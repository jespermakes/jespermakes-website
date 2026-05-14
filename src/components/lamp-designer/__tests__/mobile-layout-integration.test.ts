import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const source = readFileSync(
  resolve(__dirname, "../cone-lamp-designer.tsx"),
  "utf-8",
);

describe("ConeLampDesigner mobile responsive layout", () => {
  it("imports MobileStepNav and Step type", () => {
    expect(source).toContain(
      'import { MobileStepNav, type Step } from "@/components/lamp-designer/mobile-step-nav"',
    );
  });

  it("imports BottomSheet", () => {
    expect(source).toContain(
      'import { BottomSheet } from "@/components/lamp-designer/bottom-sheet"',
    );
  });

  it("tracks mobile step state", () => {
    expect(source).toContain("useState<Step>(");
  });

  it("tracks bottom sheet expanded state", () => {
    expect(source).toContain("sheetExpanded");
    expect(source).toContain("setSheetExpanded");
  });

  it("renders MobileStepNav component", () => {
    expect(source).toContain("<MobileStepNav");
  });

  it("renders BottomSheet component", () => {
    expect(source).toContain("<BottomSheet");
  });

  it("has separate desktop layout hidden on mobile", () => {
    expect(source).toContain('className="hidden md:block');
  });

  it("has separate mobile layout hidden on desktop", () => {
    expect(source).toContain('className="md:hidden px-4');
  });

  it("shows conditional content based on mobile step", () => {
    expect(source).toContain('mobileStep === "design"');
    expect(source).toContain('mobileStep === "parts"');
    expect(source).toContain('mobileStep === "export"');
  });

  it("includes a MobileSheetPeek component with next button", () => {
    expect(source).toContain("MobileSheetPeek");
    expect(source).toContain("Next →");
  });

  it("has quick-adjust thickness buttons in bottom sheet for design step", () => {
    expect(source).toContain("Quick adjust");
    expect(source).toContain("[3, 4, 5, 6, 6.4, 7, 8]");
  });

  it("adds bottom padding on mobile for bottom sheet clearance", () => {
    expect(source).toContain("pb-24");
  });

  it("collapses sheet when changing steps", () => {
    expect(source).toContain("setSheetExpanded(false)");
  });
});
