import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generatePrintSettingsText,
  downloadPrintSettings,
} from "./print-settings-card";

describe("generatePrintSettingsText", () => {
  it("includes the design name in the header", () => {
    const text = generatePrintSettingsText({ designName: "My Lamp" });
    expect(text).toContain("PRINT SETTINGS — My Lamp");
  });

  it("falls back to 'Lamp' for empty design name", () => {
    const text = generatePrintSettingsText({ designName: "" });
    expect(text).toContain("PRINT SETTINGS — Lamp");
  });

  it("includes slicer settings", () => {
    const text = generatePrintSettingsText({ designName: "test" });
    expect(text).toContain("Vase mode");
    expect(text).toContain("0.6 mm");
    expect(text).toContain("0.3 mm");
  });

  it("includes material settings", () => {
    const text = generatePrintSettingsText({ designName: "test" });
    expect(text).toContain("Translucent PETG");
    expect(text).toContain("75–80 °C");
    expect(text).toContain("230–245 °C");
  });

  it("includes hardware info", () => {
    const text = generatePrintSettingsText({ designName: "test" });
    expect(text).toContain("E27 LED");
    expect(text).toContain("12 W");
  });

  it("includes dimensions when provided", () => {
    const text = generatePrintSettingsText({
      designName: "test",
      heightMm: 150,
      topDiameterMm: 80,
      bottomDiameterMm: 120,
      wallThicknessMm: 1.2,
    });
    expect(text).toContain("DIMENSIONS");
    expect(text).toContain("150.0 mm");
    expect(text).toContain("80.0 mm");
    expect(text).toContain("120.0 mm");
    expect(text).toContain("1.2 mm");
  });

  it("omits dimensions section when none provided", () => {
    const text = generatePrintSettingsText({ designName: "test" });
    expect(text).not.toContain("DIMENSIONS");
  });

  it("includes partial dimensions", () => {
    const text = generatePrintSettingsText({
      designName: "test",
      heightMm: 200,
    });
    expect(text).toContain("DIMENSIONS");
    expect(text).toContain("200.0 mm");
    expect(text).not.toContain("Top diameter");
  });

  it("includes the attribution footer", () => {
    const text = generatePrintSettingsText({ designName: "test" });
    expect(text).toContain("jespermakes.com/lamp-designer");
  });
});

describe("downloadPrintSettings", () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let attrs: Record<string, string>;
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    attrs = {};

    const fakeLink = {
      set href(v: string) { attrs.href = v; },
      get href() { return attrs.href ?? ""; },
      set download(v: string) { attrs.download = v; },
      get download() { return attrs.download ?? ""; },
      click: clickSpy,
    };

    const createElementSpy = vi.fn(() => fakeLink);
    createObjectURLSpy = vi.fn(() => "blob:mock-url");
    revokeObjectURLSpy = vi.fn();

    // @ts-expect-error -- minimal shim
    globalThis.document = { createElement: createElementSpy };
    globalThis.URL.createObjectURL = createObjectURLSpy as typeof URL.createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURLSpy as typeof URL.revokeObjectURL;
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("triggers a download click", () => {
    downloadPrintSettings({ designName: "test" });
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("sets the download filename", () => {
    downloadPrintSettings({ designName: "test" }, "my-lamp-settings.txt");
    expect(attrs.download).toBe("my-lamp-settings.txt");
  });

  it("uses default filename when none provided", () => {
    downloadPrintSettings({ designName: "test" });
    expect(attrs.download).toBe("print-settings.txt");
  });

  it("creates a text/plain blob", () => {
    downloadPrintSettings({ designName: "test" });
    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/plain;charset=utf-8");
  });

  it("revokes the object URL after download", () => {
    downloadPrintSettings({ designName: "test" });
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});
