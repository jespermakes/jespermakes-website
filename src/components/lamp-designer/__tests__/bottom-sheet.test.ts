import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const source = readFileSync(
  resolve(__dirname, "../bottom-sheet.tsx"),
  "utf-8",
);

describe("BottomSheet", () => {
  it("exports the BottomSheet component", () => {
    expect(source).toContain("export function BottomSheet");
  });

  it("is hidden on md+ screens", () => {
    expect(source).toContain("md:hidden");
  });

  it("is fixed to the bottom of the viewport", () => {
    expect(source).toContain("fixed bottom-0 left-0 right-0");
  });

  it("has a drag handle visual indicator", () => {
    expect(source).toContain("w-8 h-1 rounded-full");
  });

  it("shows a backdrop when expanded", () => {
    expect(source).toContain("bg-black/20");
    expect(source).toContain("expanded &&");
  });

  it("uses ResizeObserver to measure content height", () => {
    expect(source).toContain("ResizeObserver");
  });

  it("animates max-height transitions", () => {
    expect(source).toContain("transition-[max-height]");
    expect(source).toContain("duration-300");
  });

  it("has an accessible toggle button", () => {
    expect(source).toContain("Collapse controls");
    expect(source).toContain("Expand controls");
  });

  it("accepts expanded, onToggle, peekContent, and children props", () => {
    expect(source).toContain("expanded: boolean");
    expect(source).toContain("onToggle: () => void");
    expect(source).toContain("peekContent: ReactNode");
    expect(source).toContain("children: ReactNode");
  });
});
