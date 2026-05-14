import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

// Mock db
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockValues = vi.fn();
const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: () => {
      mockInsert();
      return { values: (v: unknown) => { mockValues(v); return { returning: (r: unknown) => { mockReturning(r); return [{ id: "new-uuid", name: "My Lamp", updatedAt: new Date("2026-01-01") }]; } }; } };
    },
    update: () => {
      mockUpdate();
      return { set: (s: unknown) => { mockSet(s); return { where: (w: unknown) => { mockWhere(w); return { returning: (r: unknown) => { mockReturning(r); return mockReturningResult; } }; } }; } };
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  lampDesigns: {
    id: "id",
    userId: "user_id",
    name: "name",
    parameters: "parameters",
    thumbnail: "thumbnail",
    context: "context",
    templateId: "template_id",
    updatedAt: "updated_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  and: (...args: unknown[]) => ({ and: args }),
}));

let mockReturningResult: unknown[] = [];

import { POST } from "../route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/lamp-designer/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeInvalidRequest(): Request {
  return new Request("http://localhost/api/lamp-designer/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockReturningResult = [];
});

describe("POST /api/lamp-designer/save", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ parameters: { height: 10 } }) as never);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid JSON", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeInvalidRequest() as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid JSON");
  });

  it("returns 400 when parameters is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ name: "Test" }) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing 'parameters' design payload.");
  });

  it("creates a new design when no id is provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(
      makeRequest({
        name: "My Lamp",
        parameters: { height: 200, width: 100 },
        thumbnail: "data:image/png;base64,abc",
        context: "bedroom",
        templateId: "template-1",
      }) as never,
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.design).toBeDefined();
    expect(json.design.id).toBe("new-uuid");
    expect(json.design.name).toBe("My Lamp");
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        name: "My Lamp",
        parameters: { height: 200, width: 100 },
        thumbnail: "data:image/png;base64,abc",
        context: "bedroom",
        templateId: "template-1",
      }),
    );
  });

  it("defaults name to 'Untitled' when not provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    await POST(
      makeRequest({ parameters: { height: 100 } }) as never,
    );
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Untitled" }),
    );
  });

  it("updates an existing design when id is provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockReturningResult = [
      { id: "existing-uuid", name: "Updated Lamp", updatedAt: new Date("2026-01-02") },
    ];
    const res = await POST(
      makeRequest({
        id: "existing-uuid",
        name: "Updated Lamp",
        parameters: { height: 300 },
      }) as never,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.design.id).toBe("existing-uuid");
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated Lamp",
        parameters: { height: 300 },
      }),
    );
  });

  it("returns 404 when updating a non-existent design", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockReturningResult = [];
    const res = await POST(
      makeRequest({
        id: "nonexistent",
        name: "Test",
        parameters: { height: 100 },
      }) as never,
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });
});
