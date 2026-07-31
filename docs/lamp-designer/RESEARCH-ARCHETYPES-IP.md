# Research: Lamp Archetypes, MakerWorld Platform, and IP Boundaries

Compiled 2026-07-31 for the Lamp Designer v2 rebuild (see LAMP-DESIGNER-V2-ROADMAP.md).
Sources: MakerWorld model pages, Printables GraphQL API (exact counts), Thingiverse, Bambu forum/wiki, EU and Danish legal sources. Printables numbers are exact; MakerWorld numbers from search listings are approximate (marked ~), individual page numbers are exact.

---

## 1. Archetype ranking by observed platform traction

| # | Archetype | Strongest signal | Vase mode? | IP risk |
|---|-----------|------------------|------------|---------|
| 1 | Moon / lithophane sphere lamps | 69,506 dl on one MakerWorld model; 123,382 on one Printables model | No | None (NASA data public domain) |
| 2 | Spiral / twisted vase shades | 34,417 dl top MakerWorld swirl lamp | Yes | None |
| 3 | Ribbed / wavy vase lamps | 8.2k dl top model, dozens of mid-size hits | Yes | None |
| 4 | Mushroom dome lamps | 10.4k dl top model | Mostly no | Medium (Panthella/Nesso adjacency) |
| 5 | Slatted / kumiko / Japanese lantern | 9.3k dl top model | No | None |
| 6 | Desk / sculptural table lamps | 16.5k dl (CubeStack) | Mixed | Medium (Tolomeo/Anglepoise adjacency for arms) |
| 7 | Voronoi / organic-cell shells | 4,686 dl top Printables | Partly | None |
| 8 | Honeycomb / hex lattice | 6,690 dl top Printables | No | None |
| 9 | Origami / folded / pleated | ~12.8k dl top tealight set | Yes (pleats) | Medium (Le Klint Sinus adjacency) |
| 10 | Geometric / faceted low-poly | ~1.7k dl mid hits, long tail | Yes | None |
| 11 | Photo lithophane cylinders | 541k users of MakerWorld's lithophane tool | No | None (user photos) |
| 12 | Gyroid / TPMS lattice | 1,614 dl top parametric | No | None |

**Rejected: stacked-disc / louvered shades.** Verified weak (top MakerWorld result 152 downloads) AND the multi-tier curved-disc language is precisely PH 5 / Artichoke territory. No template. If louvers ever come back: straight venetian slats on a cylinder, never curved reflector tiers in graduated diameters.

**Cross-cutting finding: the Bambu LED Lamp Kit 001** (Maker's Supply hardware kit, 5V USB, 3W/5W, 3000K/4000K) is the gravitational center of the MakerWorld lamp ecosystem. The platform's top lamp is built for it, categories are named after it, and Maker's Supply BOM listings pay creators 3-15% cash commission (effective March 24, 2026). Every template should ship a Kit 001 mount variant alongside E27/E14 rings and a generic 60-70 mm LED puck seat. Bonus: 5V 3W/5W runs cool, which relaxes the PLA heat constraints that mains bulbs impose.

---

## 2. Per-archetype geometry logic and constraints

### 2.1 Moon / lithophane spheres
Geometry: sphere radius R (60-100 mm typical, 150 mm diameter reference). Wall thickness modulated by grayscale heightmap (NASA LRO data, public domain): t(u,v) = t_min + (1 - brightness) * (t_max - t_min). Params: diameter, t_min, t_max, heightmap, flat-spot diameter at base, opening diameter, stand style.
Print: standard walls, effectively solid shell, no supports when dome closure is tuned (flatten top or adaptive layers 0.08 mm at poles). ~10 h at 150 mm. White or marble PLA.
Constraints: gradient reads only at t 0.6-3.2 mm; layers 0.08-0.12 mm (never above 0.16 or banding); sphere top is the failure zone (last ~10 degrees exceeds overhang at 0.2 mm layers); t_max above ~4 mm blocks light; t_min below ~0.5 mm cracks; base opening clears the LED with 0.3-0.5 mm.
Top examples: Moon Lamp for LED Lamp 001 (LeHa Design, MakerWorld 731351, 69,506 dl, SDFL); Design Moon Lamp (Frank Deschner, Printables 23859, 123,382 dl, CC-BY-NC-SA); Moon Lamp Commercial Use Allowed (Printables 1481473, CC-BY).

### 2.2 Spiral / twisted vase shades
Geometry: r(theta) = R + A * sin(N * theta), swept along Z with linear twist T over height H; optional R(z) profile spline. Params: H 100-300, R, wave count N 4-24, depth A, twist T 0-360+, R(z) control points, opening diameters, fitting type.
Print: vase mode, 1 perimeter, 0 infill, line width up to 200 % of nozzle (0.8 on 0.4) for stiffness. Reference: 2.9 h, 65 g desk size.
Constraints: exactly one closed simple contour at every Z (enforce r > 0.2R everywhere, check self-intersection); combined slope from flare + twist within 45 deg sustained, 50 brief; no bridging exists in vase mode so R(z) must be C1-continuous; flare top rim inward ~5 mm or it warps; above H 250 / R 90 auto-increase line width or enforce A >= 2 mm (waves are the stiffener).
Top examples: The Striped Swirl Lamp (SoDR, MakerWorld 1018987, 34,417 dl, SDFL); Spiral Lamp Shade (Printables 1106983, CC-BY); Twisted shade for IKEA Skaftet (Printables 444253, CC-BY-NC).

### 2.3 Ribbed / wavy vase lamps
Geometry: same engine, different ranges: fine ribs N 16-60 at A 0.5-2 mm, low/zero twist, plus horizontal band ripple R(z) = R0 * (1 + B * sin(M * pi * z / H)). Optional fuzzy-skin flag.
Print: vase mode for shades; 2-wall standard for load-bearing bodies. PETG recommended by the top E27 model.
Constraints: same vase rules; band ripple B directly creates overhang, bind B * M * pi * R0 / H <= tan(50 deg). E27 ring openings 40 mm class with 0.3 mm clearance, 1.6 mm min ring wall.
Top examples: Wavy Lamp E27 PETG (Eris, MakerWorld 965182, ~8.2k dl); Organic Ripple Lamp (MakerWorld 2188163, ~5.7k dl); Wave Lamp (Printables 634207, CC-BY-NC-SA).
Note: IKEA-adapter variants (Skaftet, Tarnaby) recur across top models; interoperability is legal and a proven demand amplifier.

### 2.4 Mushroom dome lamps
Geometry: dome (squashed superellipsoid, squash k), stem (cylinder/flared), optional gills, optional ribbing. Params: dome diameter, k, edge curl-under angle, stem height/diameter/flare, gill count, puck seat, cable channel.
Print: standard 2 walls; dome upside down separately (support-free) snapped to stem, or single piece within overhang limits. 2-6 h.
Constraints: dome underside fails beyond ~45 deg curl-under; stem junction >= 3 perimeter contact; dome diffuser wall 1.2 mm+ for even glow; stem diameter >= dome/4 or it tips (ballast cavity flag).
IP guardrail: keep defaults organic (squashed, stumpy, textured). The clean glossy hemisphere on a slender trumpet stem IS the Panthella (protected to 2068); quad-stem dome is Artemide Nesso. Cap that corner of the parameter space.
Top examples: Stumpy Mushroom Lamp (NUKDDD, MakerWorld 95343, ~10.4k dl); Kit-001 Mushroom Ribbed (MakerWorld 2134432, ~7.3k dl); Voronoi Mushroom (Printables 1466028, CC-BY-SA).

### 2.5 Slatted / kumiko / Japanese lantern
Geometry: frame (cylinder/box/pagoda) with vertical slat array (count, width, gap) or kumiko lattice panels (asanoha/diamond, cell size); inner vase-mode diffuser in white/translucent. Two-material natural fit.
Print: slats vertical support-free; lattice panels flat then slot together (dominant approach); bridges <= ~10 mm clean or arch them (45 deg chamfer under top ring).
Constraints: free slats fragile below 2x2 mm above 120 mm height; lattice member min 1.5-2 mm, junction overlap >= member width; slot tolerances 0.15-0.25 mm per side.
Top examples: Japanese Mini Tea Light Lantern (MakerWorld 1180829, ~9.3k dl); KUMIKO Modular DELTA (MakerWorld 808247); Japanese Garden Lantern (Printables 318894, 8,356 dl, CC-BY).

### 2.6 Desk / sculptural table lamps
Geometry: (a) articulated arm: segments L1/L2, friction hinges 0.25-0.4 mm clearance, head with puck seat, cable channel; (b) sculptural revolve/loft bodies (cloud = sphere unions).
Constraints: printed arms >= 8x8 mm section per 100 mm reach in PLA; friction hinges lose preload in PLA (design for bolts + nyloc); base mass >= 2x head moment (ballast cavity); PETG for heads above 5 W.
IP guardrail: no tension-cable cantilever (Tolomeo, actively enforced) and no three-spring cluster (Anglepoise trade dress). Box-section arms with visible bolts are fine.
Top examples: CubeStack (MakerWorld 1057953, ~16.5k dl); Cumulis (MakerWorld 2012709, ~9k dl); Kit 001 55-minute lamp (MakerWorld 2175648).

### 2.7 Voronoi / organic-cell shells
Geometry: Poisson-disc seeds on a revolve surface, surface Voronoi, edges offset to strut width w, shell thickness t, fillets. Params: base form, seed density (cells 15-40 mm), w 1.5-3 mm, t 2-3 mm, fillet, openings, optional inner vase diffuser.
Print: standard mode; the one archetype that legitimately wants supports, avoided via (a) stacked ring sections, (b) egg orientation keeping struts under 55 deg, (c) separate cage + vase diffuser (top model does exactly this).
Constraints (highest-risk archetype): MUST run strut-graph connectivity validation (single component, no dangling edges); struts below 1.5x2 mm snap; horizontal spans > 10 mm fail (bias Voronoi relaxation to steepen edges, enforce max horizontal span); cells > ~50 mm glare without diffuser; fillet junctions >= 1 mm.
Top examples: VORONOI PATTERN LAMPSHADE (Toprototyp, MakerWorld 547681, SDFL); Voronoi Lamp w/ LED Stand (Printables 611307, 4,686 dl, CC-BY-SA).

### 2.8 Honeycomb / hex lattice
Geometry: hex grid on cylinder/cone/capsule: cell radius 8-25 mm, wall 1.2-3 mm, through-holes or 0.4-0.8 mm membrane backing, optional size gradient.
Constraints: flat-topped hex bridges the cell top, cap ~12-15 mm or auto-rotate vertex-up; walls below 1.2 mm brittle; sphere mapping needs pentagon defects, prefer cylinder/cone forms.
Top examples: Honeycomb lamp shade (Printables 82432, 6,690 dl, CC-BY-NC-SA); Honeycomb Table Lamp (MakerWorld 1740058); HiveLight for Kit 001 (MakerWorld 169614).

### 2.9 Origami / folded / pleated
Geometry: (a) pleat engine, vase-friendly: zigzag r(theta) between R_out/R_in, pleat count 6-24, optional band phase-flip for diamond/waterbomb facets; (b) rigid triangulated fold-look (Yoshimura).
Constraints: crease radius >= nozzle diameter; band transitions respect 45-50 deg (h_band >= pleat_depth); R_in >= 0.25 * R_out against self-intersection.
IP guardrail: straight pleats, diamonds, polygonal folds are safe (the 1938 Le Klint patent is expired; Kaare Klint's Model 101 public domain since end of 2024). NEVER sine-curve-folded swooping shells: the Sinus/Model 172 line (Poul Christiansen, living) is protected for decades. Never the Le Klint name.
Top examples: Table Tealight Lamp Set 2 (MakerWorld 1871775, ~12.8k dl); Perimeter Origami Lampshade (Printables 862922).

### 2.10 Geometric / faceted low-poly
Geometry: F x S faceted revolve (F facets 5-12, S segments 3-8), icosphere jitter, crystal prisms. Vase mode works for faceted revolves.
Constraints: every face normal within 55 deg of vertical (tilt-check per face, warn/auto-adjust); vase facet corners >= 0.8 mm radius; F < 6 faces bow, add 3 % inward crown.

### 2.11 Photo lithophane cylinders
Geometry: user image heightfield on cylinder arc (90-360 deg), sphere, or plaque; thickness 0.6-3.2 mm as 2.1. MakerWorld's own lithophane tool: 541k users; personalization is the strongest print trigger on the platform.
Constraints: as 2.1 plus vertical orientation mandatory, min feature ~2 px per 0.4 mm, faces need >= 40 px across, arc under 180 deg needs a base foot. User images = user's IP responsibility (ToS clause).

### 2.12 Gyroid / TPMS lattice
Geometry: gyroid implicit surface in a shell volume, cell 10-30 mm, thickness 0.8-1.6 mm, solid rim rings top/bottom >= 3 mm. Marching cubes + thicken, export watertight.
Constraints: self-supporting at cell >= 12 mm, t >= 0.8 mm; trimmed boundary cells leave knife-edges unless rims cap them (mandatory).

---

## 3. MakerWorld platform (mid-2026 state)

- **Parametric Model Maker (MakerLab)**: two authoring routes, OpenSCAD (.scad) and Fusion 360 (.f3d, since PMM v1.0.0, June 30 2025). Favorite parameters become user-facing sliders; parameter comments become tooltips; 3MF profile export configurable; open or closed source choice. Multi-plate generation for OpenSCAD models. Free to use currently.
- **No public write API.** Uploads are manual; automated ingestion only from verified Printables/Thingiverse accounts. Third-party generator services exist only as negotiated partnerships.
- **External links in model listings are prohibited** by community guidelines. The web generator cannot be linked from MakerWorld model pages.
- Strategy this implies: two distribution channels. Publish curated presets natively on MakerWorld as PMM parametric models (which means our geometry templates want an OpenSCAD implementation path), keep the full-featured guided app on jespermakes.com. Cross-promotion inside MakerWorld between our own models is allowed.
- Formats accepted: 3mf, stl, step, obj, scad, f3d and more. Print profiles are Bambu Studio project 3mf. Since Feb 2025: every model and profile needs at least one real photo of the printed object or it gets rejected.
- Economy: Boost = 12 points (15 exclusive); ~500 points = $40 gift card; Exclusive Model Program pays $0.066/point +25 %, needs 100 prior prints, excludes AI-generated. Maker's Supply BOM commissions 3-15 % cash (since March 24, 2026). 2026 points overhaul: points decay with model age (cadence beats one big drop), 9 evaluation tiers, quality baseline = real photos + profiles + instructions.
- What ranks for lamps: Kit 001 compatibility, no-supports and fast-print claims, multiple print profiles, real photo sets, customizable badge, sustained upload cadence.

---

## 4. IP and design protection (EU/Denmark)

Framework, verified to mid-2026:
- Applied art gets full EU copyright with no higher originality bar (Cofemel C-683/17; Flos C-168/09; joined C-580/23 + C-795/23 decided Dec 4 2025: infringement turns on whether the ORIGINAL ELEMENTS of the protected work appear in the accused object; technical-function features excluded). Term: life + 70. Kwantum v Vitra (Oct 2024): applies regardless of country of origin.
- Protection horizons: PH series (Henningsen, d. 1967) until end of 2037. Panthella (Panton, d. 1998) until 2068. Akari (Noguchi, d. 1988) until 2058, plus live trademarks on the Akari name and stamp. Arco (Castiglioni, d. 2002) until 2072. Tizio until 2085; Tolomeo (De Lucchi, living) longer, actively enforced. Le Klint: 1938 patent expired, Kaare Klint Model 101 public domain since end of 2024, but the Sinus/172 line (Christiansen, living) protected for decades, Le Klint brand a live mark.
- Registered designs on the classics expired long ago; copyright + trademark + marketing law enforce. Shape trademarks are the backstop: Louis Poulsen registered the PH 5 shade shape as a 3D mark in Japan and won (Tokyo District Court 2018); assume equivalent EU strategies.
- **Regulation (EU) 2024/2822, fully in force July 1, 2026**: creating, downloading, copying, sharing any medium or software recording a design is an infringing use, aimed at 3D files, products include non-physical embodiments. So no cloning currently registered commercial lamps either (Hay, Muuto, Gubi class), not just classics.

Danish enforcement record (not theoretical):
- Voga.com (Sø- og Handelsretten 2014): UK replica seller ordered to geo-block Denmark; ISP blocking followed.
- invertu.com (Copenhagen City Court 2015): criminal conviction, suspended prison for replica furniture/lamp sales into DK.
- Nlini (Retten i Aarhus 2019): 1 year 3 months conditional, 500,000 DKK confiscated, PH lamps explicitly among the 2,000+ copies.
- Danish private-copy law (§ 12) does NOT cover copies that "can be perceived as an original": a faithful home print of a protected lamp is outside the private-use exception. "Users only print at home" is not a defense.

Operating rules for the generator (the verdict):
1. Generic geometric families only: spiral, ribbed, voronoi, honeycomb, gyroid, low-poly, straight pleats, kumiko grids, moon/photo lithophanes, organic mushrooms, box-section arms. All safe: none reproduces original creative elements of a protected work.
2. Parameter-space blacklist (constrain ranges away from these corners, no "inspired by" presets): multi-tier curved reflector discs in graduated diameters (PH 5); layered pointed-leaf globes (Artichoke); glossy hemisphere on trumpet stem (Panthella); sine-wave-folded pleat shells (Le Klint Sinus); Akari-proportioned ribbed cocoons; arch-on-marble-block floor lamp; tension-cable cantilever arm; three-spring arm cluster.
3. Names: no designer or brand names anywhere in product UI, listings, or marketing ("PH-style", "Akari-like" is trademark use in trade). Design-history commentary in the VIDEO is fine as commentary; the tool ships nameless generic archetypes.
4. Because we emit files: no protected-design templates at all, a takedown route on the site, and ToS putting lithophane image responsibility on the user.

---

## 5. Consolidated printability constants (0.4 mm nozzle baseline)

- Vase mode: one closed simple contour per Z; sustained overhang <= 45 deg, brief <= 50; line width up to 200 % nozzle; C1-continuous profiles; no bridging exists; flare top rims inward.
- Standard shells: min wall 0.8 mm (2 perimeters), 1.2 mm above 200 mm height; overhang <= 45-55 deg; clean bridges <= 10 mm, arch anything longer; fit clearances 0.2-0.4 mm, slots 0.15-0.25 mm.
- Lattices: voronoi struts >= 1.5-2 mm with graph connectivity validation; hex walls >= 1.2 mm, cells vertex-up or <= 15 mm; gyroid t >= 0.8 mm, cells >= 10-12 mm, solid rims >= 3 mm.
- Lithophane: 0.6-3.2 mm thickness, 0.08-0.12 mm layers, vertical, 99-100 % solid, white PLA.
- Thermal: Kit 001 (5V 3W/5W) is PLA-safe; mains bulbs follow the clearance table in RESEARCH-FIXTURE-STANDARDS.md.

## 6. Strategic takeaways

1. Every template ships a Kit 001 mount option; it is the MakerWorld lamp economy, and BOM commissions align with the Bambu relationship.
2. Implement templates with an OpenSCAD port path so curated presets live natively as PMM models; there is no upload API and no external linking.
3. Publish cadence beats one big drop (age decay in the 2026 points system); real photos + profiles are mandatory.
4. Popular-model licenses do not constrain us: we reimplement generic math, never meshes.
5. Denmark is the most aggressive jurisdiction in Europe on designer-lamp copies and the 2026 design law covers files. Generic-geometry-only is the only lane for a Danish business, and it contains 11 of the 12 highest-demand archetypes.
