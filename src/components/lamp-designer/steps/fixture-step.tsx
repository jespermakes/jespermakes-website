"use client";

import { useState } from "react";
import type { FixtureModuleId, FixtureSpec, LampContext } from "@/lib/lamp-designer/types";
import { FIXTURE_MODULES } from "@/lib/lamp-designer/fixtures";

export interface FixtureStepProps {
  fixture: FixtureSpec;
  context: LampContext;
  onChange: (fixture: FixtureSpec) => void;
}

/** Which module fits the chosen setting most naturally. */
const SUGGESTED_BY_CONTEXT: Record<LampContext, FixtureModuleId> = {
  dining: "e27-clamp",
  hallway: "e27-clamp",
  bedside: "e14-clamp",
  reading: "stem-m10",
  desk: "kit001-seat",
  shelf: "kit001-seat",
};

type CouponStatus = "idle" | "preparing" | "ready" | "error";

export function FixtureStep({ fixture, context, onChange }: FixtureStepProps) {
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");
  const suggested = SUGGESTED_BY_CONTEXT[context];

  async function downloadCoupon() {
    setCouponStatus("preparing");
    try {
      const { couponToStlBlob } = await import("@/lib/lamp-designer/export");
      const blob = couponToStlBlob(fixture.moduleId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fit-test-${fixture.moduleId}.stl`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setCouponStatus("ready");
    } catch (err) {
      console.error("Coupon export failed:", err);
      setCouponStatus("error");
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        What will power it?
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Every lamp starts at the fixture. Pick the hardware your lamp will
        mount on; the shade is built around it.
      </p>

      <div className="flex flex-col gap-3">
        {FIXTURE_MODULES.map((mod) => {
          const isSelected = fixture.moduleId === mod.id;
          const isSuggested = mod.id === suggested;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                if (!isSelected) setCouponStatus("idle");
                onChange({ moduleId: mod.id });
              }}
              aria-pressed={isSelected}
              className={[
                "flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-forest bg-forest/5"
                  : "border-wood/15 bg-white hover:border-wood/30",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isSelected ? "text-forest" : "text-wood"}`}>
                  {mod.name}
                </span>
                {isSuggested && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded bg-forest/10 text-forest">
                    Suggested
                  </span>
                )}
                <span className="ml-auto text-xs tabular-nums text-wood/40">
                  Ø{mod.apertureDiameter} mm
                </span>
              </span>
              <span className="text-xs text-wood/60 leading-snug">{mod.description}</span>
              <span className="text-xs text-wood/40 leading-snug">
                You buy: {mod.hardware}
              </span>
              {mod.fitNote && (
                <span className="text-xs text-amber-700/80 leading-snug">{mod.fitNote}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 p-3 rounded-xl bg-wood/5">
        <p className="text-xs text-wood/60 leading-snug mb-2">
          Before a long shade print: print this 15-minute test ring and check
          it fits your hardware.
        </p>
        <button
          type="button"
          onClick={downloadCoupon}
          disabled={couponStatus === "preparing"}
          className="w-full p-2.5 rounded-lg border-2 border-wood/15 bg-white text-sm font-medium text-wood hover:border-forest/30 hover:bg-forest/5 transition-colors"
        >
          {couponStatus === "preparing"
            ? "Preparing…"
            : couponStatus === "ready"
              ? "✓ Fit test downloaded"
              : couponStatus === "error"
                ? "Failed — try again"
                : "Download fit test (STL)"}
        </button>
      </div>
    </div>
  );
}
