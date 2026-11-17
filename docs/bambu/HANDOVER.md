# Bambu Lab section: handover

Built 17 Nov 2026 on `feature/bambu-section`. Three pages, all server rendered for the visitor's store:

- `/bambulab` the landing page: the H2D and the lamps, the lineup cheapest first, the comparison table
- `/bambulab/picker` 7 questions, one printer back with reasons and a step up
- `/bambulab/filament` the whole filament range by what the part has to survive, plus accessories

## Where things are

| What | File |
|---|---|
| Printer specs, blurbs, picker attributes | `src/data/bambu/printers.ts` |
| Filament groups and what each is for | `src/data/bambu/filaments.ts` |
| Accessories | `src/data/bambu/accessories.ts` |
| Every handle the refresh and the link check cover | `src/data/bambu/handles.json` |
| Prices, variants, images, the date and region of each check | `src/data/bambu/store-snapshot.json` (generated) |
| Awin link builder, store hosts (client safe) | `src/lib/bambu-links.ts` |
| Snapshot reader, price formatting (server only) | `src/lib/bambu-shop.ts` |
| Which store a visitor sees | `src/lib/bambu-store-server.ts` |
| Picker logic (pure, tested) | `src/lib/bambu-picker.ts`, tests in `src/lib/bambu.test.ts` |
| Last link check | `docs/bambu/link-check.json` |

## Refresh prices

```bash
node scripts/bambu-refresh.mjs --region eu      # about 4 minutes, one page every 3 s
node scripts/bambu-verify-links.mjs             # about 4 minutes, 2 Awin samples
npx vitest run src/lib/bambu.test.ts
```

Then commit the snapshot and push through the normal branch and preview flow. The test suite fails if a
product on a page has no dated EUR price, if a printer's variant name stops existing on the store, or if
the lineup is no longer cheapest first, so a renamed variant shows up as a red test, not a blank card.

## Traps, each one hit while building this

- **Bambu redirects by IP.** From the Spark, `store.bambulab.com`, `us.store` and `uk.store` all 302 to
  `eu.store.bambulab.com`. WebFetch lands there too. The refresh script checks the final host and refuses to
  record a region it did not reach, so the US side stays empty until someone runs `--region us` from a US
  machine. Do not reverse engineer the store's API to get round it.
- **US product URLs** are confirmed from the `hreflang="en-US"` link on each EU page, which is Bambu's own
  statement of where the product lives on the US store. All 76 matched the EU handle on 17 Nov 2026.
- **The store rate limits** after about 40 quick requests (HTTP 429). One request every 3 s with a 45 s back
  off works.
- **Prices** are in `<script id="product-jsonld">`, a ProductGroup with `hasVariant`. The picture is on each
  variant, not on the group. The struck-through price is `offers.priceSpecification.price`.
- **Placeholder prices.** The X1E is listed at 99999 and the H2D Pro has no priced variant. Both are sold to
  companies and are left out of the lineup.
- **Specs do not come from the store.** The store HTML carries a JSON copy of the H2D spec table on every
  product page, so a regex over it gives the H2D's numbers for every printer. The numbers in `printers.ts`
  come from `bambulab.com/en/<model>/tech-specs` or `/specs` (the path differs per model), which answer 403
  to curl and WebFetch and were read in Chrome. The P1S spec page is gone (404), so its numbers come from the
  table on its store page, which for the P1S is the real one.
- **Awin.** Every request through an Awin link is a click on our account, so the link check follows only a
  few. The rest are checked by decoding `ued` and loading the store page directly.
- **`/bambulab` used to be a 308** to `/tools/bambu-lab-h2d`. Browsers that saw it keep it cached and still
  land on the H2D tool page, which carries the affiliate link too.

## Open

- US prices: run the refresh from a US machine.
- Ad marking: the pages use the Rubio pattern (an affiliate line, `rel="sponsored"`). Whether Danish rules
  also want a visible Reklame label is Jesper's call.
