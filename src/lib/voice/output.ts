// Long dashes out of AI-written text before a visitor sees it (DR-287). The Storyteller and Title Lab
// prompts already ask the model for none; this catches the ones it writes anyway. A range between
// numbers becomes a hyphen ("5-10"), every other long dash a comma. The characters are built from
// code points so this file never holds one.

const DASH_CODES = [0x2014, 0x2013, 0x2015, 0x2012, 0x2e3a, 0x2e3b, 0xfe58, 0xfe31, 0xfe32];
const DASHES = DASH_CODES.map((c) => String.fromCharCode(c)).join("");
const RANGE = new RegExp(`(\\d)\\s*[${DASHES}]\\s*(\\d)`, "g");
const ANY = new RegExp(`\\s*[${DASHES}]+\\s*`, "g");
const HAS = new RegExp(`[${DASHES}]`);

export function undashText(s: string): string {
  if (!HAS.test(s)) return s;
  return s
    .replace(RANGE, "$1-$2")
    .replace(ANY, ", ")
    .replace(/^\s*,\s*/, "")
    .replace(/\s*,\s*$/, "")
    .replace(/,\s*([,.;:!?)])/g, "$1")
    .replace(/\(\s*,\s*/g, "(");
}

// Every string inside a parsed JSON answer, at any depth.
export function undashDeep<T>(value: T): T {
  if (typeof value === "string") return undashText(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => undashDeep(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = undashDeep(v);
    return out as T;
  }
  return value;
}
