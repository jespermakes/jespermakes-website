import type { MaterialSettings, Shape } from "./types";

export const AI_SYSTEM_PROMPT = `You are a design assistant for a 2D CNC/laser design studio called Jesper Makes Studio.
You generate shapes that will be placed on a canvas for manufacturing.

You MUST respond with a JSON object containing:
{
  "shapes": [...],     // array of Shape objects to add to the canvas
  "message": "...",    // a brief, friendly message explaining what you generated
  "modifications": [...] // optional: IDs of existing shapes to delete (for replacements)
}

Each shape in the "shapes" array must conform to this Shape interface:

{
  "id": "ai-<random>",       // unique id; use "ai-" prefix
  "type": "rectangle" | "circle" | "line" | "path" | "text",
  "x": number,                // center X in mm (canvas origin is 0,0; +X right, +Y down)
  "y": number,                // center Y in mm
  "width": number,            // mm bounding width (for circle: diameter)
  "height": number,           // mm bounding height
  "rotation": 0,              // degrees clockwise; default 0
  "stroke": "#2C1810",        // hex; '#2C1810' is the default
  "strokeWidth": 0.5,          // mm
  "fill": "none",             // 'none' or hex
  "cornerRadius": 0,          // mm (rectangles only)
  "text": "..." ,              // text type only
  "fontSize": 10,              // text type only, mm
  "cutType": "outside" | "inside" | "online" | "pocket" | "guide",
  "pathData": "M0,0 L10,0...", // SVG path d (path type only)
  "closed": true,              // path type only
  "x1": 0, "y1": 0, "x2": 10, "y2": 0  // line type only, endpoints relative to (x,y)
}

CRITICAL RULES
- All dimensions are in millimeters.
- Place shapes with at least 5 mm spacing between parts.
- Generate CLOSED paths (closed: true) for parts that will be cut out.
- For parts to cut out as the perimeter of a piece, set cutType to "outside".
- For holes inside a part, set cutType to "inside".
- For score lines / engraved outlines, set cutType to "online".
- Use the user's stated material thickness (or context.material.thickness) for joint dimensions.
- Each generated shape needs a unique id; collisions with the existing canvas are not allowed.
- Always include a short, plain-English explanation in "message".

FINGER JOINT MATH
When generating finger joints between two panels:
- Finger width = material thickness (or specified width).
- Tabs on panel A extend material-thickness BEYOND the panel edge.
- Slots on panel B are cut INTO the panel edge by material-thickness.
- Number of fingers = floor(edge_length / (finger_width * 2)).
- Where panel A has a tab, the mating panel B has a matching slot.

LAYOUT
- Lay multi-part designs out as a row of panels with 10 mm gaps so the user
  can see them at a glance and nest later in Plan mode.
- Center the layout near the canvas origin where possible.

WHEN UNSURE
- If a request is ambiguous, make a reasonable assumption and explain it in
  "message" rather than refusing.
- If a request is physically impossible, return an empty shapes array and
  explain why in "message".
- For requests beyond your reach (3D forms, complex curves), generate the
  closest 2D approximation and say so.

REPLACEMENTS
- When the user asks you to MODIFY existing shapes, return the new shape
  list AND an "modifications" array of the IDs you're replacing. Use the
  ids you see in the existingShapes context.

KEEP DESIGNS PRACTICAL. The user is going to cut these on a real machine.
`;

export interface AIRequestContext {
  prompt: string;
  existingShapes: Shape[];
  material: MaterialSettings;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

export function buildUserMessage(ctx: AIRequestContext): string {
  const m = ctx.material;
  const summary = ctx.existingShapes.slice(0, 30).map((s) => ({
    id: s.id,
    type: s.type,
    x: round(s.x),
    y: round(s.y),
    width: round(s.width),
    height: round(s.height),
    cutType: s.cutType,
  }));
  const parts: string[] = [];
  parts.push(`Material: ${m.name}, ${m.width} × ${m.height} mm, ${m.thickness} mm thick.`);
  if (summary.length > 0) {
    parts.push(`Existing shapes on canvas (showing first ${summary.length}):`);
    parts.push("```json");
    parts.push(JSON.stringify(summary, null, 2));
    parts.push("```");
  } else {
    parts.push("Canvas is empty.");
  }
  parts.push("");
  parts.push("User request:");
  parts.push(ctx.prompt);
  return parts.join("\n");
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface AIResponseShape {
  id?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  cutType?: string;
  pathData?: string;
  closed?: boolean;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface AIResponse {
  shapes: AIResponseShape[];
  message: string;
  modifications?: string[];
}

const VALID_TYPES = new Set([
  "rectangle",
  "circle",
  "line",
  "path",
  "text",
]);
const VALID_CUT_TYPES = new Set([
  "inside",
  "outside",
  "online",
  "pocket",
  "guide",
]);

/** Coerce an AI shape blob into a valid Shape, or null if it's broken. */
export function coerceAIShape(raw: AIResponseShape): Shape | null {
  if (!raw || typeof raw !== "object") return null;
  const type = typeof raw.type === "string" ? raw.type : null;
  if (!type || !VALID_TYPES.has(type)) return null;
  const x = num(raw.x);
  const y = num(raw.y);
  if (x === null || y === null) return null;

  const id =
    typeof raw.id === "string" && raw.id.length > 0
      ? raw.id
      : `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const base: Shape = {
    id,
    type: type as Shape["type"],
    x,
    y,
    width: num(raw.width) ?? 10,
    height: num(raw.height) ?? 10,
    rotation: num(raw.rotation) ?? 0,
    stroke: typeof raw.stroke === "string" ? raw.stroke : "#2C1810",
    strokeWidth: num(raw.strokeWidth) ?? 0.5,
    fill: typeof raw.fill === "string" ? raw.fill : "none",
  };

  if (type === "rectangle" && typeof raw.cornerRadius === "number") {
    base.cornerRadius = raw.cornerRadius;
  }
  if (type === "text") {
    base.text = typeof raw.text === "string" ? raw.text : "Text";
    base.fontSize = num(raw.fontSize) ?? 10;
    base.fontFamily = "Inter, sans-serif";
    base.textAnchor = "middle";
  }
  if (type === "line") {
    base.x1 = num(raw.x1) ?? -base.width / 2;
    base.y1 = num(raw.y1) ?? 0;
    base.x2 = num(raw.x2) ?? base.width / 2;
    base.y2 = num(raw.y2) ?? 0;
  }
  if (type === "path") {
    if (typeof raw.pathData === "string" && raw.pathData.length > 0) {
      base.pathData = raw.pathData;
    } else {
      // Without points or pathData a path can't render.
      return null;
    }
    base.closed = raw.closed === true;
  }
  if (typeof raw.cutType === "string" && VALID_CUT_TYPES.has(raw.cutType)) {
    base.cutType = raw.cutType as Shape["cutType"];
  }
  return base;
}

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

/**
 * Tries hard to extract a JSON object from a model response that may be
 * wrapped in code fences, prose, or both.
 */
export function parseAIResponse(text: string): AIResponse | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s?|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const candidate = match ? match[0] : cleaned;
  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>;
    const shapes = Array.isArray(parsed.shapes)
      ? (parsed.shapes as AIResponseShape[])
      : [];
    const message =
      typeof parsed.message === "string" ? parsed.message : "Done.";
    const modifications =
      Array.isArray(parsed.modifications)
        ? (parsed.modifications as unknown[]).filter(
            (id): id is string => typeof id === "string",
          )
        : undefined;
    return { shapes, message, modifications };
  } catch {
    return null;
  }
}
