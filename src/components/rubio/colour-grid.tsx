export type Swatch = { name: string; hex: string; collection?: string };

/**
 * The colour swatches, ported over from the old /tools pages when those were
 * folded into the shop. Oil Plus 2C carries 40, DuroGrit 16 grouped into
 * collections.
 *
 * These are approximations of the real oiled colour, which is why the copy
 * underneath points at the physical fan deck. A hex on a backlit screen is not
 * the same thing as oil on oak and pretending otherwise gets people the wrong
 * tin.
 */
export default function ColourGrid({
  swatches,
  productName,
}: {
  swatches: Swatch[];
  productName: string;
}) {
  if (swatches.length === 0) return null;

  const collections = Array.from(
    new Set(swatches.map((s) => s.collection).filter((c): c is string => !!c)),
  );

  const groups: Array<{ label: string | null; items: Swatch[] }> =
    collections.length > 0
      ? collections.map((c) => ({ label: c, items: swatches.filter((s) => s.collection === c) }))
      : [{ label: null, items: swatches }];

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-medium">The colours</h2>
          <p className="mt-1.5 text-sm text-white/50">
            {swatches.length} colours in {productName}.
          </p>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-white/40">
          These are approximations. Colour changes completely depending on the wood underneath, so
          treat them as a shortlist, not a decision.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.label ?? "all"} className="mb-8 last:mb-0">
          {group.label && (
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#fcc52c]">
              {group.label}
            </h3>
          )}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {group.items.map((s) => (
              <div key={`${group.label ?? ""}-${s.name}`} className="text-center">
                <div
                  className="aspect-square w-full rounded-xl border border-white/10 shadow-inner"
                  style={{ backgroundColor: s.hex }}
                  aria-label={s.name}
                />
                <div className="mt-1.5 text-[11px] leading-tight text-white/55">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
