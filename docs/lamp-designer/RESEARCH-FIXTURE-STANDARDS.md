# Research: Light Fixture Mounting Standards

Compiled 2026-07-31 for the Lamp Designer v2 rebuild (see LAMP-DESIGNER-V2-ROADMAP.md).
Target: FDM (Bambu H2D), PLA/PETG, EU/DK primary, US secondary. Every lamp starts from the socket mount and builds outward. Numbers are manufacturer/retailer specs or community-measured print models; where sources conflict, the range and the most common value are given. Rules marked DERIVED are calculated from sourced temperature data, not found verbatim in a source.

---

## 1. Socket standards and their shade mounting interfaces

### 1.1 E27 (EU standard, primary target)

Construction: EN 60238 lampholder, two-piece body (cap + skirt). The skirt is externally threaded and shade rings screw onto it. The shade is a flat annulus clamped between the holder's shoulder and one ring, or between two rings.

| Parameter | Value | Notes |
|---|---|---|
| Skirt thread nominal OD | 40 mm | Universal nominal across EU makers |
| Skirt thread pitch | 2.5 mm most common; range 2.1-3.0 mm | Community caliper measurements on real holders: 40.2 mm OD x 2.4 mm pitch and 39.0 mm OD x 2.1 mm pitch (two families exist) |
| Shade aperture (hole in shade) | 40 mm nominal; print 40.5-41.0 mm | Published print models use 40-42 mm; 42 mm is the loose-fit choice |
| Shade ring OD | 48-60 mm; common wide ring 57 mm | |
| Holder body height | 57 mm typical | |
| Flange/shoulder diameter | 45 mm | Partly-threaded holders with flange |
| Top entry thread | M10x1 female | The EU standard stem interface |
| Rating | 250 V, 4 A, EN 60238 | |

Design consequence: two socket generations exist in the wild (about 40.2x2.4 and 39.0x2.1). A printed female thread sized 40.2 x 2.5 with 0.4-0.6 mm diametral clearance catches the common family; the robust alternative is a plain 41 mm aperture clamped by the rings that ship with every holder (no printed thread at all). Threaded version = parametric option; clamped annulus = default.

### 1.2 E14

| Parameter | Value |
|---|---|
| Skirt thread | 28 mm OD x 2 mm pitch (sold as M28 rings) |
| Shade aperture | 28.5-29 mm (nominal 28); EU convention shared with B22 |
| Shade ring OD | 43-44 mm |
| Holder body | 28 mm OD x 56-57 mm length typical |
| Top entry | M10x1 |

Print rule: female thread 28.5 x 2.0 with 0.4 mm diametral clearance, or plain 29 mm aperture clamped by stock rings (default).

### 1.3 E26 and E12 (US)

Three coexisting systems; support as interchangeable mount modules.

Harp and finial (spider fitter), the classic US table lamp:
- Finial/harp stud thread: 1/4-27 UNS (6.35 mm OD, 0.941 mm pitch), near-universal.
- Spider washer center hole: 7/16 in (11.1 mm); print 11.2-11.4 mm.
- Harp sizes: 4 to 15 in tall in 1/2 in steps.
- Printed part: 3-4 leg spider meeting a washer boss; finial clamps it; optionally print 1/4-27 female finial (+0.3-0.4 mm diametral).

UNO fitter:
- UNO thread: 1-1/4 in x 18 TPI (31.75 mm OD, 1.411 mm pitch), ring integrated in shade.
- Slip UNO ID: 1-7/16 in (36.5 mm) most common; variants 34.9 and 41.3 mm; held by the bulb screwing in.

E26 threaded-socket cord kits: aperture 40-43 mm (1.65 in), clamped by two rings, mechanically identical to the EU system.

E12 (candelabra): no standardized shade interface; small shades clip onto the bulb, or use reducer washers in spider shades. Generator: clip-on-bulb module or skip.

### 1.4 GU10

No standardized shade mounting interface. GU10 is a twist-lock bi-pin, lamp face Ø50 mm; shades attach to the fixture, not the lamp. Generator approach: print a pocket carrier for a purchased Ø35-40 mm GU10 holder secured with its bracket or M10 nut, flagged "verify against your specific holder" (holder bodies are not dimensionally standardized).

### 1.5 B22 (bayonet, UK/IE, some DK legacy)

Same clamped-annulus system; shade aperture 28-29 mm, identical to E14, so the E14 module covers B22. Low priority for DK/EU.

---

## 2. Pendant cord sets people actually buy

### 2.1 IKEA (the number one real-world target)

| Cord set | Socket | Key specs | Shade interface |
|---|---|---|---|
| SUNNEBY | E27 (EU) / E26 (NA) | 1.8 m textile cord, max load 1.8 kg, max 22 W | Threaded socket body + large screw-on ring |
| HEMMA | E27 (EU) / E26 (NA) | 1.8 m, max load 1.8 kg, LED recommended | Same; community-measured thread approx M40x2.5 |
| SKAFTET | E26/E27 (E14 table variants) | pendant + table/floor bases | Same ring system |
| STRALA, HAVSDJUP, JALLBY | E27/E26 | seasonal/variant cord sets | Same socket family |

Community-verified interface for the whole IKEA family: do not print the thread. Print a plain Ø45.0 mm aperture that slips over the socket body and rests on (or clamps under) the stock threaded ring. MakerWorld's multi-model IKEA lampshade series ships "default socket hole Ø45 mm (fits HEMMA, SUNNEBY, HAVSDJUP, SKAFTET, JALLBY)". If printing the mating thread: M40x2.5 female with generous clearance. Inherit SUNNEBY's max 22 W as a hard cap in the UI.

### 2.2 Generic EU E27 cord sets

Creative Cables and similar use standard EN 60238 holders: the E27 clamped-annulus module (41 mm hole) covers all of them.

### 2.3 US E26 cord kits

BRIGHTTIA, VEVOR and similar plug-in kits ship a shade-ready threaded E26 socket with rings; shades with approx 1.65 in (40-43 mm) top opening mount with the included ring. One 41-42 mm printed aperture serves both markets.

---

## 3. Table/floor lamp stem hardware

EU: M10x1 lamp nipple (hollow all-thread, OD 10.0 mm, pitch 1.0, bore ~7 mm for cable). Reliable printed pattern: flange with 10.3-10.4 mm clearance hole clamped between two M10x1 lamp nuts. Printing M10x1 female threads at 1 mm pitch is at the edge of 0.4-nozzle printability; prefer clamping.

US: 1/8 IP lamp pipe, always 1/8-27 (0.94 mm pitch); sold OD ~9.5 mm, true NPS 10.3 mm, both exist: design clearance hole 10.5 mm. Same clamped-flange pattern; harp saddle slips over the nipple below the socket.

---

## 4. LED bulb envelope dimensions (clearance design)

| Bulb | Diameter | Overall length | Use in generator |
|---|---|---|---|
| A60 / A19 | 60.0-60.3 mm | 100-112 mm | 60 x 110 (112 worst case for closed tops) |
| G95 globe | 95 mm | 135-143 mm | 95 x 140 |
| G125 globe | 125 mm | 168-178 mm | 125 x 173 |
| ST64 Edison | 64 mm | 140-145 mm | 64 x 143 |
| C35 candle | 35 mm | 96-120 mm | 35 x 100 |
| GU10 (PAR16) | 50 mm | 52-58 mm (long-barrel to 75) | 50 x 55 |

Rule: model the bulb as a cylinder of (max diameter + 2x heat clearance) and never let shade geometry intrude.

---

## 5. Heat: measured data and material limits

### 5.1 Measured temperatures (sourced)

| Source of heat | Measured temperature | Condition |
|---|---|---|
| LED bulb heatsink/base (SMD) | 60-100 C | Steady state; hottest zone of any LED bulb |
| 9 W compact SMD LED, worst tested | 86 C at heatsink | Minimal sink area, no airflow |
| 60 W-equiv LED heatsink, typical | 60-80 C | 9-10 W draw, 5-6 W as heat |
| LED filament junction | 88-102 C at 3.5 W | Glass envelope runs cooler than junction |
| Incandescent glass | 150-250 C | Out of scope, stated for contrast |
| PLA shade near incandescent | passed 45 C fast, deformed onto bulb in ~2 h | 3DWithUs test |
| Same shade with LED | stayed under 45 C over 2-3 h | 3DWithUs test |

### 5.2 Material limits

PLA: glass transition 55-60 C, HDT 45-60 C, keep plastic under ~45-50 C. PETG: Tg 65-80 C, HDT 65-75 C, keep under ~65 C.

### 5.3 Standards context

EN/IEC 60598-1 (luminaires) works by temperature-rise testing per part, not fixed clearances; the transferable principle: no plastic part may reach its softening range in steady state. IKEA caps its cord sets at 22 W. Near-universal community rule on model sites: LED only.

### 5.4 Generator rules (DERIVED)

Hard rules: LED only; embossed "LED ONLY, MAX xx W" near the socket aperture; never enclose the socket/heatsink region tightly (5 mm+ radial air around the bulb base, top venting on pendants for chimney flow).

Clearance, bulb envelope to shade wall (radial), still air, closed-ish shades; relax for open/vented geometry:

| LED power | PLA | PETG |
|---|---|---|
| up to 4 W | 15 mm | 10 mm |
| 5-7 W | 25 mm | 15 mm |
| 8-10 W (60 W equiv) | 35 mm, vented top required | 20 mm |
| 11-13 W | not recommended in PLA; if used, 50 mm + open top and bottom | 30 mm, vented |
| above 15 W | out of scope for printed shades | PETG only, open geometry, 40 mm+ |

Default the generator to PETG for anything above 7 W or any closed-top design.

---

## 6. FDM fit tolerances (printed part to commercial hardware)

| Case | Clearance | Notes |
|---|---|---|
| Printed female thread onto commercial male thread | +0.2 to +0.4 mm diametral | |
| Printed bolt into printed nut | 0.3-0.5 mm bolt major to nut minor | |
| Internal threads | oversize 0.2-0.4 mm | |
| External threads | undersize 0.1-0.2 mm | |
| E27 clamped aperture | print 40.5-41.0 mm | 41 mm fits both measured skirt families |
| E14/B22 clamped aperture | print 29.0 mm | |
| IKEA family slip-over | print 45.0 mm | Verified default in multi-cord-set MakerWorld models |
| US kit threaded socket aperture | print 41-43 mm | 1.65 in spec |
| M10x1 / 1/8 IP stem clearance hole | 10.3-10.5 mm | Clamp with metal lamp nuts |
| 1/4-27 finial female thread | +0.3-0.4 mm diametral | Or use a brass finial |
| Layer height for fine threads | 0.1-0.12 mm | 0.4 mm nozzle |
| Coarse threads (2-3 mm pitch, 40 mm dia) | print well even at 0.2 mm layers | Why E27/IKEA rings are the easiest printed threads in the system |

Practice: print a 10-15 minute test coupon (ring + aperture) per socket family before any long shade print; on a calibrated H2D start at the tight end (0.2-0.3 mm). Threads self-center; put the seam on the non-thread side or use scarf seams. For load-bearing pendant mounts, the clamped annulus (no printed thread) carries weight on a continuous solid ring and is the strength-safe default.

---

## 7. Recommended parametric mount modules (synthesis)

1. **EU-E27-CLAMP** (default, EU): plain annulus, hole 41.0 mm, land width 8 mm min, 2.4 mm+ thick; clamps between stock rings. Covers every EN 60238 E27 holder and generic cord sets.
2. **EU-E27-THREAD**: printed female M40x2.5, major 40.6-40.8 mm printed, 8-10 mm engagement; parametric pitch override (2.4/3.0).
3. **EU-E14-CLAMP**: hole 29.0 mm; doubles as B22 module.
4. **IKEA-SLIP**: hole 45.0 mm slip-over, rests on stock ring; covers SUNNEBY/HEMMA/SKAFTET/STRALA/HAVSDJUP/JALLBY, EU and US versions.
5. **US-E26-CLAMP**: hole 41-43 mm.
6. **US-SPIDER**: 3-leg spider to 11.3 mm washer hole for harp + finial; optional printed 1/4-27 finial.
7. **US-UNO**: printed 1-1/4-18 female ring; SLIP-UNO variant at 36.7 mm ID.
8. **STEM-M10 / STEM-18IP**: flange with 10.4 / 10.5 mm hole, clamped by metal nuts.
9. **GU10-CARRIER**: pocket for purchased GU10 holder, flagged "verify part".

Every module carries: bulb-envelope keep-out (section 4) + heat clearance (section 5), a material gate (PLA blocked above 10 W or closed tops), embossed "LED ONLY MAX xx W" text, and a printable 15-minute fit-test coupon export.

Full source link list: see the research agent output archived in Brain; primary sources include lampholders.eu spec pages, IKEA product pages, MakerWorld/Printables measured models (Threaded Socket Ring E27+E14, IKEA lampshade series), Grand Brass and Paxton hardware references, 3DWithUs shade safety test, MDPI filament LED thermal study, and Bambu TDS sheets.
