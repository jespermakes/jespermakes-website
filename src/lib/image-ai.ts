import { IMAGE_TAG_VOCABULARY } from "@/data/image-tag-vocabulary";

const MODEL = "anthropic/claude-sonnet-4";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface AutoTagResult {
  description: string;
  material: string | null;
  sponsors: string[];
  toolCategories: string[];
  shotType: string | null;
  who: string[];
  setting: string | null;
}

export async function autoTagImage(imageUrl: string): Promise<AutoTagResult> {
  const vocab = IMAGE_TAG_VOCABULARY;

  const systemPrompt = `You are an image tagger for jespermakes.com, a Danish story-led woodworking YouTube channel.
You look at one image and return ONE JSON object describing it for the image library.

Return ONLY valid JSON, no markdown, no preamble, matching this shape:
{
  "description": "<one concise sentence, concrete, no fluff, no marketing language>",
  "material": <one of: ${vocab.material.values.join(", ")}, or null if no dominant wood>,
  "sponsors": [<any of: ${vocab.sponsors.values.join(", ")}>],
  "toolCategories": [<any of: ${vocab.toolCategories.values.join(", ")}>],
  "shotType": <one of: ${vocab.shotType.values.join(", ")}, or null>,
  "who": [<any of: ${vocab.who.values.join(", ")}, empty array if no person visible>],
  "setting": <one of: ${vocab.setting.values.join(", ")}, or null>
}

Rules:
- description: ONE sentence, max 20 words. Describe what's actually visible. No "beautiful", "stunning", "showcasing" or marketing words.
- material: the dominant wood type visible, or null if the image isn't wood-focused.
- sponsors: ONLY include a sponsor if their branding/logo/distinctive product is clearly visible. Carhartt = jacket/workwear branding. Festool = green-and-black power tools with visible Festool logo. Bambu Lab = 3D printer with logo. xTool = laser cutter with logo. Rubio Monocoat = oil finish product/can. WISA Plywood = edge-labeled plywood. Empty array if no sponsor visible. Do not guess from context.
- toolCategories: what tools are visible? hand-tools = chisels, planes, saws, hammers. power-tools = routers, track saws, drills, sanders. cnc = CNC router, Shaper Origin. laser = laser cutter, Glowforge, xTool. 3d-print = 3D printer or 3D-printed parts. measuring = rulers, squares, calipers. clamping = clamps, vises. Multiple OK. Empty array if no tools visible.
- shotType: pick the single best fit. Hero = wide/final-piece showpiece. Detail = close-up. Process = action mid-build. B-roll = ambient/contextual. Portrait = person-focused.
- who: only include if a person is clearly visible. "jesper" if it's clearly the channel host (bearded guy, often in wool/denim). "wife" if his partner is visible. "hands-only" if only hands are shown.
- setting: where was this shot? Null if unclear.

Never guess wildly. If unsure, use null or an empty array.`;

  const body = {
    model: MODEL,
    max_tokens: 600,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: "Tag this image. Return only the JSON object." },
        ],
      },
    ],
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://jespermakes.com",
      "X-Title": "Jesper Makes Image Library",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson(raw);
  return sanitize(parsed);
}

function extractJson(text: string): unknown {
  const clean = text.replace(/```json\s?|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
}

function sanitize(raw: unknown): AutoTagResult {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const vocab = IMAGE_TAG_VOCABULARY;

  const oneOf = (field: keyof typeof vocab, value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const allowed = vocab[field].values as readonly string[];
    return allowed.includes(value) ? value : null;
  };

  const manyOf = (field: keyof typeof vocab, value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    const allowed = vocab[field].values as readonly string[];
    return value.filter((v): v is string => typeof v === "string" && allowed.includes(v));
  };

  return {
    description: typeof obj.description === "string" ? obj.description.slice(0, 300).trim() : "",
    material: oneOf("material", obj.material),
    sponsors: manyOf("sponsors", obj.sponsors),
    toolCategories: manyOf("toolCategories", obj.toolCategories),
    shotType: oneOf("shotType", obj.shotType),
    who: manyOf("who", obj.who),
    setting: oneOf("setting", obj.setting),
  };
}
