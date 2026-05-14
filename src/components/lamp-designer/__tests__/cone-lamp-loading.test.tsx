import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const loadingPath = resolve(
  __dirname,
  "../../../app/cone-lamp/loading.tsx",
);
const pagePath = resolve(
  __dirname,
  "../../../app/cone-lamp/page.tsx",
);

describe("ConeLampLoading skeleton", () => {
  const source = readFileSync(loadingPath, "utf-8");

  it("exports a default function", () => {
    expect(source).toContain("export default function ConeLampLoading");
  });

  it("applies animate-pulse for skeleton animation", () => {
    expect(source).toContain("animate-pulse");
  });

  it("uses the project bg-cream background", () => {
    expect(source).toContain("bg-cream");
  });

  it("includes a top bar skeleton", () => {
    expect(source).toContain("h-12");
    expect(source).toContain("border-b");
  });

  it("includes skeleton cards for leaf parts (5) and structural parts (4)", () => {
    expect(source).toContain("{ length: 5 }");
    expect(source).toContain("{ length: 4 }");
  });

  it("mirrors the part card height from the real page", () => {
    expect(source).toContain("h-[220px]");
  });
});

describe("ConeLampPage suspense boundary", () => {
  const source = readFileSync(pagePath, "utf-8");

  it("is a server component (no 'use client' directive)", () => {
    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("'use client'");
  });

  it("imports Suspense from react", () => {
    expect(source).toContain('import { Suspense } from "react"');
  });

  it("wraps ConeLampDesigner in a Suspense boundary", () => {
    expect(source).toContain("<Suspense");
    expect(source).toContain("<ConeLampDesigner");
  });

  it("uses ConeLampLoading as the suspense fallback", () => {
    expect(source).toContain("fallback={<ConeLampLoading");
  });

  it("imports the loading skeleton", () => {
    expect(source).toContain('import ConeLampLoading from "./loading"');
  });
});
