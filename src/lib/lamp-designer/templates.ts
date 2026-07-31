import type {
  LampParameters,
  LampTemplate,
  ProfilePoint,
  ShapeParameters,
} from "./types";

const cone: LampTemplate = {
  id: "cone",
  name: "Cone",
  description: "Classic conical shade, wide at the bottom and narrow at the top",
  defaultParameters: {
    height: 180,
    topDiameter: 40,
    bottomDiameter: 200,
    curveTension: 0,
    wallThickness: 2.5,
  },
  profile: [
    { x: 20, y: 0 },
    { x: 100, y: 180 },
  ],
};

const dome: LampTemplate = {
  id: "dome",
  name: "Dome",
  description: "Rounded dome shape with a smooth curved profile",
  defaultParameters: {
    height: 160,
    topDiameter: 20,
    bottomDiameter: 220,
    curveTension: 0.6,
    wallThickness: 2.5,
  },
  profile: [
    { x: 10, y: 0 },
    {
      x: 110,
      y: 60,
      handleIn: { x: -40, y: 0 },
      handleOut: { x: 40, y: 0 },
    },
    { x: 110, y: 160 },
  ],
};

const cylinder: LampTemplate = {
  id: "cylinder",
  name: "Cylinder",
  description: "Straight-sided cylindrical shade with equal top and bottom diameters",
  defaultParameters: {
    height: 200,
    topDiameter: 140,
    bottomDiameter: 140,
    curveTension: 0,
    wallThickness: 2.5,
  },
  profile: [
    { x: 70, y: 0 },
    { x: 70, y: 200 },
  ],
};

export const TEMPLATES: readonly LampTemplate[] = [cone, dome, cylinder];

export function getTemplate(id: LampTemplate["id"]): LampTemplate {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) {
    throw new Error(`Unknown template: ${id}`);
  }
  return template;
}

/**
 * Map user shape parameters onto a template's authored profile.
 *
 * The template profile carries the design's character; the shape parameters
 * carry the user's dimensions. The first profile point (lowest y) maps to
 * topDiameter, the last maps to bottomDiameter, and the y extent maps to
 * height. Interior points scale by their position between the two ends so
 * the curve keeps its character at any size. curveTension scales bezier
 * handle strength relative to the template's authored default: the default
 * tension reproduces the authored curve exactly, 0 straightens it.
 */
export function scaleProfileToShape(
  template: LampTemplate,
  shape: ShapeParameters
): ProfilePoint[] {
  const profile = template.profile;
  const ys = profile.map((p) => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yExtent = yMax - yMin || 1;
  const heightScale = shape.height / yExtent;

  const topRadius = profile[0].x;
  const bottomRadius = profile[profile.length - 1].x;
  const topScale = topRadius > 0 ? shape.topDiameter / 2 / topRadius : 1;
  const bottomScale =
    bottomRadius > 0 ? shape.bottomDiameter / 2 / bottomRadius : 1;

  const defaultTension = template.defaultParameters.curveTension;
  const tensionScale = defaultTension > 0 ? shape.curveTension / defaultTension : 1;

  return profile.map((p) => {
    const yNorm = (p.y - yMin) / yExtent;
    const localScale = topScale + (bottomScale - topScale) * yNorm;
    const scaleHandle = (h: { x: number; y: number }) => ({
      x: h.x * localScale * tensionScale,
      y: h.y * heightScale * tensionScale,
    });
    const point: ProfilePoint = {
      x: p.x * localScale,
      y: (p.y - yMin) * heightScale,
    };
    if (p.handleIn) point.handleIn = scaleHandle(p.handleIn);
    if (p.handleOut) point.handleOut = scaleHandle(p.handleOut);
    return point;
  });
}

/**
 * The single source of profile truth for preview and export. Both must call
 * this so the rendered lamp and the exported file can never diverge.
 */
export function buildLampProfile(
  parameters: Pick<LampParameters, "templateId" | "shape">
): ProfilePoint[] {
  return scaleProfileToShape(getTemplate(parameters.templateId), parameters.shape);
}

export function profileWidth(profile: ProfilePoint[]): number {
  return Math.max(...profile.map((p) => p.x)) * 2;
}

export function profileHeight(profile: ProfilePoint[]): number {
  const ys = profile.map((p) => p.y);
  return Math.max(...ys) - Math.min(...ys);
}
