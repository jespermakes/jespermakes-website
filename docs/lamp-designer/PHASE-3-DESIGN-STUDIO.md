# PHASE-3-DESIGN-STUDIO.md

> Development brief for Phase 3 of the Jesper Makes 2D Design Studio.
> Phase 1 built the canvas. Phase 2 added text, rulers, guides, and polish.
> Phase 3 completes the drawing toolkit: pen tool, node editing, booleans,
> SVG import, and additional shape tools. After this phase, a user can
> design real maker parts (like cone lamp leaves and slotted disks) from
> scratch inside the studio.

---

## Read first

1. The Phase 1 and Phase 2 code in the repo. Read the existing data model
   in `src/lib/studio/types.ts` and the reducer in `src/lib/studio/reducer.ts`
   before changing anything.
2. This file, in full, before starting.

---

## Branch

```bash
cd /home/jesper/claude-code-workspace/studio
git checkout main           # or whatever branch has Phase 2 merged
git pull origin main
git checkout -b feature/studio-phase-3
```

---

## What Phase 3 adds

Eight groups, ordered by build dependency:

1. **Path data model upgrade** (30 min) — shapes become path-based internally
2. **Pen tool** (90 min) — draw bezier curves and straight segments
3. **Node editing mode** (90 min) — select and edit individual path nodes
4. **Polygon and star tools** (30 min) — regular polygons, stars
5. **Arc tool** (20 min) — draw arc segments
6. **Boolean operations** (60 min) — union, difference, intersection
7. **SVG import** (60 min) — drag-and-drop or file-picker to load SVGs
8. **Polish and integration** (30 min)

Total: roughly 7-8 hours of Claude Code work. Build each group, run
`npx tsc --noEmit` after each, commit after each.

---

## 1. Path data model upgrade

This is the most important architectural change in Phase 3. Every shape
needs to become a path internally so that node editing, booleans, and
the pen tool all operate on the same data structure.

### New shape type: "path"

Add to `ShapeType`:

```typescript
type ShapeType = "rectangle" | "circle" | "line" | "text" | "path";
```

Add path-specific fields to `Shape`:

```typescript
interface PathPoint {
  x: number;                 // absolute position in mm
  y: number;
  // Control points for bezier curves (cubic bezier)
  // If both are undefined, this is a straight-line corner.
  handleIn?: { x: number; y: number };   // control point coming IN to this point
  handleOut?: { x: number; y: number };  // control point going OUT of this point
}

interface Shape {
  // ...existing fields...

  // Path-specific
  points?: PathPoint[];      // ordered list of path nodes
  closed?: boolean;          // true = closed shape, false = open path
}
```

### Rectangles and circles remain as they are

Do NOT convert existing rectangles and circles to paths in the data model.
They stay as `type: "rectangle"` and `type: "circle"` with their own
rendering. This keeps them simple to create and edit (drag corners, not
nodes).

The conversion to paths happens only when needed:
- When a user wants to node-edit a rectangle (converts it to a path
  with 4 corner points)
- When a boolean operation needs to combine shapes (converts operands
  to paths internally)
- When exporting (rectangles and circles export as `<rect>` and
  `<circle>`/`<ellipse>`, not as `<path>`)

Create a conversion function:

```typescript
function shapeToPath(shape: Shape): PathPoint[] {
  switch (shape.type) {
    case "rectangle":
      // 4 corners, no handles (straight lines)
      return rectangleToPoints(shape);
    case "circle":
      // 4 points with handles approximating the circle as cubic beziers
      return circleToPoints(shape);
    case "line":
      // 2 points, no handles
      return lineToPoints(shape);
    case "path":
      return shape.points ?? [];
    default:
      return [];
  }
}
```

Put this in `src/lib/studio/path-ops.ts`.

### Path rendering

In `shape-renderer.tsx`, add a case for `type: "path"`:

```tsx
case "path": {
  const d = pointsToSVGPath(shape.points ?? [], shape.closed ?? false);
  return (
    <path
      d={d}
      stroke={shape.stroke}
      strokeWidth={shape.strokeWidth}
      fill={shape.fill === "none" ? "none" : shape.fill}
      // ...other attributes
    />
  );
}
```

The `pointsToSVGPath` function converts the `PathPoint[]` array into an
SVG path `d` attribute string:

```typescript
function pointsToSVGPath(points: PathPoint[], closed: boolean): string {
  if (points.length === 0) return "";

  const parts: string[] = [];
  parts.push(`M${points[0].x},${points[0].y}`);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (prev.handleOut && curr.handleIn) {
      // Cubic bezier
      parts.push(
        `C${prev.handleOut.x},${prev.handleOut.y} ` +
        `${curr.handleIn.x},${curr.handleIn.y} ` +
        `${curr.x},${curr.y}`
      );
    } else if (prev.handleOut) {
      // Quadratic-ish: use prev's handleOut, reflect for curr
      parts.push(
        `C${prev.handleOut.x},${prev.handleOut.y} ` +
        `${curr.x},${curr.y} ` +
        `${curr.x},${curr.y}`
      );
    } else if (curr.handleIn) {
      parts.push(
        `C${prev.x},${prev.y} ` +
        `${curr.handleIn.x},${curr.handleIn.y} ` +
        `${curr.x},${curr.y}`
      );
    } else {
      // Straight line
      parts.push(`L${curr.x},${curr.y}`);
    }
  }

  if (closed && points.length > 1) {
    // Close: draw segment from last point back to first
    const last = points[points.length - 1];
    const first = points[0];

    if (last.handleOut && first.handleIn) {
      parts.push(
        `C${last.handleOut.x},${last.handleOut.y} ` +
        `${first.handleIn.x},${first.handleIn.y} ` +
        `${first.x},${first.y}`
      );
    } else if (last.handleOut || first.handleIn) {
      const ho = last.handleOut ?? { x: last.x, y: last.y };
      const hi = first.handleIn ?? { x: first.x, y: first.y };
      parts.push(`C${ho.x},${ho.y} ${hi.x},${hi.y} ${first.x},${first.y}`);
    }
    parts.push("Z");
  }

  return parts.join(" ");
}
```

Put this in `src/lib/studio/path-ops.ts`.

---

## 2. Pen tool

The pen tool draws freeform paths with a mix of straight segments and
bezier curves. This is the tool that lets users draw shapes like the
cone lamp leaves.

### Toolbar

Add a Pen tool button after the Line tool. Icon: a fountain-pen nib or
a bezier-curve icon (a curve with two handle dots). Keyboard shortcut: P.

### Behavior

The pen tool works click-by-click (not drag-to-draw like rectangles):

1. **Click** to place a corner point (straight line to the next point)
2. **Click and drag** to place a curve point:
   - The click sets the point position
   - The drag pulls out symmetric handles (handleIn and handleOut mirror
     each other around the point)
   - The further you drag, the more curved the segment will be
   - While dragging, show the handles as thin lines with small dots at
     the ends
3. Each new point connects to the previous one. The path preview shows
   the growing shape in real-time.
4. **Close the path:** click on the first point to close it. The path
   becomes a closed shape. Tool switches to Select with the new shape
   selected.
5. **End an open path:** press Enter or Escape, or double-click the last
   point. The path is finalized as an open path. Tool switches to Select.
6. **Cancel:** press Escape before placing any points to cancel and
   switch to Select.

### Visual feedback during drawing

- Placed points: small solid dots (4px, amber)
- Handles: thin lines from the point to each handle dot (1px, amber,
  50% opacity). Handle dots: 4px circles, white fill with amber border.
- Path preview: the outline of the shape so far, using the default
  stroke color and width
- "Rubber band" segment: a preview line/curve from the last placed
  point to the current cursor position, shown as a dashed line. This
  shows the user what the next segment will look like before they click.
- When hovering near the first point (within 8px screen distance), the
  cursor should change and the first point should highlight to indicate
  "click to close."

### Shift modifier

While placing a point (click without drag), hold Shift to constrain the
segment angle to 0/45/90/135 degrees, same as the Line tool.

### Alt modifier

While dragging out handles, hold Alt to break the handle symmetry
(independent handles). This lets one side of the curve be sharp and the
other smooth.

---

## 3. Node editing mode

Node editing lets users modify existing paths by moving individual points
and adjusting bezier handles. This is what makes the pen tool truly useful:
draw a rough shape, then refine it point by point.

### Activating node editing

- Double-click a path shape while in Select mode to enter node editing
  mode for that shape.
- Or: select a path shape and press Enter to enter node editing.
- While in node editing, the selected shape's points are displayed as
  editable nodes. All other shapes are dimmed (50% opacity).

### Node display

- Corner points (no handles): small squares (5px, white fill, blue border)
- Curve points (has handles): small circles (5px, white fill, blue border)
- Handles: thin lines from the point to the handle dot (1px, blue, 40%
  opacity). Handle dots: 3px circles, blue fill.

### Interactions in node editing mode

**Move a point:** click and drag a node point. Snapping applies. If the
point has handles, the handles move with it.

**Adjust a handle:** click and drag a handle dot. By default, the opposite
handle mirrors the movement (smooth curve). Hold Alt while dragging to
break the mirror and adjust independently (cusp).

**Select multiple nodes:** click a node to select it (blue fill). Shift+click
to add/remove from node selection. Drag a marquee to select multiple nodes.
Move or delete applies to all selected nodes.

**Add a point:** click on a path segment (between two existing points) to
insert a new point at that position on the curve. The curve shape should
not change (the new point is inserted at the exact position on the bezier,
with handles calculated to preserve the original curve).

**Delete a point:** select a point, press Delete. The point is removed and
the adjacent segments reconnect. If a closed path has fewer than 3 points
after deletion, convert it to an open path. If an open path has fewer
than 2 points, delete the entire shape.

**Convert point type:**
- Select a corner point, press C to convert it to a smooth curve point
  (handles are generated based on adjacent segment directions)
- Select a curve point, press C to convert it to a corner point (handles
  are removed)

### Exiting node editing

- Press Escape to exit back to Select mode
- Click on empty canvas to exit
- Click on a different shape to exit and select that shape
- Press V to switch to Select mode

### Converting rectangles/circles to editable paths

When the user double-clicks (or presses Enter on) a rectangle or circle
to enter node editing:

1. Show a confirmation: "Convert to editable path? This can't be undone."
   (Small toast with "Convert" and "Cancel" buttons, not a blocking modal.)
2. If confirmed, replace the shape in the document with its path equivalent
   (using `shapeToPath`). The new shape has `type: "path"` and is now
   fully node-editable.
3. Enter node editing mode on the new path.

This is a one-way conversion. Once a rectangle becomes a path, it can't
go back to being a rectangle. That's fine and expected — the same behavior
as every other vector editor.

---

## 4. Polygon and star tools

### Polygon tool (keyboard shortcut: G for "polygon/gon")

Draws regular polygons with a configurable number of sides.

**Behavior:**
1. Click to set the center, drag outward to set the radius
2. While dragging, the polygon preview shows. Default: 6 sides (hexagon).
3. The number of sides is set in the properties panel (show a "Sides"
   field when the polygon tool is active or a polygon shape is selected).
   Range: 3 to 64.
4. Hold Shift while dragging to constrain the rotation to 15-degree
   increments.

**Data model:** Polygons are stored as `type: "path"` shapes with N
corner points and `closed: true`. They're generated by the polygon tool
but from then on they're just paths. No special `type: "polygon"` needed.

### Star tool (same button as polygon, toggle in properties panel)

When the polygon tool is active, the properties panel shows a "Star"
checkbox. When checked:

- The shape becomes a star with alternating outer and inner vertices
- An "Inner radius" slider (as percentage of outer radius, 10% to 90%,
  default 50%) controls how pointy the star is
- The number of points matches the "Sides" value

Stars are also stored as `type: "path"` shapes.

### Toolbar

Add a single Polygon/Star button after the Text tool. Icon: a hexagon
outline. Tooltip: "Polygon (G)".

---

## 5. Arc tool

Draws circular arc segments.

### Behavior

1. Click to set the arc center
2. Drag outward to set the radius (and the start angle, based on drag direction)
3. Release to set the start point
4. Move the mouse around the center to set the sweep angle
5. Click to finalize the arc

This two-step interaction (drag for radius, then sweep) is more intuitive
than specifying three points.

### Data model

Arcs are stored as `type: "path"` shapes with the arc approximated as
cubic bezier segments (same approach as the circle-to-path conversion,
but for a partial arc).

**Alternatively:** store as a path with two endpoint nodes. The arc can
be approximated with 1-4 cubic bezier segments depending on the sweep
angle (one segment per 90 degrees of arc).

### Toolbar

Add an Arc button after Polygon. Icon: a curved arc segment. Keyboard
shortcut: A.

### Shift modifier

Hold Shift to constrain the sweep angle to 15-degree increments.

---

## 6. Boolean operations

Boolean operations combine two or more shapes into new shapes. This is
what Shaper Studio calls "ShapeShifter" and it's essential for designing
real parts (cutting slots, combining overlapping shapes, punching holes).

### The three operations

- **Union (Add):** combines two shapes into one, merging their outlines.
  The result is a single path that covers the area of both shapes.
- **Difference (Subtract):** cuts one shape out of another. Select two
  shapes; the frontmost shape is subtracted from the one behind it. The
  result is the back shape with a hole where the front shape was.
- **Intersection:** keeps only the overlapping area of two shapes. The
  result is a shape covering only where both shapes overlap.

### UI

Three buttons in the toolbar, grouped together after a separator.
They're only active (not grayed out) when 2+ shapes are selected.

Icons:
- Union: two overlapping circles, both filled
- Difference: two overlapping circles, overlap area empty
- Intersection: two overlapping circles, only overlap filled

Keyboard shortcuts: none for v1. These are used less frequently than
drawing tools and the toolbar buttons are sufficient.

### Implementation

**This is the hardest algorithmic problem in Phase 3.** Path boolean
operations on bezier curves are genuinely difficult to implement from
scratch. Two approaches:

**Approach A — Use Paper.js (recommended)**

Install Paper.js (`npm install paper`) and use its boolean operations:

```typescript
import paper from "paper";

function booleanOperation(
  shapeA: Shape,
  shapeB: Shape,
  operation: "unite" | "subtract" | "intersect"
): PathPoint[] {
  // 1. Set up an offscreen Paper.js canvas
  paper.setup(new paper.Size(1, 1));

  // 2. Convert both shapes to Paper.js Path objects
  const pathA = shapeToPaperPath(shapeA);
  const pathB = shapeToPaperPath(shapeB);

  // 3. Perform the boolean operation
  let result: paper.PathItem;
  switch (operation) {
    case "unite":
      result = pathA.unite(pathB);
      break;
    case "subtract":
      result = pathA.subtract(pathB);
      break;
    case "intersect":
      result = pathA.intersect(pathB);
      break;
  }

  // 4. Convert the result back to our PathPoint[] format
  return paperPathToPoints(result);
}
```

Paper.js's boolean engine is battle-tested and handles edge cases
(tangent intersections, self-intersecting paths, compound paths with
holes) that would take weeks to implement correctly from scratch.

**Important:** Paper.js is used ONLY for boolean math, not for rendering.
The studio continues to render via SVG-in-DOM as before. Paper.js runs
its calculations offscreen and returns the result as path data.

**Approach B — Use a lightweight polygon clipper**

If adding Paper.js (it's a large library) feels too heavy, use a lighter
alternative like `polygon-clipping` (npm package, ~20KB, implements
Greiner-Hormann/Martinez polygon clipping). It handles polygons and
basic curves but may struggle with complex bezier intersections.

**My recommendation: use Paper.js.** The library is ~300KB minified but
it's the standard for this kind of work and it handles every edge case.
The rendering code stays as-is (SVG-in-DOM), Paper.js only runs when
the user clicks a boolean button. Tree-shaking won't help (Paper.js is
a monolith), but it's a one-time load and the studio page is already a
client-only bundle with no server-side concerns.

### Compound paths (holes)

When a Difference operation creates a shape with a hole (e.g., subtracting
a circle from a rectangle creates a rectangle with a round hole), the
result is a **compound path** — a single shape whose SVG path data
contains multiple sub-paths (using multiple `M` commands).

The `PathPoint[]` model needs to support this. Options:

1. **Flat points array with a separator marker:** add a special
   `isMoveTo: true` flag on PathPoint to mark where sub-paths start.
2. **Nested arrays:** change `points` to `PathPoint[][]` where each
   inner array is a sub-path.
3. **Keep it flat, use SVG path `d` string directly:** store the result
   of boolean operations as a raw SVG `d` string in a new `pathData`
   field on the Shape, bypassing `PathPoint[]` for compound paths.

**Use option 3 for compound paths.** Add an optional `pathData?: string`
field to Shape. When `pathData` is present, the renderer uses it directly
instead of converting `points` to a path string. This keeps compound
paths working without rearchitecting the point model. Node editing of
compound paths can be deferred to a later phase.

```typescript
interface Shape {
  // ...existing fields...

  points?: PathPoint[];      // simple paths (pen tool, polygon, arc)
  pathData?: string;         // compound paths from booleans, SVG import
  closed?: boolean;
}
```

In `shape-renderer.tsx`:

```tsx
case "path": {
  const d = shape.pathData ?? pointsToSVGPath(shape.points ?? [], shape.closed ?? false);
  return <path d={d} ... />;
}
```

### Workflow

1. User draws two overlapping shapes (any type: rectangles, circles, paths)
2. User selects both shapes (click one, shift-click the other)
3. User clicks the Union/Difference/Intersection button in the toolbar
4. Both original shapes are deleted from the document
5. A new `type: "path"` shape replaces them with the boolean result
6. The new shape is selected
7. The operation is one undo step

If the result of a boolean operation is empty (e.g., intersecting two
non-overlapping shapes), show a brief toast: "Shapes don't overlap."
and leave the originals unchanged.

---

## 7. SVG import

Let users bring in existing SVG files. This is essential for workflows
where the user has shapes from other tools (Inkscape, Illustrator,
Shaper Studio, or the Cone Lamp/Box Joint Jig generators on this very
site) that they want to modify in the studio.

### UI

Two ways to import:

1. **Drag and drop:** drag an SVG file onto the canvas. A drop zone
   highlight appears ("Drop SVG to import"), and the shapes are added
   on drop.
2. **File button:** add an "Import SVG" button to the toolbar (or to a
   File menu if one exists). Opens a file picker filtered to `.svg` files.

### Parsing

Use the browser's built-in `DOMParser` to parse the SVG:

```typescript
function parseSVG(svgString: string): Shape[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return [];

  const shapes: Shape[] = [];
  processElement(svg, shapes, identity());  // recursive descent
  return shapes;
}
```

### What to parse

Walk the SVG DOM tree recursively. For each element:

- `<rect>` → create a `type: "rectangle"` Shape
- `<circle>` → create a `type: "circle"` Shape
- `<ellipse>` → create a `type: "circle"` Shape (width !== height)
- `<line>` → create a `type: "line"` Shape
- `<path>` → store the `d` attribute in `pathData` on a `type: "path"`
  Shape. Do not parse the `d` string into PathPoints (that's complex
  and error-prone for arbitrary SVGs). Just keep the raw path data.
- `<polygon>` → convert the points list to a `pathData` string
- `<polyline>` → same, but open
- `<text>` → create a `type: "text"` Shape
- `<g>` → recurse into children, applying the group's `transform`

### Transforms

Handle the `transform` attribute on `<g>` and individual elements.
Support at minimum: `translate(x, y)`, `rotate(angle)`, `scale(sx, sy)`,
and `matrix(a, b, c, d, e, f)`. Apply transforms to the final shape
coordinates.

### Units and scaling

SVG files may use different coordinate systems:

- Some use `viewBox` with unitless coordinates
- Some use `width="100mm"` with mm units
- Some use pixel coordinates (assuming 96 DPI or 72 DPI)
- Some use no units at all

**Default behavior:** if the SVG has `width` and `height` with unit
suffixes (mm, cm, in, px, pt), parse them and convert to mm. If unitless,
assume the SVG is in pixels at 96 DPI (1 px = 0.2646 mm). This matches
the browser's default SVG rendering.

If the imported shapes are unreasonably large or small (wider than 2000mm
or narrower than 0.1mm), show a prompt: "The imported design appears to
be in [pixels/points]. Scale to mm?" with a "Scale" and "Keep as-is"
option.

### Placement

Imported shapes are placed centered on the current viewport. After import,
all imported shapes are selected so the user can immediately move or scale
them.

### Limitations (document clearly)

- Embedded images (`<image>`) are ignored
- CSS styling (`<style>` blocks) is ignored; only inline `style` and
  presentation attributes (stroke, fill, etc.) are read
- Filters, gradients, clip-paths, masks are ignored
- Text in imported SVGs may not match the original font (we use Inter/
  Playfair, the original may use any font)

These are reasonable v1 limitations. Show a one-line toast if anything
was skipped: "Some elements were skipped during import."

### File: `src/lib/studio/svg-import.ts`

---

## 8. Polish and integration

### Properties panel updates

**Path shapes:** when a `type: "path"` shape is selected (but not in
node editing mode), show:

- Position (bounding box center X, Y)
- Size (bounding box width, height)
- Rotation
- Point count (read-only, e.g. "12 nodes")
- "Edit nodes" button (enters node editing mode)
- Stroke and fill

**Polygon/star creation:** when the Polygon tool is active, show in the
properties panel:

- Sides (number input, 3-64)
- Star checkbox
- Inner radius % (when star is checked)

### Toolbar layout

After Phase 3, the toolbar should have:

```
[Logo]
─────────
[Select (V)]
[Pen (P)]
[Rectangle (R)]
[Circle (C)]
[Line (L)]
[Arc (A)]
[Polygon (G)]
[Text (T)]
─────────
[Union]
[Difference]
[Intersection]
─────────
[Undo]
[Redo]
─────────
[Import SVG]
[Export SVG]
```

If the toolbar gets too tall for smaller screens, add a scrollbar inside
the toolbar (the canvas area should never shrink to accommodate toolbar
height).

### Cursor for pen tool

- Default cursor (hovering canvas): `crosshair`
- Hovering a placed point: small circle cursor indicating "click to select"
- Hovering the first point of an open path: special cursor indicating
  "click to close path" (or just change the first point's dot to a
  larger highlight)

### Undo for boolean operations

A boolean operation is a single undo step: undo restores both original
shapes and removes the boolean result.

### Export update

Ensure that:
- Path shapes export their `pathData` or `points` correctly as `<path>` elements
- Compound paths (from booleans) export with their full `d` attribute
  including sub-paths
- Imported shapes that were stored as raw `pathData` re-export cleanly

---

## New npm dependencies

**Phase 3 introduces the first external geometry library:**

```bash
npm install paper
npm install --save-dev @types/paper
```

Paper.js is used ONLY for boolean operations (step 6). If you can
implement booleans without it (e.g., using `polygon-clipping` for a
lighter footprint), that's fine too. The requirement is that union,
difference, and intersection work correctly on overlapping shapes
including bezier curves. Whatever library achieves that most reliably
with the least complexity is the right choice.

**Do not use Paper.js for rendering, canvas management, or event handling.**
The studio continues to render via SVG-in-DOM as in Phases 1 and 2.

---

## What NOT to build in Phase 3

Still out of scope:

- Cut types, depths, kerf, dogbones, tabs (Phase 4: Manufacturing Mode)
- Plan mode or Review mode (Phase 4)
- Layers panel
- Part nesting
- Parametric variables
- Cloud save / user accounts
- DXF import or export
- Mobile touch gestures
- Multi-page documents
- Image tracing (bitmap to vector)
- Outlined text export (text to paths)
- Freehand drawing tool
- Measurement/dimension annotation tool
- Offset path (expand/contract a shape by a distance)
- Fillet/chamfer on corners
- Node editing of compound paths (from booleans/import)
- Array/pattern repeat tools

---

## Testing checklist

### Path data model
- [ ] Existing rectangles, circles, lines, and text still render and work
- [ ] No regressions in selection, transformation, undo/redo, export

### Pen tool
- [ ] Press P, click canvas three times, press Enter: open 3-point path appears
- [ ] Click four points, click the first point: closed path (polygon) appears
- [ ] Click and drag when placing a point: bezier handles appear, curve forms
- [ ] The rubber-band preview shows the next segment before clicking
- [ ] Shift constrains straight segments to 45-degree angles
- [ ] Alt while dragging handles breaks symmetry
- [ ] Escape cancels the path in progress
- [ ] A realistic shape (like a leaf outline) can be drawn with 8-10 points

### Node editing
- [ ] Double-click a path shape: nodes appear on the shape, other shapes dim
- [ ] Drag a node: it moves, the shape updates in real-time
- [ ] Drag a bezier handle: the curve adjusts
- [ ] Click on a segment between nodes: new node inserted, curve unchanged
- [ ] Select a node, press Delete: node removed, adjacent segments reconnect
- [ ] Shift-click to select multiple nodes, drag to move them all
- [ ] Press Escape: exit node editing, return to Select mode
- [ ] Double-click a rectangle: conversion prompt appears. After converting,
      the rectangle becomes a 4-node path that can be edited

### Polygon and star
- [ ] Press G, drag on canvas: hexagon appears (6 sides)
- [ ] Properties panel shows "Sides" field; change to 3 = triangle, 5 = pentagon
- [ ] Check "Star": shape becomes a star. Inner radius slider adjusts pointiness.
- [ ] Shift constrains rotation during drag

### Arc
- [ ] Press A, click to set center, drag for radius, then sweep
- [ ] Arc renders correctly as a curved path
- [ ] Shift constrains sweep to 15-degree increments

### Boolean operations
- [ ] Draw two overlapping rectangles, select both, click Union: they merge
      into a single path with the combined outline
- [ ] Draw a circle on top of a rectangle, select both, click Difference:
      the rectangle now has a circular hole where the circle was
- [ ] Draw two overlapping circles, select both, click Intersection:
      only the overlapping lens shape remains
- [ ] Undo a boolean: both original shapes come back
- [ ] Boolean on non-overlapping shapes: toast appears, shapes unchanged
- [ ] Boolean result renders correctly in export

### SVG import
- [ ] Drag an SVG file onto the canvas: shapes appear
- [ ] Import a simple SVG with rectangles and circles: they appear as
      editable rectangle and circle shapes
- [ ] Import an SVG with `<path>` elements: they appear as path shapes
- [ ] Import the cone lamp SVG export from the Cone Lamp Designer on
      jespermakes.com: all 9 parts import and render correctly
- [ ] Imported shapes are centered on the viewport and selected
- [ ] File picker import works (button in toolbar)
- [ ] SVGs with transforms (translate, rotate, scale) import correctly
- [ ] "Some elements were skipped" toast appears when SVG contains
      unsupported elements

### Integration
- [ ] All Phase 1 and Phase 2 features still work
- [ ] New toolbar layout fits on screen (no overflow at 900px viewport height)
- [ ] Properties panel updates correctly for all shape types
- [ ] Export includes all shape types correctly
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds

---

## Deployment

Same as before: push the branch, Vercel preview, Jesper reviews, Floki
merges to main.

One new npm package (`paper` + `@types/paper`). No database changes.
No env vars. No API routes.

---

## For Claude Code

Build order recommendation:

1. **Path data model + path rendering** (foundation, must be solid)
2. **Pen tool** (the flagship new feature, benefits from having path
   rendering already working)
3. **Node editing** (builds on the path model; test heavily)
4. **Polygon + star** (quick win, uses path model)
5. **Arc** (quick win)
6. **SVG import** (independent of other features, can be done in parallel)
7. **Booleans** (requires Paper.js install, hardest algorithmic piece)
8. **Polish** (toolbar layout, cursor, properties panel, final sweep)

The pen tool and node editing are the two pieces that will take the most
time and iteration. Get those right before moving to booleans. If either
one is taking more than 2 hours, commit what works and move on; partial
is better than stuck.

For booleans: if Paper.js gives you trouble (canvas setup in a headless
context, SSR issues with Next.js, etc.), try `polygon-clipping` as a
fallback. It handles polygons cleanly and is much lighter. The tradeoff
is that it struggles with true bezier curves (it works on polygonized
approximations), but for Phase 3 that's an acceptable limitation.

---

*Phase 3 brief for the Jesper Makes 2D Design Studio. After this phase,
the studio can draw anything a maker would need: organic curves, precise
polygons, compound shapes, and imported designs. The next phase adds
manufacturing intelligence.*
