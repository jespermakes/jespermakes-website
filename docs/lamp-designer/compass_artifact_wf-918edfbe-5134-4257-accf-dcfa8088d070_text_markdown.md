# Designing a Parametric 3D-Printed Lamp Generator: Research Report

## TL;DR

- **A well-designed parametric lamp generator is a real market gap.** Existing customizers (Thingiverse OpenSCAD scripts, MakerWorld Parametric Model Maker, fixed vase-mode lampshades) handle geometry tweaks but none combine constraint-guided design, real-time WebGL preview, a 2D pattern studio, and clean 3MF/STL export with multi-material support — and none teach lighting design principles while you work. Ship one that does and you have both a winnable contest centerpiece and a referenceable product.
- **The encodable design rules come from a century of lamp design** — Henningsen's three-shade 3:2:1 ratio and logarithmic-spiral curve (1925), Noguchi's washi-paper diffusion philosophy, and modern lighting-engineering metrics (shielding angle 30°/40°/50°, cutoff angles, UGR ≤19 for comfort, IES "fully shielded" ≥2.5%/10% rule at 90°/80°). Bake these into constraints, not just sliders.
- **The pipeline reality is unforgiving but tractable.** Export 3MF (not STL) for multi-material; guarantee watertight manifold geometry; enforce wall-thickness minimums tied to nozzle size (≥2× line width for vase mode at 0.4 mm; ≥0.8 mm is safer); design around PLA's Tg of ~60 °C versus an LED-bulb heatsink that hits 60–100 °C — so default to PETG/PCTG or enforce ≥5 cm bulb-to-shade clearance for PLA.

## Key Findings

1. **The three-shade system is the canonical "encodable" lamp.** Henningsen's PH lamps (Louis Poulsen, 1925–) use a logarithmic spiral with the bulb at the spiral's focal point, and a 3:2:1 top/middle/bottom diameter ratio. Lamp model numbers (e.g. PH 3/2) encode shade diameter in decimeters and the proportional family. This is, almost literally, a parametric system avant la lettre — and the design principle "every line of sight to the bulb passes through at least one diffusing shade" is the most powerful single constraint a generator can enforce.

2. **Diffusion physics is dominated by polymer morphology and wall thickness.** Per Bambu Lab's own wiki: PLA is semi-crystalline so its crystal grains scatter light, while PETG is amorphous and transmits more directly — meaning **PLA gives a softer, more diffused "frosted" glow; PETG gives a crisper, more transparent look.** Wall-thickness, layer-line direction, and nozzle size all gate diffusion: larger nozzles (0.6–0.8 mm) and aligned-rectilinear infill produce more transmission; vase-mode single-walls produce the softest, most luminous shades.

3. **PLA has a fundamental thermal collision with LED bulbs.** Bambu PLA Translucent has Tg = 54 °C, HDT = 55 °C, Vicat = 61 °C; a typical A19 LED bulb heatsink reaches 60–100 °C in operation (LIFX in-house testing). The generator must either (a) require PETG/PCTG/PC for any shade within ~5 cm of the bulb, or (b) enforce a hard geometric clearance.

4. **3MF is the right export target; STL is the fallback.** 3MF is now ISO/IEC 25422:2025; it carries multiple objects, materials, colors, embedded slicer settings, and is a compressed XML zip 30–50% smaller than equivalent binary STL. For a multi-material lamp (translucent shade + opaque base) it is the only sane choice. STL ships only surface geometry as raw triangles — a hard requirement that any STL the generator emits be perfectly manifold/watertight.

5. **Vase mode is the right default print strategy, with caveats.** Single-wall spiralized prints maximize light transmission and remove the internal layer features that would otherwise scatter light. But vase mode allows only one continuous outer contour — no internal cavities, no holes in the bottom — so the generator must geometrically enforce this when vase mode is the target.

6. **Competitive landscape: many tools, none well-aimed.** Thingiverse Customizer (OpenSCAD-driven) hosts dozens of parametric lampshades but is slow, ugly, and produces unconstrained output. MakerWorld's Parametric Model Maker (Bambu's own platform) is gaining traction with parametric generators (Gridfinity bins, fabric, lightboxes) but is OpenSCAD-bound and lacks a polished UI for non-coders. Cuttle.xyz is the closest UX comparable — browser-based 2D parametric design with templates, free tier, growing community — but it's 2D-only for laser cutters. There is a clear hole for a 3D, browser-based, lamp-specific, constraint-guided tool.

## Details

### 1. Lamp & Lighting Design Principles

**Poul Henningsen's Three-Shade System (1925–)** is the rosetta stone for any parametric lamp. Designed for Louis Poulsen and debuted at the 1925 *Exposition Internationale des Arts Décoratifs et Industriels Modernes* in Paris (the "Paris Lamp" won gold), it uses a **logarithmic spiral** as the generating curve, with the light source placed at the spiral's focal point so every shade receives equal angular share of the source — producing even luminance distribution across the curved shade. The **three-shade family** uses a **3:2:1 diameter ratio** (e.g., the PH 3/2 has top/middle/bottom shades sized so that ratio holds; the PH 5/5 has a 50 cm top, ~31 cm middle, ~16.5 cm bottom). The numbering convention is: first number = top-shade diameter in decimeters; second number = the decimeter from whose 3:2:1 family the lower shades are drawn. Pure models (3/3, 4/4, 5/5) keep the same family; mixed models (4/3, 6/3) pair a larger top with a smaller family below. The largest historical lamp (85 cm top) uses 4:2:1 instead. The result is a system that gave Henningsen ~1,000 distinct models from a handful of parameters — exactly the structural pattern a parametric generator wants. Critically, Henningsen pursued **glare-free light**: every direct line of sight to the bulb is blocked by at least one shade, and the curve shape is computed so reflected light from the inner shade surfaces reinforces the downward flux. The inner shade undersides are matte/sandblasted; the outer top surfaces are glossy — a multi-material/multi-finish concept that maps naturally to dual-nozzle FDM (translucent shade body + opaque inner-coat strip).

**Isamu Noguchi's Akari (1951–)** is the diffusion counterpoint. Made of washi paper stretched over bamboo ribs around removable wooden forms, Akari prioritize the *quality* of light over geometry. Noguchi (in Vitra's Akari catalog text): *"The harshness of electricity is thus transformed through the magic of paper back to the light of our origin – the sun – so that its warmth may continue to fill our rooms at night."* Over 100 models across table/floor/pendant. The encodable lesson is **material translucency** as a primary design variable, not an afterthought — and the use of bamboo ribbing creates structural-vs-translucent zones that anticipate today's structural-rim-with-thin-vase-mode-skin printing.

**Other canonical designers** contribute distinct primitives the generator can offer as starting templates: **Achille Castiglioni** (Arco floor lamp, Toio, Parentesi) — found-object/industrial aesthetic, bulb-as-component, asymmetric proportions; **Verner Panton** (Flowerpot, 1968) — two hemispheres facing each other, hiding the bulb between them, pure form geometry; **Arne Jacobsen** (AJ lamp) — single asymmetric tilted shade, very directional; **Ingo Maurer** (Bulb 1966, Lucellino, Zettel'z) — celebrates rather than hides the source, poetic/playful (out of scope for a constraint-guided generator but worth honoring as a creative-mode template); **Le Corbusier** (Lampe de Marseille) — adjustable architectural pendant; **Bauhaus** (Wagenfeld WG24) — opal-glass diffuser + visible cylindrical glass stem, "form follows function" purity.

**Encodable design rules distilled from the canon:**
- Bulb must not be directly visible from horizontal viewing angles at normal seated/standing distances.
- Shade height should be ~⅔ of base height (table lamps); shade bottom diameter ~1.75× shade height; top diameter ~60% of bottom (American Lighting Association residential guidance).
- Wider at the bottom than the top → downward flux dominant.
- Reflective/light inner surface + diffuse outer = Henningsen approach; pure diffusion outer = Akari approach. Offer both as "modes."
- The lower the shade sits relative to eye height, the smaller its opening must be to maintain shielding angle.

### 2. Light Behavior, Optics & Glare Metrics

The relevant lighting-engineering vocabulary the generator should adopt:

- **Cutoff angle**: the angle between the lamp's vertical axis and the line of sight at which the bare bulb is just no longer visible. IES defines a "cutoff fixture" as one where intensity is ≤2.5% of lamp lumens at ≥90° and ≤10% at ≥80°. "Fully shielded" = bulb invisible below horizontal.
- **Shielding angle**: complementary; from the bulb edge to the shade lower lip. Common practical values are 30°, 40°, 50°. Higher = more comfort, less light spread. The generator should compute this in real time and warn when it falls below ~25°.
- **Beam angle**: between the directions where intensity = 50% of peak. Narrow <20°, medium 20–40°, wide >40°. Shade opening size and bulb position drive this.
- **Unified Glare Rating (UGR)**, defined by CIE 117-1995 and CIE 190:2010: scale 10 (imperceptible) to 30 (intolerable). Office threshold ≤19, general areas ≤25. UGR depends on the installation, not just the fixture, but for residential context, designing to keep luminance below ~3,000 cd/m² in any viewing-angle window is a reasonable internal target. The 3-step scale (10/13/16/19/22/25/28) is the smallest perceptible glare difference.
- **Direct / indirect / diffuse**: shade openings determine the mix. Closed-top + open-bottom → downlight task lamp. Open-top + closed-bottom → uplight ambient. Translucent everywhere → diffuse ambient.

The **diffusion physics** at the wall: light transmission through a printed wall depends on (a) polymer crystallinity — amorphous polymers (PETG, PCTG, PC, co-polyesters like ColorFabb XT/nGen) transmit more directly; semi-crystalline (PLA) scatters; (b) wall thickness — thicker walls = more scatter, less transmission, more even surface luminance, but darker overall; (c) layer-line direction — aligned, single-direction extrusion (vase mode or aligned-rectilinear infill) reduces internal interfaces; (d) surface texture — matte/textured outer surfaces add another diffusion step. The Bambu Lab wiki explicitly notes: *"PLA is a semi-crystalline polymer, the crystalline grains within it affect light refraction, while PETG is an amorphous polymer. Therefore, PETG generally has higher transparency than PLA."*

### 3. Geometry Rules to Encode

**Curves the generator should offer as primitives:**
- **Logarithmic spiral** (Henningsen): r = a·e^(bθ). Bulb at origin; shade follows curve. Encodes both shape and bulb position in one parameter family.
- **Catenary** (chain curve): y = a·cosh(x/a). Naturally "hanging" form for pendant shades; pure tension-only geometry, structurally elegant when printed.
- **Parabolic**: y = ax². Concentrates and projects light. Per Grand Brass's metal-shade product line, parabolic reflectors *"can provide up to 30% more light coverage compared to conventional horizontal shades."* Used in reflectors and task lighting.
- **Conical / frustum**: simplest; default Akari-like upper-cut cone or full cone.
- **Bell / ogive**: classical hand-blown look; combines a concave upper with a convex lower.
- **Revolution-of-a-profile-curve** with editable Bezier control points: ultimate flexibility — this is what most parametric vase generators (e.g., MakerWorld Make My Vase) already use.

**Constraints to enforce (real-time, with visible warnings in the UI):**
1. **Bulb concealment**: given a user-specified eye-height range (e.g., 1.0–1.8 m for floor lamps; 0.4–1.2 m for table lamps), no straight line from the bulb envelope to a point in that eye-height range may pass through an opening without crossing a shade surface. Reduce to: at the shade's lowest opening, the angle from bulb center to lip ≥ shielding angle (default 30°, configurable 25°–50°).
2. **Bulb fit**: shade inner diameter at the socket entry ≥ bulb maximum diameter + clearance (≥5 mm for LED, ≥15 mm for incandescent — though incandescent should be discouraged).
3. **Thermal clearance**: minimum air gap from bulb envelope surface to shade inner surface ≥ 50 mm for PLA, ≥20 mm for PETG, ≥10 mm for PC.
4. **Opening ratio**: top opening / bottom opening should generally stay within 0.3–1.5 for a "lamp-like" silhouette (outside this range it reads as bowl or chimney).
5. **Aspect ratio**: total height / max diameter typically 0.5–2.5 for table lamps; up to 4 for pendant cylinders.
6. **Wall thickness minimum**: 0.8 mm (2 walls @ 0.4 mm nozzle) for non-vase-mode prints; vase mode set wall width = nozzle × 1.2–2.0 for strength.
7. **Vase-mode geometry**: outer contour only, no holes in the bottom face, no negative draft (overhang ≤45° at any height), single connected silhouette per Z-slice.
8. **Multi-material zoning**: if the user selects a multi-material lamp (translucent body + opaque base/rim), the boundary between materials must be a planar Z-cut or simple axial sweep (FDM can't print arbitrarily complex inter-material seams cleanly).

### 4. Materials for 3D-Printed Lampshades

The thermal table is the most important single piece of engineering information in this report:

| Filament | Polymer | Tg / HDT | Diffusion character | Notes |
|---|---|---|---|---|
| Bambu PLA Translucent | PLA (semi-crystalline) | Tg 54 °C, HDT 55 °C, Vicat 61 °C | Soft frosted glow; high scatter | Vendor: *"perfect for crafting lightshades and decorative lanterns. Its frosted finish diffuses light beautifully."* |
| Bambu PLA Glow | PLA + luminous powder | ~60 °C (PLA family) | Glow-in-dark afterglow | Requires hardened nozzle |
| Bambu PETG Translucent | PETG (amorphous) | Tg ~80 °C | Crisp, more transparent | Vendor: *"Optimized for exceptional light transmittance … unmatched levels of translucency"* |
| Fillamentum PLA Crystal Clear | PLA (special grade) | Tg 55–60 °C; annealed HDT 100–110 °C | Highest clarity PLA; *"the optically clearest PLA for 3D printing in the world"* | Anneal 80 °C × 2 h |
| ColorFabb nGen / nGen Clear | Eastman Amphora AM3300 co-polyester | Tg/HDT ~85 °C | Clean translucency, low odor | Print 220–240 °C |
| ColorFabb_XT / XT Clear | Eastman Amphora AM1800 co-polyester | HDT 70 °C (0.455 MPa), 62 °C (1.82 MPa) | "Clear as ice" | Print 240–260 °C |
| Polymaker PolyLite PC | Polycarbonate | Service ~120 °C | Stiff, heat-resistant, light-diffusing — vendor explicitly lampshade-oriented | Requires enclosure, anneal 90 °C × 2 h |
| eSUN PETG | PETG | Tg ~80 °C | Translucent, smooth | Easy to print |
| AddNorth Textura Matte | Cellulose-enriched PLA | PLA-class (~60 °C) | Matte surface, "great light transmission" | Used in award-winning commercial Tunnelbanelampan |

**The decisive LED-vs-PLA finding** (LIFX in-house testing, published on lifx.com.au): *"In development and testing, we found that the heatsink of a fully lit LED bulb was around 60°C–100°C (140°F–212°F) depending on the make and model of the LED bulb, room temperature and airflow."* Specifically: an A21 1000+ lumen bulb measured 85 °C at the heatsink in a semi-enclosed sideways fitting; two 9 W compact LEDs hit 86 °C; CFL glass reached 120 °C; an incandescent A19 60 W surface sits around 127 °C. This **directly overlaps** PLA's Tg of ~60 °C — a PLA shade in contact with or very near the heatsink of a working LED bulb is at risk of slow deformation. Recommended clearance: ≥5 cm (2 in) for LEDs to PLA, more for halogen (45–60 cm). For the generator, the safest default is PETG or PCTG; PLA should require an active geometric clearance check or a warning gate.

**Vase mode + nozzle size**: per Bambu's transparent-printing guide, a 0.8 mm nozzle with linear single-direction infill and disabled top/bottom shells gives the best transparency on the X1C. Vase mode means a single continuous spiral with no retractions; layer height typically 0.12–0.3 mm; wall width matched to nozzle (0.4–0.8 mm). Larger nozzles also produce stronger walls and faster prints — important when shades can be 200+ mm tall.

**Filament drying** is mandatory for any translucent print: moisture causes micro-bubbles that look like fog. PETG: 65 °C × 8 h. PLA: 55 °C × 6–8 h. PC: 80 °C × 8 h. The generator should surface this as a "before you print" checklist item.

**Fire safety**: most 3D-printed lampshade failures online involve people using incandescent bulbs (surface 100–250 °C) with PLA shades and a too-tight enclosure. The cardinal rules to bake into the UI: (1) require user to confirm bulb type; (2) auto-recommend LED ≤9 W for any PLA design; (3) hard-block "incandescent + PLA + <50 mm clearance"; (4) provide a downloadable safety README that ships with every export.

### 5. Competitive Landscape

**Existing parametric lamp tools — the field today:**

| Tool | Strengths | Weaknesses | Gap to exploit |
|---|---|---|---|
| Thingiverse Customizer (OpenSCAD) | Vast catalog of parametric lampshades (mightynozzle's Customizable Lamp Shade, tm4n's Cell Lampshade, OctaShade, etc.) | Slow rendering, dated UI, often broken, OpenSCAD-only, no real-time preview | All of UX, speed, polish |
| MakerWorld Parametric Model Maker | Real-time customize button, large audience, ties directly to Bambu printers | Still OpenSCAD-bound; geometry primitives only; no lighting domain knowledge | Domain-aware constraints + better UX |
| MakerWorld "Make My Vase" / Make My Lithophane / Lightbox Maker | Polished UX, free, integrated with platform | Vases/lithophanes/lightboxes ≠ lamps; no shielding/cutoff awareness | Lamp-specific knowledge |
| Cuttle.xyz | Best-in-class browser parametric UX, generators, code/no-code hybrid, vibrant community | 2D only, laser-cutter focused | Bring Cuttle's UX quality to 3D lamps |
| Tinkercad | Friendly, web-based, blocks-based | No real parametric, no domain knowledge | Constraint-guided generator |
| Shapr3D / Fusion 360 shared models | Powerful CAD | Not browser-based, requires learning CAD | Beginner gap |
| 3DPrintBunny "Woven Table Lamp for LED Lamp 001" and similar fixed designs | Beautiful single designs | Not parametric | Customization |

**The clear gap**: a constraint-guided, lamp-domain-aware, browser-based, real-time-preview, beginner-friendly tool that exports 3MF with multi-material assignments and embeds print-ready settings. Cuttle proves the UX model works; MakerWorld proves the audience exists; nothing yet ties both to actual lamp engineering.

**Reference success stories**: Scott Yu-Jan is the canonical Bambu Lab creator-economy example. His **WORBY** (a "Wall Organizer with Red, Blue, and Yellow" — not the Apple-watch dock; ~4.8k downloads on MakerWorld) was the contest centerpiece, but the design that truly *spawned hundreds of derivative AirPods/iPhone variants* is his **iPhone StandBy Mode Dock** (co-designed with OVERWERK), with ~63.1k downloads and ~4.1k makes on MakerWorld. The pattern (creator + Bambu + contest + parametric remix-friendly base) is exactly the model the lamp generator should replicate. Earlier Bambu contests (#WhyIPrint, Pieksekisten, FORMISM ARC, Old World Magic) and the current Let's Make It Fund (up to $300,000) confirm the playbook.

### 6. The Design-to-Printable-File Pipeline

**STL vs 3MF — verdict: emit 3MF as primary, STL as fallback.**

| | STL | 3MF |
|---|---|---|
| Standard | de facto, 1987 | ISO/IEC 25422:2025 |
| Geometry | raw triangles, single mesh | mesh + multiple objects + assemblies |
| Color/Material | none | full multi-material/color |
| Settings | none | print profile, supports, layer heights embedded |
| Size | 50 bytes/triangle, uncompressed | ZIP+XML, typically 30–50% smaller |
| Lattices | uncompressed (e.g., 8 MB) | beam-lattice extension (~11 KB equivalent) |
| Ecosystem | universal | Bambu Studio, PrusaSlicer, Cura, all Bambu printers |

**Mesh requirements the generator must guarantee on every export**:
- **Manifold**: every edge shared by exactly two faces.
- **Watertight**: no holes, gaps, or naked edges; volume fully enclosed.
- **Consistent normals**: all faces point outward.
- **No self-intersections, degenerate faces, zero-area triangles, duplicate faces, or inverted triangles.**
- **Minimum feature size** ≥ nozzle × 1.5 (so 0.6 mm at 0.4 mm nozzle).
- **Wall thickness minima**: vase mode ≥ 1.0 mm wall width recommended (with 0.6 mm nozzle); standard prints ≥ 0.8 mm.
- **Overhang angle** ≤ 45° throughout the shade body (no support-required regions in vase mode).
- **Build-volume fit**: validate against the user's printer (Bambu A1 mini 180³ mm, A1/P1S/X1C ~256³, H2D 350×320×325).

**Multi-material export** (for dual-nozzle Bambu H2D / H2C / AMS-equipped X1C / P1S): assign material indices per object in the 3MF; keep the inter-material boundary planar where possible (FDM purge-and-switch is much cleaner on horizontal seams). The H2D's dual-nozzle layout means the user can have one nozzle hold opaque base material (e.g., PLA Matte Black) and the other hold translucent shade material (e.g., PETG Translucent) in a single print, with much lower waste than AMS color-switching. Default to recommending this combo for H2D users; AMS users get a warning about purge waste.

**Common failure modes to pre-empt:**
- Hole in the bottom of a vase-mode lamp ↔ vase mode disallows it. Solution: enforce a closed bottom with a separately printed socket bushing, or auto-generate a non-vase-mode base plate as a second 3MF object.
- Wall too thin → under-extrusion, fragile. Auto-clamp wall thickness to nozzle × 1.2 minimum.
- Print won't stick → auto-recommend brim if first-layer footprint <40 mm.

### 7. Everything Else

**Electrical hardware ecosystem**: the generator must integrate with off-the-shelf lamp kits. Edison-screw socket standards: **E26** (US, 26 mm diameter, 120 V) and **E27** (EU/global, 27 mm, 220–240 V) are mechanically interchangeable across that 1 mm difference; **E14** (small, Europe), **E12** (small, US/candelabra), **E39/E40** (mogul, >300 W only). Standard medium-base socket dimensions: ~40 mm diameter × 45 mm high. Standard cord kits (UL-listed, 6–20 ft) end in an E26/E27 socket with a 25–40 mm threaded shade-ring collar — the generator's "socket pocket" parameter should default to fit this collar. Include a tested socket-hole template (e.g., 26 mm hole with 1 mm clearance) in the export.

**Internationalization**: offer EU/US toggles for socket sizes, voltage warnings, and bulb wattage caps. Caution that E26 sockets max at 300 W generally (US NEC).

**Lamp-type requirements differ**:
- **Pendant**: top connector for cord, no base; consider weight (>1 kg pendants need explicit ceiling anchor).
- **Table**: needs a wide-enough base (footprint ≥ ⅓ shade max diameter) for stability; cable exit notch.
- **Floor**: typically a stem + shade; consider a printed shade attached to a commercial floor-lamp pole rather than printing the whole pole (build-volume limit).
- **Wall sconce**: one-sided mounting plate, often half-shade geometry.

**Build-volume limits** for consumer FDM printers: Bambu A1 mini 180×180×180 mm, A1/P1S/X1C ~256³, H2D 350×320×325 mm. Many design tutorials assume ~200 mm max shade dimensions. Offer "split for printing" when designs exceed the user's printer.

**Post-processing**: light wet-sanding (up to 3000 grit) or a clear UV-resistant varnish dramatically smooths layer lines and increases transparency; vendors like Creality and ColorFabb both recommend this for clear prints. The generator could ship a "finishing guide" with each export.

**Photography of lit lamps**: shoot at dusk for natural ambient balance; expose for the shade luminance (typically EV +1 to +2 over scene); use a tripod and 1/15–1/2 s at f/5.6, ISO 100–400. For contest entries, both a "lit" and "off" hero shot win consistently.

**Licensing / UGC**: MakerWorld and Printables both default to allowing user license choice, typically Creative Commons (CC-BY, CC-BY-NC, CC-BY-NC-SA most common). The generator should let users (a) pick a license for *their* generated design and (b) inherit the base-template license. The underlying generator code is a separate question (likely the owner keeps it proprietary; the *output* is the user's). Add a Bambu Lab/MakerWorld upload button to the export flow for contest submissions.

**Safety / liability**: distribute designs only — never assemble or sell completed lamps without UL/CE certification. The export should ship with a README explicitly stating: (1) for hobby/non-commercial use; (2) user is responsible for electrical assembly per local code; (3) recommended bulb type and wattage cap; (4) no warranty.

**Accessibility for non-designers**: Cuttle's lesson — start with templates, not a blank canvas. Offer "Henningsen Mode" (3-shade with 3:2:1 ratio), "Akari Mode" (single soft form, washi-like surface texture), "Pendant Mode", "Table Mode" presets, each with 2–3 named sliders that map to deeper parameters.

## Recommendations

**Stage 1 — Ship the MVP (8–12 weeks)**:
1. Single-shape parametric shade with profile-curve editor (Bezier control points) and a built-in logarithmic-spiral preset honoring 3:2:1 ratios.
2. Real-time shielding-angle and cutoff-angle indicators in the 3D viewport; red-warning when shielding <25°.
3. Vase-mode-aware geometry validation (closed bottom check, single-contour check, overhang check).
4. STL + 3MF export with embedded print profile (PLA / PETG default at 0.4 mm nozzle); manifold/watertight guarantee from the geometry engine.
5. E26/E27 socket-pocket template, configurable.
6. Two starting templates: "Henningsen 3-Shade" and "Akari Cone."

**Stage 2 — Differentiate**:
1. 2D pattern studio (perforation/voronoi/wave-relief patterns) wrapped onto the shade as a translucent vs opaque mask — drives multi-material 3MF export.
2. Multi-material 3MF for H2D users (translucent shade + opaque base).
3. "Lit preview" mode — a basic ray-marched light simulation showing approximate luminance distribution on a virtual wall.
4. One-click MakerWorld upload.

**Stage 3 — Community moat**:
1. Template gallery with user-submitted parametric presets (the Cuttle pattern).
2. License toggle per design.
3. Integration with the MakerWorld design contest as the official tool.

**Benchmarks that would change the strategy**:
- If <20% of users finish a design in their first session → templates and onboarding are too thin; double the preset count.
- If >10% of exported files fail to slice on Bambu Studio → tighten geometry validation, especially overhang and wall-thickness checks.
- If contest entries cluster around 2–3 forms → the parameter space is too constrained; add curve types.
- If users routinely override the bulb-clearance check → make it a soft warning with explicit "I accept the risk" rather than a block, but log it.

## Caveats

- **UGR is not strictly applicable to residential decorative luminaires.** The CIE 117-1995 method is for interior workplace lighting; for residential mood lighting, the values are advisory at best. Don't display UGR as a hard score — use shielding angle and a qualitative "comfort" rating instead.
- **Real-world light simulation in-browser is hard.** A physically accurate render of how a printed shade will look lit requires sub-surface scattering and photometric data we don't have. Use a stylized preview and be honest about it.
- **The thermal table assumes "typical" filaments.** Specific spools vary; annealed PLA can reach HDT 100+ °C (Fillamentum Crystal Clear), but most users won't anneal. Default to the un-annealed numbers for safety.
- **MakerWorld contest rules are platform-specific** and change per contest; confirm rules before claiming the tool is "official." Bambu's Let's Make It Fund (up to $300,000) is a current sponsor channel worth investigating but not the same as a MakerWorld design contest slot.
- **3MF support in older slicers** is incomplete — emit STL alongside as a compatibility fallback for users on older Cura/Prusa/Mac workflows.
- **The Henningsen 3:2:1 system was tuned for incandescent point sources.** LED filament bulbs (long, linear) and LED corn bulbs (omnidirectional clusters) change the optics — the bulb is no longer a point at the spiral's focus. For high-fidelity Henningsen-mode designs, recommend Edison-style LED filament bulbs as the visual reference.

## Completion Checklist

| Plan Item | Covered |
|---|---|
| 1. Lamp & lighting design principles (PH, Akari, Castiglioni, Panton, Jacobsen, Maurer, Le Corbusier, Bauhaus) | ✅ Section 1 |
| 2. Light optics, glare, UGR, shielding/cutoff, distribution patterns | ✅ Section 2 |
| 3. Geometry rules to encode (curves, ratios, constraints) | ✅ Section 3 |
| 4. Materials, polymer morphology, vase mode, multi-material, LED heat, fire safety, specialty filaments | ✅ Section 4 |
| 5. Competitive landscape including WORBY/Scott Yu-Jan | ✅ Section 5 |
| 6. STL vs 3MF, manifold, wall thickness, multi-material export, failure modes | ✅ Section 6 |
| 7. Hardware (E26/E27), lamp types, build volumes, post-processing, photography, licensing, safety, accessibility | ✅ Section 7 |
| Recommendations + benchmarks | ✅ Recommendations |
| Caveats & limitations | ✅ Caveats |