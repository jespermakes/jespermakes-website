import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BoxGeometry } from "three";
import { downloadSTL } from "./export-stl";
import { download3MF } from "./export-3mf";

// Minimal DOM shims for download tests (no jsdom needed)
function setupDOMMocks() {
  const clickSpy = vi.fn();
  const attrs: Record<string, string> = {};

  const fakeLink = {
    set href(v: string) { attrs.href = v; },
    get href() { return attrs.href ?? ""; },
    set download(v: string) { attrs.download = v; },
    get download() { return attrs.download ?? ""; },
    click: clickSpy,
  };

  const createElementSpy = vi.fn(() => fakeLink);
  const createObjectURLSpy = vi.fn(() => "blob:mock-url");
  const revokeObjectURLSpy = vi.fn();

  // @ts-expect-error -- minimal shim
  globalThis.document = { createElement: createElementSpy };
  globalThis.URL.createObjectURL = createObjectURLSpy;
  globalThis.URL.revokeObjectURL = revokeObjectURLSpy;

  return { clickSpy, attrs, createObjectURLSpy, revokeObjectURLSpy };
}

describe("downloadSTL", () => {
  let mocks: ReturnType<typeof setupDOMMocks>;

  beforeEach(() => { mocks = setupDOMMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("triggers a download click", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    downloadSTL(geometry, "test.stl");
    expect(mocks.clickSpy).toHaveBeenCalledOnce();
  });

  it("creates and revokes an object URL", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    downloadSTL(geometry, "test.stl");
    expect(mocks.createObjectURLSpy).toHaveBeenCalledOnce();
    expect(mocks.revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("sets the download filename", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    downloadSTL(geometry, "my-lamp.stl");
    expect(mocks.attrs.download).toBe("my-lamp.stl");
  });

  it("uses default filename when none provided", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    downloadSTL(geometry);
    expect(mocks.attrs.download).toBe("lamp.stl");
  });
});

describe("download3MF", () => {
  let mocks: ReturnType<typeof setupDOMMocks>;

  beforeEach(() => { mocks = setupDOMMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("triggers a download click", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    download3MF(geometry, "test.3mf");
    expect(mocks.clickSpy).toHaveBeenCalledOnce();
  });

  it("sets the download filename", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    download3MF(geometry, "my-lamp.3mf");
    expect(mocks.attrs.download).toBe("my-lamp.3mf");
  });

  it("uses default filename when none provided", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    download3MF(geometry);
    expect(mocks.attrs.download).toBe("lamp.3mf");
  });
});

describe("filename sanitization (component logic)", () => {
  function sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, "_") || "lamp";
  }

  it("keeps valid characters", () => {
    expect(sanitize("my-lamp_v2")).toBe("my-lamp_v2");
  });

  it("replaces spaces and special chars", () => {
    expect(sanitize("my lamp (v2)")).toBe("my_lamp__v2_");
  });

  it("falls back to 'lamp' for empty result", () => {
    expect(sanitize("")).toBe("lamp");
  });
});
