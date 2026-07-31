import type {
  FixtureModuleId,
  LampParameters,
  LampTemplate,
  ProfilePoint,
  ShapeParameters,
} from "./types";
import { getMountInterface } from "./fixtures";

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

const oval: LampTemplate = {
  id: "oval",
  name: "Oval",
  description: "Full-bellied onion silhouette, the Scandinavian pendant classic",
  defaultParameters: {
    height: 190,
    topDiameter: 44,
    bottomDiameter: 110,
    curveTension: 0.55,
    wallThickness: 2,
  },
  profile: [
    { x: 22, y: 0, handleOut: { x: 30, y: 12 } },
    {
      x: 105,
      y: 95,
      handleIn: { x: 0, y: -38 },
      handleOut: { x: 0, y: 38 },
    },
    { x: 55, y: 190, handleIn: { x: -30, y: -35 } },
  ],
};

const bell: LampTemplate = {
  id: "bell",
  name: "Bell",
  description: "Slim neck opening into a flared rim, the classic glass-shade look",
  defaultParameters: {
    height: 170,
    topDiameter: 44,
    bottomDiameter: 164,
    curveTension: 0.5,
    wallThickness: 2,
  },
  profile: [
    { x: 22, y: 0, handleOut: { x: 3, y: 40 } },
    {
      x: 34,
      y: 110,
      handleIn: { x: -4, y: -38 },
      handleOut: { x: 6, y: 28 },
    },
    { x: 82, y: 170, handleIn: { x: -38, y: -8 } },
  ],
};

export const TEMPLATES: readonly LampTemplate[] = [cone, dome, cylinder, oval, bell];

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

/**
 * Clamp the user's shape so the shade can physically host the chosen
 * fixture: the top opening must reach past the crown land. Used by the
 * assembly builder defensively and by the UI as the slider floor.
 */
export function clampShapeToFixture(
  shape: ShapeParameters,
  moduleId: FixtureModuleId
): ShapeParameters {
  const mount = getMountInterface(moduleId);
  const minTopDiameter = Math.ceil(mount.crownMinRadius * 2);
  if (shape.topDiameter >= minTopDiameter) return shape;
  return { ...shape, topDiameter: minTopDiameter };
}

/**
 * The full lamp profile: fixture crown first, shade built around it
 * (DR-160). Starts at the mount aperture, runs the flat crown ring out to
 * the shade's top radius, then follows the scaled shade profile down.
 * This is what the preview renders and the STL contains.
 */
export function buildLampAssemblyProfile(
  parameters: Pick<LampParameters, "templateId" | "shape" | "fixture">
): ProfilePoint[] {
  const mount = getMountInterface(parameters.fixture.moduleId);
  const shape = clampShapeToFixture(parameters.shape, parameters.fixture.moduleId);
  const shade = scaleProfileToShape(getTemplate(parameters.templateId), shape);
  return [{ x: mount.apertureDiameter / 2, y: 0 }, ...shade];
}

export function profileWidth(profile: ProfilePoint[]): number {
  return Math.max(...profile.map((p) => p.x)) * 2;
}

export function profileHeight(profile: ProfilePoint[]): number {
  const ys = profile.map((p) => p.y);
  return Math.max(...ys) - Math.min(...ys);
}
