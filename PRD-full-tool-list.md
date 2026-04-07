# PRD: Full Workshop Tool List

## Goal
Add all 43 tools from Jesper's workshop to the tools data file. These are real tools he owns and uses. Most are Festool (ambassador brand), plus Laguna, Shaper, Makita, Tormek, Paslode, and hand tools.

## Important Notes
- Do NOT remove or modify any existing tools in tools.ts (xTool, Bambu Lab, Rubio Monocoat, AP700, etc.)
- Do NOT modify existing categories or tools that are already in the file
- Some tools already exist (TS 55, Domino DF 500, ETS 150, Cordless Drill). UPDATE those existing entries with the correct full model names from this list, but keep their existing buyLinks intact.
- All Festool tools get `badge: "Ambassador"`
- buyLinks: empty arrays `[]` for all new tools (affiliate links added later)
- Category assignments should use existing categories where possible. Add new categories only if needed.

## Category Mapping

Map these tools into the existing "Power Tools" category. It's already the catch-all for workshop tools. Don't create sub-categories in the data model - the category field stays simple.

The tools page already groups by category, so all Festool power tools will appear together.

For hand tools, use a new category if "Workshop Essentials" doesn't fit, or group them under "Workshop Essentials" which already exists.

## Tools to Add/Update

### Festool Saws (all Ambassador)
1. **Festool TKS 80 EBS** — Table saw. Compact and precise. The Systainer-compatible table saw.
   - slug: festool-tks-80
2. **Festool CSC SYS 50** — Cordless table saw. Runs on the 18V battery system. Portable job-site saw.
   - slug: festool-csc-sys-50
3. **Festool KAPEX KS 120** — Sliding compound miter saw. Precision crosscuts and miters. One of Festool's flagship saws.
   - slug: festool-kapex-ks-120
4. **Festool TS 55 FEBQ-Plus** — ALREADY EXISTS as "Festool Track Saw TS 55". Update the name to "Festool TS 55 FEBQ-Plus Track Saw". Keep existing description and buyLinks.
5. **Festool HKC 55** — Cordless circular saw. Battery-powered, uses the same track as the TS 55.
   - slug: festool-hkc-55
6. **Festool HK 85** — Circular saw for heavy cuts. Up to 85mm cutting depth.
   - slug: festool-hk-85
7. **Festool RSC 18** — Cordless reciprocating saw. For demolition and rough cuts.
   - slug: festool-rsc-18
8. **Festool CARVEX PS 420** — Jigsaw. Smooth, precise curves. Great dust extraction.
   - slug: festool-carvex-ps-420

### Festool Joinery (Ambassador)
9. **Festool DOMINO XL DF 700** — The big Domino. For larger tenons and heavy-duty joinery. 
   - slug: festool-domino-xl-df-700
10. **Festool DOMINO DF 500** — ALREADY EXISTS. Update name to "Festool DOMINO DF 500 Q-Plus". Keep existing description and buyLinks.

### Festool Drilling/Driving (Ambassador)
11. **Festool QUADRIVE TPC 18/4** — Percussion drill. Four-speed gearbox, seriously powerful.
    - slug: festool-quadrive-tpc-18
12. **Festool TXS 12** — Compact drill. Tiny but capable. Perfect for tight spaces and delicate work.
    - slug: festool-txs-12
13. UPDATE existing "Festool Cordless Drill T 18" — this is the general entry. Keep it as-is since the QUADRIVE and TXS cover the specific models.

### Festool Sanding (Ambassador)
14. **Festool ETS EC 150/5 EQ** — Brushless random orbital sander. The upgraded version with EC motor.
    - slug: festool-ets-ec-150
15. **Festool ETS 150/3 EQ-Plus** — ALREADY EXISTS as "Festool Random Orbital Sander ETS 150". Update name. Keep buyLinks.
16. **Festool ROTEX RO 90** — Geared eccentric sander. Sands, polishes, and does coarse stock removal. Versatile.
    - slug: festool-rotex-ro-90
17. **Festool RTS 400** — Rectangular orbital sander. For flat surfaces and edges.
    - slug: festool-rts-400
18. **Festool BS 75** — Belt sander. For heavy stock removal and leveling.
    - slug: festool-bs-75

### Festool Other Power Tools (Ambassador)
19. **Festool AGC 18-125** — Cordless angle grinder. 125mm. Battery powered.
    - slug: festool-agc-18
20. **Festool VECTURO OSC 18** — Cordless oscillating multi-tool. Cuts, scrapes, sands.
    - slug: festool-vecturo-osc-18
21. **Festool HLC 82** — Cordless planer. 82mm width. Battery system.
    - slug: festool-hlc-82

### Festool Dust Extraction (Ambassador)
22. **Festool CTM 36 E** — Mobile dust extractor. 36-liter. Auto-start with tools.
    - slug: festool-ctm-36
23. **Festool CTH 26 E** — Hazardous dust extractor. H-class filtration for toxic dust.
    - slug: festool-cth-26
24. **Festool CT-VA 20** — Cyclone pre-separator. Goes between tool and extractor, catches the heavy stuff.
    - slug: festool-ct-va-20

### Festool Workshop (Ambassador)
25. **Festool SYS-AIR H** — Air purifier. Cleans workshop air. Essential for health.
    - slug: festool-sys-air
26. **Festool SYSLITE KBS C** — Cordless work light. Bright, runs on battery system.
    - slug: festool-syslite-kbs
27. **Festool SYS 18V Energy Set** — Battery and charger set. SCA16 charger + TCL 6 rapid charger.
    - slug: festool-energy-set
28. **Festool KV-SYS D8** — Domino connectors system. For knockdown furniture joints.
    - slug: festool-kv-sys-d8
29. **Festool ZS-OF 1010 M** — Router accessory set for the OF 1010 router.
    - slug: festool-zs-of-1010
30. **Festool VN-HK85 130X16-25** — Groove cutting unit for the HK 85.
    - slug: festool-vn-hk85-groove
31. **Festool FSK Cross-Cutting Guide Rail** — Guide rail for precise crosscuts with track saws.
    - slug: festool-fsk-guide-rail

### Festool Storage (Ambassador)
32. **Festool SYS3 ORG & SORT/3 Systainers** — The Systainer organizer system. Modular tool storage.
    - slug: festool-systainer-org
33. **Festool Open-Top Tool Bag** — Canvas tool tote. Simple, durable.
    - slug: festool-tool-bag

### Laguna Tools
34. **Laguna 18|BX Bandsaw** — 18-inch bandsaw. Serious resawing capability.
    - slug: laguna-18bx-bandsaw
    - category: Power Tools
35. **Laguna SuperMax 16|32 Drum Sander** — Drum sander for consistent thickness sanding on wide boards.
    - slug: laguna-supermax-drum-sander
    - category: Power Tools
36. **Laguna C|Flux Cyclone Collector** — Cyclone dust collector. High capacity.
    - slug: laguna-cflux-cyclone
    - category: Power Tools

### Other Brands
37. **Shaper Origin** — Handheld CNC router. Cuts precise shapes guided by computer vision. A unique tool.
    - slug: shaper-origin
    - category: Power Tools
38. **Makita 40V Max XGT** — Cordless drill. When you need raw power the Festool doesn't deliver.
    - slug: makita-40v-xgt
    - category: Power Tools
39. **Tormek T-8** — Water-cooled sharpening system. Keeps chisels and plane irons razor sharp.
    - slug: tormek-t-8
    - category: Workshop Essentials
40. **Paslode Cordless Nailer** — Cordless nail gun. Gas-powered. Fast framing and construction work.
    - slug: paslode-cordless-nailer
    - category: Power Tools

### Hand Tools
41. **Northmen Guild Axes (Set of 4)** — Hand-forged axes. Traditional Scandinavian craft.
    - slug: northmen-guild-axes
    - category: Workshop Essentials
42. **Temple Tool Co Japanese Pull Saws (Set of 4)** — Japanese-style pull saws. Precise hand cuts.
    - slug: temple-pull-saws
    - category: Workshop Essentials
43. **Halder Simplex 40 Mallet** — Soft-face mallet. Won't damage your work. Essential for chisel work and assembly.
    - slug: halder-simplex-40
    - category: Workshop Essentials
44. **Irwin Jack Handsaw** — General purpose handsaw. Reliable and affordable.
    - slug: irwin-jack-handsaw
    - category: Workshop Essentials

## Descriptions
Keep descriptions SHORT (1-2 sentences max). Write them in Jesper's voice: casual, practical, honest. No marketing fluff. If you don't have specific context for a tool, write a generic but useful description about what it does and why a woodworker would want it.

## Validation
- `npm run build` must pass with zero errors
- All new tool pages must be accessible at `/tools/[slug]`
- Existing tools (xTool, Bambu Lab, Rubio, AP700) must NOT be modified or removed
- Ambassador badges on ALL Festool tools
- No ambassador badges on non-Festool tools
- Total tool count should be around 55-60 pages
