# PHASE-4-DESIGN-STUDIO.md

> Development brief for Phase 4 of the Jesper Makes 2D Design Studio.
> Phases 1-3 built the drawing tools. Phase 4 makes the studio a real
> product: cloud save, user accounts, export profiles for different
> machines, discoverability for beginners, and corner radius on rectangles.
> After this phase, users have a reason to create an account and a reason
> to come back.

---

## Read first

1. The existing studio code in the repo (Phases 1-3 merged).
2. `JESPER-MAKES-DEV-HANDOFF.md` for the site's auth system, database
   schema, and deployment patterns.
3. This file, in full, before starting.

---

## Branch

```bash
cd /home/jesper/claude-code-workspace/studio
git checkout main
git pull origin main
git checkout -b feature/studio-phase-4
```

---

## What Phase 4 adds

Nine groups:

1. **Corner radius on rectangles** (30 min)
2. **Right-click context menu** (45 min)
3. **Shortcut hints and onboarding** (45 min)
4. **Design file format** (30 min)
5. **Database schema for designs** (30 min)
6. **Save/load API routes** (45 min)
7. **Cloud save UI** (60 min)
8. **My Designs page** (45 min)
9. **Export profiles** (60 min)

Total: roughly 7-8 hours of Claude Code work.

---

## 1. Corner radius on rectangles

Add a `cornerRadius` property to rectangles that rounds the corners.

### Data model

Add to Shape:

```typescript
interface Shape {
  // ...existing fields...

  cornerRadius?: number;     // in mm, default 0. Only applies to rectangles.
}
```

### Rendering

In `shape-renderer.tsx`, when rendering a rectangle with `cornerRadius > 0`,
use the SVG `rx` and `ry` attributes:

```tsx
<rect
  x={shape.x - shape.width / 2}
  y={shape.y - shape.height / 2}
  width={shape.width}
  height={shape.height}
  rx={shape.cornerRadius}
  ry={shape.cornerRadius}
  // ...other attributes
/>
```

Clamp `cornerRadius` to `Math.min(shape.width, shape.height) / 2` so
the radius never exceeds what the shape can physically display.

### Properties panel

When a rectangle is selected, add a "Corner radius" field below Width
and Height:

- Number input, in current display units (mm or inches)
- Default: 0 (sharp corners)
- Minimum: 0
- Maximum: auto-clamped to half the smallest dimension
- A small slider next to the input for quick adjustment (range 0 to max)

### Visual handle (optional but nice)

When a rectangle with corner radius > 0 is selected, show a small
circular drag handle at the inner edge of the top-left corner radius.
Dragging it left/right adjusts the corner radius interactively. This is
how Figma and Sketch handle corner radius and it's very intuitive.

If this takes more than 30 minutes to implement, skip it and rely on
the properties panel input only. The handle can come in a later polish
pass.

### SVG export

Rectangles with corner radius export as `<rect rx="..." ry="...">`.
Standard SVG, no special handling needed.

---

## 2. Right-click context menu

A right-click context menu makes features discoverable without the user
needing to memorize shortcuts.

### When right-clicking on a shape (selected or not)

If the shape isn't selected, select it first, then show the menu.

Menu items:

```
Cut                    Ctrl+X
Copy                   Ctrl+C
Paste                  Ctrl+V
Duplicate              Ctrl+D
──────────
Delete                 Del
──────────
Edit Nodes             Enter
Convert to Path
──────────
Bring to Front
Send to Back
```

### When right-clicking on empty canvas

```
Paste                  Ctrl+V
──────────
Select All             Ctrl+A
Fit All                Ctrl+0
──────────
Grid Settings...
```

"Grid Settings..." opens the properties panel (if closed) scrolled to
the grid/document section.

### When right-clicking with multiple shapes selected

```
Cut                    Ctrl+X
Copy                   Ctrl+C
Duplicate              Ctrl+D
──────────
Delete                 Del
──────────
Union
Difference
Intersection
──────────
Bring to Front
Send to Back
```

### Implementation

Create `src/components/studio/context-menu.tsx`.

- The menu is an absolutely-positioned div rendered on top of everything
- Appears at the cursor position on `contextmenu` event
- Disappears on any click (inside or outside the menu), on Escape, or
  on scroll/pan
- Each item shows the action name on the left and the shortcut on the
  right (in a muted color)
- Grayed-out items that don't apply (e.g. "Paste" when nothing has been
  copied, "Edit Nodes" on a text shape)
- Style: `bg-white rounded-xl shadow-xl border border-wood/[0.08]`,
  items are `px-4 py-2 text-sm text-wood hover:bg-wood/[0.04]`

### Bring to Front / Send to Back

These change the z-order of shapes. Implement by moving the shape to the
end (front) or beginning (back) of the `shapes` array in the document.
SVG renders later elements on top of earlier ones, so array order = z-order.

Add these as reducer actions:

```typescript
case "BRING_TO_FRONT":
  // Remove shape from its current position, push to end
case "SEND_TO_BACK":
  // Remove shape from its current position, unshift to beginning
```

---

## 3. Shortcut hints and onboarding

Make the studio approachable for first-time users without adding clutter
for experienced users.

### Welcome overlay (first visit only)

When a user visits `/studio` for the first time (check `localStorage`
for a `studio_onboarding_seen` flag), show a centered overlay card:

```
┌─────────────────────────────────────────┐
│                                         │
│   Jesper Makes Studio                   │
│   Free 2D design for makers             │
│                                         │
│   Quick start:                          │
│                                         │
│   R  Draw a rectangle                   │
│   C  Draw a circle                      │
│   L  Draw a line                        │
│   P  Draw with the pen                  │
│   T  Place text                         │
│   V  Select and move                    │
│                                         │
│   Space + drag to pan                   │
│   Scroll to zoom                        │
│   Right-click for more options          │
│                                         │
│   [Start drawing]                       │
│                                         │
└─────────────────────────────────────────┘
```

- Translucent dark backdrop behind the card
- The card uses the standard design tokens (cream bg, wood text, amber
  accent on the button)
- Clicking "Start drawing" or pressing any key dismisses it and sets
  `localStorage.studio_onboarding_seen = "1"`
- The overlay does NOT show if the flag is already set
- A "?" help button at the bottom of the toolbar re-shows this overlay
  at any time

### Toolbar shortcut badges

Each toolbar button already has a tooltip (from Phase 2). Additionally,
show the keyboard shortcut letter as a small badge in the bottom-right
corner of each tool button:

- 8px circle or square, `bg-white/20 text-[9px] text-cream/70`
- Shows: V, R, C, L, P, A, G, T (matching each tool's shortcut)
- These are always visible, not just on hover

This teaches shortcuts passively without getting in the way.

### Status bar hints

When the status bar has no contextual information to show (no shapes
selected, cursor not tracked), show a rotating hint:

- "Right-click for options"
- "Space + drag to pan the canvas"
- "Ctrl+D to duplicate selected shapes"
- "Double-click a shape to edit its nodes"
- "Ctrl+Z to undo"

Cycle through these every 8 seconds. Use a gentle fade transition.
Stop cycling once the user has performed any action (they don't need
hints anymore for this session).

### Tool-specific cursor hints

When a drawing tool is active and the user hasn't started drawing yet,
show a small floating label near the cursor:

- Rectangle tool: "Click and drag to draw"
- Circle tool: "Click and drag to draw"
- Line tool: "Click to set start point"
- Pen tool: "Click to place points, drag for curves"
- Text tool: "Click to place text"

The hint disappears as soon as the user starts the action (pointer down)
and doesn't come back until the tool is switched.

Implementation: a small `<div>` positioned at `cursor + (15px, 15px)`,
rendered only when the tool is active and no interaction is in progress.
Style: `bg-wood/80 text-cream text-xs px-2 py-1 rounded shadow-sm`

---

## 4. Design file format

Before building cloud save, define what a saved design looks like.

### The .jm format (JSON)

A design file is a JSON object:

```typescript
interface StudioDesignFile {
  version: 1;
  name: string;
  description?: string;
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  canvasSettings: {
    gridSpacing: number;      // mm
    snapToGrid: boolean;
    unitDisplay: "mm" | "in";
  };
  shapes: Shape[];            // the full shapes array
}
```

### Local save/load (works without an account)

Add two actions accessible from the toolbar or a File menu:

- **Save to file:** serializes the current document as `.jm` JSON and
  triggers a browser download. Filename: `{designName}.jm.json` (the
  `.json` suffix ensures the OS recognizes it as openable).

- **Open from file:** file picker for `.jm.json` files. Parses the JSON
  and loads the shapes into the editor, replacing the current document
  (with an "unsaved changes" warning if applicable).

This gives every user (logged in or not) the ability to save and resume
work. Cloud save builds on top of this format.

### File: `src/lib/studio/file-format.ts`

---

## 5. Database schema for designs

### New table

Add to `src/lib/db/schema.ts`:

```typescript
export const studioDesigns = pgTable("studio_designs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Untitled"),
  description: text("description").default(""),
  // The full design data as JSON (shapes array + canvas settings).
  // Stored as JSONB for queryability, but in practice we read/write
  // the whole blob at once.
  data: jsonb("data").$type<StudioDesignFile>().notNull(),
  // Thumbnail: a small PNG data URL or Vercel Blob URL for the design
  // list view. Generated client-side by rendering the shapes to a
  // small canvas and converting to a data URL.
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

Run the Drizzle migration after adding this.

### Design limits

For v1, no limit on the number of saved designs per user. If this
becomes a storage problem later, add a limit (50 designs per free user,
unlimited for newsletter subscribers, something like that). Don't build
the limit system now.

---

## 6. Save/load API routes

### `POST /api/studio/designs` — create a new design

```typescript
// Body: { name: string, data: StudioDesignFile, thumbnail?: string }
// Returns: { design: { id, name, updatedAt } }
// Auth: required (logged-in users only)
```

### `GET /api/studio/designs` — list user's designs

```typescript
// Returns: { designs: [{ id, name, thumbnail, updatedAt }] }
// Auth: required
// Sorted by updatedAt DESC (most recently edited first)
// Does NOT return the full data blob (too large for a list view)
```

### `GET /api/studio/designs/[id]` — load a single design

```typescript
// Returns: { design: { id, name, data, updatedAt } }
// Auth: required, must be the owner
// Returns the full data blob
```

### `PATCH /api/studio/designs/[id]` — update (save)

```typescript
// Body: { name?: string, data?: StudioDesignFile, thumbnail?: string }
// Returns: { design: { id, name, updatedAt } }
// Auth: required, must be the owner
// Updates updatedAt automatically
```

### `DELETE /api/studio/designs/[id]` — delete a design

```typescript
// Returns: { ok: true }
// Auth: required, must be the owner
```

### Files

```
src/app/api/studio/designs/route.ts         — POST (create) + GET (list)
src/app/api/studio/designs/[id]/route.ts    — GET (load) + PATCH (save) + DELETE
```

### Auto-save

The studio should auto-save to the server every 30 seconds if:
1. The user is logged in
2. The design has been saved at least once (has an ID)
3. There are unsaved changes since the last save

Show a subtle indicator in the top bar: "Saving..." during save,
"Saved" after success, "Unsaved changes" when there are local changes.

Do NOT auto-save if the user hasn't explicitly saved yet (don't create
a design without the user's intent). The first save is always manual
(user clicks "Save" or Ctrl+S).

---

## 7. Cloud save UI

### Top bar

Replace the minimal logo-only top area with a proper top bar inside
the studio layout:

```
┌──────────────────────────────────────────────────────────┐
│ [JM logo]  Design name (editable)     Saved ✓   [Save]  │
│                                        [Sign in]         │
└──────────────────────────────────────────────────────────┘
```

- **Logo:** small Jesper Makes wordmark, links to `/`
- **Design name:** inline-editable text field. Default: "Untitled".
  Click to edit. Press Enter or click away to confirm. Renaming triggers
  a save if the design has an ID.
- **Save status:** "Saved" (with a subtle checkmark) / "Saving..." /
  "Unsaved changes" / "Not saved yet"
- **Save button:** if the design has never been saved, shows "Save" (amber
  button). After the first save, becomes less prominent (the auto-save
  handles it). Keyboard shortcut: Ctrl+S.
- **Sign in:** if the user is NOT logged in, show a "Sign in to save"
  link that goes to `/login?callbackUrl=/studio`. If logged in, show
  their avatar or email initial.

### Height: 40px. Background: white with bottom border.

The top bar sits above the rulers (between the admin-style header area
and the canvas). It does NOT replace the toolbar on the left.

### Layout update

```
┌──────────────────────────────────────────┐
│           TOP BAR (40px)                 │
├──┬──┬────────────────────────┬───────────┤
│  │RU│                        │           │
│TB│LR│       CANVAS           │ PROPS     │
│  │  │                        │           │
├──┴──┴────────────────────────┴───────────┤
│           STATUS BAR (28px)              │
└──────────────────────────────────────────┘
```

### Save flow

**First save (no ID yet):**

1. User presses Ctrl+S or clicks "Save"
2. If not logged in: redirect to `/login?callbackUrl=/studio` with the
   current design serialized in `sessionStorage` so it survives the
   auth redirect. After login, the redirect brings them back to `/studio`
   which checks `sessionStorage` and restores the design.
3. If logged in: POST to `/api/studio/designs` with the design data.
   The response includes the new design ID. Store it in the React state.
   URL updates to `/studio?id={designId}` (shallow push, no reload).
   Save status changes to "Saved".

**Subsequent saves:**

1. Auto-save every 30 seconds if changes exist, or manual Ctrl+S
2. PATCH to `/api/studio/designs/{id}`
3. Save status flashes "Saving..." then "Saved"

**Loading a saved design:**

1. If the URL has `?id={designId}`, fetch it on mount via
   `GET /api/studio/designs/{id}`
2. Load the shapes and canvas settings into the reducer
3. Set the design name in the top bar
4. If the fetch fails (404, 403), show an error toast and start with
   a blank canvas

### New design

Add a "New" option (Ctrl+N or from the logo menu):

1. If there are unsaved changes, prompt: "You have unsaved changes.
   Save before creating a new design?" with Save / Don't Save / Cancel.
2. Clear the canvas, reset the design name to "Untitled", clear the
   design ID from state and URL.

### Open an existing design

Add an "Open" option (Ctrl+O):

1. If the user is logged in, show a modal with their saved designs
   (fetched from GET `/api/studio/designs`). Each design shows its
   thumbnail, name, and last-modified date.
2. Click a design to load it.
3. If the user is not logged in, show the file picker for local `.jm.json`
   files instead.

---

## 8. My Designs page

A page at `/studio/designs` (or `/my-designs`) that shows all of a
user's saved designs in a grid. This is the "home base" for the studio.

### Layout

Uses the site's normal layout (header + footer, not the full-viewport
studio layout). Requires auth; redirects to `/login` if not logged in.

### Content

```
My Designs                                    [+ New Design]

┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│thumb │  │thumb │  │thumb │  │thumb │
│      │  │      │  │      │  │      │
├──────┤  ├──────┤  ├──────┤  ├──────┤
│Name  │  │Name  │  │Name  │  │Name  │
│2d ago│  │1w ago│  │2w ago│  │1mo   │
└──────┘  └──────┘  └──────┘  └──────┘
```

- Grid of design cards, 4 columns on desktop, 2 on mobile
- Each card shows: thumbnail (rendered from the saved thumbnail data URL),
  design name, relative time since last edit
- Click a card to open it in the studio (`/studio?id={designId}`)
- Right-click or long-press on a card for: Rename, Duplicate, Delete
- "+ New Design" button opens `/studio` with a blank canvas
- If the user has no designs yet, show a friendly empty state:
  "No designs yet. Create your first one." with a big [+ New Design] button.

### File

```
src/app/studio/designs/page.tsx
```

This page uses the site's normal layout (with nav and footer), unlike
the studio canvas page.

---

## 9. Export profiles

This is the beginning of the "connect" story. Instead of a single
"Export SVG" button, the studio offers machine-specific export profiles
that produce SVGs optimized for different tools.

### Available profiles

**Generic SVG (default)**
- Same as current export: clean SVG with mm units
- No machine-specific encoding
- Works with any software that opens SVGs

**Shaper Origin**
- SVG with Shaper-compatible color encoding:
  - Black (#000000) strokes = interior cuts
  - Blue (#0000FF) strokes = exterior cuts (outside the line)
  - Red (#FF0000) strokes = on-the-line cuts
  - Gray (#808080) strokes = guide lines (not cut)
- Adds `shaper:cutDepth` attributes if cut depths are assigned (Phase 5)
- File extension: `.svg` (Shaper Origin reads standard SVGs with color
  encoding)

**Laser cutter**
- SVG with hairline strokes (0.001mm) in pure colors
  - Red (#FF0000) = cut
  - Blue (#0000FF) = engrave/score
  - Black (#000000) = raster engrave
- This is the convention most laser software (LightBurn, LaserGRBL,
  Glowforge) expects
- No fill on cut paths; filled paths indicate raster areas

**CNC router (Vectric / Easel)**
- Clean SVG or DXF with:
  - Closed paths only (open paths are closed or removed with a warning)
  - No overlapping paths
  - Paths grouped by intended operation
- A "Job sheet" sidecar JSON file with:
  - Material thickness
  - Bit diameter
  - Recommended speeds/feeds (if known)
  - Cut type assignments per path group

### UI

Replace the single "Export SVG" toolbar button with an export dropdown
or modal:

**Option A — Dropdown from the toolbar button:**

Click "Export" → dropdown appears:

```
Export as...
──────────
  Generic SVG
  Shaper Origin SVG
  Laser Cutter SVG
  CNC Router SVG
──────────
  Save to file (.jm)
```

Each option triggers the export with the appropriate profile. The last
used profile is remembered (localStorage) and becomes the default.

**Option B — Export modal (richer, better for explanation):**

Click "Export" → a modal appears showing the profile options as cards:

```
┌─────────────────────────────────────────────────┐
│  Export your design                              │
│                                                  │
│  ┌────────────┐  ┌────────────┐                  │
│  │ Generic    │  │ Shaper     │                  │
│  │ SVG        │  │ Origin     │                  │
│  │            │  │            │                  │
│  │ Works with │  │ Color-     │                  │
│  │ everything │  │ encoded    │                  │
│  │            │  │ for Origin │                  │
│  │ [Download] │  │ [Download] │                  │
│  └────────────┘  └────────────┘                  │
│                                                  │
│  ┌────────────┐  ┌────────────┐                  │
│  │ Laser      │  │ CNC        │                  │
│  │ Cutter     │  │ Router     │                  │
│  │            │  │            │                  │
│  │ Hairline   │  │ Closed     │                  │
│  │ strokes    │  │ paths +    │                  │
│  │ for LB/GF  │  │ job sheet  │                  │
│  │ [Download] │  │ [Download] │                  │
│  └────────────┘  └────────────┘                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

**My recommendation: Option A (dropdown) for v1.** It's faster to use
and matches the toolbar paradigm. The modal is better for explaining
what each profile does but adds clicks to the most common action. Add
the modal in a later polish phase if users need the explanation.

### Implementation

Create `src/lib/studio/export-profiles.ts`:

```typescript
type ExportProfile = "generic" | "shaper-origin" | "laser" | "cnc-router";

function exportWithProfile(shapes: Shape[], profile: ExportProfile): string {
  switch (profile) {
    case "generic":
      return exportGenericSVG(shapes);
    case "shaper-origin":
      return exportShaperOriginSVG(shapes);
    case "laser":
      return exportLaserSVG(shapes);
    case "cnc-router":
      return exportCNCRouterSVG(shapes);
  }
}
```

**For Phase 4, the profile logic is mostly about stroke color and width
mapping.** True cut-type assignment (inside/outside/on-line/pocket) comes
in Phase 5 when Manufacturing Mode is built. For now, the profiles use
a best-guess mapping:

- Filled shapes → raster/pocket
- Unfilled shapes with visible stroke → cut
- The user can override stroke colors manually before exporting

This is an 80% solution. The 20% (proper cut-type assignment UI) comes
in Phase 5.

### CNC Router job sheet

When exporting with the CNC router profile, also download a `.json`
sidecar file:

```json
{
  "generator": "Jesper Makes Studio",
  "version": 1,
  "designName": "my-design",
  "exportDate": "2026-04-28T12:00:00Z",
  "units": "mm",
  "boundingBox": {
    "width": 300,
    "height": 200
  },
  "shapes": [
    {
      "id": "abc123",
      "type": "rectangle",
      "suggestedCutType": "profile",
      "dimensions": { "width": 50, "height": 30 }
    }
  ],
  "notes": "Generated by Jesper Makes Studio. Open the SVG in your CAM software and assign toolpaths."
}
```

---

## What NOT to build in Phase 4

- Cut type assignment UI (inside/outside/on-line/pocket/guide) — Phase 5
- Kerf compensation — Phase 5
- Dogbone fillets — Phase 5
- Tab/bridge generation — Phase 5
- Plan mode / Review mode — Phase 5
- Part nesting (SVGNest) — Phase 5+
- Parametric variables — Phase 6
- Real-time collaboration (multiplayer editing) — much later
- Direct machine connection (Shaper Origin WiFi sync, USB) — much later;
  for now, export profiles are the bridge
- Design sharing (public URLs for designs) — v2
- Version history / revision tracking — v2
- Design templates (pre-built starting points) — v2
- DXF export — Phase 5 (alongside manufacturing features)
- Offline mode / service worker — v2

---

## New npm dependencies

None for Phase 4. The save/load system uses the existing database stack
(Drizzle, Postgres). The export profiles are pure string manipulation.

---

## New environment variable

None. The studio uses the existing `POSTGRES_URL` and auth system.

---

## Testing checklist

### Corner radius
- [ ] Select a rectangle, properties panel shows "Corner radius" field
- [ ] Set corner radius to 5mm: rectangle corners become rounded
- [ ] Increase corner radius to max: it never exceeds half the smaller dimension
- [ ] Corner radius exports correctly as `<rect rx="5" ry="5">` in SVG
- [ ] Corner radius is preserved after undo/redo, save/load

### Right-click context menu
- [ ] Right-click a shape: menu appears with Cut, Copy, Paste, Duplicate, Delete, Edit Nodes, etc.
- [ ] Right-click empty canvas: menu shows Paste, Select All, Fit All
- [ ] Right-click with multiple shapes selected: menu includes boolean operations
- [ ] Click a menu item: action executes, menu closes
- [ ] Click outside menu or press Escape: menu closes
- [ ] "Bring to Front" and "Send to Back" change shape z-order
- [ ] Keyboard shortcuts shown in menu items are correct

### Shortcut hints and onboarding
- [ ] First visit to `/studio`: welcome overlay appears with shortcut list
- [ ] Click "Start drawing" or press a key: overlay dismisses
- [ ] Refresh the page: overlay does NOT appear again
- [ ] Click the "?" button in the toolbar: overlay re-appears
- [ ] Toolbar buttons show small shortcut letter badges (V, R, C, L, P, etc.)
- [ ] Status bar shows rotating hint text when idle
- [ ] Drawing tools show cursor hint ("Click and drag to draw") before first action
- [ ] Cursor hint disappears once user starts drawing

### Save to file / Open from file
- [ ] Ctrl+S when not logged in: downloads a `.jm.json` file
- [ ] Open a `.jm.json` file: shapes load into the editor
- [ ] Save and reopen: all shapes, positions, styles, text content preserved
- [ ] Corner radius preserved in save/load

### Cloud save (logged in)
- [ ] Log in, open `/studio`, draw something, press Ctrl+S
- [ ] "Save" creates a new design, URL updates to `?id=...`
- [ ] Top bar shows "Saved" status
- [ ] Make a change, wait 30 seconds: auto-save fires, "Saved" status returns
- [ ] Refresh the page with `?id=...` in URL: design reloads
- [ ] Rename the design in the top bar: name updates on next save
- [ ] "New" clears the canvas and starts fresh

### My Designs page
- [ ] Visit `/studio/designs`: grid of saved designs appears
- [ ] Each card shows thumbnail, name, and relative date
- [ ] Click a card: opens the design in the studio
- [ ] Right-click a card: Rename, Duplicate, Delete options
- [ ] Delete a design: confirmation, then it disappears
- [ ] Empty state: "No designs yet" with a Create button
- [ ] Not logged in: redirect to login

### Export profiles
- [ ] Click Export dropdown: profile options appear
- [ ] "Generic SVG" downloads the same SVG as before
- [ ] "Shaper Origin SVG" downloads an SVG with black/blue/red/gray strokes
- [ ] "Laser Cutter SVG" downloads an SVG with hairline strokes in red/blue/black
- [ ] "CNC Router SVG" downloads an SVG + a `.json` job sheet sidecar
- [ ] The last-used profile is remembered on next export

### Regression
- [ ] All Phase 1, 2, 3 features still work
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds

---

## Deployment notes

Phase 4 touches the database for the first time since the studio was
created:

1. Append the `studioDesigns` table to `src/lib/db/schema.ts`
2. Run `npx drizzle-kit generate && npx drizzle-kit push`
3. The `.env.local` file (with `POSTGRES_URL`) must be present in the
   Claude Code workspace for the API routes to work in dev. Copy it from
   Floki's workspace if needed:
   ```bash
   cp /home/jesper/jesper-makes-ai/website/.env.local \
      /home/jesper/claude-code-workspace/studio/.env.local
   ```

New API routes (5):
- `POST /api/studio/designs`
- `GET /api/studio/designs`
- `GET /api/studio/designs/[id]`
- `PATCH /api/studio/designs/[id]`
- `DELETE /api/studio/designs/[id]`

No new npm packages. No new env vars beyond the existing ones.

---

## For Claude Code

Build order:

1. **Corner radius** (small, self-contained, immediate value)
2. **Right-click context menu** (changes interaction layer, good to have
   early so you can use it while testing later features)
3. **Shortcut hints and onboarding** (UI work, independent of backend)
4. **Design file format** (the serialization layer save/load depends on)
5. **Database schema** (must exist before API routes)
6. **API routes** (CRUD, straightforward)
7. **Cloud save UI** (the top bar, save flow, auto-save, Ctrl+S)
8. **My Designs page** (depends on API routes working)
9. **Export profiles** (independent, can be done any time)

Commit after each group. The first three groups are pure client-side
and can be tested without the database. Groups 4-8 require the database
and auth system.

For the auth integration: the site uses NextAuth. Look at how existing
API routes (like the Title Lab or Storyteller tracking) get the user
session:

```typescript
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...proceed with session.user.id as the owner
}
```

For the thumbnail: generate it client-side by:
1. Temporarily hiding all non-shape elements (grid, handles, rulers)
2. Using `SVGElement.outerHTML` to get the SVG string
3. Rendering it to an offscreen `<canvas>` via `canvg` or `new Image()`
   with a data URL
4. Converting to a small PNG data URL (200x150px max)
5. Sending the data URL as the `thumbnail` field in the save request

If thumbnail generation is too complex, skip it for now and use a
placeholder icon on the designs grid. Thumbnails can be added in a
polish pass. The save/load system should work without them.

---

*Phase 4 brief for the Jesper Makes 2D Design Studio. After this phase,
users can save their work, come back to it, export for their specific
machine, and learn the tool without reading a manual. The studio becomes
a product, not just a demo.*
