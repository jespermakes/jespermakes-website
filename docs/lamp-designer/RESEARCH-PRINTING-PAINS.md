# Research: What Actually Goes Wrong When People Print Lamps

Compiled 2026-07-31 late, for the cycle-2 redesign (Jesper's directive: find the biggest real problems, redesign around them). Sources: Bambu and Prusa forums, MakerWorld and Printables model comments, vendor guides, buyer reviews. Reddit blocks automated fetching; the same problems recur across every other venue, which is itself the frequency signal.

## The top five, ranked by frequency x severity

### 1. The light is the final quality inspector
Shades look fine printed; lit from inside, every flaw glows: banding, z-seam scars, wall thickness variation from speed changes, micro gaps. Long forum threads end unresolved ("no golden bullet, inherent to FDM"). Causes: variable outer-wall speed, coarse layers, seam placement, smooth geometry exposing everything.
Generator answer: texture by default (ribs, twists, facets hide what smooth exposes; our presets already lean this way), seam guidance into pattern valleys, tuned print recipes (constant outer-wall speed, scarf seam, fine layers), and "check it lit before you gift it" guidance.
Evidence: Bambu forum 195851 (layer lines in shade, unresolved), 99742 (thickness buildup visible lit), Prusa moon-lithophane banding thread.

### 2. The vase mode trap
The community meta for shades is spiral vase (seam-free, fast, the glow sweet spot), but vase mode cannot print sockets, holes, or islands; bottoms gap; the base-to-wall transition snaps; scaling an STL does not scale a vase wall. Printing the same model in normal mode costs 4-5x time and filament, adds the seam, and blocks light. Top models solve it with a separate normal-mode socket collar, and a whole ecosystem of adapter rings exists because most models do not.
Generator answer: THE structural win. Two-piece by construction: a vase-safe shade body (single continuous contour, overhang-clamped, reinforced neck) plus a separate small mount collar (normal mode, 30-60 min) carrying the aperture, threads and embossed warnings. Regenerate at the requested size instead of scaling.
Evidence: Bambu forum 12412 (vase bottom gaps), 142679 (socket cannot vase-print; normal mode 4-5x), MakerWorld Lamp Shade 2.0 (designer admits unfixable vase overhang).

### 3. Heat and aging
Documented test: incandescent bulb melted a PLA shade in about 2 hours. PLA sags in sunny windows; one bedside shade shattered after 8 months (UV brittleness). The maker uses an LED; the gift recipient screws in whatever bulb they own.
Generator answer: largely BUILT already (bulb envelopes, wattage gates by measured clearance, LED-only rule, PETG forcing). Still missing: vent openings on enclosed forms, embossed LED-ONLY text in the mesh, UV/aging note in guidance.
Evidence: 3DWithUs LED vs incandescent test, Beets3D PLA safety alert, recurring Quora wattage questions.

### 4. Hardware does not fit
Printed E27 rings that need 1 percent XY scaling, E26/E27/E14 confusion, EU ring system vs US harp/spider, cables 30 mm short, bulbs that do not fit inside shades. The flood of adapter/reducer models proves the frequency.
Generator answer: BUILT: the verified fixture library with print tolerances and the 15-minute fit coupon is exactly this. Remaining: bulb-size input against the cavity (partially via envelopes), region picker (US set post-launch).
Evidence: MakerWorld Ring E27 40mm comments, Desk Lamp cable complaints, the reducer-ring ecosystem itself.

### 5. The translucency expectation gap
"Clear" prints frosted; moisture hazes translucent filament even from sealed bags; nearly all white filament glows warm; silk cracks; too many walls kill the glow, one wall shows the bulb. Optimum from study and practice: milky white, ~0.8 mm for max glow, 1.2-1.6 mm sturdy-and-glowing.
Generator answer: partly BUILT (material plan, wall-glow advice, frosted-not-clear language). Add: lit-appearance preview per filament class, a diffusion dial that writes wall count into the recipe, and the one line that saves the most prints: dry the filament first.
Evidence: Bambu forum 33191 (clear PETG frustration), Bambu wiki translucent guide, "why is there no real white" thread, BioResources PLA lampshade optics study.

## The tail (smaller but real)
- Print time shock (lithophane moons 50-109 hours; normal vs vase 4-5x): show honest per-part estimates before export.
- Tall prints failing late: brim non-negotiable on tall vases; warn on extreme height/base ratios.
- Build plate limits: printer-model input, segment or constrain (we are H2D-first for launch).
- Fragility: vase base-transition snaps; light lamps tip: reinforced neck, ballast pocket in printed feet.
- STL corruption folklore ("print the 3MF, never auto-repair"): our welded watertight 3MF sidesteps the class.
- Lithophane defaults ruin the image (needs 100 percent walls, 0.12 layers): our moon recipe pins them.
- Wiring fear: design around off-the-shelf CE cord kits, never DIY mains guidance. Built.

## The meta-finding
Almost every top problem is preventable at design time, not print time. The market's answer today is thousands of static STLs plus forum folklore. A generator that takes fixture, bulb and filament as inputs and emits vase-safe geometry, a tuned recipe, and three lines of honest guidance solves the top five structurally. That is the cycle-2 thesis.

Full source list in the research agent output archived via Brain; primary links include the Bambu forum threads 195851, 99742, 12412, 142679, 33191, 172713, Prusa lithophane and vase threads, MakerWorld models 1009776, 183248, 1993704, 2067852, 3DWithUs, Beets3D, Bambu wiki, BioResources study, Printables 741175 and 150501, Thingtesting Gantri reviews.
