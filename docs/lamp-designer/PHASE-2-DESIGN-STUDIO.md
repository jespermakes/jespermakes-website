# PHASE-2-DESIGN-STUDIO.md

> Development brief for Phase 2 of the Jesper Makes 2D Design Studio.
> Phase 1 delivered a working canvas with drawing, selection, and SVG export.
> Phase 2 makes it feel like a real tool: text, visible grid, rulers, smart
> guides, copy/paste, polish, and precision.

---

## Read first

1. The Phase 1 code is already in the repo on branch `feature/studio-phase-1`.
   Start by reading what's there before changing anything.
2. Read `PHASE-1-DESIGN-STUDIO.md` if present in the workspace for context
   on the data model and architecture decisions.
3. This file, in full, before starting.

---

## Branch

Work on a new branch off the Phase 1 branch:

```bash
cd /home/jesper/claude-code-workspace/studio
git checkout feature/studio-phase-1
git pull origin feature/studio-phase-1
git checkout -b feature/studio-phase-2
```

If Phase 1 has already been merged to `main`, branch off `main` instead.

---

## What Phase 2 adds

Phase 2 has seven groups of changes. They can be built in this order:

1. **Grid visibility fix** (5 min)
2. **Rulers** (30 min)
3. **Text tool** (60 min)
4. **Copy/paste and duplicate** (20 min)
5. **Smart alignment guides** (45 min)
6. **Status bar and zoom controls** (20 min)
7. **Polish pass** (30 min)

Total: roughly 3-4 hours of Claude Code work. Build each group, run
`npx tsc --noEmit` after each, commit after each. Push when all seven
are done.

---

## 1. Grid visibility fix

The grid is currently almost invisible. Make it clearly visible without
being distracting.

**Changes to `grid-layer.tsx`:**

- Minor grid lines: change from 5% opacity to **15% opacity**. Color stays
  `#4A3228` (wood-light).
- Major grid lines (every 10th line): change to **30% opacity** and increase
  stroke width from the current value to **0.5px** in screen space.
- At very high zoom (above 10 px/mm), show sub-grid lines at 1mm spacing
  at 8% opacity. At low zoom (below 0.5 px/mm), hide minor lines entirely
  and only show major lines.
- The grid should feel like graph paper: clearly structured, but the shapes
  are always the dominant visual element.

**Test:** at default zoom, the 10mm grid should be immediately visible as
a light warm-toned graph-paper pattern on the cream background.

---

## 2. Rulers

Add rulers along the top and left edges of the canvas, showing measurements
in the current display unit (mm or inches).

**Layout change:**

```
┌──────────────────────────────────┐
│ ┌──┬────────────────────────┐    │
│ │  │  TOP RULER (horizontal) │    │
│ ├──┼────────────────────────┤    │
│ │L │                        │ P  │
│ │E │                        │ R  │
│ │F │       CANVAS            │ O  │
│ │T │                        │ P  │
│ │  │                        │ S  │
│ ├──┴────────────────────────┤    │
│ │        STATUS BAR          │    │
│ └────────────────────────────┘    │
└──────────────────────────────────┘
```

- Top ruler: 24px tall, spans the full width of the canvas area
- Left ruler: 24px wide, spans the full height of the canvas area
- Corner square (top-left, 24x24): shows the unit label ("mm" or "in"),
  clickable to toggle units
- Both rulers sit OUTSIDE the SVG canvas element, rendered as separate
  components (HTML `<canvas>` elements or styled divs with CSS)

**Ruler rendering:**

- Background: `#F5F0E8` (slightly darker than cream, so they're distinct)
- Tick marks and numbers in `wood-light` (#4A3228) at 60% opacity
- Major ticks every 10mm (or 1" in imperial), with the number label
- Minor ticks every 1mm (or 1/8" in imperial), shorter, no label
- Sub-ticks every 0.5mm at high zoom, just tiny dots
- A colored indicator line (amber, 1px) tracks the cursor position on
  both rulers as the mouse moves over the canvas
- Numbers are rendered in a small monospace font, 9px, upright on both
  rulers (the left ruler's numbers should be rotated to read vertically,
  or placed sideways — whatever is most readable)
- Rulers update smoothly during pan and zoom — they reflect the current
  viewport in document coordinates

**Implementation:** use HTML `<canvas>` elements overlaid on the layout.
They're cheaper to render than hundreds of DOM ticks, and they update
smoothly during pan/zoom via `requestAnimationFrame`. Wire them to the
same viewport state the SVG canvas uses.

**Create:** `src/components/studio/ruler.tsx`

---

## 3. Text tool

Add the ability to place and edit text on the canvas. This is the most
important new feature in Phase 2 — Jesper specifically asked for it.

### Adding the Text shape type

Extend the `ShapeType` union:

```typescript
type ShapeType = "rectangle" | "circle" | "line" | "text";
```

Add text-specific fields to the `Shape` interface:

```typescript
interface Shape {
  // ...existing fields...

  // Text-specific
  text?: string;             // the text content
  fontSize?: number;         // in mm (document units), default 10
  fontFamily?: string;       // default "Inter" (site's sans font)
  textAnchor?: "start" | "middle" | "end";  // horizontal alignment
}
```

### The Text tool (keyboard shortcut: T)

**Behavior:**

1. User selects the Text tool (click toolbar icon or press T)
2. User clicks on the canvas to place the text insertion point
3. A text shape is created at that position with placeholder text "Text"
4. The shape is immediately selected and the text is immediately editable
   (an inline contenteditable overlay appears on top of the SVG text,
   sized and positioned to match)
5. The user types their text. The shape updates in real-time.
6. Clicking outside the text (or pressing Escape) exits text editing mode
7. The tool switches back to Select

**Double-click to edit:** when in Select mode, double-clicking an existing
text shape enters text editing mode for that shape.

**Rendering:**

In the SVG canvas, text shapes render as `<text>` elements:

```tsx
<text
  x={shape.x}
  y={shape.y}
  fontSize={shape.fontSize}
  fontFamily={shape.fontFamily ?? "Inter, sans-serif"}
  textAnchor={shape.textAnchor ?? "middle"}
  dominantBaseline="central"
  fill={shape.stroke}          // text color uses the stroke color
  transform={`rotate(${shape.rotation}, ${shape.x}, ${shape.y})`}
>
  {shape.text}
</text>
```

**The inline editor overlay:**

When editing text, render an HTML `<div contentEditable>` positioned
absolutely over the SVG text element. It must:

- Match the position, size, font, and zoom of the SVG text exactly
- Have a transparent background so the canvas shows through
- Show a blinking cursor
- Handle multi-line text (Enter creates a new line, rendered as separate
  `<tspan>` elements in the SVG)
- Sync its content back to the shape on every keystroke

This is the trickiest part of the text tool. The overlay needs to stay
precisely aligned with the SVG text as the user types, pans, or zooms.
A simpler alternative if alignment proves too difficult: instead of an
overlay, show a textarea in the properties panel that edits the selected
text shape's content. Less elegant but more reliable. Start with the
overlay approach; fall back to the properties-panel approach if it takes
more than an hour to get the alignment right.

**Properties panel for text:**

When a text shape is selected, show:

- Text content (textarea, multi-line)
- Font size (number input, in current display units)
- Font family (dropdown: Inter, Playfair Display, monospace, or free text input)
- Text alignment (three toggle buttons: left, center, right)
- Position X, Y (same as other shapes)
- Rotation

**SVG export:**

Text shapes export as `<text>` elements with proper font attributes.
Note in the properties panel or export dialog: "Text in the exported SVG
requires the font to be installed on the machine that opens the file.
For CNC/laser use, convert text to paths in your CAM software."

Outlined/vectorized text export (converting fonts to paths) is a Phase 3+
feature. For now, export as `<text>` elements.

### Toolbar update

Add a Text tool button between Line and the separator. Icon: a capital
letter "A" in the toolbar's icon style. Keyboard shortcut shown in
tooltip: "Text (T)".

---

## 4. Copy/paste and duplicate

### Copy (Ctrl+C / Cmd+C)

When shapes are selected and the user presses Ctrl+C:

- Store the selected shapes' data in a module-level variable (not the
  system clipboard — clipboard API has async permission issues and we're
  only copying within the app)
- Show a brief toast or flash ("Copied" text that fades after 1 second)

### Paste (Ctrl+V / Cmd+V)

When the user presses Ctrl+V and there are copied shapes:

- Create new shapes from the copied data with new IDs
- Offset them by (+10mm, +10mm) from the originals so they're visibly
  distinct
- Select the newly pasted shapes
- Push to undo history

### Duplicate (Ctrl+D / Cmd+D)

Same as copy+paste in one step. Duplicates the selected shapes with
(+10mm, +10mm) offset, selects the duplicates.

### Cut (Ctrl+X / Cmd+X)

Copy the selected shapes, then delete them.

### Keyboard handler update

Add these shortcuts to the existing keyboard handler in the studio page.
Remember to skip them when an input field or the text editor is focused.

---

## 5. Smart alignment guides

When moving or drawing a shape, show dynamic guide lines that indicate
alignment with other shapes on the canvas. This is the feature that makes
a vector editor feel professional.

### What triggers guides

During a move or resize operation, for each edge and center of the shape
being moved, check against every other shape's edges and centers:

- Left edge, right edge, horizontal center
- Top edge, bottom edge, vertical center

If any of these are within a snap threshold (2mm in document space or
6px in screen space, whichever is larger), show a guide line and snap
the shape to the exact alignment.

### Visual appearance

- Guide lines: thin (1px screen space), colored amber (`#C17F3C`),
  dashed (`strokeDasharray="4 4"`)
- Guide lines extend across the full visible canvas (not just between
  the two aligned shapes)
- Show small distance labels (e.g. "10.0") in amber when shapes are
  evenly spaced? No — that's v3. Just the lines for now.

### Implementation

Create `src/lib/studio/guides.ts`:

```typescript
interface GuideLine {
  axis: "horizontal" | "vertical";
  position: number;  // in document mm
}

function findAlignmentGuides(
  movingShapes: Shape[],
  allShapes: Shape[],
  threshold: number
): GuideLine[] {
  // For each edge/center of the moving shapes' combined bounding box,
  // check against each edge/center of every non-moving shape.
  // Return guide lines for any alignment within threshold.
}

function snapToGuides(
  position: { x: number; y: number },
  guides: GuideLine[],
  threshold: number
): { x: number; y: number; activeGuides: GuideLine[] } {
  // Snap the position to the nearest guide if within threshold.
  // Return the snapped position and which guides are active.
}
```

Render active guide lines in the `ToolOverlay` component as thin dashed
lines spanning the viewport.

**Smart guides take priority over grid snap.** If a smart guide is within
threshold, snap to it instead of the grid. If no smart guide is close,
fall back to grid snap (if enabled).

---

## 6. Status bar and zoom controls

Add a thin status bar at the bottom of the studio layout, below the canvas.

### Layout

- Height: 28px
- Background: same as rulers (`#F5F0E8`)
- Border-top: `border-wood/[0.08]`
- Text: `text-[11px] text-wood-light/60 font-mono`

### Contents (left to right)

1. **Cursor position:** "X: 142.5  Y: 87.0 mm" — updates as the mouse
   moves over the canvas. Shows in current display units.

2. **Selection info** (when shapes are selected): "1 shape selected" or
   "3 shapes selected" or "Rectangle 45 × 30 mm"

3. **Spacer** (pushes the rest to the right)

4. **Zoom controls:**
   - "−" button (zoom out one step)
   - Zoom percentage display (e.g. "150%"), clickable to reset to 100%
   - "+" button (zoom in one step)
   - "Fit all" button (icon or text, zooms to show all shapes with padding)

### Zoom percentage

Calculate from the current `zoom` value (pixels per mm). Define 100% as
the zoom level where 1mm on screen equals approximately 1mm on a 96dpi
display (roughly 3.78 px/mm). So:

```typescript
const zoomPercent = Math.round((zoom / 3.78) * 100);
```

### Fit All

When clicked, calculate the bounding box of all shapes, add 20mm padding,
and set the viewport to show that region. If no shapes exist, show the
area around the origin (say, -100 to +100 in both axes).

Add keyboard shortcut: Ctrl+0 (zero) for Fit All.

**Create:** `src/components/studio/status-bar.tsx`

---

## 7. Polish pass

Small improvements across the whole studio that collectively make it
feel much more professional.

### Cursor feedback

Change the cursor based on context:

- Default (no tool, hovering canvas): `crosshair`
- Select tool, hovering empty canvas: `default`
- Select tool, hovering a shape: `move`
- Select tool, hovering a resize handle: `nw-resize`, `ne-resize`,
  `n-resize`, `e-resize`, etc. (directional resize cursors matching
  which handle is hovered)
- Select tool, hovering the rotation handle: `grab`
- Drawing tools (Rect, Circle, Line, Text): `crosshair`
- Pan mode (Space held): `grab`, and while actively dragging: `grabbing`

Set cursors via CSS on the SVG element and on the handle elements.

### Selection highlight

Currently selected shapes get a blue overlay. Improve:

- Blue selection stroke: change to a bright, distinct blue like `#2563EB`
  (not too light, not too dark), 1.5px screen width
  (`vector-effect="non-scaling-stroke"`)
- Add a subtle fill highlight: `fill="#2563EB"` at 4% opacity on selected
  shapes, so the selection is visible even on unfilled shapes

### Handle appearance

- Resize handles: 7x7px white squares with a 1px `#2563EB` border
  (crisp and visible against any background)
- Rotation handle: 7px diameter white circle with blue border, positioned
  20px above the top edge, connected by a thin blue line
- All handles use `vector-effect="non-scaling-stroke"` and are sized in
  screen pixels (they stay the same size regardless of zoom)

### Toolbar tooltips

If not already present, ensure every toolbar button shows a tooltip on
hover with the tool name and keyboard shortcut:

- "Select (V)"
- "Rectangle (R)"
- "Circle (C)"
- "Line (L)"
- "Text (T)"
- "Undo (Ctrl+Z)"
- "Redo (Ctrl+Shift+Z)"
- "Export SVG"

Tooltips: small floating div that appears to the right of the button
after a 500ms hover delay. `bg-wood text-cream text-xs px-2 py-1
rounded shadow-lg`. Disappears on mouseout.

### Keyboard shortcut: Escape

Pressing Escape should:

1. If currently editing text: exit text editing mode
2. If shapes are selected: deselect all
3. If a drawing tool is active: switch to Select tool
4. If in the middle of a draw operation (dragging): cancel the operation

Process in that priority order (first matching condition wins).

### Canvas origin marker

Draw a small crosshair at the origin (0, 0) — two thin lines, 10mm long,
in wood-light at 20% opacity. This gives the user an anchor point on the
infinite canvas. The crosshair should be behind all shapes but above the
grid.

### Zoom to cursor

Double-check that zoom centers on the cursor position (not on the center
of the viewport). This was specified in Phase 1 but is the single most
common thing that feels wrong if it's off. Test by zooming in on a shape
in the corner of the viewport — the shape should stay under the cursor.

### Properties panel: empty state

When nothing is selected and the user first opens the studio, the
properties panel should show a welcoming empty state:

```
Draw something to get started.

R  Rectangle
C  Circle
L  Line
T  Text
```

Small text, centered, in wood-light/40. Acts as a quick-reference for
keyboard shortcuts.

---

## What NOT to build in Phase 2

Still out of scope:

- Boolean operations (union, intersection, difference)
- Bezier curves / pen tool
- SVG import / DXF import
- Cut types, depths, kerf, dogbones, tabs
- Plan mode or Review mode
- Layers panel
- Part nesting
- Parametric variables
- Cloud save / user accounts
- Tracking events
- Mobile touch gestures
- Multi-page documents
- Group/ungroup
- Outlined text export (text-to-paths)
- Polygon tool (regular polygons with N sides)
- Arc tool
- Measurement tool / dimension annotations

---

## Testing checklist

After building, verify:

### Grid
- [ ] Grid is clearly visible at default zoom (10mm squares, warm graph-paper feel)
- [ ] Major grid lines (100mm) are more prominent than minor lines
- [ ] At high zoom, 1mm sub-grid appears
- [ ] At low zoom, minor lines hide and only major lines remain

### Rulers
- [ ] Top ruler shows mm tick marks that match the canvas grid
- [ ] Left ruler shows mm tick marks
- [ ] Both rulers scroll/pan with the canvas
- [ ] Amber cursor indicator tracks mouse position on both rulers
- [ ] Corner square shows "mm", clicking it toggles to "in" and back
- [ ] Ruler numbers are readable and correctly positioned

### Text tool
- [ ] Press T, click canvas, text shape appears with "Text" as content
- [ ] Text is immediately editable (cursor blinking, can type)
- [ ] Click outside or press Escape exits editing
- [ ] Double-click an existing text shape to re-edit
- [ ] Properties panel shows font size, family, alignment for text shapes
- [ ] Text renders in the exported SVG
- [ ] Multi-line text works (Enter key)

### Copy/paste
- [ ] Select a shape, Ctrl+C, Ctrl+V — duplicate appears offset by 10mm
- [ ] Ctrl+D duplicates in one step
- [ ] Ctrl+X cuts (copies then deletes)
- [ ] Pasting selects the new shapes
- [ ] Undo reverses a paste

### Smart guides
- [ ] Draw two rectangles. Move one toward the other. When edges align,
      an amber dashed guide line appears and the shape snaps to alignment.
- [ ] Guides appear for: left edge, right edge, top edge, bottom edge,
      horizontal center, vertical center
- [ ] Guides disappear when the shape moves away from alignment
- [ ] Smart guides take priority over grid snap when close

### Status bar
- [ ] Shows cursor position in mm as mouse moves
- [ ] Shows selection info when shapes are selected
- [ ] Zoom −/+ buttons work
- [ ] Zoom percentage display is accurate
- [ ] Clicking the percentage resets to 100%
- [ ] "Fit all" zooms to show all shapes
- [ ] Ctrl+0 triggers Fit All

### Polish
- [ ] Cursor changes appropriately (crosshair for draw tools, move for
      hovering shapes, resize for handles, grab for rotation)
- [ ] Selection highlight is clearly visible (blue stroke + subtle fill)
- [ ] Handles are crisp white squares with blue borders
- [ ] Rotation handle is above the shape with a connecting line
- [ ] Toolbar tooltips show on hover with shortcuts
- [ ] Escape deselects / cancels / exits text editing (priority order)
- [ ] Origin crosshair visible at (0,0)
- [ ] Properties panel shows shortcut hints when nothing is selected
- [ ] Zoom follows cursor position (not viewport center)

### Regression
- [ ] All Phase 1 features still work: draw rect, circle, line, select,
      move, resize, rotate, delete, undo, redo, export SVG
- [ ] `npx tsc --noEmit` passes clean
- [ ] `npm run build` succeeds

---

## Deployment

Same as Phase 1: push the branch, Vercel auto-builds a preview URL.
Jesper reviews the preview. When approved, Floki merges to main.

No new npm packages. No database changes. No env vars. No API routes.
Pure client-side.

---

## For Claude Code

Build order recommendation:

1. Grid visibility fix (smallest change, immediate visual win)
2. Status bar and zoom controls (sets up the layout for rulers)
3. Rulers (depends on the new layout structure)
4. Text tool (biggest new feature, tackle while fresh)
5. Copy/paste (quick win, mechanical)
6. Smart alignment guides (geometry-heavy, save for when the simpler
   stuff is done)
7. Polish pass (final sweep, touches many files but each change is small)

Commit after each group. Run `tsc` after each. Push when all seven
are done.

If the inline text editing overlay proves too difficult to align
precisely with the SVG text (font metrics, zoom scaling, position
drift), fall back to editing text through the properties panel only.
A working text tool with panel-based editing is better than a broken
inline editor. Ship the working version; inline editing can be added
in Phase 3 as a refinement.

---

*Phase 2 brief for the Jesper Makes 2D Design Studio. Seven groups of
changes that turn a working prototype into something that feels like
a real design tool.*
