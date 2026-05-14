# PHASE-6-DESIGN-STUDIO.md

> Development brief for Phase 6 of the Jesper Makes 2D Design Studio.
> Phases 1-5 built a complete manufacturing-aware design tool with cloud
> save and export profiles. Phase 6 adds two things that make the studio
> genuinely unprecedented: a community design library called The Workbench,
> and an AI design assistant that generates parts from natural language.
>
> The Workbench turns the studio from a tool into a platform.
> The AI assistant turns the studio from something you learn into
> something that teaches you.
>
> Nobody else has either of these. Together, they're the reason someone
> switches from Shaper Studio to jespermakes.com and never goes back.

---

## Read first

1. Existing studio code (Phases 1-5 merged)
2. `JESPER-MAKES-DEV-HANDOFF.md` for auth, API patterns, OpenRouter setup
3. This file, in full, before starting.

---

## Branch

```bash
cd /home/jesper/claude-code-workspace/studio
git checkout main
git pull origin main
git checkout -b feature/studio-phase-6
```

---

## What Phase 6 adds

Three major features:

1. **The Workbench** — community design library (publish, browse, remix)
2. **AI Design Assistant** — natural language to geometry on the canvas
3. **Improved tooltips and onboarding** — making sure beginners can find everything

---

# PART 1: THE WORKBENCH

## The concept

The Workbench is a public library of designs that any jespermakes.com
user can publish to and browse from. It is NOT a marketplace (nothing is
sold). It is a commons: makers share designs freely, others use them,
modify them, and share their modifications back.

Think of it as Thingiverse for 2D cut files, but built into the design
tool instead of being a separate website. The key differentiator: you
don't download a file and open it in another program. You click "Open
in Studio" and the design loads directly into the editor, ready to
modify or cut.

### Route: `/workbench`

Public page. Anyone can browse. Login required to publish or save
designs to your own account.

### Naming

The section is called **The Workbench** everywhere:
- Navigation: "Workbench"
- Page title: "The Workbench — Community Designs"
- In the studio: "Publish to Workbench" / "Browse Workbench"
- The tagline: "Free designs from makers, for makers."

---

## Database schema

### `workbench_designs` table

```typescript
export const workbenchDesigns = pgTable("workbench_designs", {
  id: uuid("id").defaultRandom().primaryKey(),
  // The source design (private, in the author's account)
  sourceDesignId: uuid("source_design_id")
    .references(() => studioDesigns.id, { onDelete: "set null" }),
  // Author
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(), // display name, cached
  // Content
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  // The full design data (snapshot at time of publishing)
  data: jsonb("data").$type<StudioDesignFile>().notNull(),
  thumbnail: text("thumbnail"), // data URL or Blob URL
  // Categories
  category: text("category").notNull().default("general"),
  // "furniture", "joinery", "signs", "toys", "jigs", "decorative",
  // "mechanical", "laser", "cnc", "general"
  // Metrics
  downloadCount: integer("download_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  remixCount: integer("remix_count").notNull().default(0),
  // Remix chain — if this design was forked from another
  remixOfId: uuid("remix_of_id")
    .references(() => workbenchDesigns.id, { onDelete: "set null" }),
  // Moderation
  status: text("status").notNull().default("published"),
  // "published" | "flagged" | "removed"
  // Timestamps
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### `workbench_likes` table

```typescript
export const workbenchLikes = pgTable("workbench_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  designId: uuid("design_id")
    .notNull()
    .references(() => workbenchDesigns.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Add a unique constraint on (userId, designId) to prevent double-likes
```

---

## API routes

### `GET /api/workbench/designs`

Browse published designs. Query parameters:

- `category` — filter by category
- `tag` — filter by tag
- `search` — full-text search on name + description
- `sort` — `recent` (default), `popular` (by download count),
  `most-liked`
- `page` — pagination (20 per page)

Returns: `{ designs: [...], totalCount, page, pageSize }`

Each design in the list includes: id, name, description, authorName,
thumbnail, tags, category, downloadCount, likeCount, remixCount,
publishedAt. Does NOT include the full `data` blob (too large for
listing).

### `GET /api/workbench/designs/[id]`

Full design details including the `data` blob. Increments
`downloadCount` atomically. Public (no auth required).

### `POST /api/workbench/designs`

Publish a design to The Workbench. Auth required.

Body: `{ sourceDesignId?, name, description, tags, category, data, thumbnail }`

If `sourceDesignId` is provided, it's linked to the author's private
design. If publishing a remix, `remixOfId` points to the original
Workbench design that was forked.

### `POST /api/workbench/designs/[id]/like`

Toggle like. Auth required. If already liked, unlikes. Returns the new
like count.

### `DELETE /api/workbench/designs/[id]`

Remove own design from The Workbench. Auth required, must be the author.
(Admin can also remove any design for moderation.)

---

## The Workbench page (`/workbench`)

### Layout

Uses the site's normal layout (header + footer), not the studio layout.

### Hero section

```
The Workbench
Free designs from makers, for makers.

Browse community-made designs for CNC routers and laser cutters.
Open any design directly in the Studio, modify it, and make it yours.

[Browse designs]  [Publish yours]
```

### Browse section

Filter bar:

```
[All] [Furniture] [Joinery] [Signs] [Toys] [Jigs] [Decorative] [Laser] [CNC]

Sort: [Recent ▼]  Search: [____________]
```

Design grid (3 columns desktop, 2 mobile, 1 narrow mobile):

Each card shows:
- Thumbnail (the design preview image)
- Name
- Author name
- Download count (small icon + number)
- Like count (heart icon + number)
- Category tag
- "Open in Studio" button

### Design detail view

Clicking a card opens a detail view (either a modal or a dedicated page
at `/workbench/[id]`):

```
┌─────────────────────────────────────────┐
│  [Large thumbnail / preview]            │
│                                         │
│  Box Joint Storage Crate                │
│  by WoodworkingDave                     │
│  Published 3 days ago                   │
│                                         │
│  A sturdy storage crate with            │
│  interlocking box joints. Sized for     │
│  standard 12mm Baltic birch plywood.    │
│                                         │
│  Tags: joinery, box joints, storage     │
│  Category: Furniture                    │
│  Downloads: 47  Likes: 12              │
│  Material: 12mm plywood                 │
│  Parts: 6 shapes                        │
│                                         │
│  [♥ Like]  [Open in Studio]  [Download] │
│                                         │
│  Remixed from: "Simple Box" by Jesper   │
│                                         │
└─────────────────────────────────────────┘
```

"Open in Studio" loads the design data into `/studio` as a new unsaved
design (the user can then save it to their own account, modify it, etc.).

"Download" downloads the raw `.jm.json` file for users who want to use
it outside the studio.

### Publish flow (from the Studio)

In the studio's export dropdown or File menu, add:

```
Publish to Workbench
```

Clicking it opens a publish modal:

```
┌─────────────────────────────────────────┐
│  Publish to The Workbench               │
│                                         │
│  Name: [Box Joint Storage Crate      ]  │
│                                         │
│  Description:                           │
│  [A sturdy storage crate with...     ]  │
│  [                                   ]  │
│                                         │
│  Category: [Furniture ▼]                │
│  Tags: [joinery, box joints, storage ]  │
│                                         │
│  [Preview thumbnail]                    │
│                                         │
│  By publishing, you agree that your     │
│  design is shared freely under          │
│  CC BY 4.0 (Creative Commons            │
│  Attribution).                          │
│                                         │
│  [Cancel]              [Publish]        │
│                                         │
└─────────────────────────────────────────┘
```

### Remix flow

When a user opens a Workbench design in the Studio and then publishes
their modified version back to The Workbench, the new publication
includes a `remixOfId` pointing to the original. The detail view shows:
"Remixed from: [Original Design Name] by [Original Author]" with a link.

This creates a visible chain of attribution. Good for community and
good for the original designer's visibility.

---

# PART 2: AI DESIGN ASSISTANT

## The concept

A conversational AI assistant built into the studio canvas that
generates geometry from natural language descriptions. You describe
what you want to build, and the assistant creates the shapes on the
canvas.

This is the feature that doesn't exist anywhere else. Not in Shaper
Studio. Not in Fusion 360. Not in Vectric. Not in any free tool. It's
the reason someone who has never used a CNC router visits jespermakes.com
and walks away with a design they can actually cut.

### Why this works technically

The studio already has:
- A shape data model (Shape interface with all geometry fields)
- A reducer that accepts "ADD_SHAPES" actions
- OpenRouter connected to Claude Sonnet via the existing API pattern
- The manufacturing data model (cut types, material thickness, etc.)

The AI assistant is a server-side API route that takes a natural language
prompt, constructs a system prompt that describes the Shape interface,
and asks Claude to return a JSON array of shapes. The client receives
the shapes and dispatches them to the reducer. The shapes appear on the
canvas.

The magic is in the prompt engineering, not in new infrastructure.

---

## UI: The Assistant panel

### Trigger

A small floating button in the bottom-right corner of the canvas:

```
[✦ Ask AI]
```

Or a keyboard shortcut: `/` (slash, like Notion's slash command).

### The panel

Clicking the button opens a panel on the right side (replacing or
overlaying the properties panel):

```
┌──────────────────────────┐
│  ✦ Design Assistant       │
│  Describe what you want   │
│  to build.                │
│                           │
│  ┌────────────────────┐   │
│  │ I need a box with  │   │
│  │ finger joints,     │   │
│  │ 200mm wide, 150mm  │   │
│  │ deep, 100mm tall,  │   │
│  │ from 6mm plywood   │   │
│  └────────────────────┘   │
│  [Generate ✦]             │
│                           │
│  ── Previous ──           │
│                           │
│  "Add a 30mm hole in the  │
│   center of the lid"      │
│   → Added 1 shape         │
│                           │
│  "Make a phone stand      │
│   that holds at 60        │
│   degrees"                │
│   → Generated 2 parts     │
│                           │
└──────────────────────────┘
```

### Conversation history

The assistant maintains a conversation context within the session:

- "I need a box with finger joints, 200mm wide..." → generates 6 panels
- "Add a 30mm hole in the center of the lid" → adds a circle to the
  existing lid panel (the AI knows what's already on the canvas)
- "Make the walls thicker, 8mm instead of 6mm" → regenerates with
  updated dimensions

This conversational continuity is what makes it feel like magic. The
AI understands the context of what's already been designed and can
modify incrementally.

### Loading state

While the AI is generating:

```
✦ Thinking...
  Generating your design. This takes a few seconds.
  [Cancel]
```

Show a subtle shimmer animation on the canvas where new shapes will
appear (or just a general loading indicator in the panel).

---

## API route: `/api/studio/ai-assist`

### Request

```typescript
POST /api/studio/ai-assist
{
  prompt: string,                    // user's natural language request
  existingShapes: Shape[],          // current canvas state (so AI can reference/modify)
  material: MaterialSettings,       // current material setup
  conversationHistory: Message[],   // previous turns in this session
}
```

### The system prompt

This is the most important piece. The system prompt teaches Claude how
to generate shapes that the studio can render:

```typescript
const SYSTEM_PROMPT = `You are a design assistant for a 2D CNC/laser design studio.
You generate shapes that will be placed on a canvas for manufacturing.

You MUST respond with a JSON object containing:
{
  "shapes": [...],     // array of Shape objects to add to the canvas
  "message": "...",    // brief message explaining what you generated
  "modifications": [...] // optional: IDs of existing shapes to delete (for replacements)
}

Each shape in the "shapes" array must be a valid Shape object:

{
  "id": "unique-id",
  "type": "rectangle" | "circle" | "line" | "path" | "text",
  "x": number,         // center X in mm
  "y": number,         // center Y in mm
  "width": number,     // mm (for rectangles, circles)
  "height": number,    // mm
  "rotation": number,  // degrees
  "stroke": "#2C1810", // hex color
  "strokeWidth": 0.5,  // mm
  "fill": "none",      // "none" or hex color
  "cornerRadius": 0,   // mm (rectangles only)
  "text": "...",        // text content (text type only)
  "fontSize": 10,      // mm (text type only)
  "cutType": "outside" | "inside" | "online" | "pocket" | "guide",
  "pathData": "M0,0 L10,0...", // SVG path d string (path type only)
  "closed": true       // path closure
}

IMPORTANT RULES:
- All dimensions are in millimeters
- The canvas origin (0, 0) is at the center
- Place shapes with reasonable spacing (at least 5mm between parts)
- Generate CLOSED paths for parts that will be cut out
- Use "outside" cut type for parts, "inside" for holes
- When the user mentions material thickness, use it for joint dimensions
- For finger/box joints: fingers should be material-thickness wide and
  interlock perfectly between mating panels
- For through-holes: use "inside" cut type
- Always explain what you generated in the "message" field

FINGER JOINT MATH:
When generating finger joints between two panels:
- Finger width = material thickness (or a specified width)
- Fingers on panel A are tabs, fingers on panel B are slots
- Tabs extend beyond the panel edge by material thickness
- Slots are cut into the panel edge by material thickness
- The fingers must interlock: where A has a tab, B has a slot
- Number of fingers = floor(edge_length / (finger_width * 2))

COMMON REQUESTS:
- "box with finger joints" = 6 panels (top, bottom, front, back, left, right)
  with interlocking fingers on every joint
- "phone stand" = 2-3 interlocking pieces with an angled slot
- "shelf brackets" = shaped support pieces with mounting holes
- "coaster" = circle or rounded square with engraving text
- "nameplate" = rectangle with text, pocket-cut letters

When modifying existing shapes:
- Reference them by their position or type ("the rectangle on the left")
- Use the "modifications" array to list IDs of shapes to replace
- Generate replacement shapes with the same IDs

Keep designs practical and physically buildable. If a request is vague,
make reasonable assumptions and explain them in your message.`;
```

### Response handling

The client receives the JSON response, parses the shapes array, and
dispatches them to the reducer:

```typescript
// 1. Parse the AI response
const result = JSON.parse(responseText);

// 2. Remove any shapes the AI wants to replace
if (result.modifications?.length) {
  dispatch({ type: "DELETE_SHAPES", ids: result.modifications });
}

// 3. Add the new shapes
dispatch({ type: "ADD_SHAPES", shapes: result.shapes });

// 4. Select the new shapes so the user can see them
dispatch({ type: "SET_SELECTION", ids: result.shapes.map(s => s.id) });

// 5. Fit the view to show all new shapes
dispatch({ type: "FIT_ALL" });

// 6. Show the AI's message in the assistant panel
setAiMessage(result.message);
```

### Error handling

- If Claude returns malformed JSON: "I had trouble generating that
  design. Try rephrasing your request."
- If the request is too vague: Claude should ask for clarification in
  the `message` field and return an empty shapes array
- If the design is physically impossible: Claude should explain why in
  the `message` field
- Rate limit: max 10 AI requests per minute per user. Show "Please wait
  a moment before making another request." if exceeded.

### Cost management

Each AI call costs money (OpenRouter charges per token). To keep costs
manageable:

- Use Claude Sonnet (not Opus) for the assistant
- Cap `max_tokens` at 4000 (enough for complex designs, not enough for
  abuse)
- Include only the shapes that are relevant to the prompt in
  `existingShapes` (not the entire canvas if it has hundreds of shapes)
- Cache nothing (every request is unique)
- The rate limit (10/min) prevents runaway costs from a single user

---

## Example interactions

### "I need a simple box, 150mm x 100mm x 80mm, from 6mm plywood"

The AI generates 6 rectangular panels:
- Top: 150 x 100 mm
- Bottom: 150 x 100 mm
- Front: 150 x 80 mm
- Back: 150 x 80 mm
- Left: 100 x 80 mm (accounting for material thickness overlap: 88mm)
- Right: 100 x 80 mm (88mm)

All panels placed side by side with 10mm spacing, all assigned
"outside" cut type.

Message: "Here are the 6 panels for your box. The side panels are
88mm wide to account for the 6mm front and back panels overlapping.
No joints yet. Want me to add finger joints?"

### "Yes, add finger joints"

The AI remembers the box context and generates new versions of all
6 panels with interlocking finger patterns along each joining edge.
The finger width matches the 6mm material thickness.

Message: "I've added finger joints to all edges. Each finger is 6mm
wide to match your plywood thickness. The front and back panels have
tabs on the sides, and the side panels have matching slots."

### "Add a 40mm hole centered in the top panel"

The AI adds a circle (diameter 40mm) positioned at the center of the
top panel, with "inside" cut type.

Message: "Added a 40mm hole in the center of the top panel, set as
an inside cut."

### "Make a phone stand, holds the phone at 70 degrees"

The AI generates 2-3 interlocking pieces that form an angled cradle:
- A base piece with a slot
- An angled support with a slot that interlocks with the base
- Optional: a small lip piece to keep the phone from sliding

Message: "Here's a 2-piece interlocking phone stand. The support sits
at 70 degrees from horizontal. The slot width matches your 6mm
material. The lip at the front keeps the phone from sliding."

### "Make a set of coasters with my name engraved"

The AI generates circular coasters (diameter 90mm, corner radius for
a rounded look) with the user's name as a text shape centered on each,
assigned "pocket" cut type for the text.

Message: "Here are 4 round coasters, 90mm diameter. I've added 'Jesper'
as engraved text in the center of each (set to pocket cut). Change
the text in the properties panel if you want a different name."

---

# PART 3: IMPROVED TOOLTIPS AND ONBOARDING

## Enhanced tooltips

Every toolbar button needs a rich tooltip, not just text. When hovering
for 500ms:

```
┌──────────────────────────────┐
│ Rectangle Tool               │
│ R                            │
│                              │
│ Click and drag to draw a     │
│ rectangle. Hold Shift for    │
│ a perfect square.            │
│                              │
│ Tip: Set corner radius in    │
│ the properties panel for     │
│ rounded corners.             │
└──────────────────────────────┘
```

Structure:
- **Line 1:** Tool name (bold)
- **Line 2:** Keyboard shortcut (monospace, muted color)
- **Line 3+:** Brief description of how to use it
- **Tip:** (optional) a secondary hint about a related feature

### Tooltip content for each tool

**Select (V)**
Click to select shapes. Shift+click to add to selection.
Drag to move. Drag handles to resize. Right-click for more options.

**Pen (P)**
Click to place straight points. Click and drag for curves.
Click the first point to close the shape. Press Escape to finish.

**Rectangle (R)**
Click and drag to draw. Hold Shift for a square.
Tip: Set corner radius in the properties panel.

**Circle (C)**
Click and drag to draw. Hold Shift for a perfect circle.

**Line (L)**
Click to set start, click again for end. Hold Shift for 45-degree angles.

**Arc (A)**
Click for center, drag for radius, then set the sweep angle.

**Polygon (G)**
Click and drag to draw. Set the number of sides in properties.
Toggle "Star" mode for star shapes.

**Text (T)**
Click to place text. Double-click existing text to edit.

**Union, Difference, Intersection**
Select two or more shapes, then click to combine them.

**Undo / Redo**
Ctrl+Z / Ctrl+Shift+Z

**Import SVG**
Open an SVG file. Drag and drop also works.

**Export**
Download your design for your machine.

### Implementation

Create `src/components/studio/rich-tooltip.tsx`:

```tsx
interface RichTooltipProps {
  title: string;
  shortcut?: string;
  description: string;
  tip?: string;
  position: { x: number; y: number };
}
```

- Appears 500ms after hover starts (use a timer, cancel on mouse leave)
- Positioned to the right of the toolbar button
- Max width: 240px
- Style: `bg-wood text-cream rounded-xl shadow-2xl p-4 text-sm`
- Animates in with a subtle fade + slide

## Additional onboarding improvements

### Contextual prompts in empty states

When the canvas is empty and the user is in Design mode, show a large
centered prompt:

```
Start by drawing something, or try the AI assistant.

[Draw a rectangle]  [✦ Ask AI to design something]

Or import an existing SVG file by dragging it here.
```

The buttons are quick-start actions: "Draw a rectangle" switches to
the Rectangle tool. "Ask AI" opens the assistant panel.

### Mode-switch guidance

When the user switches to Plan mode for the first time (per session),
show a brief inline guide at the top of the properties panel:

```
Plan Mode
Assign how each shape will be cut.

Click a shape, then choose a cut type below.
Shapes will be color-coded by their assignment.

[Got it]
```

Same for Review mode:

```
Review Mode
Check your design before cutting.

This preview shows what the finished result will
look like. Fix any warnings before exporting.

[Got it]
```

Dismissing sets a `localStorage` flag so it doesn't repeat.

---

## Files to create

### The Workbench
```
src/app/workbench/page.tsx              — browse page
src/app/workbench/[id]/page.tsx         — design detail page
src/app/api/workbench/designs/route.ts  — GET (list) + POST (publish)
src/app/api/workbench/designs/[id]/route.ts — GET (detail) + DELETE
src/app/api/workbench/designs/[id]/like/route.ts — POST (toggle like)
src/components/studio/publish-modal.tsx — publish-to-Workbench form
src/components/workbench/design-card.tsx — card component for the grid
src/components/workbench/design-detail.tsx — detail view component
src/lib/workbench.ts                   — data access helpers
```

### AI Assistant
```
src/app/api/studio/ai-assist/route.ts  — the AI endpoint
src/components/studio/ai-panel.tsx     — the assistant panel UI
src/lib/studio/ai-prompts.ts          — system prompt and response parsing
```

### Tooltips + onboarding
```
src/components/studio/rich-tooltip.tsx  — enhanced tooltip component
src/components/studio/empty-canvas.tsx  — empty state prompt
```

---

## New npm dependencies

None. The AI integration uses OpenRouter via `fetch` (same pattern as
Title Lab and Storyteller). The Workbench uses the existing Drizzle +
Postgres stack.

---

## Environment variables

No new env vars. The `OPENROUTER_API_KEY` is already set up and used
by Title Lab and Storyteller.

---

## What NOT to build in Phase 6

- Comments or discussion on Workbench designs (v2)
- User profiles with portfolios (v2)
- Collections / playlists of designs (v2)
- Following other makers (v2)
- Notifications when your design is liked or remixed (v2)
- AI generating path shapes with complex bezier curves (start with
  rectangles, circles, and simple polygons only; complex shapes in v2)
- AI understanding images ("design something that looks like this photo")
- Version history on Workbench designs
- Moderation queue (admin can delete; community flagging in v2)
- Paid/premium designs (never; the whole point is free)
- AI-generated manufacturing settings (cut types, depths); the AI
  generates geometry only, the user assigns manufacturing intent in
  Plan mode

---

## Testing checklist

### The Workbench
- [ ] `/workbench` page loads with hero, filter bar, design grid
- [ ] Category filter works (click "Furniture" shows only furniture)
- [ ] Search works (type "box" shows designs with "box" in name/description)
- [ ] Sort works (Recent, Popular, Most Liked)
- [ ] Design cards show thumbnail, name, author, download count, likes
- [ ] Click a card: detail view opens with full description
- [ ] "Open in Studio" loads the design into `/studio` as unsaved
- [ ] "Download" downloads the `.jm.json` file
- [ ] Like button toggles (heart fills/empties), count updates
- [ ] Like requires login (redirect to login if not authenticated)
- [ ] Publish from Studio: modal opens with name, description, tags, category
- [ ] Published design appears on The Workbench page
- [ ] Remix attribution: publishing a modified Workbench design shows
      "Remixed from..." link
- [ ] Author can delete their own Workbench design
- [ ] Pagination works (20 per page)
- [ ] Empty state shows when no designs match the filter

### AI Design Assistant
- [ ] "Ask AI" button visible in bottom-right of canvas
- [ ] Clicking it opens the assistant panel
- [ ] Type "draw a 100mm square" and click Generate: a 100x100mm
      rectangle appears on the canvas
- [ ] Type "make it a circle instead": the rectangle is replaced with
      a 100mm diameter circle
- [ ] Type "add a 20mm hole in the center": a circle with "inside"
      cut type is added
- [ ] Type "I need a box, 200x150x100mm, 6mm plywood": 6 panels appear
      with correct dimensions
- [ ] Follow-up "add finger joints": panels regenerate with finger patterns
- [ ] AI message appears in the panel explaining what was generated
- [ ] New shapes are selected and the view fits to show them
- [ ] "Thinking..." indicator shows during generation
- [ ] Cancel button works during generation
- [ ] Error message shows for malformed responses
- [ ] Rate limit works (10 requests/minute)
- [ ] Slash key (/) opens the assistant panel
- [ ] Conversation history shows previous requests and responses

### Tooltips
- [ ] Hover any toolbar button for 500ms: rich tooltip appears
- [ ] Tooltip shows tool name, shortcut, description, and tip
- [ ] Tooltip disappears on mouse leave
- [ ] Tooltip doesn't block interaction with other buttons

### Onboarding
- [ ] Empty canvas shows "Start by drawing something" prompt
- [ ] "Draw a rectangle" button in the prompt switches to Rectangle tool
- [ ] "Ask AI" button in the prompt opens the assistant panel
- [ ] First time entering Plan mode: inline guide appears
- [ ] "Got it" dismisses and doesn't reappear
- [ ] First time entering Review mode: same pattern

### Regression
- [ ] All Phase 1-5 features still work
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds

---

## For Claude Code

Build order:

1. **Rich tooltips** (small, self-contained, immediate improvement)
2. **Empty canvas state and mode-switch guides** (small UI work)
3. **Workbench database schema** (foundation for the community features)
4. **Workbench API routes** (CRUD + like)
5. **Workbench browse page** (the public-facing grid)
6. **Workbench publish flow** (from Studio to Workbench)
7. **Workbench detail view** (the full design page)
8. **AI assistant API route** (the system prompt + OpenRouter call)
9. **AI assistant panel UI** (the conversational interface)
10. **Integration testing** (make sure publish, browse, open-in-studio,
    and AI generation all work together)

The AI assistant is the riskiest piece: the quality depends heavily on
the system prompt and on Claude's ability to generate valid Shape JSON.
Start with simple requests ("draw a rectangle", "draw a circle") and
work up to complex ones ("box with finger joints"). Iterate on the
system prompt until finger joint math is reliable.

For the finger joint generation specifically: the system prompt includes
explicit math rules. If Claude still gets it wrong, add a post-processing
step that validates and corrects the geometry before placing it on the
canvas:

```typescript
function validateFingerJoints(shapes: Shape[], materialThickness: number): Shape[] {
  // Check that finger widths match material thickness
  // Check that mating edges have complementary tab/slot patterns
  // Adjust if needed
  return correctedShapes;
}
```

For The Workbench: start with the API routes and a minimal browse page.
The publish flow and detail view come after the core listing works. Don't
build the remix chain logic until basic publish + browse is solid.

---

*Phase 6 brief for the Jesper Makes 2D Design Studio. The Workbench
turns the studio into a community. The AI assistant turns it into
something nobody else has. Together, they're the reason makers switch
and stay.*
