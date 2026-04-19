"use client";

import { useState, useEffect, useRef } from "react";
import { trackBoxJointJig } from "@/lib/box-joint-jig-track";
import { downloadAssemblyPDF } from "@/lib/box-joint-jig-export";

const MM_PER_INCH = 25.4;

// ---------- helpers ----------

function inchesToFraction(inches: number): string {
  if (isNaN(inches) || inches < 0) return "0";
  const whole = Math.floor(inches + 0.00001);
  const frac = inches - whole;
  const sixteenths = Math.round(frac * 16);

  if (sixteenths === 16) return `${whole + 1}`;
  if (sixteenths === 0) return whole === 0 ? "0" : `${whole}`;

  let num = sixteenths;
  let den = 16;
  while (num % 2 === 0) {
    num /= 2;
    den /= 2;
  }

  if (whole === 0) return `${num}/${den}`;
  return `${whole} ${num}/${den}`;
}

function mmToFraction(mm: number): string {
  return inchesToFraction(mm / MM_PER_INCH);
}

function parseImperial(str: string): number {
  if (!str || typeof str !== "string") return NaN;
  const cleaned = str.trim().replace(/["']/g, "");
  const mixed = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const frac = cleaned.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  const num = parseFloat(cleaned);
  return isNaN(num) ? NaN : num;
}

function formatLength(mm: number, unit: "mm" | "in"): string {
  if (unit === "mm") return `${Math.round(mm)}`;
  return mmToFraction(mm);
}

function unitSuffix(unit: "mm" | "in"): string {
  return unit === "mm" ? "mm" : "in";
}

// ---------- component ----------

export default function BoxJointJigPage() {
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const [thickness, setThickness] = useState(45); // always in mm
  const [thicknessText, setThicknessText] = useState("45");
  const [fingers, setFingers] = useState(5);
  const [slotHeightOverride, setSlotHeightOverride] = useState("");
  const [marginVerticalOverride, setMarginVerticalOverride] = useState("");
  const [marginHorizontalOverride, setMarginHorizontalOverride] = useState("");
  const [title, setTitle] = useState("JESPER MAKES BOX JOINTS");
  const [showTitle, setShowTitle] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const [labelText, setLabelText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAssembly, setShowAssembly] = useState(false);

  const assemblyRef = useRef<HTMLDivElement>(null);

  // Track page view once on mount
  useEffect(() => {
    trackBoxJointJig({ eventType: "page_view" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the editable thickness text input with the canonical mm value
  useEffect(() => {
    if (unit === "mm") {
      setThicknessText(String(Math.round(thickness)));
    } else {
      setThicknessText(mmToFraction(thickness));
    }
  }, [unit, thickness]);

  const commitThicknessText = () => {
    if (unit === "mm") {
      const v = parseFloat(thicknessText);
      if (!isNaN(v) && v > 0) setThickness(Math.round(v));
      else setThicknessText(String(Math.round(thickness)));
    } else {
      const inches = parseImperial(thicknessText);
      if (!isNaN(inches) && inches > 0) {
        const snapped = Math.round(inches * 16) / 16;
        setThickness(snapped * MM_PER_INCH);
      } else {
        setThicknessText(mmToFraction(thickness));
      }
    }
  };

  const sliderMin = unit === "mm" ? 6 : 0.25 * MM_PER_INCH;
  const sliderMax = unit === "mm" ? 80 : 2.5 * MM_PER_INCH;
  const sliderStep = unit === "mm" ? 1 : MM_PER_INCH / 16;

  const t = thickness;
  const slotHeight =
    slotHeightOverride && Number(slotHeightOverride) > 0
      ? Number(slotHeightOverride)
      : t * 1.6;
  const marginV =
    marginVerticalOverride && Number(marginVerticalOverride) > 0
      ? Number(marginVerticalOverride)
      : t * 0.6;
  const marginH =
    marginHorizontalOverride && Number(marginHorizontalOverride) > 0
      ? Number(marginHorizontalOverride)
      : t * 0.6;

  const defaultLabel = unit === "mm" ? `${Math.round(t)}MM` : `${mmToFraction(t)} IN`;
  const label = labelText || defaultLabel;

  const titleSize = Math.max(8, t * 0.55);
  const labelSize = Math.max(8, t * 0.55);

  const plateWidth = 2 * marginH + (2 * fingers + 1) * t;
  const titleBlock = showTitle && title ? titleSize + marginV * 0.6 : 0;
  const labelBlock = showLabel ? labelSize + marginV * 0.6 : 0;
  const plateHeight = marginV + titleBlock + slotHeight + labelBlock + marginV;

  const slots: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (let i = 0; i < fingers; i++) {
    slots.push({
      x: marginH + t + i * 2 * t,
      y: marginV + titleBlock,
      width: t,
      height: slotHeight,
    });
  }

  const titleY = marginV + titleSize * 0.85;
  const labelY = marginV + titleBlock + slotHeight + marginV * 0.6 + labelSize * 0.85;

  // Assembly diagram geometry — relative to plateWidth for consistent rendering
  const asmPad = Math.max(4, plateWidth * 0.03);
  const asmStroke = plateWidth * 0.004;
  const asmDashA = plateWidth * 0.02;
  const asmDashB = plateWidth * 0.013;
  const asmText = plateWidth * 0.038;
  const cutLineY = slots[0] ? slots[0].y + slots[0].height / 2 : plateHeight / 2;
  // Back-strip gap is centered vertically on the plate
  const gapTop = plateHeight / 2 - t / 2;
  const gapBot = gapTop + t;

  const generateSVG = (): string => {
    const pad = 5;
    const w = plateWidth + pad * 2;
    const h = plateHeight + pad * 2;
    const docUnit = unit === "mm" ? "mm" : "in";
    const docW = unit === "mm" ? w : w / MM_PER_INCH;
    const docH = unit === "mm" ? h : h / MM_PER_INCH;

    const slotsXml = slots
      .map(
        (s) =>
          `  <rect x="${(pad + s.x).toFixed(3)}" y="${(pad + s.y).toFixed(3)}" width="${s.width.toFixed(3)}" height="${s.height.toFixed(3)}" rx="${(s.width / 2).toFixed(3)}" ry="${(s.width / 2).toFixed(3)}" fill="none" stroke="#000000" stroke-width="0.2"/>`
      )
      .join("\n");

    const titleXml =
      showTitle && title
        ? `  <text x="${(pad + plateWidth / 2).toFixed(3)}" y="${(pad + titleY).toFixed(3)}" font-family="Arial, sans-serif" font-size="${titleSize.toFixed(3)}" font-weight="700" text-anchor="middle" fill="#000000">${title}</text>`
        : "";

    const labelXml = showLabel
      ? `  <text x="${(pad + plateWidth / 2).toFixed(3)}" y="${(pad + labelY).toFixed(3)}" font-family="Arial, sans-serif" font-size="${labelSize.toFixed(3)}" font-weight="700" text-anchor="middle" fill="#000000">${label}</text>`
      : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${docW.toFixed(3)}${docUnit}" height="${docH.toFixed(3)}${docUnit}" viewBox="0 0 ${w.toFixed(3)} ${h.toFixed(3)}">
  <!-- Box Joint Jig - generated by Jesper Makes Studio -->
  <!-- For ${formatLength(t, unit)}${unitSuffix(unit)} thick wood, ${fingers} fingers -->
  <!-- Plate: ${formatLength(plateWidth, unit)} x ${formatLength(plateHeight, unit)} ${unitSuffix(unit)} -->
  <rect x="${pad}" y="${pad}" width="${plateWidth.toFixed(3)}" height="${plateHeight.toFixed(3)}" fill="none" stroke="#000000" stroke-width="0.2"/>
${slotsXml}${titleXml ? "\n" + titleXml : ""}${labelXml ? "\n" + labelXml : ""}
</svg>`;
  };

  const downloadSVG = () => {
    trackBoxJointJig({
      eventType: "svg_download",
      unit,
      thickness: t,
      fingers,
      hasCustomTitle: showTitle && title !== "JESPER MAKES BOX JOINTS",
      hasCustomLabel: showLabel && labelText !== "",
    });

    const svg = generateSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const tStr =
      unit === "mm"
        ? `${Math.round(t)}mm`
        : `${mmToFraction(t).replace(/[\s/]/g, "-")}in`;
    a.download = `box-joint-jig-${tStr}-${fingers}fingers.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openAssembly = () => {
    setShowAssembly(true);
    trackBoxJointJig({ eventType: "guide_view", unit, thickness: t, fingers });
  };

  const downloadPDF = async () => {
    if (!assemblyRef.current) return;
    trackBoxJointJig({
      eventType: "pdf_download",
      unit,
      thickness: t,
      fingers,
    });
    const tStr =
      unit === "mm"
        ? `${Math.round(t)}mm`
        : `${mmToFraction(t).replace(/[\s/]/g, "-")}in`;
    await downloadAssemblyPDF(
      assemblyRef.current,
      `box-joint-jig-assembly-${tStr}-${fingers}fingers.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-cream text-wood">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        {/* Header */}
        <div className="mb-9 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
              Jesper Makes Studio
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-wood mb-3">
              The Box Joint Jig Designer
            </h1>
            <p className="text-wood-light/65 text-[15px] max-w-[620px] leading-relaxed m-0">
              Generate a cut-ready box joint template for any wood thickness. Drop the SVG into Shaper Origin, your laser cutter, or any CNC router. Free, forever.
            </p>
          </div>
          <div className="pt-5">
            <div className="inline-flex bg-wood/[0.06] rounded-full p-[3px] gap-[2px]">
              {(["mm", "in"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`border-none px-[18px] py-[7px] rounded-full text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer transition-all ${
                    unit === u
                      ? "bg-wood text-cream"
                      : "bg-transparent text-wood-light/55"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-7 items-start">
          {/* Controls */}
          <div className="bg-white/55 border border-wood/[0.06] rounded-2xl p-6">
            {/* Thickness */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                Wood Thickness
              </label>
              <div className="flex items-center gap-3.5">
                <input
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={thickness}
                  onChange={(e) => setThickness(Number(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: "#3F6B4A" }}
                />
                <div className="flex items-baseline gap-1 min-w-[88px] justify-end">
                  <input
                    type="text"
                    value={thicknessText}
                    onChange={(e) => setThicknessText(e.target.value)}
                    onBlur={commitThicknessText}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    className="w-16 border-none bg-transparent text-wood text-xl font-semibold text-right outline-none p-0"
                  />
                  <span className="text-xs text-wood-light/45">
                    {unitSuffix(unit)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-wood-light/50 mt-2 leading-snug">
                {unit === "mm"
                  ? "The slot width and divider width both equal the wood thickness. That's what makes box joints work."
                  : "Type fractions like 3/4 or 1 1/2. Slots and dividers both equal the wood thickness."}
              </p>
            </div>

            {/* Fingers */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                Number of Fingers
              </label>
              <div className="flex items-center gap-3.5">
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={fingers}
                  onChange={(e) => setFingers(Number(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: "#3F6B4A" }}
                />
                <div className="flex items-baseline gap-1 min-w-[88px] justify-end">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={fingers}
                    onChange={(e) => setFingers(Number(e.target.value) || 2)}
                    className="w-16 border-none bg-transparent text-wood text-xl font-semibold text-right outline-none p-0"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase">
                  Title Text
                </span>
                <button
                  onClick={() => setShowTitle(!showTitle)}
                  className={`border-none bg-transparent text-[11px] font-bold tracking-wider cursor-pointer p-0 ${
                    showTitle ? "text-forest" : "text-wood-light/35"
                  }`}
                >
                  {showTitle ? "ON" : "OFF"}
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!showTitle}
                placeholder="BOX JOINT JIG"
                maxLength={40}
                className={`w-full px-3.5 py-2.5 border border-wood/[0.12] rounded-[10px] bg-white/70 text-wood text-sm outline-none ${
                  showTitle ? "opacity-100" : "opacity-40"
                }`}
              />
            </div>

            {/* Label */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase">
                  Size Label
                </span>
                <button
                  onClick={() => setShowLabel(!showLabel)}
                  className={`border-none bg-transparent text-[11px] font-bold tracking-wider cursor-pointer p-0 ${
                    showLabel ? "text-forest" : "text-wood-light/35"
                  }`}
                >
                  {showLabel ? "ON" : "OFF"}
                </button>
              </div>
              <input
                type="text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                disabled={!showLabel}
                placeholder={defaultLabel}
                maxLength={12}
                className={`w-full px-3.5 py-2.5 border border-wood/[0.12] rounded-[10px] bg-white/70 text-wood text-sm outline-none ${
                  showLabel ? "opacity-100" : "opacity-40"
                }`}
              />
            </div>

            {/* Advanced */}
            <div className="border-t border-wood/[0.06] pt-4 mt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="border-none bg-transparent text-wood-light/55 text-[10px] font-bold tracking-[0.15em] uppercase cursor-pointer p-0 flex items-center gap-2"
              >
                <span className="text-[8px]">{showAdvanced ? "▼" : "▶"}</span> Advanced
              </button>
              {showAdvanced && (
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                      Slot Depth (mm)
                    </label>
                    <input
                      type="number"
                      placeholder={`auto: ${(t * 1.6).toFixed(0)}`}
                      value={slotHeightOverride}
                      onChange={(e) => setSlotHeightOverride(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wood/[0.12] rounded-[10px] bg-white/70 text-wood text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                      Top / Bottom Margin (mm)
                    </label>
                    <input
                      type="number"
                      placeholder={`auto: ${(t * 0.6).toFixed(0)}`}
                      value={marginVerticalOverride}
                      onChange={(e) => setMarginVerticalOverride(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wood/[0.12] rounded-[10px] bg-white/70 text-wood text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                      Left / Right Margin (mm)
                    </label>
                    <input
                      type="number"
                      placeholder={`auto: ${(t * 0.6).toFixed(0)}`}
                      value={marginHorizontalOverride}
                      onChange={(e) => setMarginHorizontalOverride(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-wood/[0.12] rounded-[10px] bg-white/70 text-wood text-sm outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="bg-white/55 border border-wood/[0.06] rounded-2xl p-9 min-h-[340px] flex items-center justify-center">
              <svg
                viewBox={`-2 -2 ${plateWidth + 4} ${plateHeight + 4}`}
                className="w-full max-h-[380px] overflow-visible"
              >
                <rect
                  x="0"
                  y="0"
                  width={plateWidth}
                  height={plateHeight}
                  fill="rgba(63, 107, 74, 0.07)"
                  stroke="#2C1810"
                  strokeWidth={Math.max(0.4, plateWidth * 0.0018)}
                />
                {slots.map((s, i) => (
                  <rect
                    key={i}
                    x={s.x}
                    y={s.y}
                    width={s.width}
                    height={s.height}
                    rx={s.width / 2}
                    ry={s.width / 2}
                    fill="#FAF7F2"
                    stroke="#2C1810"
                    strokeWidth={Math.max(0.4, plateWidth * 0.0018)}
                  />
                ))}
                {showTitle && title && (
                  <text
                    x={plateWidth / 2}
                    y={titleY}
                    fontFamily="Georgia, serif"
                    fontSize={titleSize}
                    fontWeight="700"
                    textAnchor="middle"
                    fill="#4A3228"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {title}
                  </text>
                )}
                {showLabel && (
                  <text
                    x={plateWidth / 2}
                    y={labelY}
                    fontFamily="Georgia, serif"
                    fontSize={labelSize}
                    fontWeight="700"
                    textAnchor="middle"
                    fill="#4A3228"
                  >
                    {label}
                  </text>
                )}
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/55 border border-wood/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                  Plate Width
                </div>
                <div className="text-[22px] font-semibold text-wood">
                  {formatLength(plateWidth, unit)}
                  <span className="text-xs text-wood-light/50 ml-1 font-normal">
                    {unitSuffix(unit)}
                  </span>
                </div>
              </div>
              <div className="bg-white/55 border border-wood/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                  Plate Height
                </div>
                <div className="text-[22px] font-semibold text-wood">
                  {formatLength(plateHeight, unit)}
                  <span className="text-xs text-wood-light/50 ml-1 font-normal">
                    {unitSuffix(unit)}
                  </span>
                </div>
              </div>
              <div className="bg-white/55 border border-wood/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                  Joint Spacing
                </div>
                <div className="text-[22px] font-semibold text-wood">
                  {formatLength(t, unit)}
                  <span className="text-xs text-wood-light/50 ml-1 font-normal">
                    {unitSuffix(unit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <button
                onClick={downloadSVG}
                className="bg-wood text-cream border-none rounded-xl py-[18px] text-sm font-semibold cursor-pointer tracking-wide hover:bg-[#1f110b] transition-colors"
              >
                Download SVG
              </button>
              <button
                onClick={openAssembly}
                className="bg-forest/10 text-forest border border-forest/25 rounded-xl py-[18px] text-sm font-semibold cursor-pointer tracking-wide hover:bg-forest/15 transition-colors"
              >
                View Assembly Guide
              </button>
            </div>

            <p className="text-[11px] text-wood-light/50 text-center mt-3 leading-relaxed">
              Works with Shaper Origin, most CNC routers, and laser cutters. Text exports as SVG text — convert to paths in your CAM software if needed.
            </p>
          </div>
        </div>

        {/* Note from Jesper at bottom */}
        <div className="mt-12 mx-auto p-6 bg-forest/[0.08] border border-forest/[0.18] rounded-xl text-sm text-wood-light leading-relaxed max-w-[720px]">
          <strong className="text-wood">A note from Jesper:</strong> I built this same jig for a video about making big planters with my wife. The trick is committing to one wood thickness — once you do that, the math just works. 45mm stock gives you 45mm fingers and 45mm gaps. Don&apos;t overthink it.
        </div>
      </div>

      {/* Assembly modal */}
      {showAssembly && (
        <div
          onClick={() => setShowAssembly(false)}
          className="fixed inset-0 bg-wood/55 flex items-start justify-center px-5 py-10 overflow-y-auto z-[100]"
        >
          <div
            ref={assemblyRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-cream rounded-2xl max-w-[720px] w-full px-14 py-12 relative shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
          >
            <button
              onClick={() => setShowAssembly(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border-none bg-wood/[0.08] text-wood text-lg cursor-pointer flex items-center justify-center"
            >
              ×
            </button>

            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase">
              Jesper Makes Studio · Assembly Guide
            </div>
            <h2 className="font-serif text-[32px] font-normal mt-1 mb-2 leading-tight">
              Building Your Box Joint Jig
            </h2>
            <p className="text-wood-light/65 text-sm mt-0 mb-8 leading-relaxed">
              For {formatLength(t, unit)}{unitSuffix(unit)} thick wood · {fingers} fingers · plate {formatLength(plateWidth, unit)} × {formatLength(plateHeight, unit)} {unitSuffix(unit)}
            </p>

            <div className="bg-forest/[0.08] border border-forest/20 rounded-xl px-6 py-5 mb-8">
              <div className="text-[10px] font-bold tracking-[0.15em] text-forest uppercase mb-2">
                You&apos;ll Need
              </div>
              <ul className="mt-2 pl-5 text-sm leading-[1.7] text-wood-light list-disc">
                <li>Two sheets of plywood, each at least {formatLength(plateWidth, unit)} × {formatLength(plateHeight, unit)} {unitSuffix(unit)} (12mm / 1/2&quot; plywood works well)</li>
                <li>A CNC router, laser cutter, or Shaper Origin</li>
                <li>Wood glue and a few wood screws</li>
                <li>A piece of scrap {formatLength(t, unit)}{unitSuffix(unit)} stock to use as a spacer</li>
              </ul>
            </div>

            {/* Steps — see assembly diagrams below the steps array */}
            {[
              {
                title: "Cut two identical plates",
                body: `Load the SVG into your CAM software and cut two copies of the plate. Both will be identical: ${formatLength(plateWidth, unit)} × ${formatLength(plateHeight, unit)} ${unitSuffix(unit)}, with ${fingers} oval slots.`,
                diagram: (
                  <svg
                    viewBox={`0 0 ${plateWidth * 2 + asmPad * 3} ${plateHeight + asmPad * 2}`}
                    className="w-full max-w-[340px]"
                  >
                    {[0, 1].map((pi) => (
                      <g
                        key={pi}
                        transform={`translate(${asmPad + pi * (plateWidth + asmPad)}, ${asmPad})`}
                      >
                        <rect
                          x={0}
                          y={0}
                          width={plateWidth}
                          height={plateHeight}
                          fill="rgba(63, 107, 74, 0.12)"
                          stroke="#2C1810"
                          strokeWidth={asmStroke}
                        />
                        {slots.map((s, i) => (
                          <rect
                            key={i}
                            x={s.x}
                            y={s.y}
                            width={s.width}
                            height={s.height}
                            rx={s.width / 2}
                            ry={s.width / 2}
                            fill="#FAF7F2"
                            stroke="#2C1810"
                            strokeWidth={asmStroke}
                          />
                        ))}
                      </g>
                    ))}
                  </svg>
                ),
              },
              {
                title: "Slice one plate down the middle",
                body: `Take ONE of the two plates and cut it cleanly down the long axis, splitting it into two narrower strips. A table saw or track saw makes this easy — the cut line runs right through the middle of the slot row.`,
                diagram: (
                  <svg
                    viewBox={`0 0 ${plateWidth + asmPad * 2} ${plateHeight + asmPad * 2}`}
                    className="w-full max-w-[320px]"
                  >
                    <g transform={`translate(${asmPad}, ${asmPad})`}>
                      <rect
                        x={0}
                        y={0}
                        width={plateWidth}
                        height={plateHeight}
                        fill="rgba(63, 107, 74, 0.12)"
                        stroke="#2C1810"
                        strokeWidth={asmStroke}
                      />
                      {slots.map((s, i) => (
                        <rect
                          key={i}
                          x={s.x}
                          y={s.y}
                          width={s.width}
                          height={s.height}
                          rx={s.width / 2}
                          ry={s.width / 2}
                          fill="#FAF7F2"
                          stroke="#2C1810"
                          strokeWidth={asmStroke}
                        />
                      ))}
                      <line
                        x1={-asmPad}
                        y1={cutLineY}
                        x2={plateWidth + asmPad}
                        y2={cutLineY}
                        stroke="#3F6B4A"
                        strokeWidth={asmStroke * 1.8}
                        strokeDasharray={`${asmDashA} ${asmDashB}`}
                      />
                      <text
                        x={plateWidth + asmPad - asmText * 0.3}
                        y={cutLineY - asmText * 0.4}
                        textAnchor="end"
                        fill="#3F6B4A"
                        fontSize={asmText}
                        fontFamily="Inter, sans-serif"
                        fontWeight="700"
                      >
                        CUT
                      </text>
                    </g>
                  </svg>
                ),
              },
              {
                title: "Mount the strips on the back",
                body: `Flip the intact plate over (slot side down). Glue and screw the two strips onto the back, leaving exactly ${formatLength(t, unit)}${unitSuffix(unit)} of empty space between them. Use a piece of your actual stock as a spacer to get the gap perfect.`,
                diagram: (
                  <svg
                    viewBox={`0 0 ${plateWidth + asmPad * 2} ${plateHeight + asmPad * 2}`}
                    className="w-full max-w-[320px]"
                  >
                    <g transform={`translate(${asmPad}, ${asmPad})`}>
                      <rect
                        x={0}
                        y={0}
                        width={plateWidth}
                        height={plateHeight}
                        fill="rgba(63, 107, 74, 0.12)"
                        stroke="#2C1810"
                        strokeWidth={asmStroke}
                      />
                      <rect
                        x={0}
                        y={0}
                        width={plateWidth}
                        height={gapTop}
                        fill="rgba(44, 24, 16, 0.08)"
                        stroke="#3F6B4A"
                        strokeWidth={asmStroke * 1.6}
                        strokeDasharray={`${asmDashA} ${asmDashB}`}
                      />
                      <rect
                        x={0}
                        y={gapBot}
                        width={plateWidth}
                        height={plateHeight - gapBot}
                        fill="rgba(44, 24, 16, 0.08)"
                        stroke="#3F6B4A"
                        strokeWidth={asmStroke * 1.6}
                        strokeDasharray={`${asmDashA} ${asmDashB}`}
                      />
                      {slots.map((s, i) => (
                        <rect
                          key={i}
                          x={s.x}
                          y={s.y}
                          width={s.width}
                          height={s.height}
                          rx={s.width / 2}
                          ry={s.width / 2}
                          fill="#FAF7F2"
                          stroke="#2C1810"
                          strokeWidth={asmStroke}
                        />
                      ))}
                      <text
                        x={plateWidth / 2}
                        y={gapTop + t / 2 + asmText * 0.35}
                        textAnchor="middle"
                        fill="#3F6B4A"
                        fontSize={asmText}
                        fontFamily="Inter, sans-serif"
                        fontWeight="700"
                      >
                        {formatLength(t, unit)}{unitSuffix(unit)} GAP
                      </text>
                    </g>
                  </svg>
                ),
              },
              {
                title: "Slide your workpiece into the gap",
                body: `The jig is done. Slide your ${formatLength(t, unit)}${unitSuffix(unit)} stock into the gap between the back strips, line up where you want the box joints, and clamp it in place. Run your router or Shaper through the slots and you'll get perfect ${formatLength(t, unit)}${unitSuffix(unit)} fingers every time.`,
                diagram: (
                  <svg
                    viewBox={`${-plateWidth * 0.15} 0 ${plateWidth * 1.3 + asmPad * 2} ${plateHeight + asmPad * 2}`}
                    className="w-full max-w-[360px]"
                  >
                    <g transform={`translate(${asmPad}, ${asmPad})`}>
                      <rect
                        x={0}
                        y={0}
                        width={plateWidth}
                        height={plateHeight}
                        fill="rgba(63, 107, 74, 0.12)"
                        stroke="#2C1810"
                        strokeWidth={asmStroke}
                      />
                      <rect
                        x={0}
                        y={0}
                        width={plateWidth}
                        height={gapTop}
                        fill="rgba(44, 24, 16, 0.08)"
                        stroke="#3F6B4A"
                        strokeWidth={asmStroke * 1.6}
                        strokeDasharray={`${asmDashA} ${asmDashB}`}
                      />
                      <rect
                        x={0}
                        y={gapBot}
                        width={plateWidth}
                        height={plateHeight - gapBot}
                        fill="rgba(44, 24, 16, 0.08)"
                        stroke="#3F6B4A"
                        strokeWidth={asmStroke * 1.6}
                        strokeDasharray={`${asmDashA} ${asmDashB}`}
                      />
                      <rect
                        x={-plateWidth * 0.14}
                        y={gapTop + asmStroke * 0.5}
                        width={plateWidth * 1.28}
                        height={t - asmStroke}
                        fill="rgba(139, 90, 43, 0.55)"
                        stroke="#2C1810"
                        strokeWidth={asmStroke}
                      />
                      {slots.map((s, i) => (
                        <rect
                          key={i}
                          x={s.x}
                          y={s.y}
                          width={s.width}
                          height={s.height}
                          rx={s.width / 2}
                          ry={s.width / 2}
                          fill="#FAF7F2"
                          stroke="#2C1810"
                          strokeWidth={asmStroke}
                        />
                      ))}
                    </g>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr] gap-4 mb-7">
                <div className="w-8 h-8 rounded-full bg-wood text-cream flex items-center justify-center font-serif text-[15px] font-semibold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-serif text-[19px] font-semibold mt-1 mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-wood-light mt-0 mb-4 leading-relaxed">
                    {step.body}
                  </p>
                  <div className="bg-white/60 border border-wood/[0.06] rounded-[10px] p-4 flex justify-center">
                    {step.diagram}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-wood/[0.08] text-xs text-wood-light/55 leading-relaxed">
              <strong className="text-wood-light">A note from Jesper:</strong> I built this same jig for a video about making big planters with my wife. The trick is committing to one wood thickness — once you do that, the math just works. 45mm stock gives you 45mm fingers and 45mm gaps. Don&apos;t overthink it.
            </div>

            <button
              onClick={downloadPDF}
              className="w-full mt-6 bg-wood text-cream border-none rounded-xl py-4 text-sm font-semibold cursor-pointer hover:bg-[#1f110b] transition-colors"
            >
              Download Assembly Guide as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
