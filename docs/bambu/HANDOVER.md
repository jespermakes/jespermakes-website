# Bambu Lab section: handover

Built 17 Nov 2026 on `feature/bambu-section`. Three pages, all server rendered for the visitor's store:

- `/bambulab` the landing page: the H2D and the lamps, the lineup cheapest first, the comparison table
- `/bambulab/picker` 8 questions, one printer back with reasons and a step up
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

## The picker's fibre question (21 Nov 2026)

Bonnie Deng at Bambu ran the picker, got the P1S and had hoped for the P2S. On the first 7 questions the
two are the same printer (256 mm bed, closed, no heated chamber, one nozzle), so the cheaper P1S always won.
What the P2S has and the P1S lacks is a hardened steel nozzle, which carbon and glass fibre filament needs.
Jesper told her he would add that question, so question 4 now asks "Do you want to print carbon or glass
fibre filament?". Yes removes every printer without `specs.hardenedNozzle`, then the cheapest left wins as
before, so the P2S comes out for PLA-CF, PETG-CF, ASA-CF and the like, and the X2D still wins when a heated
chamber is needed too.

- `nozzle` and `hardenedNozzle` in `printers.ts` come only from each printer's `specsUrl`, read in Chrome
  on 21 Nov 2026, with the quoted line in a comment. Hardened steel: P2S, X2D, H2S, H2D, H2C, H3C.
  Stainless: A1 mini, A1, A2L (its page says PLA-CF and PETG-CF only after you replace the nozzle with a
  hardened one, so it counts as false) and P1S (its store spec table: "0.4 mm Stainless Steel Included").
  A test pins that list, so a new printer needs its nozzle read off its page.
- The step up from the P1S is now the P2S ("a hardened steel nozzle, so carbon and glass fibre filament
  becomes possible later") instead of the X2D. A same series, same box printer is still skipped unless it
  adds the hardened nozzle.
- Checked before the push: with fibre "no", all 1944 answer sets of the old 7 questions give the same
  printer, variant, budget flag and unmet list as 8fab70f. Only the P1S's step up changed (180 sets).
- The engineering answer and the heated chamber step up no longer say "carbon fibre", since the P2S
  prints fibre filament without a heated chamber.

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
