import type { LampContext, ContextConstraints } from "./types";

export interface ContextMeta {
  id: LampContext;
  label: string;
  description: string;
  constraints: ContextConstraints;
}

export const CONTEXT_META: readonly ContextMeta[] = [
  {
    id: "bedside",
    label: "Bedside",
    description: "Soft, warm glow for winding down",
    constraints: {
      eyeHeightMin: 300,
      eyeHeightMax: 500,
      suggestedProportionRatio: 0.6,
      suggestedLightDirection: "down",
    },
  },
  {
    id: "dining",
    label: "Dining",
    description: "Focused downlight over the table",
    constraints: {
      eyeHeightMin: 600,
      eyeHeightMax: 900,
      suggestedProportionRatio: 0.8,
      suggestedLightDirection: "down",
    },
  },
  {
    id: "reading",
    label: "Reading",
    description: "Directed light for a reading nook",
    constraints: {
      eyeHeightMin: 400,
      eyeHeightMax: 700,
      suggestedProportionRatio: 0.7,
      suggestedLightDirection: "down",
    },
  },
  {
    id: "hallway",
    label: "Hallway",
    description: "Ambient glow to light the way",
    constraints: {
      eyeHeightMin: 500,
      eyeHeightMax: 800,
      suggestedProportionRatio: 0.5,
      suggestedLightDirection: "ambient",
    },
  },
  {
    id: "desk",
    label: "Desk",
    description: "Task light for focused work",
    constraints: {
      eyeHeightMin: 350,
      eyeHeightMax: 550,
      suggestedProportionRatio: 0.65,
      suggestedLightDirection: "down",
    },
  },
  {
    id: "shelf",
    label: "Shelf",
    description: "Compact accent for display shelves",
    constraints: {
      eyeHeightMin: 200,
      eyeHeightMax: 400,
      suggestedProportionRatio: 0.5,
      suggestedLightDirection: "up",
    },
  },
];

export function getContextConstraints(context: LampContext): ContextConstraints {
  const meta = CONTEXT_META.find((m) => m.id === context);
  if (!meta) throw new Error(`Unknown context: ${context}`);
  return meta.constraints;
}
