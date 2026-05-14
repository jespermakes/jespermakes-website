import { describe, it, expect } from "vitest";
import { TEMPLATES, getTemplate, profileWidth, profileHeight } from "./templates";

describe("TEMPLATES", () => {
  it("contains exactly 3 templates", () => {
    expect(TEMPLATES).toHaveLength(3);
  });

  it("includes cone, dome, and cylinder", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(["cone", "dome", "cylinder"]);
  });

  it("every template has a non-empty profile", () => {
    for (const t of TEMPLATES) {
      expect(t.profile.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("every template has valid defaultParameters", () => {
    for (const t of TEMPLATES) {
      expect(t.defaultParameters.height).toBeGreaterThan(0);
      expect(t.defaultParameters.wallThickness).toBeGreaterThan(0);
      expect(t.defaultParameters.topDiameter).toBeGreaterThan(0);
      expect(t.defaultParameters.bottomDiameter).toBeGreaterThan(0);
    }
  });
});

describe("getTemplate", () => {
  it("returns the correct template by id", () => {
    expect(getTemplate("cone").name).toBe("Cone");
    expect(getTemplate("dome").name).toBe("Dome");
    expect(getTemplate("cylinder").name).toBe("Cylinder");
  });

  it("throws for unknown template id", () => {
    // @ts-expect-error testing invalid id
    expect(() => getTemplate("invalid")).toThrow("Unknown template: invalid");
  });
});

describe("cone template", () => {
  const cone = getTemplate("cone");

  it("has a straight profile from narrow top to wide bottom", () => {
    const [top, bottom] = cone.profile;
    expect(top.x).toBeLessThan(bottom.x);
    expect(top.y).toBeLessThan(bottom.y);
  });

  it("has zero curveTension (straight sides)", () => {
    expect(cone.defaultParameters.curveTension).toBe(0);
  });

  it("top is narrower than bottom", () => {
    expect(cone.defaultParameters.topDiameter).toBeLessThan(
      cone.defaultParameters.bottomDiameter
    );
  });
});

describe("dome template", () => {
  const dome = getTemplate("dome");

  it("has bezier handles on the middle point for curvature", () => {
    const mid = dome.profile[1];
    expect(mid.handleIn).toBeDefined();
    expect(mid.handleOut).toBeDefined();
  });

  it("has non-zero curveTension", () => {
    expect(dome.defaultParameters.curveTension).toBeGreaterThan(0);
  });
});

describe("cylinder template", () => {
  const cyl = getTemplate("cylinder");

  it("has equal top and bottom diameters", () => {
    expect(cyl.defaultParameters.topDiameter).toBe(
      cyl.defaultParameters.bottomDiameter
    );
  });

  it("has a vertical straight profile", () => {
    const [top, bottom] = cyl.profile;
    expect(top.x).toBe(bottom.x);
    expect(top.y).toBeLessThan(bottom.y);
  });
});

describe("profileWidth", () => {
  it("returns the full diameter from profile points", () => {
    expect(profileWidth(getTemplate("cone").profile)).toBe(200);
    expect(profileWidth(getTemplate("dome").profile)).toBe(220);
    expect(profileWidth(getTemplate("cylinder").profile)).toBe(140);
  });
});

describe("profileHeight", () => {
  it("returns the height span of the profile", () => {
    expect(profileHeight(getTemplate("cone").profile)).toBe(180);
    expect(profileHeight(getTemplate("dome").profile)).toBe(160);
    expect(profileHeight(getTemplate("cylinder").profile)).toBe(200);
  });
});
