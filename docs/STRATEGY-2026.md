# jespermakes.com 2.0: positioning, revenue, structure
Floki, 2026-07-31. Grounded in a full code audit, Stripe history from both accounts, and live site data.

## 1. Where we actually stand (measured, not guessed)

Revenue, lifetime:
- Old model (beacons.ai, free plans + optional donation): 1,698.50 USD across 212 payments. Average 8.01, median 5.00, max 50.00. Best year 2024: 972.50 (132 payments, ~81/month). People paid 20, 25, 30, 50 as "Support from ..." donations. One person paid 50 USD for the cone lamp 3D file.
- New model (jespermakes.com shop, fixed low prices): 104.00 EUR across 24 orders in ~4 months (~26/month). Every charge is 5.00 or less. Cone lamp 3D print: 10 sales at 5. Cheat sheets: 8 at 3. Cone lamp laser: 4 at 5. Tee: 35 (Printful). Pallet kit: "coming soon", no file exists.
- Pay-what-you-want and donations are not supported anywhere in the current code. Nobody can pay us 50 even when they want to.

Conclusion: the fixed low price cut monthly plan revenue to roughly a third and capped the ceiling.

Audience:
- YouTube main: 359K subs, 43.6M lifetime views. This is the engine.
- Newsletter: 3,397 subscribers, 8 new in 30 days, ZERO broadcasts ever sent, no welcome email, no sequences. The most underused asset in the business.
- Blog: DB-driven, working admin, stale since April.
- Site content is CMS-driven (homepage, blog, tools all in Postgres with a full admin + MCP), which makes iteration cheap. Good bones.

Sponsors (the actual money): Navimow EUR 4,500 delivered, Bambu Lab EUR 9,500 unsigned 47 days, MILESEEY $2,000 pending. One sponsor deal = 4 years of current shop revenue. The site's first commercial job is keeping this pipeline credible.

## 2. Positioning

Frame: furniture designer, timber framer, YouTuber. Shipped today (live via CMS): hero now reads "I design furniture, raise timber frames, and film all of it from my workshop on Fyn, Denmark." About section updated to match. That is the start, not the redesign.

What the positioning still needs:
- /work: a portfolio. A furniture designer without a work page is invisible. Selected pieces, each with story, materials, photos, film. Feeds commissions and sponsor credibility. (Custom Woodwork initiative already exists in Brain; barber Higgins desk is in the pipeline.)
- Timber framing at top level: /barn, an English hub for the Ohavsladen build, linked both ways with ohavsladen.dk.
- /about rewrite around the three identities (current copy: "just a guy in a workshop", pallet-wood only).
- /mediakit aligned to the same story. Also: five different hardcoded subscriber counts across pages (351K to 359K); make one source.

## 3. Pricing: back to free + support, plus a premium tier (NEEDS JESPER APPROVAL)

- Standard plans and cheat sheets: free download, email-gated (get the file by email, join the letter, consent checkbox for EU). Optional pay-what-you-want support at download: suggested 5 / 15 / 30, minimum 2 (Stripe custom_unit_amount, small build).
- Flagship files (cone lamp laser + 3D print): keep paid at real value: 12 EUR each or 19 bundle, with "pay more if you want" enabled. Someone paid 50 USD for this file; 5 EUR is leaving money on the table.
- /support page + support option in download flow (the 20-50 donors existed; give them the door back).
- Prerequisite refactor: the product catalog is duplicated across 8 files (checkout, webhook, downloads, shop page, homepage, thank-you, account, sitemap). Consolidate to one src/lib/products.ts first, then implement PWYW once.

Expected: plans from ~26/month toward the beacons ~80/month baseline, plus list growth that compounds into every future launch.

## 4. Newsletter: from dead asset to engine

1. Welcome automation (transactional, no approval needed): who Jesper is (new framing), 3 best videos, the free plan library.
2. Re-introduction broadcast (NEEDS APPROVAL, hard rule): "The Workshop Letter #1". I draft, Jesper approves. Then monthly minimum.
3. Every free plan download = subscriber (with consent).
4. Honesty fix shipped today: homepage promised a weekly letter; now says about once a month.
5. Ohavsladen site newsletter form is FAKE today (shows success, discards the email). Wire it to the same Resend audience with source=ohavsladen. Live bug.
6. Note: purchase webhook auto-adds buyers to a separate "Customers" audience and sets newsletterSubscribed=true without explicit consent. Review for GDPR while building the consent flow.

## 5. Ohavsladen integration

Keep ohavsladen.dk as its own domain (Danish audience, municipality, funders). Add /barn on jespermakes.com in English: story, The Northmen + Tom, progress, photos, links both ways. One newsletter audience, tagged by source. Quick wins in the ohavsladen repo: 7 strong craft photos sit unused while the site shows CSS gradient placeholders; newsletter fix above; single hardcoded blog post.

## 6. The lamp designer is not a side quest (URGENT)

The specs (May 2026) name the parametric lamp designer the centerpiece of the Bambu Lab H2D video + MakerWorld contest, "late summer 2026", called a hard external deadline. That is now. Work stopped 2026-05-14. The app EXISTS at /lamp-designer (8-step wizard, 3D scene, constraints) but export is a stub: the download and publish buttons are setTimeout placeholders that produce nothing. The groundwork (19 tested modules) is on main. Finish = build real STL/3MF export + publish. This unblocks with the contract: sign Bambu, finish export, ship video. Lamp files are already 14 of 24 lifetime orders; the designer multiplies that product line.
Specs rescued today into docs/lamp-designer/ (they lived only in an untracked stale checkout).

## 7. Hidden assets the site already has

- /studio: a full 2D vector CAD app (3,368-line canvas, booleans, kerf, dogbones, nesting) on studio.jespermakes.com, noindexed, barely surfaced.
- /marketplace ("Workbench"): community design gallery with likes, comments, follows, collections, moderation. Live in nav but half-hidden.
- /rubio: a complete Rubio Monocoat finish selector (954 lines), was orphaned: zero links, no metadata, not in sitemap. Fixed today (nav + metadata + sitemap). Jesper is a Rubio ambassador; this page is sponsor gold and it was invisible.
- /plywood: WISA hub, added to sitemap today.
- Decision needed in Phase 2: launch Workbench/studio properly or park them consciously. Do not leave them half-visible.

## 8. Revenue streams, ranked by realism

1. Sponsorships: 4-5 figures per deal. Site job: mediakit + positioning + /work. Biggest lever: sign Bambu.
2. Digital plans: free+PWYW standard, premium flagship (12-19), lamp line. Near-term realistic: 100-300/month once the funnel (video description -> plan page -> email -> letter) is live.
3. Affiliate: Festool, Rubio EU, Navimow, Bambu (Awin), Epidemic. /tools has 70+ items; add per-video "kit" pages. Incremental, compounding.
4. Commissions: /work + quiet "Commission a piece" page. One desk = a thousand plan downloads. jespermakes.dk (Danish shop furniture idea, already in Brain) parked until this proves out.
5. Ohavsladen: courses later, funding now, newsletter capture today.
6. Guild/membership: guildTier schema exists. Do NOT launch until the letter has a pulse. Phase 3 earliest.
Not doing: merch push, views guarantees, sponsorship-shaped content.

## 9. Security and hygiene (shipped today)

- /dashboard had NO auth: anyone with the URL could read full revenue of both Stripe accounts. Now admin-only. /dashboard/logs was any-logged-in-user; now admin-only.
- Title Lab and Storyteller AI endpoints had zero rate limiting (direct OpenRouter cost abuse). Basic per-IP + global brake added.
- pallet-starter-kit was purchasable at 35 EUR via direct API with no deliverable. Blocked.
- GitHub PAT was embedded in git remote URLs (website + buddhistforening). Cleaned; rotation flagged (also in ~/.git-credentials).
- Customer PII export (3,369 contacts with addresses/birthdates) moved out of the workspace to ~/private, mode 600.
- Known debt, tracked not fixed: admin check duplicated inline in ~10 files, tests exist but no test script, drizzle push without migration history, 87 MB of images in git alongside the newer Blob library, legacy static blog/tools data files (~3,400 lines) drifting from the DB.

## 10. Codebase restructure (shipped today)

/home/jesper/sites/ now holds all web properties: jespermakes.com, ohavsladen.dk, tomstimberframes.com, buddhistforening.dk, plus assets/ (brand + product masters) and _archive/ (stale studio checkout, empty dashboard repo, strays). Symlinks at every old path so brain-server tooling and running services keep working; the flip list is documented in sites/README.md. Tom's site survived the move live on :3200. Wall chart generator scripts now in repo at product-src/workshop-wall-charts/. Lamp designer specs in docs/lamp-designer/. The April handover doc is docs/HANDOVER-2026-04.md.
Left alone on purpose: billet.dk (own agent, active pipeline), mission-control (running service), spark-ops (infra).

## 11. Redesign direction

Keep: cream/wood/amber, Playfair/Inter, the "walking into the workshop" feel. It is good and it is his.
Change: the story the homepage tells and the IA.

Homepage order: 1 Hero (three identities) / 2 Selected work / 3 The barn / 4 Plans (free + support framing) / 5 Apps / 6 Latest videos / 7 The Workshop Letter.
Nav: Work, Plans, Barn, Apps, Gear (URL stays /tools), Blog, About. Mediakit stays for sponsors.

## 12. Phases

Phase 0 (done 2026-07-31): repositioned hero + about live; restructure; security fixes; Rubio surfaced; strategy + specs in repo.
Phase 1 (next, one approval needed): product catalog consolidation, PWYW + email-gate + /support build, ohavsladen newsletter fix, welcome automation, /work skeleton, /about rewrite.
Phase 2: Letter #1 (approval), /barn hub, per-video kit pages, blog revival, lamp designer export (tied to Bambu signing), Workbench launch decision.
Phase 3: premium plan line, commissions page, guild evaluation.

Open decisions for Jesper:
1. Pricing model (section 3): yes/no + price points.
2. Letter #1: approve draft when ready.
3. Bambu H2D contract: sign or renegotiate. Blocks the lamp designer deadline.
