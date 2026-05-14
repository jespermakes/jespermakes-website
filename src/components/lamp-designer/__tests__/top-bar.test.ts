import { describe, it, expect } from "vitest";
import type { SaveStatus } from "../top-bar";

describe("LampDesignerTopBar SaveStatus type", () => {
  it("should accept all valid save statuses", () => {
    const statuses: SaveStatus[] = [
      "never-saved",
      "dirty",
      "saving",
      "saved",
      "error",
    ];
    expect(statuses).toHaveLength(5);
  });
});
