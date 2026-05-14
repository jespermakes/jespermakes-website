"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { generateAllParts, type Part } from "@/lib/cone-lamp/parts";
import { generateCutSheetSVG } from "@/lib/cone-lamp/cut-sheet";
import { trackConeLamp } from "@/lib/cone-lamp-track";
import { TOP_INNER_PATHS, BOTTOM_HOLE } from "@/lib/cone-lamp/constants";
import {
  LampDesignerTopBar,
  type SaveStatus,
} from "@/components/lamp-designer/top-bar";
import { LampDesignsDialog } from "@/components/lamp-designer/designs-dialog";
import { PublishModal } from "@/components/studio/publish-modal";

const ASSEMBLY_GUIDE_URL = "/downloads/cone-lamp-assembly-guide.pdf";
const DEFAULT_THICKNESS = 6.4;

export default function ConeLampPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? null;

  const [thicknessMM, setThicknessMM] = useState(DEFAULT_THICKNESS);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState("Untitled");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("never-saved");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Load design from URL ?id= parameter
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      initialLoadRef.current = false;
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/lamp-designer/designs/${id}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          design: {
            id: string;
            name: string;
            parameters: { thicknessMM?: number };
          };
        };
        setDesignId(json.design.id);
        setDesignName(json.design.name);
        if (typeof json.design.parameters?.thicknessMM === "number") {
          setThicknessMM(json.design.parameters.thicknessMM);
        }
        setSaveStatus("saved");
        dirtyRef.current = false;
      } catch {
        // Failed to load — start fresh
      } finally {
        initialLoadRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark dirty when thickness changes (skip initial load)
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (saveStatus === "saving") return;
    dirtyRef.current = true;
    setSaveStatus((s) => (s === "never-saved" ? "never-saved" : "dirty"));
  }, [thicknessMM, saveStatus]);

  useEffect(() => {
    trackConeLamp({ eventType: "page_view" });
  }, []);

  const handleSave = useCallback(async () => {
    if (!isLoggedIn) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/lamp-designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: designId,
          name: designName,
          parameters: { thicknessMM },
        }),
      });
      if (!res.ok) {
        setSaveStatus("error");
        return;
      }
      const json = (await res.json()) as {
        design: { id: string; name: string };
      };
      setDesignId(json.design.id);
      setSaveStatus("saved");
      dirtyRef.current = false;
      // Update URL to include id for shareability
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("id", json.design.id);
        window.history.replaceState({}, "", url.toString());
      } catch {
        /* noop */
      }
    } catch {
      setSaveStatus("error");
    }
  }, [isLoggedIn, designId, designName, thicknessMM]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const handleNewDesign = useCallback(() => {
    if (dirtyRef.current) {
      const ok = window.confirm(
        "You have unsaved changes. Discard them and start a new design?",
      );
      if (!ok) return;
    }
    setThicknessMM(DEFAULT_THICKNESS);
    setDesignId(null);
    setDesignName("Untitled");
    setSaveStatus("never-saved");
    dirtyRef.current = false;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* noop */
    }
  }, []);

  const handleOpenDesigns = useCallback(() => {
    if (!isLoggedIn) return;
    setDialogOpen(true);
  }, [isLoggedIn]);

  const handleSelectDesign = useCallback(
    async (id: string) => {
      setDialogOpen(false);
      try {
        const res = await fetch(`/api/lamp-designer/designs/${id}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          design: {
            id: string;
            name: string;
            parameters: { thicknessMM?: number };
          };
        };
        initialLoadRef.current = true;
        setDesignId(json.design.id);
        setDesignName(json.design.name);
        if (typeof json.design.parameters?.thicknessMM === "number") {
          setThicknessMM(json.design.parameters.thicknessMM);
        }
        setSaveStatus("saved");
        dirtyRef.current = false;
        // Use setTimeout to ensure initialLoadRef blocks the dirty-marking effect
        setTimeout(() => {
          initialLoadRef.current = false;
        }, 0);
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("id", json.design.id);
          window.history.replaceState({}, "", url.toString());
        } catch {
          /* noop */
        }
      } catch {
        /* Failed to load */
      }
    },
    [],
  );

  const handleRenameCommit = useCallback((name: string) => {
    setDesignName(name);
    dirtyRef.current = true;
    setSaveStatus((s) => (s === "never-saved" ? "never-saved" : "dirty"));
  }, []);

  const handlePublish = useCallback(
    async (input: {
      name: string;
      description: string;
      tags: string[];
      category: string;
    }) => {
      setPublishBusy(true);
      setPublishError(null);
      try {
        const res = await fetch("/api/lamp-designer/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
            description: input.description,
            tags: input.tags,
            parameters: { thicknessMM },
            templateId: "cone",
          }),
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: string };
          setPublishError(json.error ?? "Failed to publish.");
          return;
        }
        setPublishModalOpen(false);
      } catch {
        setPublishError("Network error. Please try again.");
      } finally {
        setPublishBusy(false);
      }
    },
    [thicknessMM],
  );

  const parts = useMemo(() => generateAllParts(thicknessMM), [thicknessMM]);
  const isOriginal = Math.abs(thicknessMM - 6.4) < 0.05;
  const totalPieces = parts.reduce((sum, p) => sum + p.count, 0);
  const uniqueShapes = parts.length;
  const leafParts = parts.filter((p) => p.type === "leaf");
  const structParts = parts.filter((p) => p.type !== "leaf");

  const downloadSVG = () => {
    trackConeLamp({ eventType: "svg_download", thickness: thicknessMM });
    const svg = generateCutSheetSVG(thicknessMM);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cone-lamp-cut-sheet-${thicknessMM.toFixed(1)}mm.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openGuide = () => {
    trackConeLamp({ eventType: "guide_open", thickness: thicknessMM });
    window.open(ASSEMBLY_GUIDE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-cream text-wood">
      <LampDesignerTopBar
        designName={designName}
        onRenameCommit={handleRenameCommit}
        saveStatus={saveStatus}
        isLoggedIn={isLoggedIn}
        userInitial={userInitial}
        onSave={handleSave}
        onNewDesign={handleNewDesign}
        onOpenDesigns={handleOpenDesigns}
      />
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-3">
            Jesper Makes · Free Tool
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-wood mb-4">
            The Cone Lamp Designer
          </h1>
          <p className="text-wood-light/70 text-[15px] md:text-[17px] max-w-[680px] leading-relaxed m-0">
            Build my pinecone pendant lamp from any plywood you&apos;ve got. Pick a
            thickness, download a cut-ready SVG of all 159 pieces sized to your stock,
            drop it into your laser cutter or CNC.{" "}
            <strong className="text-wood">Free, forever.</strong>
          </p>
        </div>

        {/* Control panel */}
        <div className="bg-white/60 border border-wood/[0.08] rounded-2xl p-7 md:p-9 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
            {/* Left: thickness slider */}
            <div>
              <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2.5">
                Wood Thickness
              </div>
              <div className="flex items-baseline gap-2 mb-3.5">
                <div className="text-5xl font-semibold text-wood leading-none">
                  {thicknessMM.toFixed(1)}
                </div>
                <div className="text-lg text-wood-light/50">mm</div>
                {isOriginal && (
                  <div className="ml-2 text-[11px] text-forest font-bold tracking-[0.1em] uppercase">
                    ↑ original
                  </div>
                )}
              </div>
              <input
                type="range"
                min={3}
                max={8}
                step={0.1}
                value={thicknessMM}
                onChange={(e) => setThicknessMM(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: "#3F6B4A" }}
              />
              <div className="flex justify-between text-[11px] text-wood-light/40 mt-1.5">
                <span>3 mm</span>
                <span>8 mm</span>
              </div>
              <p className="text-xs text-wood-light/55 leading-relaxed mt-3.5 m-0">
                Every slot, tab and joint scales automatically. The leaves stay the same
                shape, only the joinery changes. Anything from 3mm to 8mm plywood works.
              </p>
            </div>

            {/* Right: download */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1">
                Get the plans
              </div>
              <div className="grid grid-cols-2 gap-3.5 mb-1">
                <div>
                  <div className="text-[22px] font-semibold text-wood">
                    {uniqueShapes}
                  </div>
                  <div className="text-[11px] text-wood-light/55">unique shapes</div>
                </div>
                <div>
                  <div className="text-[22px] font-semibold text-wood">
                    {totalPieces}
                  </div>
                  <div className="text-[11px] text-wood-light/55">total pieces</div>
                </div>
              </div>
              <button
                onClick={downloadSVG}
                className="bg-wood text-cream rounded-2xl py-4 px-5 text-[15px] font-semibold cursor-pointer"
              >
                Download SVG cut sheet
              </button>
              <button
                onClick={openGuide}
                className="bg-transparent text-wood-light border border-wood/[0.18] rounded-2xl py-3.5 px-5 text-[13px] font-medium cursor-pointer hover:border-wood/30"
              >
                Assembly guide (PDF)
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setPublishError(null);
                    setPublishModalOpen(true);
                  }}
                  className="bg-forest text-cream rounded-2xl py-3.5 px-5 text-[13px] font-medium cursor-pointer hover:bg-forest/90"
                >
                  Publish to Marketplace
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Parts grid */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3.5 mb-4">
            <h2 className="font-serif text-2xl font-medium m-0 text-wood">
              The 9 unique parts
            </h2>
            <div className="text-xs text-wood-light/55">
              at {thicknessMM.toFixed(1)} mm thickness
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-3.5">
            {leafParts.map((p) => (
              <PartCard key={p.key} part={p} accent="forest" />
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {structParts.map((p) => (
              <PartCard key={p.key} part={p} accent="sage" />
            ))}
          </div>
        </div>

        {/* Note from Jesper */}
        <div className="bg-forest/[0.08] border border-forest/[0.18] rounded-2xl p-7 mb-5">
          <div className="text-[10px] font-bold tracking-[0.15em] text-forest uppercase mb-2.5">
            A note from Jesper
          </div>
          <p className="font-serif text-[15px] leading-relaxed m-0 text-wood-light">
            I built the original cone lamp out of 6.4mm Baltic birch and the original
            SVG only fits that one thickness. Then I lost the CAD source — so I had to
            reverse-engineer my own lamp to make it work for any plywood you&apos;ve got
            lying around. Pick whatever&apos;s on your shelf, download the cut sheet,
            and go. If you build one, send me a picture.
          </p>
        </div>

        {/* Fine print */}
        <div className="text-[11px] text-wood-light/45 leading-relaxed px-1">
          Free for personal use. Please don&apos;t sell these plans or re-upload them
          to other platforms without explicit permission. Tag{" "}
          <strong>@jespermakes</strong> if you build one.
        </div>
      </div>

      <LampDesignsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleSelectDesign}
      />

      {publishModalOpen && (
        <PublishModal
          initialName={designName}
          busy={publishBusy}
          error={publishError}
          onCancel={() => setPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}

// ----- PartCard -----

function PartCard({ part, accent }: { part: Part; accent: "forest" | "sage" }) {
  const padding = Math.max(part.bbox.width, part.bbox.height) * 0.06;
  const vbX = part.bbox.minX - padding;
  const vbY = part.bbox.minY - padding;
  const vbW = part.bbox.width + padding * 2;
  const vbH = part.bbox.height + padding * 2;
  const isBottomDisk = part.type === "bottomDisk";
  const isTopDisk = part.type === "topDisk";
  const accentClass =
    accent === "forest" ? "text-forest" : "text-[#7A8E5C]";

  return (
    <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-3.5 h-[220px] flex flex-col">
      <div className="flex-1 flex items-center justify-center min-h-0 mb-2.5">
        <svg
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          className="w-full h-[130px] max-w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={part.path}
            fill="rgba(63, 107, 74, 0.12)"
            stroke="#2C1810"
            strokeWidth={2.5}
          />
          {isBottomDisk && (
            <path
              d={BOTTOM_HOLE}
              fill="#FAF7F2"
              stroke="#2C1810"
              strokeWidth={2.5}
            />
          )}
          {isTopDisk &&
            TOP_INNER_PATHS.map((p, i) => (
              <path
                key={i}
                d={p}
                fill="#FAF7F2"
                stroke="#2C1810"
                strokeWidth={2}
              />
            ))}
        </svg>
      </div>
      <div className="border-t border-wood/[0.06] pt-2.5">
        <div className="flex justify-between items-baseline mb-1">
          <div className="font-serif text-[14px] font-semibold text-wood">
            {part.label}
          </div>
          <div
            className={`text-[10px] font-bold tracking-[0.08em] uppercase ${accentClass}`}
          >
            cut {part.count}
          </div>
        </div>
        <div className="text-[10px] text-wood-light/50">
          {part.sizeMM.w} × {part.sizeMM.h} mm
        </div>
      </div>
    </div>
  );
}
