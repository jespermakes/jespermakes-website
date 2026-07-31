import { describe, it, expect } from "vitest";
import {
  TEMPLATES,
  getTemplate,
  scaleProfileToShape,
  buildLampProfile,
} from "./templates";
import { buildExportGeometry } from "./export";
import type { ShapeParameters } from "./types";

const CUSTOM_CONE: ShapeParameters = {
  height: 300,
  topDiameter: 80,
  bottomDiameter: 240,
  curveTension: 0,
  wallThickness: 2.5,
};

describe("scaleProfileToShape", () => {
  it("is the identity at each template's default parameters", () => {
    for (const template of TEMPLATES) {
      const scaled = scaleProfileToShape(template, template.defaultParameters);
      scaled.forEach((p, i) => {
        const original = template.profile[i];
        expect(p.x).toBeCloseTo(original.x, 6);
        expect(p.y).toBeCloseTo(original.y, 6);
        if (original.handleIn) {
          expect(p.handleIn?.x).toBeCloseTo(original.handleIn.x, 6);
          expect(p.handleIn?.y).toBeCloseTo(original.handleIn.y, 6);
        }
        if (original.handleOut) {
          expect(p.handleOut?.x).toBeCloseTo(original.handleOut.x, 6);
          expect(p.handleOut?.y).toBeCloseTo(original.handleOut.y, 6);
        }
      });
    }
  });

  it("maps height and end diameters onto the profile ends", () => {
    const scaled = scaleProfileToShape(getTemplate("cone"), CUSTOM_CONE);
    const first = scaled[0];
    const last = scaled[scaled.length - 1];
    expect(first.x).toBeCloseTo(CUSTOM_CONE.topDiameter / 2, 6);
    expect(first.y).toBeCloseTo(0, 6);
    expect(last.x).toBeCloseTo(CUSTOM_CONE.bottomDiameter / 2, 6);
    expect(last.y).toBeCloseTo(CUSTOM_CONE.height, 6);
  });

  it("scales interior points between the two end factors", () => {
    const dome = getTemplate("dome");
    const shape: ShapeParameters = {
      ...dome.defaultParameters,
      topDiameter: dome.defaultParameters.topDiameter * 2,
    };
    const scaled = scaleProfileToShape(dome, shape);
    const mid = scaled[1];
    const yNorm = dome.profile[1].y / dome.profile[2].y;
    const expectedScale = 2 + (1 - 2) * yNorm;
    expect(mid.x).toBeCloseTo(dome.profile[1].x * expectedScale, 6);
    expect(mid.y).toBeCloseTo(dome.profile[1].y, 6);
  });

  it("curveTension 0 straightens an authored curve", () => {
    const dome = getTemplate("dome");
    const scaled = scaleProfileToShape(dome, {
      ...dome.defaultParameters,
      curveTension: 0,
    });
    expect(scaled[1].handleIn?.x).toBeCloseTo(0, 6);
    expect(scaled[1].handleIn?.y).toBeCloseTo(0, 6);
    expect(scaled[1].handleOut?.x).toBeCloseTo(0, 6);
  });

  it("curveTension above the authored default amplifies the curve", () => {
    const dome = getTemplate("dome");
    const scaled = scaleProfileToShape(dome, {
      ...dome.defaultParameters,
      curveTension: 1,
    });
    const amplification = 1 / dome.defaultParameters.curveTension;
    expect(scaled[1].handleIn?.x).toBeCloseTo(
      dome.profile[1].handleIn!.x * amplification,
      4
    );
  });
});

describe("buildLampProfile", () => {
  it("returns the authored profile for default parameters", () => {
    const cone = getTemplate("cone");
    const profile = buildLampProfile({
      templateId: "cone",
      shape: cone.defaultParameters,
    });
    profile.forEach((p, i) => {
      expect(p.x).toBeCloseTo(cone.profile[i].x, 6);
      expect(p.y).toBeCloseTo(cone.profile[i].y, 6);
    });
  });
});

describe("buildExportGeometry honors shape parameters", () => {
  it("exports the user's height and diameter, not the template's", () => {
    const geometry = buildExportGeometry({
      context: "bedside",
      fixture: { moduleId: "e27-clamp" },
      templateId: "cone",
      shape: CUSTOM_CONE,
      light: { colorTemperature: 2700, beamAngle: 120, direction: "down" },
      patternId: "smooth",
    });
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    // Export is Z-up: height along z, radial extent along x.
    expect(box.max.z - box.min.z).toBeCloseTo(CUSTOM_CONE.height, 3);
    expect(box.max.x - box.min.x).toBeCloseTo(CUSTOM_CONE.bottomDiameter, 3);
    geometry.dispose();
  });
});
