import { describe, it, expect, vi, beforeEach } from "vitest";

describe("LampDesignsDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("designs list API", () => {
    it("fetches designs from /api/lamp-designer/designs", async () => {
      const mockDesigns = [
        {
          id: "d1",
          name: "My Lamp",
          thumbnail: null,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "d2",
          name: "Baltic Birch Lamp",
          thumbnail: null,
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ];

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ designs: mockDesigns }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/designs");
      const json = await res.json();

      expect(fetchSpy).toHaveBeenCalledWith("/api/lamp-designer/designs");
      expect(json.designs).toHaveLength(2);
      expect(json.designs[0].name).toBe("My Lamp");
    });

    it("handles fetch error gracefully", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/designs");
      expect(res.ok).toBe(false);
    });
  });

  describe("design load API", () => {
    it("fetches a single design by ID", async () => {
      const mockDesign = {
        id: "d1",
        name: "My Lamp",
        parameters: { thicknessMM: 5.0 },
        thumbnail: null,
        updatedAt: "2026-01-01T00:00:00.000Z",
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ design: mockDesign }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/designs/d1");
      const json = await res.json();

      expect(fetchSpy).toHaveBeenCalledWith("/api/lamp-designer/designs/d1");
      expect(json.design.parameters.thicknessMM).toBe(5.0);
      expect(json.design.name).toBe("My Lamp");
    });

    it("handles 404 for non-existent design", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/designs/nonexistent");
      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });
  });
});
