import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

const mockInsert = vi.fn();
const mockValues = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: (table: unknown) => {
      mockInsert(table);
      return { values: (v: unknown) => mockValues(v) };
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  lampDesignerEvents: { _table: "lamp_designer_events" },
}));

import { POST } from "../../track/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/lamp-designer/track", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(null);
});

describe("POST /api/lamp-designer/track", () => {
  it("returns 400 for missing eventType", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid event type");
  });

  it("returns 400 for invalid eventType", async () => {
    const res = await POST(makeRequest({ eventType: "hacked" }));
    expect(res.status).toBe(400);
  });

  it("inserts event for unauthenticated user with userId null", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ eventType: "page_view" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockValues).toHaveBeenCalledWith({
      eventType: "page_view",
      designId: null,
      templateId: null,
      country: null,
      userId: null,
      metadata: null,
    });
  });

  it("inserts event with userId when authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ eventType: "design_published", designId: "d-1" }));
    expect(res.status).toBe(200);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", designId: "d-1" })
    );
  });

  it("reads x-vercel-ip-country header", async () => {
    const res = await POST(
      makeRequest({ eventType: "page_view" }, { "x-vercel-ip-country": "SE" })
    );
    expect(res.status).toBe(200);
    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({ country: "SE" }));
  });

  it("passes metadata through", async () => {
    const res = await POST(
      makeRequest({ eventType: "step_completed", metadata: { step: 2 } })
    );
    expect(res.status).toBe(200);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { step: 2 } })
    );
  });

  it("returns 200 even on db error", async () => {
    mockValues.mockRejectedValueOnce(new Error("db down"));
    const res = await POST(makeRequest({ eventType: "page_view" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  it("accepts all valid event types", async () => {
    for (const eventType of ["page_view", "step_completed", "design_exported", "design_published"]) {
      vi.clearAllMocks();
      const res = await POST(makeRequest({ eventType }));
      expect(res.status).toBe(200);
      expect(mockValues).toHaveBeenCalled();
    }
  });
});
