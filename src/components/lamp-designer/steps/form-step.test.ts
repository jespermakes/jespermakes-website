import { describe, it, expect } from "vitest";
import type { TemplateId } from "../../../lib/lamp-designer/types";
import { TEMPLATES, getTemplate } from "../../../lib/lamp-designer/templates";

const ALL_TEMPLATES: TemplateId[] = ["cone", "dome", "cylinder"];

describe("FormStep template data", () => {
  it("TEMPLATES contains exactly the expected template IDs", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(ALL_TEMPLATES);
  });

  it("each template has a non-empty name and description", () => {
    for (const template of TEMPLATES) {
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
    }
  });

  it("each template has valid defaultParameters", () => {
    for (const template of TEMPLATES) {
      const { defaultParameters: p } = template;
      expect(p.height).toBeGreaterThan(0);
      expect(p.topDiameter).toBeGreaterThan(0);
      expect(p.bottomDiameter).toBeGreaterThan(0);
      expect(p.wallThickness).toBeGreaterThan(0);
      expect(p.curveTension).toBeGreaterThanOrEqual(0);
      expect(p.curveTension).toBeLessThanOrEqual(1);
    }
  });

  it("each template has a non-empty profile", () => {
    for (const template of TEMPLATES) {
      expect(template.profile.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("getTemplate returns the correct template for each ID", () => {
    for (const id of ALL_TEMPLATES) {
      const template = getTemplate(id);
      expect(template.id).toBe(id);
    }
  });

  it("getTemplate throws for an unknown template ID", () => {
    expect(() => getTemplate("pyramid" as TemplateId)).toThrow(
      "Unknown template: pyramid"
    );
  });
});
