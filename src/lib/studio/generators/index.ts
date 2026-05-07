import type { GeneratorContext, GeneratorFn, GeneratorResult } from "./types";
import { generateBox, type BoxParams } from "./box";
import {
  generateCirclePattern,
  type CirclePatternParams,
} from "./circle-pattern";
import { generateCoaster, type CoasterParams } from "./coaster";
import {
  generateFreeformPath,
  type FreeformPathParams,
} from "./freeform-path";
import {
  generateGridPattern,
  type GridPatternParams,
} from "./grid-pattern";
import { generateHole, type HoleParams } from "./hole";
import { generateModify, type ModifyParams } from "./modify";
import { generateNameplate, type NameplateParams } from "./nameplate";
import { generatePhoneStand, type PhoneStandParams } from "./phone-stand";
import {
  generateShelfBracket,
  type ShelfBracketParams,
} from "./shelf-bracket";
import {
  generateSimpleShape,
  type SimpleShapeParams,
} from "./simple-shape";

/** Names accepted by the AI as the `tool` field. */
export type GeneratorTool =
  | "box"
  | "circle-pattern"
  | "grid-pattern"
  | "phone-stand"
  | "shelf-bracket"
  | "coaster"
  | "nameplate"
  | "simple-shape"
  | "hole"
  | "modify"
  | "freeform-path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<GeneratorTool, GeneratorFn<any>> = {
  box: generateBox,
  "circle-pattern": generateCirclePattern,
  "grid-pattern": generateGridPattern,
  "phone-stand": generatePhoneStand,
  "shelf-bracket": generateShelfBracket,
  coaster: generateCoaster,
  nameplate: generateNameplate,
  "simple-shape": generateSimpleShape,
  hole: generateHole,
  modify: generateModify,
  "freeform-path": generateFreeformPath,
};

export function isGeneratorTool(name: string): name is GeneratorTool {
  return name in REGISTRY;
}

/** Run a named generator with arbitrary params. Returns null if the name
 *  isn't registered. */
export function runGenerator(
  name: GeneratorTool,
  params: unknown,
  ctx: GeneratorContext,
): GeneratorResult | null {
  const fn = REGISTRY[name];
  if (!fn) return null;
  return fn(params, ctx);
}

export type {
  BoxParams,
  CirclePatternParams,
  CoasterParams,
  FreeformPathParams,
  GeneratorContext,
  GeneratorResult,
  GridPatternParams,
  HoleParams,
  ModifyParams,
  NameplateParams,
  PhoneStandParams,
  ShelfBracketParams,
  SimpleShapeParams,
};
