# PHASE-1-DESIGN-STUDIO.md

> Development brief for Phase 1 of the Jesper Makes 2D Design Studio.
> This brief is written for Claude Code to execute inside the jespermakes.com repo.
> Output: a working vector canvas at `/studio` with drawing, selection, and SVG export.

---

## Read these first

Before writing any code, read:

1. `JESPER-MAKES-DEV-HANDOFF.md` in the repo root (or project knowledge) for the full site architecture, design tokens, deployment rules, and coding conventions.
2. `2D-DESIGN-STUDIO-HANDOVER.md` in the project knowledge for the vision, research summary, and phased build strategy.
3. This file, in full, before starting.

---

## What Phase 1 builds

A browser-based 2D vector canvas at `/studio`. The user can:

- Pan and zoom an infinite canvas
- See a configurable grid with snap
- Draw rectangles, circles, and lines
- Select shapes by clicking or drag-selecting
- Move, resize, and rotate selected shapes
- Delete selected shapes
- Undo and redo
- Set precise dimensions via a properties panel
- Switch between mm and inches
- Export the design as a clean SVG file

Phase 1 is the sketchpad. No manufacturing features (no kerf, no dogbones, no cut types, no Plan/Review modes). Those come in later phases. But the data model must be designed to accommodate them, so this phase needs to get the architecture right even though it only shows a fraction of the final feature set.

---

## Route and layout

**Route:** `/studio`

**Layout:** This page breaks the site's normal layout. It is NOT wrapped in the standard `max-w-5xl mx-auto` container. It's a full-viewport app layout: a narrow toolbar on the left, the canvas filling the rest of the screen, and a collapsible properties panel on the right. No site header, no footer. The user enters "studio mode" and the normal website disappears.

**Navigation back:** A small Jesper Makes logo/wordmark in the top-left corner of the toolbar that links back to `/`. That's the only way out.

**`"use client"`:** The entire studio page is a client component. There are no server components inside the canvas.

---

## Technology decisions (already made, do not revisit)

### SVG-in-DOM for rendering

Phase 1 renders shapes as SVG elements inside a React-managed `<svg>` element. Not Canvas, not Paper.js, not Fabric.js.

Why: the site is React/Next.js. SVG elements are DOM nodes that React manages declaratively. SVG viewBox handles pan/zoom natively. Export to SVG is trivial (it's already SVG). The element counts in Phase 1 are small (10-200 shapes) and SVG handles that fine. CSS can style individual elements. Event handling is click/drag on DOM elements, which React is built for.

Paper.js and Maker.js will be introduced in later phases when we need heavy geometry operations (booleans, path offsetting, nesting). For drawing rectangles and circles and moving them around, SVG-in-DOM is simpler, faster to build, and more natural in this stack.

### State management

Use React state (`useState`, `useReducer`) for the document model. No Redux, no Zustand, no external state library. The document is a flat array of shape objects plus a selection set. A `useReducer` with action types is the right pattern for undo/redo (keep a history stack of states).

### No database, no auth, no server

Phase 1 is entirely client-side. No database tables, no API routes, no tracking events, no user accounts. Designs exist only in browser memory and are exported as SVG files. Cloud save comes in a later phase.

### No new npm packages for Phase 1

Do not install Paper.js, Maker.js, Fabric.js, Konva, or any canvas/geometry library. Phase 1 uses only what's already in the repo (React, Next.js, Tailwind) plus basic browser APIs (SVG, pointer events, Blob for download). Keep the dependency surface zero until a later phase genuinely needs external geometry libraries.

---

## Data model

### Shape

Every shape on the canvas is a `Shape` object. This is the core data structure that the entire application builds on. Get it right.

```typescript
type ShapeType = "rectangle" | "circle" | "line";

interface Shape {
  id: string;              // crypto.randomUUID()
  type: ShapeType;
  x: number;               // center x, in document units (mm)
  y: number;               // center y, in document units (mm)
  width: number;            // bounding width (mm). For circle: diameter.
  height: number;           // bounding height (mm). For circle: diameter.
  rotation: number;         // degrees, clockwise
  // Line-specific: start and end points relative to (x, y)
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // Style
  stroke: string;           // hex color, default "#2C1810" (wood)
  strokeWidth: number;      // in mm, default 0.5
  fill: string;             // hex color or "none", default "none"
  // Future phases will add:
  // cutType: "inside" | "outside" | "online" | "pocket" | "guide"
  // depth: number
  // layer: string
  // locked: boolean
  // parametricBindings: Record<string, string>
}
```

**Units are always millimeters internally.** The properties panel shows mm or inches based on the user's unit preference, converting on display/input. The SVG export uses mm. The canvas viewport converts between screen pixels and document mm via the zoom level.

### Document state

```typescript
interface StudioDocument {
  shapes: Shape[];
  selectedIds: Set<string>;
  // Viewport
  viewportX: number;        // pan offset in mm
  viewportY: number;
  zoom: number;             // pixels per mm (e.g. 3.0 means 3 screen pixels per 1mm)
  // Settings
  gridSpacing: number;      // mm, default 10
  snapToGrid: boolean;      // default true
  unitDisplay: "mm" | "in"; // display only, internal is always mm
}
```

### Undo/redo

Maintain a history stack of `StudioDocument` snapshots (excluding viewport state, which should NOT be undoable). Cap the history at 50 states to avoid memory bloat. Every user action that modifies shapes pushes a new snapshot.

```typescript
interface StudioHistory {
  past: StudioDocument[];    // states before current
  present: StudioDocument;   // current state
  future: StudioDocument[];  // states after current (for redo)
}
```

Standard undo/redo: Ctrl+Z pops from `past` into `present`, pushes old `present` into `future`. Ctrl+Shift+Z (or Ctrl+Y) does the reverse. Any new action clears `future`.

---

## Canvas rendering

### The SVG element

```tsx
<svg
  ref={svgRef}
  viewBox={`${viewportX} ${viewportY} ${viewportWidth} ${viewportHeight}`}
  width="100%"
  height="100%"
  xmlns="http://www.w3.org/2000/svg"
  style={{ background: "#FAF7F2" }}  // cream
>
  {/* Grid layer */}
  <GridLayer ... />

  {/* Shapes layer */}
  {shapes.map(shape => <ShapeRenderer key={shape.id} shape={shape} />)}

  {/* Selection handles layer (on top) */}
  {selectedShapes.map(shape => <SelectionHandles key={shape.id} shape={shape} />)}

  {/* Active tool overlay (draw preview, selection marquee) */}
  <ToolOverlay ... />
</svg>
```

### Coordinate system

The SVG viewBox is in **document coordinates (mm)**. The origin (0, 0) is the center of the canvas. X increases rightward, Y increases downward (standard SVG convention, matches screen coordinates, matches how makers think about sheet layouts).

Converting between screen pixels and document mm:

```
docX = viewportX + (screenX / zoom)
docY = viewportY + (screenY / zoom)
```

### Grid

Render the grid as a repeating `<pattern>` in the SVG `<defs>`. Two levels: major grid lines every `gridSpacing * 10` mm, minor grid lines every `gridSpacing` mm. Major lines are slightly darker. Both use the wood-light color at low opacity.

The grid should be infinite (tile with the pattern, not draw individual lines). The pattern scales with zoom.

### Pan and zoom

- **Pan:** middle mouse button drag, or spacebar + left mouse drag. Modifies `viewportX` and `viewportY`.
- **Zoom:** mouse wheel. Zoom toward the cursor position (the point under the cursor stays fixed). Clamp zoom between 0.1 and 50 pixels/mm.
- Both should feel smooth and responsive. Use `requestAnimationFrame` if needed.

### Snap to grid

When `snapToGrid` is true, all coordinates generated by drawing and moving tools snap to the nearest `gridSpacing` increment. The snap function:

```typescript
function snap(value: number, gridSpacing: number): number {
  return Math.round(value / gridSpacing) * gridSpacing;
}
```

Apply snap to the final position, not during drag (so the visual feedback shows the shape jumping to grid positions).

---

## Tools

The toolbar on the left has these tools. Only one tool is active at a time.

### Select tool (default, keyboard shortcut: V)

- Click a shape to select it (deselects others). Shift+click to add/remove from selection.
- Click empty canvas to deselect all.
- Drag on empty canvas to draw a selection marquee (rubber band). Shapes whose bounding boxes intersect the marquee are selected on mouse-up.
- Drag a selected shape to move it (and all other selected shapes). Snap applies.
- Drag a selection handle to resize. Shift constrains aspect ratio.
- Drag the rotation handle to rotate. Snap to 15-degree increments when shift is held.
- Delete key or Backspace removes selected shapes.

### Rectangle tool (keyboard shortcut: R)

- Click and drag to draw a rectangle. The drag defines opposite corners.
- The rectangle appears as a preview (dashed outline) during the drag.
- On mouse-up, the rectangle is added to the document and the tool switches back to Select with the new shape selected.
- Hold Shift during drag to constrain to a square.

### Circle tool (keyboard shortcut: C)

- Click and drag to draw a circle/ellipse. The drag defines the bounding box.
- Hold Shift to constrain to a perfect circle.
- Same preview and auto-switch behavior as Rectangle.

### Line tool (keyboard shortcut: L)

- Click to set the start point, click again to set the end point. The line appears.
- Hold Shift to constrain to 0/45/90/135 degree angles.
- Same auto-switch to Select behavior.

### Pan tool (keyboard shortcut: Space, hold)

- While Space is held, clicking and dragging pans the canvas.
- This is a modifier, not a separate tool button. The current tool resumes when Space is released.

---

## Properties panel

A collapsible panel on the right side, 280px wide. Shows properties of the selected shape(s). If nothing is selected, shows document properties (grid spacing, units, canvas background).

### When one shape is selected

Show editable fields:

- **Position:** X, Y (in current display units)
- **Size:** Width, Height (in current display units). For circles, show "Diameter" as a single field.
- **Rotation:** degrees
- **Stroke:** color picker (simple, just a few preset colors + hex input) and width (mm)
- **Fill:** color picker or "none" checkbox

All fields are live: typing a number updates the shape immediately. Tab between fields. Enter confirms.

### When multiple shapes are selected

Show: count of selected shapes, and a "Delete selected" button. No editable fields (batch-editing is a v1.1 feature).

### When nothing is selected

Show:
- **Grid spacing:** number input (mm)
- **Snap to grid:** checkbox
- **Units:** toggle between mm and inches
- **Zoom level:** read-only display + "Fit all" button (zooms to show all shapes)

---

## Toolbar

Vertical toolbar on the left edge of the screen, 48px wide. Dark background (`wood`), icons in cream.

From top to bottom:

1. **Jesper Makes logo** (tiny, links to `/`)
2. **Separator**
3. **Select** tool (arrow icon)
4. **Rectangle** tool
5. **Circle** tool
6. **Line** tool
7. **Separator**
8. **Undo** button (grayed out when nothing to undo)
9. **Redo** button
10. **Separator**
11. **Export SVG** button (at the bottom of the toolbar)

Each tool button shows a tooltip on hover with the tool name and keyboard shortcut.

Icons: use simple SVG icons inline. Do not install an icon library. The shapes are basic enough to draw as 16x16 SVGs: an arrow for Select, a square outline for Rectangle, a circle outline for Circle, a diagonal line for Line, curved arrows for undo/redo, a download arrow for export.

---

## SVG export

The "Export SVG" button generates a clean SVG file containing only the user's shapes (no grid, no selection handles, no UI elements) and triggers a browser download.

The SVG must:

- Use mm as the document unit: `width="Wmm" height="Hmm"`
- Have a viewBox that tightly fits all shapes with 10mm padding on each side
- Contain only `<rect>`, `<circle>`, `<ellipse>`, `<line>`, and `<g>` elements (no `<pattern>`, no `<defs>` from the grid)
- Preserve stroke colors and widths
- Apply rotations as `transform="rotate(deg, cx, cy)"`
- Include a comment at the top: `<!-- Generated by Jesper Makes Studio - jespermakes.com -->`

The downloaded filename should be `design.svg` (or `untitled.svg`). In a future phase, designs will have names.

```typescript
function exportSVG(shapes: Shape[]): string {
  // 1. Calculate bounding box of all shapes
  // 2. Add 10mm padding
  // 3. Generate SVG string with proper units
  // 4. Return the string
}

function downloadSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## File structure

```
src/app/studio/
  page.tsx                    # "use client", the entry point
  layout.tsx                  # minimal layout (no site header/footer)

src/lib/studio/
  types.ts                    # Shape, StudioDocument, ShapeType, etc.
  reducer.ts                  # useReducer actions for document state
  history.ts                  # undo/redo history management
  geometry.ts                 # coordinate transforms, bounding box, snap, hit-testing
  export-svg.ts               # SVG export logic
  constants.ts                # default colors, grid spacing, zoom limits

src/components/studio/
  canvas.tsx                  # the main SVG canvas component
  toolbar.tsx                 # left-side vertical toolbar
  properties-panel.tsx        # right-side properties panel
  grid-layer.tsx              # SVG grid pattern
  shape-renderer.tsx          # renders a Shape as an SVG element
  selection-handles.tsx       # resize/rotate handles for selected shapes
  tool-overlay.tsx            # draw preview, selection marquee
```

All files use TypeScript. All components use Tailwind for layout styling. The SVG elements inside the canvas use inline style attributes where Tailwind doesn't apply (stroke, fill, transform).

---

## Studio-specific layout

Create `src/app/studio/layout.tsx`:

```tsx
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-cream">
      {children}
    </div>
  );
}
```

This replaces the site's root layout for the `/studio` route. No nav, no footer, full viewport. The root layout's `<html>` and `<body>` tags and font loading still apply.

**Important:** Check whether the site's root `layout.tsx` wraps children in a nav bar and footer. If it does, the studio layout needs to opt out. One approach: the root layout checks the pathname and conditionally renders nav/footer. Another: the studio page renders its own `<html>` via a route group. Look at how the existing root layout works and pick the simplest opt-out.

---

## Interaction specifics

### Pointer events

Use `onPointerDown`, `onPointerMove`, `onPointerUp` on the SVG element (not on individual shapes). This gives you a single event handler that can dispatch to the active tool's logic. Pointer events work for both mouse and touch.

```tsx
<svg
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onWheel={handleWheel}
  style={{ touchAction: "none" }}  // prevent browser zoom/scroll
>
```

### Hit testing

When the Select tool processes a click, it needs to know which shape (if any) was clicked. Two approaches:

1. **DOM-based:** Put `data-shape-id={shape.id}` on each SVG element and check `event.target.dataset.shapeId`. Simple and fast for Phase 1's element counts.

2. **Geometric:** Convert the click position to document coordinates and test against each shape's bounding box. More work but independent of rendering.

Use approach 1 for Phase 1. It's simpler and sufficient.

### Selection handles

When a shape is selected, render 8 resize handles (corners + edge midpoints) as small squares, plus a rotation handle (small circle above the top edge, connected by a thin line).

The handles are rendered in a layer above the shapes so they're always clickable. They're in screen-pixel coordinates (fixed size regardless of zoom), which means they need to be rendered with `vector-effect="non-scaling-stroke"` and sized relative to the current zoom level.

### Keyboard shortcuts

Listen for `keydown` on the `window` (not on individual elements). Map:

- `v` or `Escape` = Select tool
- `r` = Rectangle tool
- `c` = Circle tool
- `l` = Line tool
- `Delete` or `Backspace` = delete selected shapes
- `Ctrl+Z` (or `Cmd+Z` on Mac) = undo
- `Ctrl+Shift+Z` or `Ctrl+Y` = redo
- `Ctrl+A` = select all
- `Space` (hold) = pan mode

Don't capture keyboard events when an input field in the properties panel is focused (check `document.activeElement`).

---

## Styling

### Toolbar

```
bg-wood text-cream
w-12 (48px)
Full height of viewport
Rounded-r-xl on the right edge (slight rounding)
Items centered horizontally
Tool buttons: 36x36, rounded-lg, hover:bg-white/10
Active tool: bg-white/20
Tooltips: small floating div on the right side of the button, bg-wood-light text-cream text-xs
```

### Properties panel

```
bg-white border-l border-wood/[0.08]
w-[280px]
Full height of viewport
Collapsible (toggle button at the top)
Input fields: same style as admin panel inputs (bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-1.5 text-sm)
Section labels: text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase
```

### Canvas background

The SVG background is cream (`#FAF7F2`). Grid lines are `wood-light` at 5% opacity (minor) and 12% opacity (major).

### Shape rendering

- Default stroke: `#2C1810` (wood), 0.5mm width
- Default fill: `none` (transparent)
- Selected shapes get a blue highlight: `#3B82F6` stroke at 0.3mm overlaid on top of the shape's actual stroke
- Hover: cursor changes to `move` when over a shape in Select mode

---

## What "done" looks like for Phase 1

A user visits `/studio` and sees:

1. A full-viewport dark-toolbar-on-left, canvas-in-center layout
2. A visible grid on the canvas (10mm spacing by default)
3. They can pan by holding Space + dragging, and zoom with the mouse wheel
4. They click the Rectangle tool (or press R), drag on the canvas, and a rectangle appears
5. They do the same with Circle and Line tools
6. They click the Select tool (V), click a shape, and see resize handles appear
7. They drag the shape to move it. It snaps to the grid.
8. They drag a corner handle to resize. Shift constrains aspect ratio.
9. They drag the rotation handle to rotate.
10. They see the shape's position and size in the properties panel on the right
11. They type new values into the properties panel and the shape updates
12. They press Delete and the shape is removed
13. They press Ctrl+Z and the shape comes back
14. They click "Export SVG" and a clean SVG file downloads

All of this feels responsive and direct. No loading spinners, no server calls. It feels like a desktop app that happens to run in the browser.

---

## What NOT to build in Phase 1

Explicitly out of scope. Do not build any of these:

- Boolean operations (union, intersection, difference)
- Text tool
- Bezier curves / pen tool
- SVG import
- DXF import or export
- Cut types, depths, kerf, dogbones, tabs
- Plan mode or Review mode
- Layers panel
- Part nesting
- Parametric variables
- Cloud save / user accounts
- Tracking events
- Mobile-optimized touch gestures (desktop pointer events are sufficient for v1)
- Ruler marks along the canvas edges
- Custom color picker (just preset swatches + hex input)
- Multi-page documents
- Print functionality
- Copy/paste (v1.1, it's fiddly to get right with keyboard event conflicts)
- Group/ungroup

---

## Testing checklist

After building, verify:

- [ ] `/studio` loads without errors
- [ ] No site nav/footer visible (full-viewport studio layout)
- [ ] Grid visible on canvas, lines at 10mm spacing
- [ ] Mouse wheel zooms in/out, zoom follows cursor position
- [ ] Space+drag pans the canvas
- [ ] Press R, drag on canvas, rectangle appears with grid-snapped corners
- [ ] Press C, drag on canvas, circle/ellipse appears
- [ ] Shift+drag constrains circle to perfect circle and rectangle to square
- [ ] Press L, click twice, line appears between the two points
- [ ] Press V (or Escape), click a shape, selection handles appear
- [ ] Drag selected shape to move it, snaps to grid
- [ ] Drag corner handle to resize
- [ ] Shift+drag corner handle constrains aspect ratio
- [ ] Drag rotation handle to rotate
- [ ] Properties panel shows selected shape's position, size, rotation
- [ ] Edit a value in properties panel, shape updates immediately
- [ ] Press Delete, shape is removed
- [ ] Ctrl+Z undoes the deletion
- [ ] Ctrl+Shift+Z redoes it
- [ ] Ctrl+A selects all shapes
- [ ] Draw multiple shapes, drag a selection marquee around some, all enclosed shapes are selected
- [ ] Click "Export SVG", file downloads
- [ ] Open downloaded SVG in a browser, shapes match what was on canvas
- [ ] Open downloaded SVG in Inkscape, dimensions are in mm and correct
- [ ] Unit toggle in properties panel switches display between mm and inches
- [ ] Keyboard shortcuts don't fire while typing in a properties panel input
- [ ] `npx tsc --noEmit` passes clean

---

## Deployment note

This page has no server-side dependencies (no API routes, no database, no tracking). Floki deploys it the same way as any other page: commit to `main`, push, Vercel builds. No env vars needed, no migration scripts, no new npm packages.

The only potential friction: the studio layout opt-out from the site's root nav/footer. Claude Code should look at how `src/app/layout.tsx` currently works and pick the least-invasive approach to hide the nav and footer on `/studio`.

---

## For Claude Code

When you start implementing:

1. Read `src/app/layout.tsx` first. Understand how the site nav and footer are rendered. Decide how `/studio` opts out.
2. Build the data model and reducer in `src/lib/studio/` first. Get the types right. Write the undo/redo logic. This is the foundation.
3. Build a minimal canvas that renders a hardcoded rectangle. Get pan and zoom working. This proves the coordinate system.
4. Add the drawing tools one at a time. Rectangle first (simplest), then Circle, then Line.
5. Add selection and transformation (move, resize, rotate). This is the hardest part of Phase 1.
6. Add the properties panel.
7. Add SVG export.
8. Run `npx tsc --noEmit` and fix any issues.
9. Test locally with `npm run dev`.

Do not try to build everything at once. Build incrementally, test each piece, then move to the next.

---

*Phase 1 brief for the Jesper Makes 2D Design Studio. One route, zero dependencies, zero server calls. Just a canvas that draws shapes and exports SVG.*
