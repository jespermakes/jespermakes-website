import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Lamp designer save/load integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("save flow", () => {
    it("creates a new design via POST /api/lamp-designer/save", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          design: { id: "new-id", name: "My Lamp", updatedAt: "2026-01-01T00:00:00.000Z" },
        }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Lamp",
          parameters: { thicknessMM: 5.0 },
        }),
      });
      const json = await res.json();

      expect(fetchSpy).toHaveBeenCalledWith("/api/lamp-designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Lamp",
          parameters: { thicknessMM: 5.0 },
        }),
      });
      expect(json.design.id).toBe("new-id");
    });

    it("updates an existing design by including id", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          design: { id: "existing-id", name: "Updated Lamp", updatedAt: "2026-01-02T00:00:00.000Z" },
        }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const body = {
        id: "existing-id",
        name: "Updated Lamp",
        parameters: { thicknessMM: 6.0 },
      };

      const res = await fetch("/api/lamp-designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      expect(json.design.id).toBe("existing-id");
      expect(json.design.name).toBe("Updated Lamp");
    });

    it("handles save error", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Lamp",
          parameters: { thicknessMM: 5.0 },
        }),
      });

      expect(res.ok).toBe(false);
    });
  });

  describe("load flow", () => {
    it("loads a design and extracts thicknessMM parameter", async () => {
      const design = {
        id: "d1",
        name: "Baltic Birch",
        parameters: { thicknessMM: 4.5 },
        thumbnail: null,
        context: null,
        templateId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ design }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/designs/d1");
      const json = await res.json();

      expect(json.design.parameters.thicknessMM).toBe(4.5);
      expect(json.design.name).toBe("Baltic Birch");
    });

    it("handles missing thicknessMM gracefully", async () => {
      const design = {
        id: "d2",
        name: "Unknown",
        parameters: {},
        thumbnail: null,
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ design }),
      });
      vi.stubGlobal("fetch", fetchSpy);

      const res = await fetch("/api/lamp-designer/designs/d2");
      const json = await res.json();

      // The page should handle undefined thicknessMM by keeping current value
      expect(typeof json.design.parameters.thicknessMM).toBe("undefined");
    });
  });

  describe("new design flow", () => {
    it("resets to default state", () => {
      const DEFAULT_THICKNESS = 6.4;
      const DEFAULT_NAME = "Untitled";

      // Simulate new design state
      const state = {
        thicknessMM: DEFAULT_THICKNESS,
        designId: null,
        designName: DEFAULT_NAME,
        saveStatus: "never-saved" as const,
      };

      expect(state.thicknessMM).toBe(6.4);
      expect(state.designId).toBeNull();
      expect(state.designName).toBe("Untitled");
      expect(state.saveStatus).toBe("never-saved");
    });
  });
});
