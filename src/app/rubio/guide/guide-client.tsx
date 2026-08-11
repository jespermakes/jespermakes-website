"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PRODUCTS,
  SPECIES_OIL2C,
  SPECIES_DUROGRIT,
  CALC_SPECIES,
  OIL2C_COLORS,
  DUROGRIT_COLORS,
  WOODCREAM_COLORS,
  DUROGRIT_RECOMMENDATIONS,
  FILTERS,
  GUIDES,
  getColorImageUrl,
  type ProductKey,
  type Color,
  type Species,
} from "@/data/rubio-guide-data";
import { trackRubioGuide } from "@/lib/rubio-guide-track";

type StepId =
  | "intro"
  | "location"
  | "interior"
  | "exterior"
  | "exterior-orientation"
  | "product"
  | "color"
  | "summary";

// ============================================================================
// Helpers
// ============================================================================

function shadeColor(hex: string, pct: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + pct));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + pct));
  const b = Math.max(0, Math.min(255, (num & 0xff) + pct));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function SwatchImage({
  url,
  approx,
  label,
}: {
  url: string;
  approx: string;
  label: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className="w-full aspect-square block"
        style={{
          background: `linear-gradient(135deg, ${approx}, ${shadeColor(approx, -10)})`,
        }}
        aria-label={label}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={label}
      loading="lazy"
      onError={() => setErrored(true)}
      className="w-full aspect-square object-cover block"
    />
  );
}

// ============================================================================
// Main component
// ============================================================================

/** A resolved, region-correct buy target for one of the three guide outcomes. */
export interface GuideBuyTarget {
  href: string;
  title: string;
  productPath: string;
  storeLabel: string;
}

export default function RubioGuideClient({
  buyTargets = {},
}: {
  buyTargets?: Record<string, GuideBuyTarget>;
}) {
  const [step, setStep] = useState<StepId>("intro");
  const [, setHistory] = useState<StepId[]>(["intro"]);
  const [product, setProduct] = useState<ProductKey | null>(null);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical" | null>(null);
  const [species, setSpecies] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [colorLabel, setColorLabel] = useState<string | null>(null);
  const [unit, setUnit] = useState<"m2" | "ft2">("m2");
  const [area, setArea] = useState<number>(10);
  const [calcSpecies, setCalcSpecies] = useState<string>("");
  const [colorFilter, setColorFilter] = useState<string>("all");

  useEffect(() => {
    trackRubioGuide({ eventType: "session_start" });
  }, []);

  useEffect(() => {
    if (product) {
      setCalcSpecies(CALC_SPECIES[product][0].id);
    }
  }, [product]);

  useEffect(() => {
    setColorFilter("all");
  }, [product]);

  // --------------------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------------------

  function goTo(next: StepId) {
    setHistory((h) => [...h, next]);
    setStep(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setHistory((h) => {
      const newHistory = h.slice(0, -1);
      const prev = newHistory[newHistory.length - 1] || "intro";
      setStep(prev);
      return newHistory;
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function resetAll() {
    setStep("intro");
    setHistory(["intro"]);
    setProduct(null);
    setOrientation(null);
    setSpecies(null);
    setColor(null);
    setColorLabel(null);
    setUnit("m2");
    setArea(10);
    setCalcSpecies("");
    setColorFilter("all");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // --------------------------------------------------------------------------
  // Step choice handlers
  // --------------------------------------------------------------------------

  function chooseLocation(loc: "interior" | "exterior") {
    goTo(loc === "interior" ? "interior" : "exterior");
  }

  function chooseInteriorSurface() {
    setProduct("oil2c");
    trackRubioGuide({ eventType: "product_recommended", product: "oil2c" });
    goTo("product");
  }

  function chooseExteriorCondition(c: "raw" | "painted") {
    if (c === "raw") {
      goTo("exterior-orientation");
    } else {
      setProduct("woodcream");
      trackRubioGuide({ eventType: "product_recommended", product: "woodcream" });
      goTo("product");
    }
  }

  function chooseOrientation(o: "horizontal" | "vertical") {
    setOrientation(o);
    setProduct("durogrit");
    trackRubioGuide({ eventType: "product_recommended", product: "durogrit" });
    goTo("product");
  }

  function pickSpecies(sp: string) {
    setSpecies(sp);
    trackRubioGuide({
      eventType: "species_selected",
      product,
      species: sp,
    });
  }

  function pickColor(c: Color) {
    setColor(c.id);
    setColorLabel(c.label);
    trackRubioGuide({
      eventType: "color_selected",
      product,
      species,
      colorId: c.id,
      colorLabel: c.label,
    });
  }

  function viewSummary() {
    trackRubioGuide({
      eventType: "summary_viewed",
      product,
      species,
      colorId: color,
      colorLabel,
      surfaceArea: area,
      unit,
    });
    goTo("summary");
  }

  function onPrint() {
    trackRubioGuide({
      eventType: "guide_printed",
      product,
      species,
      colorId: color,
      colorLabel,
    });
    if (typeof window !== "undefined") window.print();
  }

  // --------------------------------------------------------------------------
  // Calculator derived values
  // --------------------------------------------------------------------------

  const currentProduct = product ? PRODUCTS[product] : null;
  const area_m2 = unit === "m2" ? area : area / 10.764;
  const currentCalcSpecies =
    product && calcSpecies
      ? CALC_SPECIES[product].find((s) => s.id === calcSpecies) ?? null
      : null;
  const mult = currentCalcSpecies?.mult ?? 1.0;
  const adjustedCoverage = currentProduct ? currentProduct.coverage * mult : 0;
  const needed_mL =
    adjustedCoverage > 0 ? (area_m2 / adjustedCoverage) * 1000 * 1.1 : 0;
  const containerChoice = (() => {
    if (!currentProduct) return null;
    for (const c of currentProduct.containers) {
      if (c.mL >= needed_mL) return c;
    }
    return currentProduct.containers[currentProduct.containers.length - 1];
  })();
  const containerLabel = containerChoice
    ? containerChoice.mL >= 1000
      ? `${(containerChoice.mL / 1000).toFixed(1)} L`
      : `${containerChoice.mL} mL`
    : "—";
  const speciesLabelForCalcNote =
    currentCalcSpecies?.label.split(" (")[0].toLowerCase() ?? "wood";

  // --------------------------------------------------------------------------
  // Colour / species data for current product
  // --------------------------------------------------------------------------

  const colorSet: Color[] =
    product === "oil2c"
      ? OIL2C_COLORS
      : product === "durogrit"
        ? DUROGRIT_COLORS
        : product === "woodcream"
          ? WOODCREAM_COLORS
          : [];

  const filteredColors = colorSet.filter((c) => {
    if (colorFilter === "all") return true;
    if (colorFilter === "jesper") return c.jesper;
    return c.category === colorFilter;
  });

  const speciesListForPicker: Species[] =
    product === "oil2c"
      ? SPECIES_OIL2C
      : product === "durogrit"
        ? SPECIES_DUROGRIT
        : [];

  const recs =
    product === "durogrit" && species
      ? DUROGRIT_RECOMMENDATIONS[species] ?? {}
      : {};

  const showSpeciesPicker = product !== "woodcream";
  const colorPickerVisible = product === "woodcream" || species !== null;

  function whyExplanation(): string {
    if (product === "oil2c") {
      return "Because you're working indoors on raw wood. Oil Plus 2C is Rubio's flagship interior hardwax oil. One layer, colours and protects at the same time, food-safe when fully cured. DuroGrit and WoodCream are exterior products that won't work here (WoodCream is wax-based and only for vertical exterior, DuroGrit contains biocides you don't want inside).";
    }
    if (product === "durogrit") {
      const where =
        orientation === "horizontal"
          ? "horizontal surfaces like decking"
          : "vertical surfaces like cladding or fencing";
      return `Because you're on raw exterior wood, and DuroGrit is built exactly for this: ${where}. WoodCream is the alternative for exteriors, but it's specifically for renovating previously painted surfaces. Since your wood is raw, DuroGrit is the right call.`;
    }
    if (product === "woodcream") {
      return "Because you're working on previously painted wood outdoors. WoodCream is the only Rubio product that adheres to old paint without sanding back to bare wood. DuroGrit and Oil Plus 2C both need raw wood to bond, so they'd fail on your surface. WoodCream is built for renovation work.";
    }
    return "";
  }

  const speciesDisplayLabel = (() => {
    if (product === "oil2c")
      return SPECIES_OIL2C.find((s) => s.id === species)?.label ?? "—";
    if (product === "durogrit")
      return SPECIES_DUROGRIT.find((s) => s.id === species)?.label ?? "—";
    if (product === "woodcream") return "Any (applied over existing paint)";
    return "—";
  })();

  // --------------------------------------------------------------------------
  // Progress bar
  // --------------------------------------------------------------------------

  function ProgressBar({ current }: { current: 1 | 2 | 3 | 4 }) {
    return (
      <div className="flex gap-2 mb-10 max-w-md">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={
              "flex-1 h-[3px] rounded-full " +
              (n < current
                ? "bg-[#fcc52c]"
                : n === current
                  ? "bg-[#396948]"
                  : "bg-white/10")
            }
          />
        ))}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#183029] text-white">
      {/* Same header as the shop, so moving between them feels like one place. */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <nav className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/50">
            <div>
              <Link href="/rubio" className="hover:text-white">
                Rubio Monocoat
              </Link>
              <span className="mx-2 text-white/25">/</span>
              <span className="text-white/80">The guide</span>
            </div>
            <Link
              href="/rubio"
              className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Browse the shop
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 pb-24">
        {step === "intro" && (
          <section>
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#fcc52c] uppercase mb-5">
              Free guide · four questions
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-white mb-5 font-medium">
              Which Rubio do I actually need?
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed mb-4">
              Picking the right Rubio product should not require reading three technical data
              sheets. Answer four questions and I will tell you which product to buy, how much of
              it, what colour works on your wood, and exactly how to put it on.
            </p>
            <p className="text-sm text-white/45 max-w-2xl leading-relaxed mb-9">
              It ends with a buy button for the right tin in your own currency, and you can print
              the whole plan and take it to the workshop.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
              <FeatureRow num={1} title="Which product" body="Interior, exterior, new wood, painted wood. One right answer for your project." />
              <FeatureRow num={2} title="How much" body="Real coverage math adjusted for wood porosity, not a generic estimate." />
              <FeatureRow num={3} title="What colour" body="Browse real Rubio swatches on your actual wood species, not on generic oak." />
              <FeatureRow num={4} title="How to apply it" body="Step by step, with the mistakes beginners make flagged as pitfalls." />
            </div>

            <button
              className="inline-flex items-center gap-2 bg-[#fcc52c] text-[#183029] rounded-xl px-6 py-3.5 text-sm font-bold hover:bg-[#ffd457] transition-colors"
              onClick={() => goTo("location")}
            >
              Start the guide <span aria-hidden>→</span>
            </button>

            <p className="mt-10 border-t border-white/10 pt-6 text-sm text-white/45 leading-relaxed max-w-2xl">
              I am a Rubio Monocoat ambassador and I have used their finishes on nearly everything I
              have built. The links here are affiliate links, which cost you nothing extra. The
              advice is the same advice I would give you in the workshop.
            </p>
          </section>
        )}

        {step === "location" && (
          <section>
            <ProgressBar current={1} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase mb-6">
              Step 1 of 4
            </p>
            <h2 className="font-serif text-3xl text-white mb-3 font-medium leading-tight">
              Where is the project?
            </h2>
            <p className="text-white/55 text-sm mb-8">
              The single most important question. Interior and exterior
              products are fundamentally different and can&apos;t be swapped.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <OptionButton
                icon="🏠"
                title="Interior"
                body="Indoors. Furniture, floors, cabinets, countertops, shelves. Protected from weather."
                onClick={() => chooseLocation("interior")}
              />
              <OptionButton
                icon="🌳"
                title="Exterior"
                body="Outdoors. Decking, siding, cladding, fences, garden furniture. Exposed to weather."
                onClick={() => chooseLocation("exterior")}
              />
            </div>
          </section>
        )}

        {step === "interior" && (
          <section>
            <ProgressBar current={2} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase mb-6">
              Step 2 of 4
            </p>
            <h2 className="font-serif text-3xl text-white mb-3 font-medium leading-tight">
              What are you finishing?
            </h2>
            <p className="text-white/55 text-sm mb-8">
              This doesn&apos;t change the product. For indoor raw wood, Oil Plus
              2C is always the answer. But it helps me give you better colour
              and coverage advice.
            </p>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <OptionButton icon="🪑" title="Furniture or cabinetry" body="Tables, chairs, cabinets, shelving, decorative pieces." onClick={() => chooseInteriorSurface()} />
              <OptionButton icon="⬜" title="Floor" body="Hardwood or solid-plank flooring." onClick={() => chooseInteriorSurface()} />
              <OptionButton icon="🧺" title="Countertop or serving board" body="Kitchen counter, charcuterie board, serving surface." onClick={() => chooseInteriorSurface()} />
              <OptionButton icon="📐" title="Walls or ceiling" body="Wood-panelled walls, ceilings, interior cladding." onClick={() => chooseInteriorSurface()} />
            </div>
            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button className="text-white/55 hover:text-white px-5 py-3 text-sm font-semibold" onClick={goBack}>
                ← Back
              </button>
            </div>
          </section>
        )}

        {step === "exterior" && (
          <section>
            <ProgressBar current={2} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase mb-6">
              Step 2 of 4
            </p>
            <h2 className="font-serif text-3xl text-white mb-3 font-medium leading-tight">
              Is the wood raw, or already painted?
            </h2>
            <p className="text-white/55 text-sm mb-8">
              This is the question that splits DuroGrit from WoodCream. Get it
              right or the finish will fail.
            </p>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <OptionButton icon="🪵" title="Raw or unfinished wood" body="New wood, or weathered wood sanded back to bare. Never been painted." onClick={() => chooseExteriorCondition("raw")} />
              <OptionButton icon="🎨" title="Previously painted or stained" body="Old paint or stain you can't sand back to bare wood. Renovation work." onClick={() => chooseExteriorCondition("painted")} />
            </div>
            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button className="text-white/55 hover:text-white px-5 py-3 text-sm font-semibold" onClick={goBack}>
                ← Back
              </button>
            </div>
          </section>
        )}

        {step === "exterior-orientation" && (
          <section>
            <ProgressBar current={2} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase mb-6">
              Step 2 of 4
            </p>
            <h2 className="font-serif text-3xl text-white mb-3 font-medium leading-tight">
              Vertical or horizontal surface?
            </h2>
            <p className="text-white/55 text-sm mb-8">
              DuroGrit handles both, but this affects durability expectations
              and maintenance frequency.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <OptionButton icon="⬛" title="Horizontal" body="Decking, outdoor furniture tops, steps. Takes foot traffic and full sun." onClick={() => chooseOrientation("horizontal")} />
              <OptionButton icon="▮" title="Vertical" body="Siding, cladding, fencing, shed walls. Sheds water, less mechanical wear." onClick={() => chooseOrientation("vertical")} />
            </div>
            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button className="text-white/55 hover:text-white px-5 py-3 text-sm font-semibold" onClick={goBack}>
                ← Back
              </button>
            </div>
          </section>
        )}

        {step === "product" && currentProduct && (
          <section>
            <ProgressBar current={3} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#fcc52c] uppercase mb-6">
              Your product
            </p>

            <div className="bg-white/[0.04] border border-white/10 rounded-[20px] p-8 mb-6">
              <div className="flex gap-6 items-start mb-6 pb-6 border-b border-white/10">
                <div className="text-3xl w-16 h-16 bg-[#fcc52c]/15 rounded-2xl flex items-center justify-center text-[#fcc52c] flex-shrink-0">
                  {currentProduct.icon}
                </div>
                <div>
                  <div className="text-[#fcc52c] text-sm font-semibold tracking-wider uppercase mb-2">
                    {currentProduct.line}
                  </div>
                  <h2 className="font-serif text-2xl text-white mb-1 font-medium">
                    {currentProduct.name}
                  </h2>
                  <p className="text-white/70 leading-relaxed">
                    {currentProduct.desc}
                  </p>
                </div>
              </div>

              <div className="bg-[#fcc52c]/10 border border-[#fcc52c]/25 rounded-xl px-5 py-4 mb-6">
                <div className="text-[10px] font-bold tracking-[0.15em] text-[#fcc52c] mb-1.5 uppercase">
                  Why this one
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  {whyExplanation()}
                </p>
              </div>

              <h3 className="font-serif text-xl text-white font-medium mb-3">
                Let&apos;s estimate how much you need
              </h3>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <div className="flex gap-4 items-center mb-4 flex-wrap">
                  <label className="font-medium min-w-[180px] text-white text-sm">
                    Surface area
                  </label>
                  <input
                    type="number"
                    value={area}
                    min="0.1"
                    step="0.1"
                    onChange={(e) =>
                      setArea(parseFloat(e.target.value) || 0)
                    }
                    className="flex-1 min-w-[140px] bg-white/[0.04] border border-white/20 rounded-[10px] px-3.5 py-2.5 text-white outline-none focus:border-[#fcc52c]"
                  />
                  <div className="inline-flex bg-white/[0.06] rounded-[10px] p-[3px]">
                    <button
                      className={
                        "px-3.5 py-1.5 text-[13px] font-semibold rounded-lg " +
                        (unit === "m2"
                          ? "bg-white/[0.04] text-white shadow-sm"
                          : "text-white/60")
                      }
                      onClick={() => setUnit("m2")}
                    >
                      m²
                    </button>
                    <button
                      className={
                        "px-3.5 py-1.5 text-[13px] font-semibold rounded-lg " +
                        (unit === "ft2"
                          ? "bg-white/[0.04] text-white shadow-sm"
                          : "text-white/60")
                      }
                      onClick={() => setUnit("ft2")}
                    >
                      ft²
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 items-center mb-4 flex-wrap">
                  <label className="font-medium min-w-[180px] text-white text-sm">
                    Wood species
                  </label>
                  <select
                    value={calcSpecies}
                    onChange={(e) => setCalcSpecies(e.target.value)}
                    className="flex-1 min-w-[140px] bg-white/[0.04] border border-white/20 rounded-[10px] px-3.5 py-2.5 text-white outline-none focus:border-[#fcc52c]"
                  >
                    {product &&
                      CALC_SPECIES[product].map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="bg-[#fcc52c]/10 border border-[#fcc52c]/25 rounded-xl px-6 py-5 mt-4">
                  <div className="text-[10px] font-bold tracking-[0.15em] text-[#fcc52c] mb-2 uppercase">
                    You&apos;ll need
                  </div>
                  <div className="font-serif text-3xl text-white font-medium leading-tight mb-1">
                    {containerLabel}
                  </div>
                  <div className="text-sm text-white/60">
                    Needed: ~{Math.round(needed_mL)} mL. A {containerLabel} can
                    covers you with a buffer.
                  </div>
                  <div className="text-xs text-white/60 mt-3 leading-relaxed">
                    Based on ~{adjustedCoverage.toFixed(1)} m² per litre for{" "}
                    {speciesLabelForCalcNote}. Includes a 10% buffer for
                    real-world application.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button
                className="text-white/55 hover:text-white px-5 py-3 text-sm font-semibold"
                onClick={goBack}
              >
                ← Back
              </button>
              <button
                className="inline-flex items-center gap-2 bg-[#fcc52c] text-[#183029] rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#ffd457]"
                onClick={() => goTo("color")}
              >
                Pick a colour →
              </button>
            </div>
          </section>
        )}

        {step === "color" && product && (
          <section>
            <ProgressBar current={4} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase mb-6">
              Step 4 of 4
            </p>
            <h2 className="font-serif text-3xl text-white mb-3 font-medium leading-tight">
              Pick your colour.
            </h2>
            <p className="text-white/55 text-sm mb-6">
              {product === "woodcream"
                ? "WoodCream is an opaque wax-based cream. Rubio shows all its colours on pine, because the wood underneath shows through much less than with penetrating oils, so species matters less."
                : "Colours look dramatically different on different woods. Tell me your species and I'll show real Rubio swatches on that species."}
            </p>

            {showSpeciesPicker && (
              <div>
                <h3 className="font-serif text-xl text-white font-medium mb-2 mt-6">
                  Your wood
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                  {speciesListForPicker.map((sp) => (
                    <button
                      key={sp.id}
                      className={
                        "rounded-xl p-4 text-sm font-medium text-center transition-all " +
                        (species === sp.id
                          ? "border-2 border-white/60 bg-white/[0.04] shadow-[0_0_0_3px_rgba(44,24,16,0.08)]"
                          : "border border-white/12 bg-white/[0.04]/[0.05] hover:border-[#fcc52c]/60 hover:bg-white/[0.04]/[0.08]")
                      }
                      onClick={() => pickSpecies(sp.id)}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorPickerVisible && (
              <div>
                <div className="flex items-center justify-between mb-4 mt-8 flex-wrap gap-2">
                  <h3 className="font-serif text-xl text-white font-medium">
                    {product === "woodcream"
                      ? "WoodCream colours"
                      : `Colours on ${speciesDisplayLabel}`}
                  </h3>
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {FILTERS[product].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setColorFilter(f.id)}
                      className={
                        "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all " +
                        (colorFilter === f.id
                          ? "bg-[#fcc52c] text-[#183029] border border-white/60"
                          : "border border-white/20 bg-white/[0.04] text-white/60 hover:border-white/40")
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {product === "durogrit" && species && (
                  <div className="flex gap-5 items-center text-xs text-white/55 mb-6 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block bg-[#4A7C59]"></span>
                      Recommended for a natural look
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block bg-[#A32D2D]"></span>
                      Not recommended for this species
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
                  {filteredColors.map((c) => {
                    const rec = recs[c.id] ?? null;
                    const isSelected = color === c.id;
                    const isBad = rec === "bad";
                    return (
                      <button
                        key={c.id}
                        onClick={() => pickColor(c)}
                        className={
                          "relative rounded-[10px] overflow-hidden bg-white/[0.04]/[0.05] text-left transition-all " +
                          (isSelected
                            ? "border-2 border-white/60 shadow-[0_0_0_3px_rgba(44,24,16,0.15)]"
                            : "border-2 border-transparent hover:border-[#fcc52c]/60")
                        }
                      >
                        {c.jesper && (
                          <span className="absolute top-1.5 left-1.5 bg-[#fcc52c] text-[#183029] text-[9px] font-bold px-[7px] py-[3px] rounded-full tracking-wide z-[2]">
                            JESPER
                          </span>
                        )}
                        {rec === "good" && (
                          <span
                            className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white z-[2] bg-[#4A7C59]"
                            title="Recommended for a natural look"
                          >
                            ✓
                          </span>
                        )}
                        {rec === "bad" && (
                          <span
                            className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white z-[2] bg-[#A32D2D]"
                            title="Not recommended for this species"
                          >
                            !
                          </span>
                        )}
                        <div className={isBad ? "opacity-55" : ""}>
                          <SwatchImage
                            url={getColorImageUrl(product, species, c.id)}
                            approx={c.approx}
                            label={`Rubio ${currentProduct?.name} ${c.label}`}
                          />
                        </div>
                        <div className="px-2 pt-2 pb-2.5 text-xs text-center text-white/60 font-medium leading-tight">
                          {c.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button
                className="text-white/55 hover:text-white px-5 py-3 text-sm font-semibold"
                onClick={goBack}
              >
                ← Back
              </button>
              <button
                disabled={!color}
                onClick={viewSummary}
                className="inline-flex items-center gap-2 bg-[#fcc52c] text-[#183029] rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#ffd457] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                See your full plan →
              </button>
            </div>
          </section>
        )}

        {step === "summary" && product && currentProduct && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#fcc52c] uppercase mb-6">
              Your plan
            </p>
            <h2 className="font-serif text-3xl text-white mb-6 font-medium leading-tight">
              Everything you need to know.
            </h2>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
              <SummaryRow k="Product" v={currentProduct.name} />
              <SummaryRow k="Colour" v={colorLabel ?? "—"} />
              <SummaryRow k="Species" v={speciesDisplayLabel} />
              <SummaryRow
                k="Area"
                v={`${area} ${unit === "m2" ? "m²" : "ft²"}`}
              />
              <SummaryRow k="You'll need" v={containerLabel} last />
            </div>

            {/* The guide used to dead-end on the application steps. It now ends
              * where the reader actually wants to go next, with the right
              * product for their answers, in their own store and currency. */}
            {buyTargets[product] && (
              <div className="mt-6 rounded-2xl bg-[#183029] p-6 md:p-8 text-white">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#fcc52c]">
                  Get what you need
                </p>
                <h3 className="font-serif text-2xl font-medium leading-tight">
                  {containerLabel} of {buyTargets[product].title}
                  {colorLabel ? ` in ${colorLabel}` : ""}
                </h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  Sized for your {area} {unit === "m2" ? "m²" : "ft²"} of{" "}
                  {speciesLabelForCalcNote}, with a buffer. Pick the size and colour on
                  Rubio&apos;s page, they have the live stock.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a
                    href={buyTargets[product].href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#fcc52c] px-6 py-3.5 text-sm font-bold text-[#183029] hover:bg-[#ffd457] transition-colors"
                  >
                    Buy at Rubio {buyTargets[product].storeLabel} <span aria-hidden>→</span>
                  </a>
                  <Link
                    href={buyTargets[product].productPath}
                    className="text-sm font-semibold text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white"
                  >
                    More about it first
                  </Link>
                  {/* No price here on purpose. The only figure we have is the
                    * cheapest variant, which is a 6 mL sample, and putting
                    * "from DKK 15" next to "1.3 L" reads as the price of the
                    * 1.3 L tin. Rubio's page has the real per-size price. */}
                </div>
                <p className="mt-4 text-xs text-white/35">
                  Affiliate link. Costs you nothing extra, supports the channel.
                </p>
              </div>
            )}

            <h3 className="font-serif text-xl text-white font-medium mb-4 mt-8">
              How to apply it
            </h3>
            <ApplicationGuide product={product} />

            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button
                className="border border-white/20 text-white/55 hover:border-white/35 px-5 py-3 rounded-xl text-sm font-semibold"
                onClick={resetAll}
              >
                Start over
              </button>
              <button
                className="inline-flex items-center gap-2 bg-[#fcc52c] text-[#183029] rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#ffd457]"
                onClick={onPrint}
              >
                Print or save as PDF
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 text-sm text-white/65 leading-relaxed">
              <p>
                A note from Jesper: I am a Rubio Monocoat ambassador, which means I work with them
                and use their finishes. But I only recommend what I actually use. Everything I keep
                on the shelf is in{" "}
                <Link
                  href="/rubio"
                  className="text-[#fcc52c] underline decoration-[#fcc52c]/40 underline-offset-4 hover:text-[#ffd457]"
                >
                  the Rubio shop
                </Link>
                , and buying through it supports the channel at no cost to you.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Small presentational components
// ============================================================================

function FeatureRow({
  num,
  title,
  body,
}: {
  num: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="bg-white/[0.06] text-white w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-[13px] flex-shrink-0 font-serif">
        {num}
      </div>
      <div>
        <h3 className="font-serif text-[17px] mb-1 text-white font-medium">
          {title}
        </h3>
        <p className="text-sm text-white/65 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function OptionButton({
  icon,
  title,
  body,
  onClick,
}: {
  icon: string;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/[0.04]/[0.05] border border-white/12 rounded-2xl p-6 text-left cursor-pointer transition-all hover:border-[#fcc52c]/60 hover:bg-white/[0.04]/[0.08]/[0.09] flex gap-4 items-start"
    >
      <div className="text-2xl w-10 h-10 bg-[#fcc52c]/15 rounded-[10px] flex items-center justify-center text-[#fcc52c] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-xl text-white font-medium mb-1">
          {title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">{body}</p>
      </div>
    </button>
  );
}

function SummaryRow({
  k,
  v,
  last,
}: {
  k: string;
  v: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between items-start py-2.5 gap-4 " +
        (last ? "" : "border-b border-white/8")
      }
    >
      <span className="text-[13px] text-white/50 uppercase tracking-[0.1em] font-semibold min-w-[110px]">
        {k}
      </span>
      <span className="text-white font-medium text-right flex-1">{v}</span>
    </div>
  );
}

function ApplicationGuide({ product }: { product: ProductKey }) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const guide = GUIDES[product];
  return (
    <div>
      {guide.map((step, i) => {
        const open = openIndex === i;
        return (
          <div
            key={i}
            className="bg-white/[0.04] border border-white/10 rounded-2xl mb-2.5 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="w-full py-4 px-5 bg-transparent text-base font-medium text-white text-left flex justify-between items-center cursor-pointer gap-4 hover:bg-white/[0.04]/[0.08]/[0.03]"
            >
              <span className="bg-[#fcc52c]/20 text-[#183029] w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 font-serif">{step.title}</span>
              <span
                className={
                  "text-white/40 transition-transform " +
                  (open ? "rotate-180" : "")
                }
              >
                ▼
              </span>
            </button>
            <div
              className={
                "overflow-hidden transition-all " +
                (open ? "max-h-[1400px]" : "max-h-0")
              }
            >
              <div
                className="px-5 pb-5 pl-[3.75rem] text-[15px] text-white/70 leading-relaxed [&_strong]:text-white [&_.pitfall]:bg-[#E24B4A]/15 [&_.pitfall]:border-l-4 [&_.pitfall]:border-[#E24B4A] [&_.pitfall]:px-4 [&_.pitfall]:py-3 [&_.pitfall]:rounded-r-lg [&_.pitfall]:mt-3 [&_.pitfall]:text-white/80 [&_.pitfall_strong]:text-[#FF9B9A]"
                dangerouslySetInnerHTML={{ __html: step.body }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
