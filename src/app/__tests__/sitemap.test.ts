import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (fields: unknown) => {
      mockSelect(fields);
      return {
        from: (table: unknown) => {
          mockFrom(table);
          return {
            where: (condition: unknown) => {
              mockWhere(condition);
              return [];
            },
          };
        },
      };
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  blogPosts: { slug: "slug", updatedAt: "updatedAt", hidden: "hidden" },
  toolItems: {
    slug: "slug",
    updatedAt: "updatedAt",
    categorySlug: "categorySlug",
    hidden: "hidden",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

import sitemap from "../sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes the cone-lamp designer page", async () => {
    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://jespermakes.com/cone-lamp");
  });

  it("sets correct metadata for the cone-lamp page", async () => {
    const result = await sitemap();
    const coneLampEntry = result.find(
      (entry) => entry.url === "https://jespermakes.com/cone-lamp"
    );

    expect(coneLampEntry).toBeDefined();
    expect(coneLampEntry!.changeFrequency).toBe("weekly");
    expect(coneLampEntry!.priority).toBe(0.8);
  });

  it("includes all expected static pages", async () => {
    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain("https://jespermakes.com");
    expect(urls).toContain("https://jespermakes.com/shop");
    expect(urls).toContain("https://jespermakes.com/tools");
    expect(urls).toContain("https://jespermakes.com/cone-lamp");
    expect(urls).toContain("https://jespermakes.com/blog");
  });
});
