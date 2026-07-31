# Research: Filament and Light Knowledge Base

Compiled 2026-07-31 for the Lamp Designer v2 rebuild (see LAMP-DESIGNER-V2-ROADMAP.md).
Web research against store.bambulab.com, Bambu wiki and forums, retailer spec sheets, and maker community sources. Data state: July 2026. This file is the source material for the generator's material intelligence; the roadmap carries the distilled rules.

---

## 1. Bambu Lab filament lineup relevant to lamps (as sold mid-2026)

Key catalog facts the generator must encode:
- Bambu sells a dedicated diffusing lamp filament: **PLA Translucent**, marketed explicitly for "lightshades and decorative lanterns", frosted hand-blown-glass look. This is the default lamp material.
- **PETG HF is discontinued** (US store notice; only black lingered). Its successor is the **reformulated PETG Basic**, relaunched March 2026, 13 colors, reduced stringing and moisture sensitivity. Do not generate profiles that assume PETG HF availability.
- Bambu groups PLA Translucent, PETG Translucent and PC Transparent in an official "Transparent and Translucent" collection. There is no separate "lamp series" beyond that.

| Product | Light-relevant colors | Price class | Heat resistance | Light behavior | Printability notes |
|---|---|---|---|---|---|
| PLA Basic | Jade White, 30+ colors | budget | HDT 57 C at 0.45 MPa, Vicat 57 C | White = good diffuser via pigment; opaque colors block | Easiest, vase mode safe |
| PLA Matte | Ivory White, 20+ muted colors | budget | PLA class (~57 C) | Matte surface hides layer lines when lit; slightly lower transmission than Basic white | Easy, easy support removal |
| PLA Lite | limited basic colors | cheapest Bambu PLA | PLA class (~55-57 C) | Matte-ish finish, reduces layer line visibility | Value line for bulk shade bodies |
| PLA Silk+ | white/gold/silver etc., high gloss | mid | PLA class | Gloss emphasizes layer lines under light; shimmer effects, uneven glow | Slower than Basic, needs tuning |
| PLA Silk Multi-Color | Dual Color and Gradient variants | mid | PLA class | Color-shift shades; dual color changes hue with viewing angle | Fine on H2D |
| PLA Basic Gradient | Arctic Whisper, Solar Breeze, more | mid | PLA class | Color changes every 8-10 m: one-piece ombre lamps over tall vase prints | Prints like PLA Basic |
| **PLA Translucent** | 10 colors incl. Clear, Yellow, Green, Red, Teal, Orange, Purple, Blue | mid (~25 USD) | PLA class (~57 C) | Frosted-glass finish, diffuses evenly, hides bulb better than clear PETG; the lamp default | Bonds with all PLA filaments (Bambu claim), so pairs with any PLA in dual-material |
| PLA Glow | Glow Green, Yellow, Pink, Blue, Orange | mid | PLA class | Glows after light off; charges from the lamp itself | Abrasive: hardened steel nozzle required |
| PLA Marble | White Marble | mid | PLA class | Mostly opaque, stone look; faint glow only at 1 wall | Particles: no 0.2 mm nozzle |
| PLA Wood | wood tones | mid | PLA class | Opaque, warm natural look for bases/frames | Moisture sensitive, dry first |
| PLA Sparkle | glitter colors | mid | PLA class | Point-sparkle under direct light, opaque body | Particles: no 0.2 mm nozzle |
| PETG Basic (2026 reformulation) | 13 colors incl. White | budget | PETG class (HDT ~70 C) | Tougher, more heat-tolerant shade body | Replaced PETG HF; less stringing than old PETG |
| **PETG Translucent** | Clear + 8 colors | budget (~20 USD) | HDT 74 C, Vicat 79 C | Crystal-clear, see-through, exceptional transmittance; shows the bulb unless frosted | Nozzle 230-260 C, dry 65 C/8 h, brim for tall prints |
| PC | Transparent, Clear Black | premium (~42 USD) | HDT ~110 C class | Closest to glass; window elements, high-heat fixtures | Enclosure, hardest to print clear |
| ABS | White + colors | budget | HDT ~87 C class | Opaque structural parts near warm hardware | Enclosure, fumes |
| ASA | White + colors | mid | HDT 100 C class | Opaque, UV stable: outdoor and garden lamps | Enclosure, fumes; the outdoor pick |
| TPU for AMS (68D) | limited | mid-high | flexible, low HDT | Semi-translucent flexible diffuser caps | Only TPU that feeds through AMS |

Sources: Bambu US store product pages (PLA Translucent, PETG Translucent, ASA, PLA Glow, PLA Silk Multi Color, PLA Marble, PLA Wood, PLA Sparkle), Bambu PLA Basic and PLA Matte TDS PDFs, GigaParts and 3DJake spec listings, Bambu forum PLA Translucent launch thread and PETG HF discontinuation thread, Filament Price Tracker on the PETG Basic relaunch, Bambu TPU for AMS guide.

---

## 2. Light transmission by wall construction

### 2.1 Measured and documented data

| Wall build | Approx thickness | Transmission / appearance |
|---|---|---|
| Vase mode, 0.4 nozzle | 0.4-0.8 mm | Brightest glow; peer-reviewed lampshade study measured 50-65 % transmittance at 0.8 mm white PLA (400-720 nm). Bulb and LED point sources visible as hotspots, worst with clear PETG, moderate with white PLA |
| Vase mode, 0.6-0.8 nozzle or 2 spiral perimeters | 1.0-1.6 mm | The community glow sweet spot: lit-from-within look with hotspots mostly gone; 1.2-1.6 mm called out as sturdy and still transmissive |
| 2 perimeters, 0.4 nozzle | ~0.8-1.0 mm | Standard even-diffusion recipe for white PLA; bulb outline hidden, whole shade lights up |
| 3-4 perimeters | 1.2-1.8 mm | Dim, very even halo in white PLA; shade reads as a solid object with light escaping openings |
| >= ~3 mm solid | 3 mm+ | Effectively opaque in white PLA (the lithophane "black" limit) |
| Any sparse infill in the light path | n/a | Infill pattern projects as a visible shadow web when backlit. Rule: walls only, or 100 % infill, in any lit region |
| Seam | n/a | Backlight makes the seam a visible vertical line; vase mode eliminates it, otherwise align seam to rear or a rib |

### 2.2 Material diffusion character (backlit)

| Material | Backlit character |
|---|---|
| White PLA (Basic Jade White / Matte Ivory White) | Best even diffusion per cost; pigment scatters light, hides source; warm bulb reads slightly creamy. Matte additionally hides layer lines under light |
| Natural / undyed PLA | More translucent than white, slight amber cast, less even, source partly visible |
| PLA Translucent | Frosted glass: diffuses while transmitting color; hides bulb far better than clear PETG at same thickness; PLA is semi-crystalline so it can never go glass-clear |
| PETG Translucent / Clear | Amorphous, most transparent FDM option in the lineup; see-through rather than glowing; shows bulb, filament lines, internal geometry; needs fuzzy skin or a frosted bulb to read as a diffuser |
| PC Transparent | Clearest with slow, hot, thin-layer printing; window panes, not diffusers |
| Silk PLA | Gloss and pearlescence make layer lines sparkle; uneven glow, decorative only |
| Black / dark opaque any material | Absorbs; 2+ walls fully blackout, use for cutout and slit designs |

### 2.3 Community rules of thumb (generator defaults)

- White PLA, 2 walls (~0.8 mm), no infill in the lit zone: even glow, bulb hidden. The default "it just works" lampshade.
- Translucent filament, single-wall vase: brightest, glows, but you WILL see the bulb; pair only with frosted bulbs.
- 1.2-2 mm translucent PLA wall + LED: glows evenly (multiple Printables lamp designers converge on this band).
- Two spiralized perimeters with a 0.6 mm nozzle lands ~1.2 mm, bottom of the sweet spot.
- Matte PLA hides layer lines when lit; silk exaggerates them.
- Black absorbs most light; beige/white distribute far better.
- Bambu wiki max-clarity recipe (transparent PETG): dry filament, 0.1 mm layer, 0.5 mm line width, 1 wall loop, no top/bottom shells, reduced fan, slow; complex geometry cannot be made highly transparent.

Sources: BioResources study on optical properties of PLA lampshades, Bambu wiki translucent PLA/PETG printing tips, Printables lamp model notes and comments, Bambu forum vase wall thickness and H2D translucent PETG threads.

---

## 3. Effect matrix (core deliverable)

| Target effect | Filament | Walls / infill | Bulb | Notes and risks |
|---|---|---|---|---|
| Warm cozy glow (whole shade lights evenly) | PLA Translucent Clear/Yellow/Orange, or PLA Basic Jade White, or PLA Matte Ivory White | Translucent: 1.2-2 mm wall (vase with 0.6-0.8 nozzle, or 2-3 perimeters). White PLA: 2 perimeters ~0.8-1.0 mm. 0 % infill in lit zone | 2700 K frosted/opal SMD LED, 4-6 W | The bread-and-butter preset. Warm bulb through white PLA shifts slightly cream, desirable here. No infill, no top shells in light path |
| Crisp architectural white | PLA Matte Ivory White or PLA Basic Jade White (PETG Basic White for heat margin) | 3-4 perimeters, 1.2-1.6 mm; shade reads solid, light exits apertures; matte hides layer lines | 4000 K neutral, frosted SMD, 6-10 W in open designs | Avoid silk. Seam to rear if not vase mode. ASA White for outdoor versions |
| Colored accent glow | PLA Translucent (frosted color) or PETG Translucent (deeper, glassier color) | Vase 1 wall (bold, bulb-visible) or 2 walls / 1.2 mm (even color field) | Neutral 4000 K frosted LED keeps hue true; warm 2700 K shifts blues/greens muddy | PETG Translucent = stained glass; PLA Translucent = frosted sea glass. High-CRI (90+) bulb keeps saturated colors clean |
| Opaque body, light through slits/patterns | PLA Matte black or any dark opaque; ASA for outdoor | 2-3 walls minimum for full blackout; slits/cutouts modeled in geometry; any infill fine (invisible) | Clear filament-style LED for crisp projected beams; frosted for soft spill | Highest-contrast effect, filament color irrelevant to output. Check cutout bridging; keep bulb clearance for airflow |
| Lithophane-style image detail | PLA Basic Jade White only (no silk, no translucent) | 100 % infill mandatory, thickness map 0.6/0.8 mm (white) to 3.0-3.2 mm (black), 0.1-0.16 mm layers, printed vertical, slow | Cool bright backlight close behind panel: 4000-6500 K SMD; warm light lowers contrast | Any infill gap ruins the image. Works as panel inserts in a dual-material frame |
| Starry / point-pattern, route A | Opaque shell (PLA Matte dark) with perforation pattern | 2-3 walls + hole array 1-3 mm | Clear filament LED, points project onto walls | Holes below ~1 mm may seal over, test per nozzle |
| Starry / point-pattern, route B | H2D dual material: opaque shell + PLA Translucent pin-windows; optional PLA Glow accents | Solid opaque walls, translucent plugs full-depth (no infill inside plugs) | Any frosted LED, stars glow instead of project | PLA Glow needs hardened nozzle; glow charges while lamp is on, keeps stars after switch-off |
| Two-material: opaque frame + translucent windows | PLA Matte / Basic (frame) + PLA Translucent (windows). THE supported pair: same polymer, full weld | Frame 2-3 walls any infill; windows walls-only or solid; windows full wall depth so no infill shadows | Frosted SMD 2700-4000 K per mood | See bonding table |

### 3.1 Material-pair bonding for dual-material lamps (H2D)

| Pair | Bond | Use in lamps |
|---|---|---|
| PLA + PLA (any variants incl. Translucent, Glow, Matte) | Full weld | Frame + windows, patterns, lithophane inserts. The recommended path |
| PETG + PETG (Basic + Translucent) | Full weld | Higher-heat version of frame + windows |
| PLA + PETG | Poor; PLA barely sticks to anything but itself | Never as a fused single body. Separate parts joined mechanically, or deliberately used as each other's breakaway support. Interlocking geometry required if in one print |
| PETG + TPU | Inseparable weld | Flexible translucent diffuser windows or grip feet in a PETG frame |
| PLA + TPU | Weak | Avoid as bonded pair |
| ABS + ASA | Perfect bond | Opaque high-heat two-tone bodies |

### 3.2 What the H2D dual nozzle actually enables vs AMS color switching

- Single-nozzle + AMS: every filament change purges into a prime tower; waste on every change layer.
- H2D dual nozzle: one material per nozzle, no purge tower between the two, near-zero waste; per-layer switching costs time, not filament.
- Waste returns if one nozzle must serve 3+ filaments. Generator rule: cap designs at 2 materials for waste-free H2D printing.
- Incompatible-temperature pairs are what dual nozzles exist for, but the bond rules above still apply.

Sources: Tom's 3D multi-material combinations, Printables PLA/PETG mutual support model, Bambu wiki filament grouping for dual nozzles, MatterHackers dual hotend workflow guide, Eolas Prints AMS purge cost article, lithophane guides (Nozzle Down, 3DSearch, printpal).

---

## 4. Bulb pairing

### 4.1 Hard safety rule

LED only. Documented test: an incandescent bulb pushed a PLA shade past 45 C immediately and deformed it within ~2 hours; the same shade with an LED never got hot. Every lamp the generator outputs carries "LED only" in its spec.

### 4.2 Color temperature through filament

| Bulb | Through white PLA | Through natural PLA | Through PLA Translucent color | Through clear PETG/PC |
|---|---|---|---|---|
| 2700 K warm | Cozy cream glow, slight warm amplification; the hygge preset | Honey/amber cast, vintage feel | Warms the hue; reds/oranges richer, blues/greens go muddy | Unchanged warm, bulb visible |
| 4000 K neutral | Clean white, architectural | Slight ivory tint | Truest color rendering for colored shades | Unchanged neutral |

Rule: 2700 K for glow moods, 4000 K when the shade's own color must stay true. Prefer CRI 90+ for colored shades.

### 4.3 Bulb construction

| Bulb type | Light character in printed shades | Pair with |
|---|---|---|
| Filament-style LED (clear glass, quasi point source) | Crisp shadows, sparkle, sharp projected patterns | Cutout/slit shades, starry projection, open designs |
| Frosted / opal SMD LED | Soft even output, no visible point source | Single-wall vase shades, all translucent shades, even-glow presets |
| LED panel / strip | Flat even backlight | Lithophanes, edge-lit panels |

### 4.4 Wattage and heat guidance

Material limits: Bambu PLA class softens ~57 C, PETG Translucent HDT 74 C / Vicat 79 C, ASA 100 C, PC higher. LED bulbs turn roughly 60-70 % of input power into heat at the bulb envelope, so enclosure and clearance matter more than lumens.

| Shade situation | PLA (~57 C) | PETG (~75-79 C) | ASA/PC |
|---|---|---|---|
| Open shade (top and bottom vents, chimney airflow) | up to ~10 W LED, >=30 mm bulb-to-wall clearance | up to ~13 W | any household LED |
| Semi-enclosed (one opening) | <=6 W, >=40-50 mm clearance | <=10 W | <=15 W |
| Fully enclosed (globe) | <=4 W (commercial PLA printed lamps ship with 4 W LEDs) | <=6-8 W | <=10 W |
| Any incandescent/halogen | never | never | never |

Generator rules: prefer E27/E14 frosted LED <=800 lm for PLA presets; require vent geometry (open top or bottom ring) on every PLA design above 4 W; auto-suggest PETG when the user picks enclosed + bright; suggest ASA for outdoor lamps (UV stability is the driver).

Sources: 3DWithUs LED vs incandescent safety test, ColorFabb lampshade material guidance, commercial 4 W PLA lamp listings, Bambu TDS sheets.

---

## 5. Bambu Studio / H2D print specifics for lamps

### 5.1 Build volume (it is not a flat 350x320x325)

- Total advertised: 350 x 320 x 325 mm.
- Single nozzle: 325 x 320 x 325 mm. This is the max one-piece lamp footprint for normal prints.
- Dual-nozzle multi-material (both nozzles reach): 300 x 320 x 325 mm. Two-material lamp bodies must fit 300 mm in X.
- The full 350 mm X exists only in a special dual-nozzle large-model workflow.
- Height cap for any lamp piece: 325 mm.

### 5.2 Spiral vase mode

- Process > Others > Special mode > Spiral vase in Bambu Studio.
- Constraints: exactly one wall loop, zero infill, zero top shells, bottom layers only; simple continuous cross-sections only (no branching or islands); global plate setting.
- Wall thickness control: line width up to ~200 % of nozzle diameter. 0.4 nozzle gives 0.6-0.8 mm; 0.6 nozzle ~0.9-1.2 mm; 0.8 nozzle ~1.2-1.6 mm walls, squarely inside the glow sweet spot.
- Vase mode kills the seam, the single biggest visual defect in backlit shades.

### 5.3 Translucent/clear print profile

- Dry the filament (PETG Translucent: 65 C 8 h; PLA Translucent 70 C 12 h listed on H2D hardware drying). Wet filament = microbubbles = haze.
- Max clarity: 0.1 mm layers, 0.5 mm line width, 1 wall, no top/bottom shells, fan reduced, slow, consistent layer times (speed changes show as shading bands).
- H2D + PETG Translucent owner notes: nozzle up to 260 C, bed 75 C, smooth plate, brim on tall shades.
- For frosted diffusion instead of clarity: print faster/cooler and add fuzzy skin; imperfections that ruin clear improve frosted.

### 5.4 Fuzzy skin

- Supported in Bambu Studio (walls, contour only). 0.1-0.2 mm = subtle frost, 0.3 mm = strong texture.
- Lamp uses: turns clear PETG vase shades into frosted diffusers, hides layer lines and seams; on contact faces it improves mechanical interlock between poorly bonding material pairs.

### 5.5 Multi-part lamps beyond one-piece limits

- Printed threads: coarse trapezoidal threads (>=2 mm pitch, 0.15-0.2 mm clearance) print reliably; standard interfaces worth generating: E27/E14 socket rings and the 40/42 mm European lampholder ring.
- Snap fits: cantilever or annular; orient hooks so bending load is not across layers; annular snaps suit round lamp sections.
- Threaded inserts / captured nuts where hardware gets torque.
- Glue: cyanoacrylate works for PLA-PLA; PETG glues poorly, prefer mechanical joints.
- Generator convention: sections <=325 mm tall, register features (lip + recess) for alignment, thread or triple-cantilever snap for closure, and keep joint lines at opaque bands because every joint is a visible shadow line in a lit translucent region.

Sources: Bambu wiki H2D dual-nozzle printable range and 350 mm workflow pages, Bambu wiki spiral vase and fuzzy skin pages, All3DP vase mode guide, Bambu forum threads, Hubs snap-fit guide, Snapmaker thread printing guide.

---

## Caveats

- Bambu store pages blocked automated fetching; data cross-confirmed from search-indexed store content, forum announcements, wiki pages, and authorized retailers. Prices drift; treat price class as stable, not exact numbers.
- No published transmittance percentages for Bambu Translucent products; the only lab number is 50-65 % at 0.8 mm white PLA. Wall-count recommendations are community consensus, directionally robust, not lab-calibrated. Calibrated brightness curves per filament need an in-house swatch test (1-4 walls, lux meter), one evening on the H2D, and that print is filmable.
- PETG HF is legacy: mark unavailable in any filament picker; map old references to PETG Basic (2026).
