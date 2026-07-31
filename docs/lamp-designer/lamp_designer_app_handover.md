# 3D Lamp Designer App — Handover Document

**Working name:** Lamp generator
**Owner:** Jesper Makes
**Status:** Pre-build, specification stage
**Last updated:** May 2026

---

## Purpose

The 3D Lamp Designer is a free, browser-based parametric design tool that lets anyone design their own 3D printable lamp and export a print-ready file. It will live on jespermakes.com.

It exists because the cone lamp 3D print files have sold steadily but represent a fixed design: one shape, one size. The audience consistently asks for variations, taller, smaller, hexagonal, wall-mounted, different patterns. Rather than continuing to design individual lamps by hand, the goal is to build a tool that lets the audience design their own, inside constraints that guarantee the result actually works as a lamp.

## Strategic context

- The app is the centerpiece of a sponsored video collaboration with Bambu Lab, paired with a MakerWorld design contest.
- It must be live, or near-live, before the video publishes. Current target publish window is late summer 2026, so the app needs to be functional and tested well before then. This is a hard external deadline, not a soft goal.
- The app is free permanently. There is no paid tier and no plan to introduce one. An earlier assumption from Bambu's side (that it might be a paid app offered free during the contest) was incorrect and has been corrected in writing.
- It is not being framed to Bambu as a traffic driver for the rest of the site. It is built specifically for the video and the contest. Internally, traffic and shop benefit are welcome, they are just not part of the external pitch.

## Existing foundation

The app should build on two tools already running on jespermakes.com:

1. **Cone lamp resizer** (jespermakes.com/cone-lamp): lets users scale and tweak the original cone lamp design.
2. **2D studio** (jespermakes.com/studio): a pattern editor.

Whoever picks up the build should review both first. The new generator extends their approach into full parametric lamp design. The existing infrastructure is considered proven, so this is an extension project, not a from-scratch build.

## Core functional requirements

The app must let a user:

- Select a base shape: cone, dome, cylinder, organic. The set should be extensible.
- Set dimensions: height, diameter, and any shape-specific parameters.
- Choose a surface pattern: smooth, perforated, geometric, organic.
- Adjust wall thickness.
- See a real-time 3D preview that updates as parameters change.
- Export a print-ready file.

Hard constraints on the user experience:

- No login required.
- No paywall.
- The output is just the file. Users print it on whatever printer they own.

The defining feature: the geometry rules below are baked into the tool. A user should not be able to produce a design that fails as a lamp. The constraints quietly guide every design toward something that works.

## Design rules to encode

This is the core of what makes the tool more than a shape generator. The rules come from studying the two designers who effectively defined modern lamp design: Poul Henningsen (Danish, the three-shade system, from 1925) and Isamu Noguchi (Akari light sculptures, from 1951). Both spent decades solving the same problem: recovering soft, glare-free, warm light after electric bulbs made interior lighting harsh.

Distilled into constraints the app should enforce or guide toward:

1. **Bulb concealment.** The shade must hide the bulb from typical viewing angles. Henningsen's entire system was built so the bulb is never directly visible. The tool should ensure shade geometry blocks direct line of sight to the bulb from normal eye levels.

2. **Even light distribution.** Henningsen used a logarithmic spiral as the basis for his shade curves to spread light evenly across the whole surface. Shade curves the tool generates should follow principles that avoid bright hotspots and dark dead zones.

3. **Directed output.** The opening, usually downward, should send light where it is wanted: onto a table, the floor, a wall. The tool should make the user aware of where their lamp will actually throw light.

4. **Translucent and opaque balance.** A working lamp shade is at least two parts: a translucent part that diffuses light, and an opaque part that provides structure and hides wiring. The tool should treat these as distinct zones in the model.

5. **Proportion.** Henningsen numbered his lamps by shade ratio (PH 3/2, PH 4/3, PH 5). Proportion is functional, not decorative. The tool should keep shape proportions within ranges that produce good light rather than allowing arbitrary stretching.

The principle: the user gets creative freedom over shape, pattern, and size, but the tool holds the lamp physics constant so every export is printable and functional.

## Materials and print guidance

The app should default to, recommend, or output settings aligned with the following. These were validated through test prints during script research.

- **Material:** translucent PETG is preferred over PLA. PETG is an amorphous polymer and scatters light more cleanly. PLA is semi-crystalline and reads milkier. PETG also tolerates bulb heat better, since PLA can crack near hot bulbs.
- **Print mode:** vase mode, single wall.
- **Nozzle:** 0.6 to 0.8 mm. A larger nozzle means fewer line intersections, which improves light transmission.
- **Bulb pairing:** PETG plus modern LED bulbs is the recommended combination. LEDs run cool, which widens material options.
- **Filament prep:** dry filament is critical for clarity. Moisture causes bubbles and haze.

Hardware note: the Bambu H2D's dual nozzle is what makes a single-piece lamp possible. It can print the translucent shade and the opaque structural base in one job, instead of printing them separately and gluing. The tool's output should be structured to take advantage of this, with multi-material zones in a single model, while still degrading gracefully for single-nozzle printers.

## Export requirements

- Output a print-ready file. Format to be confirmed. STL is universal. 3MF carries multi-material and settings data, which suits the H2D dual-material workflow. Recommendation: support 3MF as primary with STL as fallback.
- The export should ideally carry or suggest the recommended print settings (vase mode, wall count, nozzle size) so users do not have to reconstruct them.
- Consider bundling a short printable settings guide with each export.

## Contest integration requirements

The app needs to support the MakerWorld contest that runs alongside the video:

- Users design in the app, then upload their design to MakerWorld with a designated contest tag.
- Winning designs get printed on the H2D, photographed, and featured on the channel and on MakerWorld.
- The app itself does not need to host submissions or run the contest. MakerWorld is the submission venue. But the app should make it easy for a user to get from "finished design" to "uploaded to MakerWorld," for example clear instructions or a direct link in the export step.
- The contest tag and exact mechanic are still being finalized with Bambu.

## Suggested build sequencing

This is a light suggestion, not a prescription.

- **Phase 1, MVP for the video:** one or two base shapes, core parameters (height, diameter, wall thickness), one or two pattern types, real-time preview, working export. Enough to demo on camera and for the audience to actually use.
- **Phase 2:** expand the shape and pattern libraries, refine the geometry-constraint system, polish the preview.

The MVP must clear the video deadline. Everything else can follow after publish.

## Open questions and pending decisions

- **Technical stack:** review what the cone lamp resizer and 2D studio use, then decide whether to extend that or adopt something new for the parametric engine and 3D preview.
- **Export format:** confirm 3MF, STL, or both.
- **Contest tag and mechanic:** pending final confirmation from Bambu.
- **Light feedback:** how explicitly the app surfaces "where does the light land" to users, full visualization versus simple guidance.
- **Filament naming:** whether the app recommends specific named Bambu filaments or stays brand-neutral.
- **Pattern system scope:** how much freedom to give in the perforation and pattern editor, and how much of it reuses the existing 2D studio.

## Hard constraints summary

- Free, no login, no paywall, permanently.
- Must be live and tested before the video publish window, late summer 2026 target.
- Builds on existing jespermakes.com tools.
- Geometry rules enforced so every export is a functional lamp.
- Output structured for H2D dual-material printing, graceful on single-nozzle printers.

## Sources and further reading

The lamp design principles above are distilled from background research. For anyone who wants to go deeper before building the constraint system:

- Poul Henningsen and the three-shade system: Louis Poulsen's history pages, and general design history on the PH lamp range.
- Isamu Noguchi and the Akari light sculptures: the Noguchi Museum's history of Akari.
- 3D printing for translucency: the Bambu Lab wiki guide on printing transparent PLA and PETG, plus general maker-community guidance on vase-mode lampshade printing.
