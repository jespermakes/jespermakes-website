import { describe, it, expect } from "vitest";
import type { LampContext } from "../../../lib/lamp-designer/types";
import {
  CONTEXT_META,
  getContextConstraints,
} from "../../../lib/lamp-designer/context-constraints";

const ALL_CONTEXTS: LampContext[] = [
  "bedside",
  "dining",
  "reading",
  "hallway",
  "desk",
  "shelf",
];

describe("CONTEXT_META", () => {
  it("has an entry for every LampContext value", () => {
    const ids = CONTEXT_META.map((m) => m.id);
    expect(ids).toEqual(ALL_CONTEXTS);
  });

  it("each entry has a non-empty label and description", () => {
    for (const meta of CONTEXT_META) {
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });
});

describe("getContextConstraints", () => {
  it("returns valid constraints for every LampContext value", () => {
    for (const ctx of ALL_CONTEXTS) {
      const constraints = getContextConstraints(ctx);
      expect(constraints).toBeDefined();
      expect(constraints.eyeHeightMin).toBeGreaterThan(0);
      expect(constraints.eyeHeightMax).toBeGreaterThan(constraints.eyeHeightMin);
      expect(constraints.suggestedProportionRatio).toBeGreaterThan(0);
      expect(constraints.suggestedProportionRatio).toBeLessThanOrEqual(1);
      expect(["down", "up", "ambient"]).toContain(
        constraints.suggestedLightDirection
      );
    }
  });

  it("throws for an unknown context", () => {
    expect(() => getContextConstraints("garage" as LampContext)).toThrow(
      "Unknown context: garage"
    );
  });

  it("each context has a unique set of constraints", () => {
    const seen = new Map<string, LampContext>();
    for (const ctx of ALL_CONTEXTS) {
      const c = getContextConstraints(ctx);
      const key = JSON.stringify(c);
      expect(seen.has(key)).toBe(false);
      seen.set(key, ctx);
    }
  });

  it("bedside suggests down light", () => {
    expect(getContextConstraints("bedside").suggestedLightDirection).toBe("down");
  });

  it("hallway suggests ambient light", () => {
    expect(getContextConstraints("hallway").suggestedLightDirection).toBe("ambient");
  });

  it("shelf suggests up light", () => {
    expect(getContextConstraints("shelf").suggestedLightDirection).toBe("up");
  });
});
