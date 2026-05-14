import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

let mockRows: unknown[] = [];

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => {
      mockSelect();
      return {
        from: (table: unknown) => {
          mockFrom(table);
          return {
            where: (w: unknown) => {
              mockWhere(w);
              return mockRows;
            },
          };
        },
      };
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
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  and: (...args: unknown[]) => ({ and: args }),
}));

import { GET } from "../route";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRows = [];
});

describe("GET /api/lamp-designer/designs/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/lamp-designer/designs/abc");
    const res = await GET(req, makeParams("abc"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} });
    const req = new NextRequest("http://localhost/api/lamp-designer/designs/abc");
    const res = await GET(req, makeParams("abc"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when design does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockRows = [];
    const req = new NextRequest("http://localhost/api/lamp-designer/designs/nonexistent");
    const res = await GET(req, makeParams("nonexistent"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns the full design including parameters", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const design = {
      id: "design-1",
      userId: "user-1",
      name: "My Lamp",
      parameters: { height: 200, width: 100 },
      thumbnail: "data:image/png;base64,abc",
      context: "bedroom",
      templateId: "template-1",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    };
    mockRows = [design];
    const req = new NextRequest("http://localhost/api/lamp-designer/designs/design-1");
    const res = await GET(req, makeParams("design-1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.design.id).toBe("design-1");
    expect(json.design.name).toBe("My Lamp");
    expect(json.design.parameters).toEqual({ height: 200, width: 100 });
  });

  it("scopes query to the authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockRows = [];
    const req = new NextRequest("http://localhost/api/lamp-designer/designs/design-1");
    await GET(req, makeParams("design-1"));
    expect(mockWhere).toHaveBeenCalledWith({
      and: [
        { eq: ["id", "design-1"] },
        { eq: ["user_id", "user-1"] },
      ],
    });
  });
});
