# PHASE-5-DESIGN-STUDIO.md

> Development brief for Phase 5 of the Jesper Makes 2D Design Studio.
> Phases 1-4 built a complete drawing tool with cloud save and export
> profiles. Phase 5 adds the manufacturing layer: the Design/Plan/Review
> mode separation, cut type assignment, kerf compensation, dogbone fillets,
> tab generation, material setup, tool library, and part nesting.
>
> This is the phase that turns the studio from "a free vector editor" into
> "the free alternative to Shaper Studio that understands how CNC and
> laser cutting actually work." Everything before this was building toward
> this moment.

---

## Read first

1. The existing studio code in the repo (Phases 1-4 merged).
2. The two research PDFs in the project knowledge:
   - `Designing_Free_CNC_Software.pdf` (dogbone/kerf/nesting algorithms)
   - `Shaper_Studio_What_It_Is...pdf` (Plan/Review mode, cut type encoding)
3. This file, in full, before starting.

---

## Branch

```bash
cd /home/jesper/claude-code-workspace/studio
git checkout main
git pull origin main
git checkout -b feature/studio-phase-5
```

---

## The big idea: three modes

Shaper Studio's best UX insight is separating the workflow into three
modes. We're adopting this directly, with improvements.

### DESIGN mode (what exists today)

Pure drawing. All the tools from Phases 1-4. The user creates and edits
shapes without thinking about manufacturing. No cut types visible, no
kerf preview, no dogbones. Just geometry.

This is the current studio. Phase 5 doesn't change Design mode at all,
it just labels it and adds the other two.

### PLAN mode (new in Phase 5)

The user assigns manufacturing intent to each shape:

- **Cut type:** inside, outside, on-line, pocket, guide
- **Cut depth** (for CNC routers with Z-axis)
- **Dogbone fillets** on selected inside corners
- **Tabs/bridges** on selected cut paths

In Plan mode, the drawing tools are disabled. The user can select shapes
and assign properties, but can't create new shapes or move existing ones.
This separation prevents accidents: you don't accidentally drag a shape
while trying to assign a cut type.

Shapes are color-coded by cut type (matching the Shaper Origin convention
from the Phase 4 export profiles):

- Inside cut: **blue** (#0000FF)
- Outside cut: **red** (#FF0000) (note: this is Shaper's "exterior")
- On-line cut: **black** (#000000)
- Pocket: **green** (#00AA00)
- Guide (not cut): **gray** (#808080)
- Unassigned: the shape's original stroke color, with a subtle warning

### REVIEW mode (new in Phase 5)

A read-only simulation of what the physical result will look like. The
user can't edit anything. They see:

- The shapes as they will appear after cutting, at the actual finished
  dimensions (accounting for kerf and bit diameter)
- Dogbone fillets rendered as actual geometry
- Tab positions marked
- Material outline shown as a dashed rectangle
- A "pass/fail" check for common mistakes:
  - Shapes with no cut type assigned (warning)
  - Features smaller than the bit diameter (warning)
  - Open paths assigned a pocket cut type (error)
  - Overlapping cut paths (warning)

Review mode is the "did I mess anything up?" check before exporting.
It prevents wasted material.

---

## What Phase 5 adds (11 groups)

1. **Mode tabs** (30 min)
2. **Material and workpiece setup** (30 min)
3. **Tool library** (45 min)
4. **Cut type assignment** (60 min)
5. **Cut depth assignment** (30 min)
6. **Kerf compensation preview** (90 min)
7. **Dogbone fillet generation** (90 min)
8. **Tab/bridge generation** (60 min)
9. **Review mode** (60 min)
10. **Part nesting** (90 min)
11. **Manufacturing intent in save/export** (30 min)

Total: roughly 10-12 hours of Claude Code work. This is the biggest
phase yet. Build each group, commit after each, push when done.

---

## 1. Mode tabs

Add three mode tabs at the top-right of the studio, mirroring Shaper
Studio's layout:

```
[DESIGN]  [PLAN]  [REVIEW]
```

- Rendered in the top bar (next to the design name and save status)
- The active tab is visually distinct (amber underline or filled background)
- Clicking a tab switches modes
- Keyboard shortcuts: 1 = Design, 2 = Plan, 3 = Review

### Mode state

Add to the document state:

```typescript
type StudioMode = "design" | "plan" | "review";

interface StudioDocument {
  // ...existing fields...
  mode: StudioMode;  // default "design"
}
```

Mode is NOT part of undo history. Switching modes doesn't create an
undo step.

### What changes per mode

**Design mode:**
- All drawing tools active
- Shapes rendered with their design colors (stroke/fill as set by user)
- Properties panel shows shape geometry
- Everything works exactly as it does today

**Plan mode:**
- Drawing tools disabled (toolbar shows them grayed out)
- Select tool works (click to select shapes)
- Move/resize/rotate disabled (selection handles don't appear)
- Shapes rendered with cut-type color coding
- Properties panel shows manufacturing properties instead of geometry
- A "Plan panel" replaces or supplements the properties panel

**Review mode:**
- Everything disabled (read-only)
- Canvas shows the simulated physical result
- A review panel shows warnings/errors
- Pan and zoom still work

---

## 2. Material and workpiece setup

Before assigning cut types, the user needs to define what they're
cutting from.

### Material settings (stored in the design file)

```typescript
interface MaterialSettings {
  width: number;          // mm
  height: number;         // mm
  thickness: number;      // mm
  name: string;           // e.g. "6mm Baltic Birch"
}
```

### UI: Material panel

In Plan mode, the properties panel gets a "Material" section at the top:

```
MATERIAL
──────────────────────
Name:      [6mm Baltic Birch    ]
Width:     [600    ] mm
Height:    [400    ] mm
Thickness: [6.0    ] mm
──────────────────────
```

### Canvas visualization

In Plan mode and Review mode, draw the material outline as a dashed
rectangle centered on the canvas. The material is the "workpiece" that
the shapes sit on. Shapes that extend beyond the material boundary get
a warning.

Style: dashed stroke (4px dash, 4px gap), `wood-light` at 40% opacity,
no fill. Label: "600 x 400 mm, 6mm thick" in small text below the
bottom edge.

### Default material

If no material is set: 600 x 400 mm, 6mm thick, "Plywood". These are
reasonable defaults for a hobbyist laser cutter or small CNC.

---

## 3. Tool library

The user defines the cutting tools they have. These determine kerf width,
bit diameter (for dogbones), and minimum feature size (for Review warnings).

### Tool definition

```typescript
interface CuttingTool {
  id: string;
  name: string;            // e.g. "1/4 inch upcut spiral"
  type: "router_bit" | "laser";
  diameter: number;        // mm (bit diameter for router, beam width for laser)
  kerf: number;            // mm (material removed; for router = diameter, for laser = 0.1-0.3mm typically)
}
```

### UI: Tool selector

In Plan mode, the properties panel gets a "Tool" section below Material:

```
TOOL
──────────────────────
[▼ 1/4" upcut spiral        ]
  Diameter: 6.35 mm
  Kerf: 6.35 mm

[+ Add tool]  [Edit]
──────────────────────
```

- Dropdown to select from saved tools
- "Add tool" opens a small inline form (name, type, diameter, kerf)
- "Edit" modifies the selected tool
- Tools are saved in `localStorage` (not in the design file, since they
  belong to the user's shop, not to a specific design)
- The active tool is also saved in the design file so the Review preview
  uses the right one

### Default tools

Pre-populate with three common tools:

1. "1/4 inch upcut spiral" (router, diameter 6.35mm, kerf 6.35mm)
2. "1/8 inch straight" (router, diameter 3.175mm, kerf 3.175mm)
3. "CO2 laser" (laser, diameter 0.1mm, kerf 0.2mm)

---

## 4. Cut type assignment

The core of Plan mode. Each closed shape gets a cut type that tells the
machine what to do with it.

### Cut types

```typescript
type CutType = "inside" | "outside" | "online" | "pocket" | "guide";
```

- **Inside:** the tool cuts on the inside of the path (the material
  outside the path remains). Used for holes, slots, mortises.
- **Outside:** the tool cuts on the outside of the path (the material
  inside the path remains). Used for cutting out parts.
- **On-line:** the tool centers on the path. Used for scoring, V-carving,
  or cuts where exact line position matters.
- **Pocket:** the tool removes all material inside the path. Used for
  recesses, inlays, decorative areas.
- **Guide:** the path is not cut at all. Used for alignment marks,
  construction lines, reference geometry.

### Data model

Add to Shape:

```typescript
interface Shape {
  // ...existing fields...

  // Manufacturing (Phase 5)
  cutType?: CutType;
  cutDepth?: number;         // mm, defaults to material thickness for through-cuts
  dogboneCorners?: number[]; // indices into points[] array where dogbones are applied
  tabs?: TabDefinition[];
}

interface TabDefinition {
  position: number;          // 0-1 parametric position along the path perimeter
  width: number;             // mm, default 5
  height: number;            // mm, default material thickness / 2
}
```

### UI: Cut type buttons

In Plan mode, when a shape is selected, the properties panel shows:

```
CUT TYPE
──────────────────────
[Inside] [Outside] [On-line]
[Pocket] [Guide]
──────────────────────
```

Five toggle buttons, exactly one active. The active button's color
matches the cut-type color coding (blue, red, black, green, gray).

Clicking a button assigns that cut type to all selected shapes.

### Bulk assignment

Select multiple shapes, click a cut type button: all selected shapes
get that type. This makes it fast to assign types to complex designs.

### Auto-detection (smart default)

When the user enters Plan mode for the first time (or adds shapes and
comes back to Plan mode), the studio can auto-detect likely cut types:

- Shapes that contain other shapes: the outer one is likely "outside",
  the inner ones are likely "inside" (holes)
- Shapes with fill and no other shapes inside: likely "pocket"
- Open paths: likely "guide" or "on-line"

Show auto-detected types as suggestions (dashed border on the color
indicator) that the user can confirm or override with one click. Don't
apply them silently.

### Visual feedback

In Plan mode, each shape renders in its cut-type color:

```tsx
function getCutTypeColor(cutType: CutType | undefined): string {
  switch (cutType) {
    case "inside": return "#0000FF";
    case "outside": return "#FF0000";
    case "online": return "#000000";
    case "pocket": return "#00AA00";
    case "guide": return "#808080";
    default: return "#C17F3C"; // amber = unassigned warning
  }
}
```

Unassigned shapes render in amber with a subtle pulsing animation
to draw attention.

---

## 5. Cut depth assignment

For CNC routers that support Z-axis depth control.

### UI

When a shape has a cut type assigned (not "guide"), show a depth field:

```
DEPTH
──────────────────────
[6.0    ] mm  [Through]
──────────────────────
```

- Number input in mm
- "Through" toggle: sets depth to material thickness (a through-cut)
- Default: material thickness (through-cut)
- For pockets, depth is typically less than material thickness

### Relevance

- For laser cutters: depth is irrelevant (lasers cut through or engrave,
  controlled by power/speed, not depth). Hide the depth field when the
  active tool is type "laser".
- For CNC routers: depth determines how deep the bit plunges.

---

## 6. Kerf compensation preview

This is the first genuinely hard geometry problem. Kerf compensation
offsets each cut path inward or outward by half the kerf width so the
finished part matches the intended dimensions.

### The logic

- **Outside cut:** offset the path OUTWARD by `kerf / 2`. The tool
  removes material from the outside, so the part is the right size.
- **Inside cut:** offset the path INWARD by `kerf / 2`. The tool
  removes material from the inside of the hole, making the hole the
  right size.
- **On-line cut:** no offset. The tool centers on the path.
- **Pocket:** offset INWARD by `kerf / 2` for the boundary, then
  generate a clearing pattern inside (not in Phase 5 scope, just the
  boundary offset).
- **Guide:** no offset (not cut).

### Visualization

In Plan mode, when kerf compensation is enabled:

- Show the original path as a thin dashed line (the "design intent")
- Show the compensated path as a solid line in the cut-type color
  (the "actual toolpath")
- The gap between the two lines represents the kerf

### Implementation

Path offsetting is computationally expensive and handles many edge cases
(self-intersections on tight curves, corner treatments, etc.).

**Use Paper.js's `path.offset()` method** (already installed from Phase 3
for booleans). Convert the shape to a Paper.js path, offset it, convert
back to studio PathPoints or pathData.

```typescript
function offsetPath(
  shape: Shape,
  offset: number  // positive = outward, negative = inward
): string {
  // 1. Convert shape to Paper.js Path
  // 2. Call path.offset(offset, { join: 'round' })
  // 3. Convert result back to SVG path d string
  // 4. Return the offset path data
}
```

**Important:** Paper.js's `offset()` may not exist in all versions.
If it doesn't, use the `clipper-lib` npm package (JavaScript port of
Angus Johnson's Clipper library, which is the industry standard for
polygon offsetting). Clipper handles offsetting with configurable
join types (round, miter, square) and is battle-tested in CAM software.

```bash
npm install clipper-lib
```

Clipper works on integer coordinates, so multiply by 1000 (for
sub-micron precision in mm) before passing coordinates in, and divide
on the way out.

### Kerf toggle

Add a toggle in the Plan mode panel:

```
KERF COMPENSATION
──────────────────────
[✓] Show kerf offset
    Kerf: 0.2 mm (from tool)
──────────────────────
```

The kerf value comes from the selected tool. The toggle shows/hides
the offset preview. It defaults to ON.

---

## 7. Dogbone fillet generation

Automatic corner relief for inside corners when using a CNC router bit.

### When to apply

Dogbones are relevant when:
- The cut type is "inside" or "pocket"
- The shape has sharp inside corners (< 120 degrees)
- The active tool is a "router_bit" (not laser)

### The geometry

At each qualifying inside corner:

1. Find the angle bisector of the two edges meeting at the corner
2. Place a circle of diameter = tool diameter, centered on the bisector,
   such that the circle's edge touches the corner point
3. The circle's geometry extends beyond the original path, creating
   a small overcut that allows a sharp mating piece to fit

Two styles:

- **Standard dogbone:** the circle center is on the angle bisector,
  extending diagonally from the corner. Visible from both faces of
  the joint.
- **T-bone:** the circle center is offset along one of the edges,
  so the overcut is hidden along that edge. Better aesthetics when
  one face is visible.

### UI

In Plan mode, when an inside-cut or pocket shape with corners is selected:

```
DOGBONES
──────────────────────
[Apply dogbones]
Style: [Standard ▼] / [T-bone]
Tool: 6.35mm (from tool)
Corners: [All] / [Select corners]
──────────────────────
```

- "Apply dogbones" generates dogbone fillets on all qualifying corners
- "Select corners" lets the user click individual corners to toggle
  dogbones on/off (for shapes where only some corners need relief)
- "Style" toggles between standard and T-bone
- The operation modifies the path geometry (adds circular overcuts),
  pushing a new state to undo history

### Implementation

Dogbone generation is geometric:

```typescript
function addDogbone(
  points: PathPoint[],
  cornerIndex: number,
  toolDiameter: number,
  style: "standard" | "tbone"
): PathPoint[] {
  const prev = points[prevIndex(cornerIndex, points.length)];
  const curr = points[cornerIndex];
  const next = points[nextIndex(cornerIndex, points.length)];

  // Calculate the angle bisector
  const v1 = normalize(subtract(prev, curr));
  const v2 = normalize(subtract(next, curr));
  const bisector = normalize(add(v1, v2));

  // For standard dogbone: place circle center along the bisector
  const radius = toolDiameter / 2;
  const dist = radius / Math.sin(angleBetween(v1, v2) / 2);
  const center = add(curr, scale(bisector, -dist));

  // Generate arc points for the circular overcut
  // Insert them into the path at cornerIndex
  // Return the modified points array
}
```

This is tricky to get right for arbitrary corner angles. Use Paper.js
or manual arc math. The key constraint: the resulting path must still
be a valid, non-self-intersecting closed path.

### Visual feedback

Dogbone fillets render as part of the shape's path. In Plan mode, they're
highlighted with a small amber indicator dot at each dogboned corner so
the user can see which corners have been processed.

---

## 8. Tab/bridge generation

Tabs hold parts in place during CNC routing so they don't fly loose when
the bit cuts through the last pass.

### When tabs apply

- Cut type is "outside" (cutting a part free from the material)
- Active tool is "router_bit" (lasers don't need tabs)

### Tab definition

A tab is a small uncut section along the path perimeter:

- **Position:** parametric (0.0 to 1.0 along the path length)
- **Width:** default 5mm
- **Height:** default half the material thickness

### UI

In Plan mode, when an outside-cut shape is selected:

```
TABS
──────────────────────
[Add tabs]  Count: [4]
Width: [5.0] mm
Height: [3.0] mm
[Auto-place] / [Manual place]
──────────────────────
```

- "Auto-place" distributes N tabs evenly around the perimeter
- "Manual place" lets the user click on the path to place individual tabs
- Each tab appears as a small amber rectangle straddling the path at
  its position
- Tabs can be dragged along the path to reposition
- Click a tab to select it, Delete to remove it

### Visualization

In Plan mode and Review mode:

- Tab positions shown as small filled rectangles in amber, sitting on
  the cut path
- In Review mode, tabs show as small bridges of material connecting
  the part to the surrounding stock

### Export

When exporting with a CNC router profile, tabs are encoded as gaps in
the cut path. The SVG path is split at each tab position, with the tab
section omitted. The job sheet JSON includes tab positions and dimensions.

---

## 9. Review mode

The simulation view that catches mistakes before cutting.

### Canvas rendering in Review mode

The canvas shows a simulated physical result:

- **Material:** rendered as a filled rectangle in a light wood color
  (`#E8D5B7` or similar), with a subtle wood grain texture pattern
  (optional: a CSS background pattern that looks like plywood)
- **Cut-through parts:** where outside cuts exist, the shape is "cut out"
  of the material (rendered as holes in the material rectangle, showing
  the canvas background behind it)
- **Inside cuts/pockets:** rendered as recessed areas (slightly darker
  than the material surface)
- **On-line cuts:** rendered as thin scored lines on the material surface
- **Guides:** rendered as faint dashed lines (not cut)
- **Tabs:** rendered as small bridges connecting cut-out parts to the
  material
- **Kerf:** the gap between the part and the surrounding material is
  visible (equal to the kerf width)

This is a **visual simulation**, not a precise CAM preview. It doesn't
need to handle overlapping paths or multi-pass depth strategies. It needs
to look right enough that the user can spot obvious mistakes.

### Implementation approach

The simplest way to build the review rendering:

1. Start with the material rectangle (filled, wood-colored)
2. For each outside-cut shape: boolean-subtract it from the material
   (using Paper.js, already available from Phase 3). This creates the
   "cut out" appearance.
3. For each inside-cut shape: render it as a darker filled area on top
   of the material
4. For each pocket: render as a recessed area (darker fill, depth-
   proportional darkness)
5. For on-line cuts: render as thin scored lines
6. Overlay tab indicators

### Review panel

Replace the properties panel in Review mode with a review checklist:

```
REVIEW
──────────────────────
✓ 12 shapes with cut types
⚠ 2 shapes unassigned
✓ Material: 600 × 400 mm
✓ Tool: 1/4" upcut, 6.35mm
✓ Kerf compensation applied

WARNINGS
──────────────────────
⚠ "Rectangle 3" has no cut type
⚠ "Circle 5" has no cut type
⚠ Slot width (4mm) is less than
  bit diameter (6.35mm) on
  "Rectangle 7"

──────────────────────
[Back to Plan]  [Export]
──────────────────────
```

### Warning checks

Run these checks automatically when entering Review mode:

1. **Unassigned shapes:** any shape without a cut type (excluding guides
   explicitly set as guides)
2. **Undersized features:** any inside-cut or pocket feature where the
   smallest dimension is less than the tool diameter (the bit can't
   physically fit inside)
3. **Open paths with non-guide type:** open paths can only be "on-line"
   or "guide". Flag if assigned "inside", "outside", or "pocket".
4. **Shapes outside material:** any shape that extends beyond the
   material rectangle
5. **Overlapping exterior cuts:** two outside-cut paths that overlap
   may cause the bit to re-cut already-freed material (dangerous)
6. **No tabs on outside cuts:** if using a router bit and any outside
   cut has zero tabs, warn about loose parts

### No editing in Review mode

All interaction is disabled except:
- Pan and zoom
- Clicking a warning to highlight the relevant shape on the canvas
- "Back to Plan" button to go fix the issue
- "Export" button to export with the current settings

---

## 10. Part nesting

Algorithmically arrange parts on the material to minimize waste.

### When to use

The user has multiple parts (outside-cut shapes) to cut from one sheet
of material. Nesting rearranges them for optimal material usage.

### UI

In Plan mode, add a "Nest parts" button:

```
NESTING
──────────────────────
[Nest parts]
Spacing: [2.0] mm (between parts)
Rotation: [None ▼] / [90°] / [Any]
──────────────────────
```

- "Nest parts" runs the nesting algorithm and repositions all
  outside-cut shapes within the material boundary
- "Spacing" sets the minimum gap between parts (accounts for kerf +
  safety margin)
- "Rotation" controls whether parts can be rotated during nesting:
  - None: parts stay at their current rotation
  - 90 degrees: parts can rotate in 90-degree increments
  - Any: parts can rotate freely (best packing, but grain direction
    is lost)

### Implementation

**Use SVGNest** (or its descendant Deepnest):

```bash
npm install svgnest
```

If `svgnest` isn't available as an npm package (it may be browser-only),
use the algorithm directly:

1. Convert each outside-cut shape to a polygon (approximate curves as
   line segments at sufficient resolution)
2. Define the bin (material dimensions)
3. Run the genetic algorithm packing solver
4. Apply the resulting positions and rotations back to the shapes

**Run the solver in a Web Worker** so the UI doesn't freeze. Nesting
is computationally expensive (genetic algorithm with many iterations).
Show a progress indicator: "Nesting... 23% (best: 73% material usage)"

### Results

After nesting:

- Parts are repositioned within the material boundary
- A "material usage" percentage is shown: "Material usage: 78%"
- The user can undo the nesting (it's one undo step that restores all
  original positions)
- Wasted material areas are subtly highlighted in the canvas (light
  red tint or hatching)

### Limitations (v1)

- Only outside-cut shapes are nested (inside cuts, pockets, guides
  move with their parent shapes)
- Part-in-part nesting (placing small parts inside the waste holes of
  large parts) is not supported in v1
- Only one material sheet at a time (no multi-sheet nesting)
- The genetic algorithm runs for a fixed time (5 seconds) and returns
  the best result found

---

## 11. Manufacturing intent in save/export

All manufacturing data persists.

### Save format update

Extend the design file format:

```typescript
interface StudioDesignFile {
  version: 2;  // bump from 1
  // ...existing fields...

  material?: MaterialSettings;
  activeTool?: CuttingTool;
  // Cut types, depths, dogbones, and tabs are stored per-shape
  // in the shapes array (already added to Shape interface above)
}
```

**Version migration:** when loading a v1 file, treat all shapes as
having no cut type assigned. The upgrade is seamless.

### Export profiles update

The Phase 4 export profiles now use the manufacturing data:

**Shaper Origin SVG:**
- Stroke colors from cut type (already done in Phase 4)
- Add `shaper:cutDepth` attributes using Shaper's XML namespace:
  ```xml
  <path ... xmlns:shaper="http://www.shapertools.com/namespaces/shaper"
        shaper:cutDepth="6mm" />
  ```
- Dogbone fillets are baked into the path geometry

**Laser cutter SVG:**
- Apply kerf compensation to the paths at export time (offset outward
  for outside cuts, inward for inside cuts)
- Export the compensated paths, not the design-intent paths

**CNC router SVG + job sheet:**
- Tab gaps baked into the cut paths
- Job sheet includes cut types, depths, tool info, tab positions,
  material dimensions

---

## New npm dependencies

```bash
npm install clipper-lib         # polygon offsetting for kerf compensation
npm install --save-dev @types/clipper-lib
```

SVGNest may need to be vendored (copied into the repo as a local module)
rather than installed via npm, depending on its packaging. Check whether
a suitable npm package exists; if not, copy the core algorithm files
into `src/lib/studio/nesting/`.

Paper.js is already installed from Phase 3.

---

## What NOT to build in Phase 5

- Parametric variables (Phase 6)
- G-code generation
- Multi-pass depth strategies
- Pocketing toolpath generation (zigzag/spiral clearing patterns)
- Speed and feed calculations
- Real-time machine connection
- Multi-sheet nesting
- Part-in-part nesting
- V-carving / engraving toolpaths
- 3D simulation
- Inlay toolpath generation
- Text on path
- Image tracing

---

## Testing checklist

### Mode tabs
- [ ] Three tabs visible: DESIGN, PLAN, REVIEW
- [ ] Pressing 1, 2, 3 switches modes
- [ ] Design mode: all tools work as before
- [ ] Plan mode: drawing tools grayed out, can't create new shapes
- [ ] Plan mode: can select shapes, can't move/resize them
- [ ] Review mode: everything read-only, only pan/zoom works

### Material setup
- [ ] Plan mode shows material settings in properties panel
- [ ] Changing material dimensions updates the dashed outline on canvas
- [ ] Material outline visible in Plan and Review modes

### Tool library
- [ ] Three default tools pre-populated
- [ ] Can add a new tool
- [ ] Can edit a tool
- [ ] Active tool shown in Plan mode panel
- [ ] Tool selection persists in localStorage across sessions
- [ ] Active tool saved with design file

### Cut type assignment
- [ ] Select a shape in Plan mode, click "Outside": shape turns red
- [ ] Click "Inside": shape turns blue
- [ ] All five cut types work with correct colors
- [ ] Multiple shapes can be assigned at once
- [ ] Unassigned shapes pulse in amber
- [ ] Cut types saved with the design

### Cut depth
- [ ] Depth field appears when a cut type is assigned
- [ ] "Through" toggle sets depth to material thickness
- [ ] Depth field hidden when active tool is laser type

### Kerf compensation
- [ ] Toggle kerf compensation on in Plan mode
- [ ] Outside-cut shapes show original path (dashed) and offset path (solid)
- [ ] The offset is visibly outward for outside cuts, inward for inside cuts
- [ ] Kerf value comes from the active tool
- [ ] Changing the tool updates the kerf preview immediately

### Dogbone fillets
- [ ] Select an inside-cut rectangle, click "Apply dogbones"
- [ ] Four corner overcuts appear
- [ ] Dogbone style switches between standard and T-bone
- [ ] Dogbone diameter matches the active tool
- [ ] "Select corners" mode lets user click individual corners to toggle
- [ ] Undo reverts the dogbone operation
- [ ] Dogbones visible in Review mode
- [ ] Dogbones baked into exported SVG paths

### Tabs
- [ ] Select an outside-cut shape, click "Add tabs"
- [ ] 4 tabs appear evenly spaced around the perimeter
- [ ] Tabs render as amber rectangles on the cut path
- [ ] Tab count, width, and height adjustable
- [ ] "Manual place" lets user click path to place individual tabs
- [ ] Tabs can be dragged along the path
- [ ] Tabs visible in Review mode as material bridges
- [ ] Tabs exported as gaps in the cut path (CNC router profile)

### Review mode
- [ ] Material renders as a filled wood-colored rectangle
- [ ] Outside-cut shapes appear as holes in the material
- [ ] Inside-cut shapes appear as recessed areas
- [ ] Review panel shows checklist with green checks and warnings
- [ ] Warning for unassigned shapes
- [ ] Warning for features smaller than bit diameter
- [ ] Clicking a warning highlights the shape on canvas
- [ ] "Back to Plan" and "Export" buttons work

### Nesting
- [ ] Draw several shapes, assign "outside" cut type to all
- [ ] Click "Nest parts": shapes rearrange within material boundary
- [ ] Material usage percentage displayed
- [ ] Spacing between parts matches the setting
- [ ] Undo restores original positions
- [ ] Progress indicator shows during nesting computation
- [ ] Nesting respects rotation setting (None/90/Any)

### Save/export integration
- [ ] Manufacturing data (cut types, depths, dogbones, tabs) saved with design
- [ ] Loading a saved design restores all manufacturing data
- [ ] Loading a v1 design (no manufacturing data) works without errors
- [ ] Shaper Origin export includes `shaper:cutDepth` attributes
- [ ] Laser export includes kerf-compensated paths
- [ ] CNC router export includes tab gaps and complete job sheet

### Regression
- [ ] All Phase 1-4 features still work
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds

---

## For Claude Code

This is the biggest and hardest phase. Build order matters:

1. **Mode tabs** (small, sets up the framework everything else plugs into)
2. **Material setup** (needed for Review mode and nesting)
3. **Tool library** (needed for kerf, dogbones, and Review warnings)
4. **Cut type assignment** (core of Plan mode, moderate complexity)
5. **Cut depth** (small, depends on cut type being in place)
6. **Kerf compensation** (hard geometry, depends on cut types + tool)
7. **Dogbone generation** (hard geometry, depends on tool)
8. **Tab generation** (moderate, depends on cut types)
9. **Review mode** (depends on everything above)
10. **Nesting** (independent of Review, but save it for last since it
    needs the Web Worker setup)
11. **Save/export integration** (final wiring)

For kerf compensation (step 6): if Paper.js's offset doesn't work
well, use `clipper-lib`. Clipper is the industry standard for this.
The tricky part is converting between our PathPoint/pathData format
and Clipper's integer-coordinate polygon format. Write good conversion
functions and the rest follows.

For dogbone generation (step 7): start with standard dogbones on
rectangles only. Get the math right for 90-degree corners before
handling arbitrary angles. T-bone can come after standard works.

For nesting (step 10): if SVGNest proves hard to integrate, implement
a simpler strip-packing algorithm (sort parts by height, pack left-to-
right in rows). It won't be optimal but it's useful and ships faster.
The genetic algorithm nester can come in a v2 pass.

For Review mode (step 9): the visual simulation is the crown jewel
but it's also the most complex rendering. Start with a simple version:
material rectangle, shapes colored by cut type, warnings panel. Add
the "cut-out holes in material" visual effect if time permits; skip
it if it takes more than an hour. The warnings panel alone is worth
the mode.

Commit after each step. Push when done or when you've completed a
coherent subset (steps 1-5 are a meaningful checkpoint, steps 6-8
are another, steps 9-11 are the final stretch).

---

*Phase 5 brief for the Jesper Makes 2D Design Studio. This is where the
drawing tool becomes a manufacturing tool. Design your part. Plan how
to cut it. Review the result before wasting material. Free, forever.*
