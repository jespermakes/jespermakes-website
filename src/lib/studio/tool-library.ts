import type { CuttingTool } from "./types";

const STORAGE_KEY = "studio_cutting_tools";

export const DEFAULT_TOOLS: CuttingTool[] = [
  {
    id: "default-quarter-up",
    name: '1/4" upcut spiral',
    type: "router_bit",
    diameter: 6.35,
    kerf: 6.35,
  },
  {
    id: "default-eighth-straight",
    name: '1/8" straight',
    type: "router_bit",
    diameter: 3.175,
    kerf: 3.175,
  },
  {
    id: "default-co2-laser",
    name: "CO₂ laser",
    type: "laser",
    diameter: 0.1,
    kerf: 0.2,
  },
];

function safeRead(): CuttingTool[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isCuttingTool);
  } catch {
    return null;
  }
}

function isCuttingTool(v: unknown): v is CuttingTool {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    (o.type === "router_bit" || o.type === "laser") &&
    typeof o.diameter === "number" &&
    typeof o.kerf === "number"
  );
}

export function loadTools(): CuttingTool[] {
  const stored = safeRead();
  if (stored && stored.length > 0) return stored;
  return DEFAULT_TOOLS.map((t) => ({ ...t }));
}

export function saveTools(tools: CuttingTool[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  } catch {
    /* noop */
  }
}

export function newToolId(): string {
  return `tool-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function findActiveTool(
  tools: CuttingTool[],
  activeToolId: string | null,
): CuttingTool | null {
  if (!activeToolId) return tools[0] ?? null;
  return tools.find((t) => t.id === activeToolId) ?? tools[0] ?? null;
}
