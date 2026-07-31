# Lamp Designer v2: Fixture-First Rebuild

**Status 2026-07-31 end of day:** Phase A SHIPPED (fixture step, five mount modules, fit coupons, real thermal model; commit dda75f1). Phase B1 SHIPPED (patterns are real modulated geometry, one build pipeline, validator + 47-cell golden matrix in CI; commit ddffcca). Phase C core SHIPPED (material plan engine, fixture-aware Check step, real 3MF export, per-fixture assembly guide; commit 9c489b6+fixes). Remaining: B2 (moon, photo lithophane, kumiko, mushroom engines), C remainder (dual-material zones, embossed crown text, Bambu settings embedding), D physical prints (Jesper), E MakerWorld presets. Task IDs in section 7.

**Date:** 2026-07-31
**Owner:** Floki (build), Jesper (validation prints, final calls)
**Deadline anchor:** live and tested before the Bambu video publishes (late summer 2026, DR-153)
**Decision record:** DR-160 (architecture), under DR-153 (video concept)
**Related:** LAMP-DESIGNER-PRD.md (v1 spec), lamp_generator_vision.md, lamp_designer_app_handover.md, Brain task t_01KYVM6PC3TW0Y1YGMJQHNFESH

---

## 1. Why v2: the honest audit of v1

Jesper's diagnosis: the designer only makes a shade shell at best, can produce unprintable designs (rings with no connectors), and has no mount for the light fixture. The code audit confirms it, and it is worse than it looks.

**Finding 1: the shape sliders are decorative.**
`page.tsx` passes the static `template.profile` to the scene. `generateLampGeometry()` reads only `wallThickness` from the shape parameters. Height, top diameter, bottom diameter, curve tension: none of them touch the geometry. The Reveal panel says "Height 241 mm" from state while the mesh and the exported STL are the fixed 180 mm template. The sliders move constraint meters and check text, nothing else.

**Finding 2: patterns are an illusion.**
Patterns are alpha-map textures on the preview material (`lamp-mesh.tsx`). They are never geometry. The exported STL is always a smooth shell. The horizontal-rings preview shows a lamp that cannot exist as shown. The pattern data model even has a `createsStructure: false` flag on rings, correctly identifying that they do not self-support, and nothing consumes that flag.

**Finding 3: there is no fixture.**
`LampParameters` has no socket, no mount, no power concept. `BULB_E27` constants exist only for constraint arithmetic. Nothing in any export gives the bulb a place to live. Every v1 export is an object, not a lamp.

**What v1 got right, and we keep:**
- The guided 8-step journey UX and the visual language. The flow feels right.
- The constraint-engine concept (shielding angle, thermal clearance, proportions).
- Test discipline: the lib has real unit tests throughout.
- Real binary STL export shipped 2026-07-31, correct Z-up mm pipeline.
- The vision: guided, not exposed. That stays the product.

## 2. The architecture decision: fixture-first, correct by construction

Four principles replace the v1 approach:

**P1. Every lamp begins at the fixture.** The user's first physical decision is how the lamp gets power and where the bulb sits: pendant cord set, table base, or wall mount, with a socket standard (E27 default for EU, E14, E26/E12 for US later). The fixture produces a verified mount module: a small, boring, thoroughly tested piece of geometry with exact interface dimensions. The shade is generated around the mount, never the other way. The mount is the seed of the design tree.

**P2. Archetypes are generators, not meshes.** Users do not get freeform geometry. They pick a curated base design (an archetype), each one a parametric generator that cannot produce an unprintable result. Parameter ranges are clamped to the safe envelope of that archetype. Horizontal rings always get their spines. Perforations always keep their bridges. The guarantee is by construction, not by after-the-fact warnings.

**P3. One geometry pipeline.** The preview renders the exact mesh the export writes. No texture stand-ins for geometry. If the preview shows a slot, the STL has a slot. This is non-negotiable and testable: `hash(previewMesh) == hash(exportMesh)` for every parameter set.

**P4. Validation is the backstop, not the strategy.** A final validator (manifold, single connected component, overhang, min feature, bulb clearance) runs before export as a safety net and as the trust signal in the Check step. It should never fire in normal use because generators are correct by construction. If it fires, that is a bug in a generator, and it gets logged as one.

### The lamp model

```
Fixture (socket + power mode)
  -> Mount module (verified interface geometry, per fixture)
    -> Shade archetype (parametric generator, takes mount interface as input)
      -> Pattern (archetype-native operations only)
        -> Material plan (filament + walls + bulb pairing)
          -> Validation (backstop checks)
            -> Export (3MF with profile + STL fallback + assembly guide)
```

### Data model sketch

```ts
interface FixtureSpec {
  socket: "e27" | "e14" | "e26" | "e12";
  mode: "pendant" | "table" | "wall";
  cordSetPreset?: string;        // e.g. "generic-e27-ring", "ikea-style"
}

interface MountInterface {
  apertureDiameter: number;      // what the shade crown must provide
  crownRadius: number;           // where the shade may begin
  bulbEnvelope: BulbEnvelope;    // exclusion zone: nothing inside this
  attachment: "ring-clamp" | "thread" | "snap";
}

interface LampParameters {
  context: LampContext;
  fixture: FixtureSpec;          // NEW, and first
  archetypeId: ArchetypeId;      // replaces templateId
  shape: ShapeParameters;        // now actually drives geometry
  pattern: ArchetypePatternParams; // archetype-scoped, real geometry
  light: LightParameters;
  material: MaterialPlan;        // NEW: filament + walls + bulb
}
```

### The journey, revised

Context -> **Fixture (new)** -> Form -> Shape -> Light -> Pattern -> Check -> Reveal -> Export

Context (bedside, dining, hallway) now pre-selects the fixture mode: dining suggests pendant, bedside suggests table. The Fixture step makes it explicit and physical, with photos of real hardware and a "this is the part you buy" framing. Everything downstream is anchored to it.

## 3. Fixture library v1

Full spec with sources: RESEARCH-FIXTURE-STANDARDS.md. The load-bearing facts:

- E27 holders follow EN 60238: externally threaded 40 mm skirt, shade clamped as a flat annulus between two rings. Two thread families exist in the wild (~40.2 x 2.4 and ~39.0 x 2.1), so the **clamped annulus with a 41.0 mm printed hole is the default** (fits both, carries load on a continuous ring); a printed M40x2.5 female thread is the parametric option.
- The IKEA cord set family (SUNNEBY, HEMMA, SKAFTET, STRALA, HAVSDJUP, JALLBY) shares one interface: **plain Ø45.0 mm slip-over aperture** resting on the stock ring. Community-verified default on MakerWorld. IKEA's max 22 W marking becomes our inherited hard cap.
- E14 clamp aperture: 29.0 mm, and it doubles as the B22 module.
- Table lamps: flange with 10.3-10.4 mm hole clamped between two M10x1 lamp nuts (EU standard stem). Printing the M10x1 thread itself is at the edge of FDM; clamp instead.
- US post-launch set: E26 clamp (41-43 mm), spider fitter (11.3 mm washer hole, 1/4-27 finial), UNO ring (1-1/4 x 18 TPI).
- Every module carries a bulb keep-out envelope (A60: 60 x 110 mm etc.), the heat clearance for the chosen filament, and embossed "LED ONLY MAX xx W" text near the aperture.
- Every fixture exports a **15-minute fit-test coupon** so users verify their hardware before a 10-hour shade print.

Launch modules, in order: EU-E27-CLAMP (default), IKEA-SLIP, EU-E14-CLAMP, STEM-M10 table flange, and **KIT001-SEAT** for the Bambu LED Lamp Kit 001 (the MakerWorld lamp economy standard, 5V 3W/5W, cool-running so PLA-safe; see section 4). Post-launch: US-E26-CLAMP, US-SPIDER, US-UNO, GU10-CARRIER.

Each mount module ships only after a physical fit test on real hardware, printed on the H2D. One test print per fixture, filmed, becomes video material.

## 4. Archetype library v1

Full per-archetype geometry logic, parameter ranges, constraints, examples and licenses: RESEARCH-ARCHETYPES-IP.md. Ranked by real platform traction (Printables API exact counts, MakerWorld page data).

The demand ranking, condensed: (1) moon/lithophane spheres, by far, (2) spiral/twisted vase, (3) ribbed/wavy vase, (4) mushroom domes, (5) kumiko/slatted lanterns, (6) desk/sculptural lamps, (7) voronoi shells, (8) honeycomb, (9) pleated/origami, (10) low-poly, (11) photo lithophane cylinders (541k users of MakerWorld's own tool; personalization is the strongest trigger on the platform), (12) gyroid.

**Stacked-disc/louvered shades are rejected**: verified weakest demand (top model 152 downloads) and the closest silhouette to protected PH designs. The v1 horizontal-rings pattern dies with the alpha-map system.

Proposed launch shortlist (7 archetypes, 3 shared engines, pending Jesper sign-off):

*Revolve engine (vase mode):*
1. Spiral / twisted vase
2. Ribbed / wavy vase
3. Classic family (the v1 cone, dome, cylinder, reborn as real generators)

*Heightmap engine:*
4. Moon lamp (NASA public-domain lunar data)
5. Photo lithophane cylinder (user photos, personalization)

*Frame engine (standard mode, two-material ready):*
6. Kumiko / slatted lantern (opaque frame + translucent diffuser, the H2D dual-nozzle showcase)
7. Mushroom dome (guardrailed away from the Panthella corner)

Post-launch tranche: voronoi (needs the strut-graph connectivity validator at full strength), honeycomb, pleated (straight pleats only), low-poly, gyroid, desk arms.

Every archetype ships with: clamped parameter ranges from the research constants, a Kit 001 mount variant plus the fixture modules from section 3, print-verification at parameter extremes on the H2D before launch, and an OpenSCAD port path for MakerWorld parametric presets (see section 9 strategy note).

**The Bambu LED Lamp Kit 001 finding:** the Maker's Supply hardware kit (5V USB, 3W/5W) is the center of the MakerWorld lamp economy. The platform's top lamp (69.5k downloads) is built for it, and BOM listings pay creators 3-15 percent cash commission. Every template gets a Kit 001 seat; it also runs cool enough to relax PLA heat limits. This aligns perfectly with the Bambu video.

## 5. Material and light intelligence

Full knowledge base with sources: RESEARCH-FILAMENT-LIGHT.md. The load-bearing facts:

- **Bambu sells a dedicated lamp filament: PLA Translucent**, marketed for lampshades, frosted-glass look, 10 colors, bonds with all PLA. It is our default material. PETG HF is discontinued (map to PETG Basic 2026); PETG Translucent is the stained-glass option but shows the bulb unless frosted.
- The workhorse recipes: white PLA at 2 perimeters (~0.8-1.0 mm) gives even glow with the bulb hidden; translucent wants the 1.2-2 mm sweet spot (vase mode with 0.6-0.8 nozzle); 3 mm is effectively opaque; sparse infill in any lit region projects as a shadow web, so lit zones are walls-only.
- Vase mode kills the seam, the biggest visual defect in backlit shades. Fuzzy skin turns clear PETG into a frosted diffuser.
- **Dual material on the H2D: PLA + PLA only** (opaque frame + PLA Translucent windows, full weld). PLA + PETG barely bonds and is banned as a fused body. One material per nozzle means no purge waste; the generator caps designs at 2 materials.
- **LED only, hard rule.** Documented test: one incandescent bulb destroyed a PLA shade in 2 hours. Wattage/enclosure gates: PLA up to ~10 W open, 4 W fully enclosed; PETG buys roughly double; the tool auto-suggests PETG above 7 W or for closed tops. Radial clearance table lives in the research doc.
- Bulb pairing: 2700 K frosted for glow moods, 4000 K CRI 90+ when shade color must stay true, clear filament-style LEDs for projection patterns, frosted SMD for even diffusion.
- H2D envelope reality: 325 x 320 x 325 mm single nozzle, **300 mm X for dual-material**. Taller lamps become sections with registered joints placed at opaque bands (every joint is a shadow line in a lit region).

The Check step becomes a real recommendation engine on this data. Input: archetype, pattern density, fixture, light mood. Output: named Bambu filament, wall count or vase mode, bulb spec (base, shape, max wattage, color temperature), and the reason in one plain sentence. The same data drives the 3MF print profile.

## 6. Printability validation (the backstop)

Runs on the final mesh before export, surfaces in the Check step:

1. **Watertight and manifold**: no open edges, no non-manifold edges.
2. **Single connected component**: the exact check that makes floating rings impossible to ship. Union-find over the triangle graph.
3. **Overhang analysis**: per-face angle vs print orientation; archetype metadata declares vase mode or supported limits.
4. **Minimum feature size**: no wall below 0.8 mm (2 perimeters at 0.4 nozzle), no bridge beyond archetype-declared limits.
5. **Bulb envelope clearance**: the bulb exclusion zone from the mount module must be empty, with the thermal margin for the chosen filament.
6. **Build volume**: fits the H2D envelope; oversize designs get the multi-part message, not a silent fail.

Test harness: a golden-parameter matrix per archetype (min, default, max of every parameter) runs all six checks in CI. A generator change that produces an invalid mesh fails the build, not the user.

## 7. Build phases

Brain tracking: umbrella t_01KYW1E186T68WYNJZ1TP7CNR5. Phase A t_01KYW1E8WGX0KQGQ4FHEQWGFSY, A2 (fit prints, Jesper) t_01KYW1ED1Y99FB1CW3ARNJCFPP, B1 t_01KYW1EH7CDA917CWRB7GD9EQ2, B2 t_01KYW1ENB2WQRMXV9FE90YGRDY, C t_01KYW1ESZNX26M5ZGCQDKQWB3M, D t_01KYW1EY7BRRGPW43XR1X95CVX, E t_01KYW1F1SS9MKJN9QRDY6EEGRT, decisions (Jesper) t_01KYW1F5HH13YWYEJY5Z0A8AZN.

**Phase A: truth and the fixture seed.**
Make the geometry honest and plant the fixture at the root.
- Shape parameters actually drive the profile (scale and rebuild from sliders).
- Preview/export parity: one pipeline, hash test in CI.
- FixtureSpec + mount module geometry for E27 pendant crown + E27 table stem.
- New Fixture step in the journey; context pre-selects mode.
- Physical fit test prints on the H2D (Jesper, filmed).
Done when: an exported cone with a chosen fixture screws onto real hardware and holds a bulb.

**Phase B: archetype generators replace the texture fake.**
- Archetype engine: generator interface, clamped parameter schema, mount-interface input.
- Port cone, dome, cylinder to generators; add the researched archetypes.
- Patterns become archetype-native geometry operations with connectivity guarantees.
- Kill the alpha-map path entirely.
Done when: every preview equals its export, and no parameter combination in the UI can produce a disconnected mesh.

**Phase C: intelligence.**
- Material/bulb/effect matrix as data, driving Check step recommendations.
- 3MF export with embedded Bambu Studio settings (vase mode, walls, filament).
- Assembly and hardware guide per fixture, with a buy-this list.
- Dual-material zones for the H2D (opaque structure + translucent diffuser), graceful single-material fallback.
Done when: a novice can go from export to a lit, safe lamp with no outside research.

**Phase D: verification matrix.**
- Golden-parameter CI suite across all archetypes.
- Physical print matrix on the H2D: every archetype at default and both extremes. Failures feed back into parameter clamps.
- Filament calibration swatch: one plate, each lamp filament at 1-4 walls, measured with a lux meter. One evening, and it upgrades the effect matrix from community consensus to our own measured data. Filmable.
- This phase is video gold: the failure prints tell the story of why the tool is smart.
Done when: the printed matrix exists in the workshop and every failure mode found is now unreachable in the UI.

**Phase E: launch alignment.**
- MakerWorld presence: port launch archetypes to OpenSCAD and publish as native Parametric Model Maker presets with real print photos and profiles (no API and no external links exist, so this IS the MakerWorld channel; contest tag pending from Bambu).
- In-app contest path: clear "upload your export to MakerWorld" instructions in the Export step.
- Reveal/share moment polish, OG images.
- Analytics on the new journey.
- Soft launch to the newsletter segment before the video.
Done when: the tool survives strangers before the video sends a wave at it, and the preset models are live on MakerWorld.

## 8. Video alignment: A Study Into Light

The rebuild is not a detour from the video, it is Act 2. The script's honest hook ("I made one lamp, everyone wanted twelve") extends naturally: the first version of the tool made lamp-shaped objects. The rebuild is where it learns what a lamp is: the fixture, the physics, the filament. Filmable beats by phase:

- Phase A: the first printed mount clicking onto a store-bought cord set.
- Phase B: side-by-side of the old floating-rings render and the new self-supporting version printing.
- Phase C: two-material print coming off the H2D in one job.
- Phase D: the failure wall, the prints that taught the tool its limits.

## 9. Legal and IP guardrails

Full legal research with case citations: RESEARCH-ARCHETYPES-IP.md section 4. The operating rules:

1. **Generic geometric families only.** Spiral, ribbed, voronoi, honeycomb, gyroid, low-poly, straight pleats, kumiko, lithophanes, organic mushrooms. After the December 2025 CJEU rulings, infringement turns on whether original creative elements of a protected work appear in ours; math, craft traditions and print aesthetics are not protectable. All 7 launch archetypes are clean.
2. **Parameter-space blacklist**, enforced as range clamps, not honor system: multi-tier curved reflector discs (PH 5, protected to 2037), layered leaf globes (Artichoke), glossy hemisphere on trumpet stem (Panthella, to 2068), sine-wave-folded pleat shells (Le Klint Sinus, decades left), Akari-proportioned cocoons (to 2058, plus live name trademark), tension-cable cantilever arms (Tolomeo, actively enforced), three-spring clusters (Anglepoise).
3. **No designer or brand names** in product UI, listings or marketing. "PH-style" is trademark use in trade. Design history stays in the video as commentary, where it is legitimate.
4. **File-level liability is real now.** EU Regulation 2024/2822, fully in force July 1, 2026, makes distributing files recording a protected design an infringing use. Denmark enforces hardest in Europe (criminal convictions for replica lamp sales, PH lamps named in the judgments; the private-copy exception does not cover prints that read as originals). So: no protected templates at all, a takedown route on the site, ToS putting lithophane photo responsibility on the user.

The MakerWorld distribution consequence, from the same research: MakerWorld has no upload API and bans external links in model listings. Our strategy is two channels: the full guided designer on jespermakes.com, plus curated presets published natively as MakerWorld Parametric Model Maker models (OpenSCAD), where the contest lives. Cadence beats one big drop under the 2026 points system.

## 10. Open decisions for Jesper

1. Archetype launch shortlist: sign off the 7 proposed in section 4, or swap.
2. Maker's Supply BOM commissions: enrolling our MakerWorld models in Kit 001 BOM listings pays 3-15 percent cash. Money decision, needs your call; my recommendation is yes, it is aligned income and Bambu-friendly.
3. Bulb-and-cord hardware links in the app's guide: affiliate or plain links (money question).
4. Naming: "Lamp Designer" vs something warmer (vision doc has directions; can wait, URL stays).
5. Contest tag and mechanic: still pending from Bambu, chase with Joyce alongside the concept submission task.
6. Hardware shopping list for fit tests: an E27 cord set (or the IKEA ones you have), an E14 holder, an M10 stem holder, and one Bambu LED Lamp Kit 001 order. Small money, your approval.
