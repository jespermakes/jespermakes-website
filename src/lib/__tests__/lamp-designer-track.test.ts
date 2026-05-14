import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchSpy = vi.fn(() => Promise.resolve(new Response()));

vi.stubGlobal("fetch", fetchSpy);
vi.stubGlobal("window", {});

import { trackLampDesigner } from "../lamp-designer-track";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("trackLampDesigner", () => {
  it("sends a POST request with event data", () => {
    trackLampDesigner({ eventType: "page_view" });
    expect(fetchSpy).toHaveBeenCalledWith("/api/lamp-designer/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "page_view" }),
    });
  });

  it("includes optional fields when provided", () => {
    trackLampDesigner({
      eventType: "step_completed",
      designId: "d-1",
      templateId: "t-1",
      metadata: { step: 3 },
    });
    expect(fetchSpy).toHaveBeenCalledWith("/api/lamp-designer/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "step_completed",
        designId: "d-1",
        templateId: "t-1",
        metadata: { step: 3 },
      }),
    });
  });

  it("does not throw when fetch fails", () => {
    fetchSpy.mockRejectedValueOnce(new Error("network error"));
    expect(() => trackLampDesigner({ eventType: "design_exported" })).not.toThrow();
  });
});
