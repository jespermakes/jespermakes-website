import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("lamp-designer layout", () => {
  const source = readFileSync(
    resolve(__dirname, "layout.tsx"),
    "utf-8"
  );

  it("exports metadata with correct title", () => {
    expect(source).toContain('"3D Lamp Designer | Jesper Makes"');
  });

  it("exports metadata with canonical URL", () => {
    expect(source).toContain('canonical: "/lamp-designer"');
  });

  it("exports a default layout function", () => {
    expect(source).toMatch(/export default function \w+Layout/);
  });

  it("renders children as passthrough", () => {
    expect(source).toContain("{children}");
  });
});
