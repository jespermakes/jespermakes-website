import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));

// Mock createNotification
const mockCreateNotification = vi.fn();
vi.mock("@/lib/notifications", () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

// Mock db
const mockInsertValues: unknown[] = [];
const mockSelectFromFollows: { followerId: string }[] = [];
let mockAuthorRow: { name: string | null; email: string } | undefined;

vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: (v: unknown) => {
        mockInsertValues.push(v);
        return {
          returning: () => [
            {
              id: "pub-uuid-1",
              name: "My Lamp",
              publishedAt: new Date("2026-01-01"),
            },
          ],
        };
      },
    }),
    select: (cols: Record<string, unknown>) => {
      // Distinguish between the author lookup and the followers lookup
      if ("name" in cols && "email" in cols) {
        return {
          from: () => ({
            where: () => ({
              limit: () => (mockAuthorRow ? [mockAuthorRow] : []),
            }),
          }),
        };
      }
      // followers lookup
      return {
        from: () => ({
          where: () => mockSelectFromFollows,
        }),
      };
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  workbenchDesigns: {
    id: "id",
    name: "name",
    publishedAt: "published_at",
    status: "status",
    category: "category",
    sourceDesignId: "source_design_id",
    authorId: "author_id",
    authorName: "author_name",
    description: "description",
    tags: "tags",
    data: "data",
    thumbnail: "thumbnail",
    remixOfId: "remix_of_id",
    downloadCount: "download_count",
    likeCount: "like_count",
    remixCount: "remix_count",
    updatedAt: "updated_at",
  },
  users: { id: "id", name: "name", email: "email" },
  follows: { followerId: "follower_id", followingId: "following_id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
}));

import { POST } from "../route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/lamp-designer/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeInvalidRequest(): Request {
  return new Request("http://localhost/api/lamp-designer/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockInsertValues.length = 0;
  mockSelectFromFollows.length = 0;
  mockAuthorRow = { name: "Jesper", email: "jesper@example.com" };
});

describe("POST /api/lamp-designer/publish", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ name: "Lamp", parameters: {} }) as never);
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

  it("returns 400 when name is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ parameters: { h: 10 } }) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Name is required.");
  });

  it("returns 400 when name is blank", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ name: "   ", parameters: { h: 10 } }) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Name is required.");
  });

  it("returns 400 when parameters is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest({ name: "My Lamp" }) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing 'parameters' lamp design payload.");
  });

  it("creates a workbench_designs entry with lamp data", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(
      makeRequest({
        name: "My Lamp",
        description: "A lovely lamp",
        tags: ["lamp", "cone"],
        parameters: { thicknessMM: 6.4 },
        templateId: "cone",
        thumbnail: "data:image/png;base64,abc",
      }) as never,
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.design.id).toBe("pub-uuid-1");
    expect(json.design.name).toBe("My Lamp");

    expect(mockInsertValues).toHaveLength(1);
    const inserted = mockInsertValues[0] as Record<string, unknown>;
    expect(inserted.category).toBe("lamp");
    expect(inserted.sourceDesignId).toBeNull();
    expect(inserted.authorId).toBe("user-1");
    expect(inserted.authorName).toBe("Jesper");
    expect(inserted.name).toBe("My Lamp");
    expect(inserted.description).toBe("A lovely lamp");
    expect(inserted.tags).toEqual(["lamp", "cone"]);
    expect(inserted.thumbnail).toBe("data:image/png;base64,abc");
    expect(inserted.data).toEqual({
      type: "lamp",
      templateId: "cone",
      parameters: { thicknessMM: 6.4 },
    });
  });

  it("falls back to email username when name is null", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockAuthorRow = { name: null, email: "maker@example.com" };
    await POST(
      makeRequest({
        name: "Lamp",
        parameters: { h: 10 },
      }) as never,
    );
    const inserted = mockInsertValues[0] as Record<string, unknown>;
    expect(inserted.authorName).toBe("maker");
  });

  it("notifies followers on publish", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockSelectFromFollows.push({ followerId: "follower-1" }, { followerId: "follower-2" });
    await POST(
      makeRequest({
        name: "My Lamp",
        parameters: { h: 10 },
      }) as never,
    );
    expect(mockCreateNotification).toHaveBeenCalledTimes(2);
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "follower-1",
        type: "new_design",
        designId: "pub-uuid-1",
      }),
    );
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "follower-2",
        type: "new_design",
        designId: "pub-uuid-1",
      }),
    );
  });

  it("trims tags and limits to 12", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const tags = Array.from({ length: 15 }, (_, i) => `tag${i}`);
    await POST(
      makeRequest({
        name: "Lamp",
        parameters: { h: 10 },
        tags,
      }) as never,
    );
    const inserted = mockInsertValues[0] as Record<string, unknown>;
    expect((inserted.tags as string[]).length).toBe(12);
  });
});
