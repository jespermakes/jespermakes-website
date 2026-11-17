"use client";

import { useEffect, useState } from "react";
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
  "Every lamp on this page has been printed on my H2D in the workshop, and you can change it a little: the height, and on the Flower and Poppy lamps the way the flowers land on the shade. Each version you can pick here went through the slicer and my print checks before it got a download button. The one I printed is marked, the other versions passed the same checks but I haven't printed them myself.";

// The two film lamps that have no checked variants here: MakerWorld has them exactly as printed.
const ALSO_FROM_THE_FILM = [
  {
    name: "Cloudy Fluff",
    note: "The lamp my daughter Julie drew.",
    href: "https://makerworld.com/en/models/3531319",
    image: "/printed-lamps/film/cloudy-fluff.webp",
  },
  {
    name: "Twisted Ruff",
    note: "A twisted shade that clicks onto its base.",
    href: "https://makerworld.com/en/models/3530308",
    image: "/printed-lamps/film/twisted-ruff.webp",
  },
];

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
            {variant.printed ? "The one I printed" : "Checked, not printed by me"}
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

          {lamp.knobs.map((knob) => {
            const isPattern = knob.key === "seed";
            const offered = knob.values.filter((value) => findVariant(lamp, { ...variant.params, [knob.key]: value }));
            return (
              <div key={knob.key}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/45 uppercase">
                    {knob.label}
                  </div>
                  {isPattern && offered.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const others = offered.filter((value) => value !== variant.params[knob.key]);
                        pick(knob.key, others[Math.floor(Math.random() * others.length)]);
                      }}
                      className="text-xs font-medium text-forest hover:underline"
                    >
                      Shuffle
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {knob.values.map((value, i) => {
                    const selected = variant.params[knob.key] === value;
                    const target = findVariant(lamp, { ...variant.params, [knob.key]: value });
                    const available = lamp.variants.some((v) => v.params[knob.key] === value);
                    const label = `${knob.labels?.[i] ?? value}${knob.unit ? ` ${knob.unit}` : ""}`;
                    if (isPattern && target) {
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`${knob.label} ${label}`}
                          onClick={() => pick(knob.key, value)}
                          className={[
                            "relative h-[76px] w-[56px] overflow-hidden rounded-lg border-2 bg-[#ebe8e2] transition-colors",
                            selected ? "border-forest" : "border-wood/15 hover:border-wood/30",
                          ].join(" ")}
                        >
                          <Image
                            src={lit && target.imageLit ? target.imageLit : target.image}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                          <span
                            className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${
                              lit ? "text-white/80" : "text-wood/60"
                            }`}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    }
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
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

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

export default function LampGeneratorPage() {
  const [lampId, setLampId] = useState(PRINTED_LAMPS[0].id);
  const lamp = PRINTED_LAMPS.find((l) => l.id === lampId) ?? PRINTED_LAMPS[0];

  // jespermakes.com/lamp-designer#poppy opens on the Poppy Lamp
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (PRINTED_LAMPS.some((l) => l.id === fromHash)) setLampId(fromHash);
  }, []);

  function choose(id: string) {
    setLampId(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="min-h-screen bg-cream text-wood">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-8">
          <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-3">
            Jesper Makes · Lamp generator
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-wood mb-4">
            Lamps I&apos;ve printed
          </h1>
          <p className="text-wood-light/70 text-[15px] md:text-[17px] max-w-[680px] leading-relaxed m-0">{INTRO}</p>
        </div>

        <div role="tablist" aria-label="Pick a lamp" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          {PRINTED_LAMPS.map((l) => {
            const selected = l.id === lamp.id;
            const cover = defaultVariant(l);
            return (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => choose(l.id)}
                className={[
                  "flex items-center gap-3 rounded-xl border-2 p-2 text-left transition-colors",
                  selected ? "border-forest bg-forest/5" : "border-wood/10 bg-white/60 hover:border-wood/25",
                ].join(" ")}
              >
                <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-[#ebe8e2]">
                  <Image src={cover.imageLit ?? cover.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-wood leading-tight">{l.name}</span>
                  <span className="block text-xs text-wood/50">
                    {l.variants.length} {l.variants.length === 1 ? "version" : "versions"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <LampCard key={lamp.id} lamp={lamp} />

        <div className="mt-12">
          <h2 className="font-serif text-2xl text-wood mb-1">2 more from the film</h2>
          <p className="text-sm text-wood/65 max-w-[680px] mb-4">
            These 2 are on MakerWorld just the way I printed them, so for now there&apos;s only the one size of each.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ALSO_FROM_THE_FILM.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-wood/[0.08] bg-white/60 p-3 hover:border-forest/30 transition-colors"
              >
                <span className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-[#ebe8e2]">
                  <Image src={item.image} alt={`${item.name}, lit`} fill sizes="128px" className="object-cover" />
                </span>
                <span>
                  <span className="block font-serif text-xl text-wood">{item.name}</span>
                  <span className="block text-sm text-wood/65">{item.note}</span>
                  <span className="block text-xs font-medium text-forest mt-1 group-hover:underline">
                    Free on MakerWorld
                  </span>
                </span>
              </a>
            ))}
          </div>
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
