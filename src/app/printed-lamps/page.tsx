"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PRINTED_LAMPS,
  defaultVariant,
  fileUrl,
  findVariant,
  formatSize,
  type PrintedLamp,
  type PrintedVariant,
} from "@/lib/printed-lamps";

const INTRO =
  "Every lamp on this page has been printed on my H2D in the workshop, and you can change it a little: the height, and on some of them the pattern. Each version you can pick here went through the slicer and my print checks before it got a download button. The one I printed is marked, the other sizes passed the same checks but I haven't printed them myself.";

function FilamentLine({ name, colour, grams, nozzle, part }: PrintedVariant["filaments"][number]) {
  return (
    <li className="flex items-center gap-2 text-sm text-wood/80">
      <span
        className="inline-block h-3.5 w-3.5 rounded-full border border-wood/20 shrink-0"
        style={{ background: colour }}
        aria-hidden="true"
      />
      <span>
        {name}, {grams} g
        <span className="text-wood/45"> ({part ? `${part}, ` : ""}{nozzle} nozzle)</span>
      </span>
    </li>
  );
}

function DownloadButtons({ project3mf, project3mfMb, stlZip, stlZipMb, extra }: PrintedVariant["files"]) {
  return (
    <div className="flex flex-col gap-2.5">
    <div className="flex flex-col sm:flex-row gap-2.5">
      <a
        href={fileUrl(project3mf)}
        download
        className="flex-1 text-center rounded-xl border-2 border-forest bg-forest px-4 py-3 text-sm font-medium text-white hover:bg-forest/90 transition-colors"
      >
        3MF for Bambu Studio
        <span className="block text-xs text-white/70 mt-0.5">H2D settings, {formatSize(project3mfMb)}</span>
      </a>
      <a
        href={fileUrl(stlZip)}
        download
        className="flex-1 text-center rounded-xl border-2 border-wood/15 bg-white px-4 py-3 text-sm font-medium text-wood hover:border-forest/30 hover:bg-forest/5 transition-colors"
      >
        STL files
        <span className="block text-xs text-wood/50 mt-0.5">zip, {formatSize(stlZipMb)}</span>
      </a>
    </div>
    {extra?.map((e) => (
      <a
        key={e.path}
        href={fileUrl(e.path)}
        download
        className="text-center rounded-xl border-2 border-wood/15 bg-white px-4 py-2.5 text-sm font-medium text-wood hover:border-forest/30 hover:bg-forest/5 transition-colors"
      >
        {e.label}: 3MF for Bambu Studio
        <span className="text-xs text-wood/50"> ({formatSize(e.mb)})</span>
      </a>
    ))}
    </div>
  );
}

function LampCard({ lamp }: { lamp: PrintedLamp }) {
  const [params, setParams] = useState<Record<string, number>>(defaultVariant(lamp).params);
  const [lit, setLit] = useState(false);
  const variant = findVariant(lamp, params) ?? defaultVariant(lamp);
  const image = lit && variant.imageLit ? variant.imageLit : variant.image;

  function pick(key: string, value: number) {
    const exact = findVariant(lamp, { ...params, [key]: value });
    const any = lamp.variants.find((v) => v.params[key] === value);
    const next = exact ?? any;
    if (next) setParams(next.params);
  }

  return (
    <section id={lamp.id} className="bg-white/60 border border-wood/[0.08] rounded-2xl overflow-hidden scroll-mt-24">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative bg-[#ebe8e2] aspect-[11/15] md:sticky md:top-6 md:self-start">
          <Image
            src={image}
            alt={`${lamp.name}, ${variant.heightMm} mm${lit ? ", lit" : ""}`}
            fill
            sizes="(min-width: 768px) 512px, 100vw"
            className="object-contain"
          />
          <div
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase ${
              variant.printed ? "bg-forest text-white" : "bg-white/85 text-wood/70"
            }`}
          >
            {variant.printed ? "The one I printed" : "Checked, not printed at this size"}
          </div>
          {variant.imageLit && (
            <button
              type="button"
              onClick={() => setLit((v) => !v)}
              aria-pressed={lit}
              className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase text-wood/70 hover:bg-white transition-colors"
            >
              {lit ? "Light off" : "Light on"}
            </button>
          )}
          <div className="absolute bottom-3 left-4 text-[11px] text-wood/45">Render, not a photo</div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-wood">{lamp.name}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-wood-light/75">{lamp.blurb}</p>
          </div>

          {lamp.knobs.map((knob) => (
            <div key={knob.key}>
              <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-2">
                {knob.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {knob.values.map((value, i) => {
                  const selected = variant.params[knob.key] === value;
                  const available = lamp.variants.some((v) => v.params[knob.key] === value);
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={selected}
                      onClick={() => pick(knob.key, value)}
                      className={[
                        "rounded-lg border-2 px-3.5 py-1.5 text-sm font-medium transition-colors",
                        selected
                          ? "border-forest bg-forest/10 text-forest"
                          : "border-wood/15 bg-white text-wood hover:border-wood/30",
                        available ? "" : "opacity-40 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {knob.labels?.[i] ?? value}
                      {knob.unit ? ` ${knob.unit}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-wood/55">Size</dt>
            <dd className="text-wood font-medium tabular-nums">
              {variant.heightMm} mm tall, {variant.widthMm} mm wide
            </dd>
            <dt className="text-wood/55">Print time</dt>
            <dd className="text-wood font-medium tabular-nums">{variant.printTime} on the H2D</dd>
          </dl>

          <ul className="flex flex-col gap-1.5">
            {variant.filaments.map((f) => (
              <FilamentLine key={f.name} {...f} />
            ))}
          </ul>

          <DownloadButtons {...variant.files} />

          {lamp.parts.length > 0 && (
            <div className="border-t border-wood/10 pt-5 flex flex-col gap-3">
              {lamp.parts.map((part) => (
                <div key={part.name}>
                  <div className="text-sm font-semibold text-wood">{part.name}</div>
                  <p className="text-sm text-wood/65 leading-snug">
                    {part.note}
                    {part.printTime ? ` About ${part.printTime} on the H2D.` : ""}
                  </p>
                  {part.files && (
                    <div className="mt-2">
                      <DownloadButtons {...part.files} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {lamp.hardware.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase mb-1.5">
                You also need
              </div>
              <ul className="list-disc list-inside text-sm text-wood/75">
                {lamp.hardware.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-wood/45 leading-relaxed">{lamp.printedNote}</p>
        </div>
      </div>
    </section>
  );
}

export default function PrintedLampsPage() {
  return (
    <div className="min-h-screen bg-cream text-wood">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-10">
          <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-3">
            Jesper Makes · Free files
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-wood mb-4">
            Lamps I&apos;ve printed
          </h1>
          <p className="text-wood-light/70 text-[15px] md:text-[17px] max-w-[680px] leading-relaxed m-0">{INTRO}</p>
        </div>

        <div className="flex flex-col gap-8">
          {PRINTED_LAMPS.map((lamp) => (
            <LampCard key={lamp.id} lamp={lamp} />
          ))}
        </div>

        <p className="mt-10 text-xs text-wood/45 max-w-[680px] leading-relaxed">
          LED only inside a printed shade, never incandescent or halogen. The 3MF files are set up for the
          Bambu Lab H2D with the settings these lamps printed with; on another printer, open them in Bambu
          Studio, pick your printer and check the plate before you print.
        </p>
      </div>
    </div>
  );
}
