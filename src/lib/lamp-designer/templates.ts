import type { LampTemplate, ProfilePoint } from "./types";

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

export function profileWidth(profile: ProfilePoint[]): number {
  return Math.max(...profile.map((p) => p.x)) * 2;
}

export function profileHeight(profile: ProfilePoint[]): number {
  const ys = profile.map((p) => p.y);
  return Math.max(...ys) - Math.min(...ys);
}
