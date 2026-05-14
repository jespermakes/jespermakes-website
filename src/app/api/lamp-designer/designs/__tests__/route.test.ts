import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (cols: unknown) => {
      mockSelect(cols);
      return {
        from: (table: unknown) => {
          mockFrom(table);
          return {
            where: (w: unknown) => {
              mockWhere(w);
              return {
                orderBy: (o: unknown) => {
                  mockOrderBy(o);
                  return mockRows;
                },
              };
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
    thumbnail: "thumbnail",
    context: "context",
    templateId: "template_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  desc: (col: unknown) => ({ desc: col }),
}));

let mockRows: unknown[] = [];

import { GET } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  mockRows = [];
});

describe("GET /api/lamp-designer/designs", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty array when user has no designs", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockRows = [];
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.designs).toEqual([]);
  });

  it("returns user designs ordered by updatedAt desc", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockRows = [
      {
        id: "design-2",
        name: "Lamp B",
        thumbnail: null,
        context: null,
        templateId: null,
        createdAt: new Date("2026-01-02"),
        updatedAt: new Date("2026-01-03"),
      },
      {
        id: "design-1",
        name: "Lamp A",
        thumbnail: "data:image/png;base64,abc",
        context: "bedroom",
        templateId: "template-1",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ];
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.designs).toHaveLength(2);
    expect(json.designs[0].id).toBe("design-2");
    expect(json.designs[1].id).toBe("design-1");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
  });

  it("does not return the parameters field", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockRows = [
      {
        id: "design-1",
        name: "Lamp A",
        thumbnail: null,
        context: null,
        templateId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ];
    const res = await GET();
    await res.json();
    const selectArg = mockSelect.mock.calls[0][0];
    expect(selectArg).not.toHaveProperty("parameters");
  });
});
