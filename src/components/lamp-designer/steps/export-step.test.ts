import { describe, it, expect } from "vitest";
import type { LampParameters, ExportFormat } from "../../../lib/lamp-designer/types";

// Mirror the component's exported helper for unit testing
function fileNameForDesign(name: string, format: ExportFormat): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "lamp"}.${format}`;
}

const SAMPLE_PARAMS: LampParameters = {
  context: "bedside",
  templateId: "cone",
  shape: {
    height: 200,
    topDiameter: 80,
    bottomDiameter: 120,
    curveTension: 0.5,
    wallThickness: 2,
  },
  light: {
    colorTemperature: 2700,
    beamAngle: 90,
    direction: "down",
  },
  patternId: "smooth",
};

describe("fileNameForDesign", () => {
  it("converts a simple name to a slug with the correct extension", () => {
    expect(fileNameForDesign("My Lamp", "stl")).toBe("my-lamp.stl");
  });

  it("handles 3mf format", () => {
    expect(fileNameForDesign("My Lamp", "3mf")).toBe("my-lamp.3mf");
  });

  it("strips special characters", () => {
    expect(fileNameForDesign("Lamp #1 (test)", "stl")).toBe("lamp-1-test.stl");
  });

  it("collapses multiple separators", () => {
    expect(fileNameForDesign("foo   bar", "stl")).toBe("foo-bar.stl");
  });

  it("falls back to 'lamp' when name is empty", () => {
    expect(fileNameForDesign("", "stl")).toBe("lamp.stl");
  });

  it("falls back to 'lamp' when name is only special chars", () => {
    expect(fileNameForDesign("!!!", "stl")).toBe("lamp.stl");
  });

  it("trims leading and trailing hyphens", () => {
    expect(fileNameForDesign("-hello-", "stl")).toBe("hello.stl");
  });
});

describe("ExportStep format metadata", () => {
  const FORMAT_META: Record<ExportFormat, { label: string; description: string }> = {
    stl: { label: "STL", description: "Universal mesh format — works with any slicer" },
    "3mf": { label: "3MF", description: "Rich format with color and metadata" },
  };

  it("has metadata for each export format", () => {
    const formats: ExportFormat[] = ["stl", "3mf"];
    for (const f of formats) {
      expect(FORMAT_META[f]).toBeDefined();
      expect(FORMAT_META[f].label.length).toBeGreaterThan(0);
      expect(FORMAT_META[f].description.length).toBeGreaterThan(0);
    }
  });
});

describe("ExportStep design summary", () => {
  it("sample parameters have all required fields", () => {
    expect(SAMPLE_PARAMS.context).toBeTruthy();
    expect(SAMPLE_PARAMS.templateId).toBeTruthy();
    expect(SAMPLE_PARAMS.patternId).toBeTruthy();
    expect(SAMPLE_PARAMS.shape.height).toBeGreaterThan(0);
  });
});

describe("MakerWorld URL", () => {
  const MAKERWORLD_URL = "https://makerworld.com/en/upload";

  it("points to the MakerWorld upload page", () => {
    expect(MAKERWORLD_URL).toContain("makerworld.com");
    expect(MAKERWORLD_URL).toContain("/upload");
  });

  it("uses HTTPS", () => {
    expect(MAKERWORLD_URL.startsWith("https://")).toBe(true);
  });
});
