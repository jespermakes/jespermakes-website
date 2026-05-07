import { generateId } from "../shape-factory";
import type { CutType, Shape } from "../types";
import { findShapeByDescription } from "./shape-resolver";
import type { GeneratorFn } from "./types";

export type ModifyAction =
  | "resize"
  | "move"
  | "delete"
  | "set-corner-radius"
  | "set-cut-type"
  | "duplicate";

export interface ModifyParams {
  targetDescription: string;
  action: ModifyAction;
  width?: number;
  height?: number;
  cornerRadius?: number;
  cutType?: CutType;
  offsetX?: number;
  offsetY?: number;
  count?: number;
}

/** Resize / move / delete / duplicate / change properties on a target shape. */
export const generateModify: GeneratorFn<ModifyParams> = (params, ctx) => {
  const target = findShapeByDescription(params.targetDescription, ctx.shapes);
  if (!target) {
    return {
      message: `I couldn't find "${params.targetDescription}" on the canvas.`,
    };
  }
  switch (params.action) {
    case "delete":
      return { shapesToRemove: [target.id] };
    case "resize": {
      const next: Shape = {
        ...target,
        width: params.width ?? target.width,
        height: params.height ?? target.height,
      };
      return { shapesToUpdate: [next] };
    }
    case "move": {
      const next: Shape = {
        ...target,
        x: target.x + (params.offsetX ?? 0),
        y: target.y + (params.offsetY ?? 0),
      };
      return { shapesToUpdate: [next] };
    }
    case "set-corner-radius": {
      if (target.type !== "rectangle") {
        return { message: "Corner radius applies to rectangles only." };
      }
      const next: Shape = {
        ...target,
        cornerRadius: Math.max(0, params.cornerRadius ?? 0),
      };
      return { shapesToUpdate: [next] };
    }
    case "set-cut-type": {
      if (!params.cutType) {
        return { message: "No cut type provided." };
      }
      const next: Shape = { ...target, cutType: params.cutType };
      return { shapesToUpdate: [next] };
    }
    case "duplicate": {
      const count = Math.max(1, Math.min(50, params.count ?? 1));
      const dx = params.offsetX ?? target.width + 10;
      const dy = params.offsetY ?? 0;
      const copies: Shape[] = [];
      for (let i = 0; i < count; i++) {
        copies.push({
          ...target,
          id: generateId(),
          x: target.x + dx * (i + 1),
          y: target.y + dy * (i + 1),
        });
      }
      return { shapesToAdd: copies };
    }
  }
  return {};
};
