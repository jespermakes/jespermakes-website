import type { Shape } from "../types";

/**
 * What a generator returns. The page applies these as one undo step:
 * remove → update → add. Selection follows the added shapes.
 */
export interface GeneratorResult {
  shapesToAdd?: Shape[];
  shapesToRemove?: string[];
  shapesToUpdate?: Shape[];
  /** Optional message override. The AI's `message` is shown if absent. */
  message?: string;
}

/**
 * Context passed to every generator. Includes the current canvas + active
 * material so generators can size joints correctly without the user
 * specifying material thickness on every call.
 */
export interface GeneratorContext {
  shapes: Shape[];
  materialThickness: number;
  unit: "mm" | "in";
}

export type GeneratorFn<P> = (
  params: P,
  ctx: GeneratorContext,
) => GeneratorResult;
