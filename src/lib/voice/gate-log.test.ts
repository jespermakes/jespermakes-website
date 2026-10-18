import { describe, it, expect, vi, beforeEach } from "vitest";

const rows: Record<string, unknown>[] = [];
vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: async (row: Record<string, unknown>) => {
        rows.push(row);
      },
    }),
  },
}));
vi.mock("@/lib/db/schema", () => ({ mcpActivity: {} }));

import { adminVoiceGate, mcpVoiceGate } from "./gate-log";

const EM = String.fromCharCode(0x2014);
const who = { userId: "u1", tokenId: "t1", clientId: "c1" };

beforeEach(() => {
  rows.length = 0;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("mcpVoiceGate", () => {
  it("refuses a block and logs it", async () => {
    const g = await mcpVoiceGate("create_blog_draft", who, [{ field: "title", text: `Done ${EM} finally` }], null);
    expect(g.refuse?.isError).toBe(true);
    expect(g.refuse?.content[0].text).toContain("VOICE GATE: not saved (create_blog_draft)");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ method: "voice_gate.refused", toolName: "create_blog_draft", success: false, tokenId: "t1" });
  });
  it("lets an override through and logs the reason", async () => {
    const g = await mcpVoiceGate("update_tool", who, [{ field: "name", text: `Done ${EM} finally` }], { reason: "Jesper approved this exact line" });
    expect(g.refuse).toBeUndefined();
    expect(g.note).toContain("overridden");
    expect(rows[0]).toMatchObject({ method: "voice_gate.overridden", success: true, errorMessage: "override: Jesper approved this exact line" });
    expect((rows[0].requestBody as { reason: string }).reason).toBe("Jesper approved this exact line");
  });
  it("passes a flag with a note", async () => {
    const g = await mcpVoiceGate("update_blog_post", who, [{ field: "description", text: "A genuinely good bench." }], null);
    expect(g.refuse).toBeUndefined();
    expect(g.note).toContain("advisory");
    expect(rows[0]).toMatchObject({ method: "voice_gate.flagged" });
  });
  it("passes clean text without a log row", async () => {
    const g = await mcpVoiceGate("update_blog_post", who, [{ field: "title", text: "Three pallets, one bench" }], null);
    expect(g).toEqual({});
    expect(rows).toHaveLength(0);
  });
});

describe("adminVoiceGate", () => {
  it("answers a block with a 422 the editor understands", async () => {
    const g = await adminVoiceGate("admin.blog.update", "u1", [{ field: "content", text: `Two coats ${EM} done.` }], null);
    expect(g.response?.status).toBe(422);
    const body = await g.response!.json();
    expect(body.voice.findings[0]).toMatchObject({ field: "content", name: "Em or en dash" });
    expect(rows[0]).toMatchObject({ method: "voice_gate.refused", clientId: "admin" });
  });
  it("saves with an override and logs it", async () => {
    const g = await adminVoiceGate("admin.blog.update", "u1", [{ field: "content", text: `Two coats ${EM} done.` }], { reason: "my own words, keep them" });
    expect(g.response).toBeUndefined();
    expect(rows[0]).toMatchObject({ method: "voice_gate.overridden", errorMessage: "override: my own words, keep them" });
  });
});
