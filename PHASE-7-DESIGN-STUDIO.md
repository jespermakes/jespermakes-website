# PHASE-7-DESIGN-STUDIO.md

> Development brief for Phase 7 of the Jesper Makes 2D Design Studio.
> Phase 6 introduced the AI assistant and The Workbench community library.
> The AI assistant doesn't work well enough because it tries to generate
> raw coordinates. Phase 7 rebuilds the AI with a tool-use architecture
> (parametric generators) and completes the community platform with
> comments, profiles, collections, following, and notifications.

---

## Read first

1. Existing studio code (Phases 1-6 merged)
2. `BOX-JOINT-JIG-KNOWLEDGE.md` in project knowledge -- specifically the
   math section. This is the pattern the AI generators must follow:
   deterministic formulas, not LLM-generated coordinates.
3. This file, in full, before starting.

---

## Branch

```bash
cd /home/jesper/claude-code-workspace/studio
git checkout main
git pull origin main
git checkout -b feature/studio-phase-7
```

---

## PART 1: REBUILDING THE AI ASSISTANT

### Why the current approach fails

The Phase 6 AI assistant asks Claude to return a JSON array of Shape
objects with exact x, y, width, height coordinates. This fails because:

1. LLMs can't do reliable spatial math. A finger joint that's 0.3mm off
   doesn't interlock. A panel that's 6mm too wide doesn't fit.
2. Layout logic (spacing parts, avoiding overlaps) is spatial reasoning
   that LLMs are bad at.
3. Complex designs (box with finger joints = 6 panels x 4 edges x N
   fingers = hundreds of coordinates) overwhelm the output and amplify
   errors.
4. No validation: if the LLM returns slightly wrong geometry, it goes
   straight to the canvas with no correction.

### The new architecture: tool-use with parametric generators

Instead of generating shapes, Claude **calls generators**. The generators
are deterministic TypeScript functions that produce exact geometry from
parameters. Claude's job is understanding the user's intent and picking
the right generator with the right parameters.

This is the same pattern as function calling in the Anthropic API, but
implemented manually since we're going through OpenRouter.

```
User: "I need a box with finger joints, 200x150x100mm, 6mm plywood"
  ↓
Claude thinks: this is a box generator call
  ↓
Claude returns JSON:
{
  "tool": "box",
  "params": {
    "width": 200,
    "depth": 150,
    "height": 100,
    "materialThickness": 6,
    "jointType": "finger",
    "fingerWidth": 6,
    "openTop": false
  },
  "message": "Generating a box with finger joints..."
}
  ↓
Client calls boxGenerator(params)
  ↓
boxGenerator returns Shape[] with exact geometry
  ↓
Shapes are placed on the canvas
```

The LLM never sees or produces coordinates. It only picks tools and
fills in parameters. The math is in the generators.

### The generator library

Build a library of parametric generators in `src/lib/studio/generators/`.
Each generator takes a typed params object and returns a `Shape[]` array.

#### Generator: `box`

Generates a flat-pack box with panels laid out side by side.

```typescript
interface BoxParams {
  width: number;           // mm, outer width
  depth: number;           // mm, outer depth
  height: number;          // mm, outer height
  materialThickness: number; // mm
  jointType: "butt" | "finger" | "rabbet" | "miter";
  fingerWidth?: number;    // mm, defaults to materialThickness
  fingerCount?: number;    // auto-calculated if not specified
  openTop?: boolean;       // default false (generates lid)
  openBottom?: boolean;    // default false
  dividers?: number;       // internal dividers (0 = none)
}

function generateBox(params: BoxParams): Shape[] {
  // 1. Calculate panel dimensions (accounting for joint overlap)
  // 2. Generate each panel as a rectangle (or path with fingers)
  // 3. For finger joints: compute finger/slot patterns on each edge
  //    using the exact same math as the Box Joint Jig:
  //    fingerCount = floor(edgeLength / (fingerWidth * 2))
  //    Tabs on panel A align with slots on panel B
  // 4. Lay out panels in a row with 15mm spacing
  // 5. Assign cut types: "outside" for panel outlines, "inside" for slots
  // 6. Return Shape[]
}
```

**The finger joint math MUST use the same formula as the Box Joint Jig
tool.** `slotWidth = fingerWidth = materialThickness`. This is proven
correct. Do not invent new joint math.

#### Generator: `circle-pattern`

Generates circular patterns of holes, slots, or shapes.

```typescript
interface CirclePatternParams {
  centerX: number;
  centerY: number;
  radius: number;          // mm, distance from center to pattern elements
  count: number;           // number of elements around the circle
  elementType: "circle" | "rectangle" | "slot";
  elementWidth: number;    // mm
  elementHeight: number;   // mm (for rectangles/slots)
  startAngle?: number;     // degrees, default 0
}

function generateCirclePattern(params: CirclePatternParams): Shape[] {
  // Place N elements evenly around a circle
  // Each element rotated to point radially outward
  // Used for: bolt circles, decorative patterns, the cone lamp disk slots
}
```

#### Generator: `grid-pattern`

Rectangular arrays of shapes.

```typescript
interface GridPatternParams {
  startX: number;
  startY: number;
  columns: number;
  rows: number;
  spacingX: number;        // mm between element centers
  spacingY: number;
  elementType: "circle" | "rectangle";
  elementWidth: number;
  elementHeight: number;
}
```

#### Generator: `phone-stand`

A two-piece interlocking phone/tablet stand.

```typescript
interface PhoneStandParams {
  angle: number;           // degrees from horizontal (50-80 typical)
  width: number;           // mm, width of the stand
  depth: number;           // mm, base depth
  materialThickness: number;
  deviceThickness?: number; // mm, slot width for the device (default 12)
  lipHeight?: number;      // mm, front lip to hold the device (default 15)
}

function generatePhoneStand(params: PhoneStandParams): Shape[] {
  // Generate 2 interlocking pieces:
  // 1. Base piece with a vertical slot
  // 2. Angled support piece with a horizontal slot that interlocks
  // 3. Optional lip piece
  // Slot widths = materialThickness (same rule as box joints)
}
```

#### Generator: `shelf-bracket`

```typescript
interface ShelfBracketParams {
  width: number;           // mm, horizontal reach
  height: number;          // mm, vertical height
  materialThickness: number;
  style: "triangle" | "curved" | "decorative";
  mountingHoles: number;   // count
  mountingHoleDiameter: number; // mm
}
```

#### Generator: `coaster`

```typescript
interface CoasterParams {
  diameter: number;        // mm (or width/height for non-circular)
  shape: "circle" | "square" | "hexagon" | "rounded-square";
  cornerRadius?: number;   // for rounded-square
  text?: string;           // engraved text
  textSize?: number;       // mm
  border?: boolean;        // decorative border ring
  borderWidth?: number;    // mm
  count?: number;          // how many to generate (default 1)
}
```

#### Generator: `nameplate`

```typescript
interface NameplateParams {
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
  cornerRadius?: number;
  mountingHoles?: boolean;
  mountingHoleDiameter?: number;
  border?: boolean;
}
```

#### Generator: `simple-shape`

Fallback for basic geometry requests.

```typescript
interface SimpleShapeParams {
  type: "rectangle" | "circle" | "polygon" | "star";
  width: number;
  height: number;
  cornerRadius?: number;
  sides?: number;          // for polygon
  innerRadius?: number;    // for star (as ratio 0-1)
  x?: number;              // placement position
  y?: number;
}
```

#### Generator: `hole`

Adds a hole to an existing shape (by position reference).

```typescript
interface HoleParams {
  targetDescription: string; // "the lid", "the top panel", "the large rectangle"
  diameter: number;
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  offsetX?: number;        // mm from the named position
  offsetY?: number;
}
```

For this generator, the AI also returns a `targetShapeId` that it
identifies from the existing shapes on the canvas based on the user's
description. The generator creates a circle at the right position
and assigns "inside" cut type.

#### Generator: `modify`

Modifies existing shapes (resize, reposition, change properties).

```typescript
interface ModifyParams {
  targetDescription: string;
  action: "resize" | "move" | "delete" | "set-corner-radius" |
          "set-cut-type" | "duplicate";
  width?: number;
  height?: number;
  cornerRadius?: number;
  cutType?: CutType;
  offsetX?: number;
  offsetY?: number;
  count?: number;          // for duplicate
}
```

### File structure for generators

```
src/lib/studio/generators/
  index.ts                 — registry of all generators
  types.ts                 — shared param interfaces
  box.ts                   — box generator
  circle-pattern.ts        — circular array
  grid-pattern.ts          — rectangular array
  phone-stand.ts           — interlocking stand
  shelf-bracket.ts         — bracket shapes
  coaster.ts               — coaster generator
  nameplate.ts             — nameplate generator
  simple-shape.ts          — basic geometry fallback
  hole.ts                  — add holes to existing shapes
  modify.ts                — modify existing shapes
  layout.ts                — shared layout utilities (spacing, nesting)
```

### Updated system prompt

The system prompt no longer asks Claude to generate shapes. It describes
the available generators and their parameters:

```typescript
const SYSTEM_PROMPT = `You are a design assistant for a 2D CNC/laser
design studio. You help users create designs by calling parametric
generators.

You MUST respond with a JSON object:
{
  "tool": "generator_name",
  "params": { ... },
  "message": "Brief explanation of what you're generating"
}

Or for modifications to existing shapes:
{
  "tool": "modify",
  "params": { "targetDescription": "...", "action": "...", ... },
  "message": "..."
}

Or if you need clarification:
{
  "tool": "clarify",
  "message": "What thickness plywood are you using?"
}

AVAILABLE GENERATORS:

## box
Creates a flat-pack box with all panels laid out.
Params: width (mm), depth (mm), height (mm), materialThickness (mm),
        jointType ("butt"|"finger"|"rabbet"|"miter"),
        fingerWidth (mm, default=materialThickness),
        openTop (bool), openBottom (bool), dividers (int)
Example: {"tool":"box","params":{"width":200,"depth":150,"height":100,
         "materialThickness":6,"jointType":"finger"}}

## circle-pattern
Places elements in a circle.
Params: centerX, centerY, radius, count, elementType, elementWidth, elementHeight
Example: bolt circle, decorative pattern, radial slots

## grid-pattern
Rectangular array of shapes.
Params: startX, startY, columns, rows, spacingX, spacingY,
        elementType, elementWidth, elementHeight

## phone-stand
Two-piece interlocking stand.
Params: angle (degrees), width, depth, materialThickness,
        deviceThickness (default 12mm), lipHeight (default 15mm)

## shelf-bracket
Shaped support bracket with mounting holes.
Params: width, height, materialThickness, style, mountingHoles,
        mountingHoleDiameter

## coaster
Round, square, or hex coaster with optional text.
Params: diameter, shape, cornerRadius, text, textSize, border,
        borderWidth, count

## nameplate
Rectangle with engraved text and optional mounting holes.
Params: width, height, text, fontSize, cornerRadius, mountingHoles

## simple-shape
Basic geometry (rectangle, circle, polygon, star).
Params: type, width, height, cornerRadius, sides, innerRadius

## hole
Add a hole to an existing shape on the canvas.
Params: targetDescription, diameter, position, offsetX, offsetY
Note: reference existing shapes by their type and position, e.g.
"the large rectangle" or "the top panel"

## modify
Change existing shapes.
Params: targetDescription, action (resize|move|delete|set-corner-radius|
        set-cut-type|duplicate), plus action-specific params

RULES:
- All dimensions in millimeters
- For finger joints: finger width ALWAYS equals material thickness
- When the user doesn't specify dimensions, use reasonable defaults
  (e.g. 6mm plywood, 200mm box width)
- When the user says "add" something, use the hole or simple-shape generator
- When the user says "change" or "make it bigger", use modify
- If the request is ambiguous, use "clarify" to ask
- Keep messages short and friendly
- Do NOT generate raw shape coordinates. ALWAYS use a generator.`;
```

### Response handling (updated)

```typescript
async function handleAIResponse(response: AIResponse) {
  if (response.tool === "clarify") {
    // Show the clarification message, wait for user input
    setAiMessage(response.message);
    return;
  }

  // Look up the generator
  const generator = generators[response.tool];
  if (!generator) {
    setAiMessage("I don't know how to do that yet. Try a different request.");
    return;
  }

  // For generators that reference existing shapes (hole, modify),
  // resolve the target description to an actual shape ID
  if (response.params.targetDescription) {
    const target = findShapeByDescription(
      response.params.targetDescription,
      currentShapes
    );
    if (!target) {
      setAiMessage(`I couldn't find "${response.params.targetDescription}" on the canvas. Can you describe it differently?`);
      return;
    }
    response.params.targetShapeId = target.id;
    response.params.targetShape = target;
  }

  // Run the generator
  try {
    const result = generator(response.params);

    if (result.shapesToAdd?.length) {
      dispatch({ type: "ADD_SHAPES", shapes: result.shapesToAdd });
    }
    if (result.shapesToRemove?.length) {
      dispatch({ type: "DELETE_SHAPES", ids: result.shapesToRemove });
    }
    if (result.shapesToUpdate?.length) {
      for (const update of result.shapesToUpdate) {
        dispatch({ type: "UPDATE_SHAPE", id: update.id, changes: update.changes });
      }
    }

    // Select new shapes and fit view
    if (result.shapesToAdd?.length) {
      dispatch({
        type: "SET_SELECTION",
        ids: result.shapesToAdd.map(s => s.id)
      });
      dispatch({ type: "FIT_ALL" });
    }

    setAiMessage(response.message);
  } catch (e) {
    setAiMessage("Something went wrong generating that design. Try again with different dimensions.");
  }
}
```

### Shape description resolver

The `findShapeByDescription` function matches natural language
descriptions to actual shapes on the canvas:

```typescript
function findShapeByDescription(
  description: string,
  shapes: Shape[]
): Shape | null {
  const desc = description.toLowerCase();

  // Try exact type matches first
  if (desc.includes("circle")) {
    const circles = shapes.filter(s => s.type === "circle");
    if (circles.length === 1) return circles[0];
    // If multiple, try size/position hints
    if (desc.includes("large") || desc.includes("big")) {
      return circles.sort((a, b) => b.width - a.width)[0];
    }
    if (desc.includes("small")) {
      return circles.sort((a, b) => a.width - b.width)[0];
    }
  }

  // "the lid" / "top panel" = topmost rectangle
  if (desc.includes("lid") || desc.includes("top")) {
    return shapes
      .filter(s => s.type === "rectangle")
      .sort((a, b) => a.y - b.y)[0]; // smallest y = topmost
  }

  // "the bottom" = bottommost rectangle
  if (desc.includes("bottom")) {
    return shapes
      .filter(s => s.type === "rectangle")
      .sort((a, b) => b.y - a.y)[0];
  }

  // Fallback: match by name if shapes have been named (future feature)
  // or by closest match to the description
  return null;
}
```

### What this fixes

1. **Finger joints are always correct** because the generator uses
   deterministic math (`fingerWidth = materialThickness`), not LLM output
2. **Layout is always clean** because the generators handle spacing
3. **Complex designs work** because the complexity is in tested code,
   not in a prompt
4. **Modifications work** because "make it bigger" calls `modify` with
   a `resize` action, not a full geometry regeneration
5. **The LLM only does what LLMs are good at**: understanding natural
   language intent and mapping it to structured parameters

---

## PART 2: COMMUNITY PLATFORM COMPLETION

### 2.1 Comments on Workbench designs

#### Schema

```typescript
export const workbenchComments = pgTable("workbench_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  designId: uuid("design_id")
    .notNull()
    .references(() => workbenchDesigns.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  // Reply threading (one level deep only, no nested threads)
  parentId: uuid("parent_id")
    .references(() => workbenchComments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### API routes

```
GET  /api/workbench/designs/[id]/comments    — list comments for a design
POST /api/workbench/designs/[id]/comments    — add a comment (auth required)
DELETE /api/workbench/comments/[id]          — delete own comment (auth required)
```

#### UI

On the design detail page (`/workbench/[id]`), below the description:

```
Comments (7)
────────────────────────────
WoodworkingDave · 2 days ago
Great design! I cut this in 12mm oak and it came out perfect.
The finger joints were tight. Tip: reduce kerf offset by 0.05mm
for hardwood.
  [Reply]

  └─ Jesper · 1 day ago
     Thanks Dave! Oak sounds beautiful. Yeah the kerf is
     calibrated for birch ply, hardwood needs less offset.

────────────────────────────
LaserLisa · 5 days ago
Love this. Remixed it with rounded corners for a gift box.

────────────────────────────
[Write a comment...]                    [Post]
```

- One level of threading (reply to a comment, but not reply to a reply)
- Author name shown (from user profile, see 2.2)
- Markdown NOT supported (plain text only, keeps it simple)
- Comment editing: not in v1 (delete and re-post instead)
- Max length: 2000 characters
- Rate limit: 5 comments per minute per user

### 2.2 User profiles

#### Schema update

Add fields to the existing `users` table:

```typescript
// Add these columns to the users table
displayName: text("display_name"),        // public name (not email)
bio: text("bio"),                         // short bio, max 500 chars
avatarUrl: text("avatar_url"),            // Vercel Blob URL
website: text("website"),                 // personal URL
location: text("location"),              // e.g. "Arhus, Denmark"
```

#### Profile page: `/profile/[userId]`

Public page showing a maker's profile:

```
┌────────────────────────────────────────────┐
│  [Avatar]  WoodworkingDave                 │
│            Portland, OR                    │
│            "Weekend maker. CNC enthusiast. │
│             Building stuff for my kids."   │
│            woodworkingdave.com             │
│                                            │
│            12 designs · 3 remixes          │
│            Joined March 2026              │
│                                            │
│            [Follow]                        │
│                                            │
│  ── Designs ──                             │
│                                            │
│  [Card] [Card] [Card] [Card]              │
│  [Card] [Card] [Card] [Card]              │
│                                            │
└────────────────────────────────────────────┘
```

#### Edit profile: `/account/profile`

(Or add a section to the existing `/account` page)

Fields: display name, bio, avatar (upload), website, location.

#### Author attribution

Update The Workbench cards and detail views to link the author name to
their profile page: `<Link href={/profile/${authorId}}>{authorName}</Link>`

### 2.3 Collections

Users can organize saved designs into named collections (like Pinterest
boards or Spotify playlists).

#### Schema

```typescript
export const designCollections = pgTable("design_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").default(""),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collectionItems = pgTable("collection_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => designCollections.id, { onDelete: "cascade" }),
  // Can hold either a private design or a workbench design
  studioDesignId: uuid("studio_design_id")
    .references(() => studioDesigns.id, { onDelete: "cascade" }),
  workbenchDesignId: uuid("workbench_design_id")
    .references(() => workbenchDesigns.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

#### UI

On `/studio/designs` (My Designs page), add a "Collections" tab:

```
[All designs]  [Collections]

Collections:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Gift     │  │ Shop     │  │ Lamp     │
│ boxes    │  │ jigs     │  │ parts    │
│ 4 items  │  │ 7 items  │  │ 9 items  │
└──────────┘  └──────────┘  └──────────┘

[+ New collection]
```

Adding to a collection: on any design card (My Designs or Workbench),
right-click or click "..." menu and select "Add to collection...".
A dropdown of existing collections appears, plus "New collection".

Public collections appear on the user's profile page.

### 2.4 Following

Users can follow other makers to see their new Workbench publications.

#### Schema

```typescript
export const follows = pgTable("follows", {
  id: uuid("id").defaultRandom().primaryKey(),
  followerId: uuid("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: uuid("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Unique constraint on (followerId, followingId)
```

#### UI

- "Follow" button on profile pages and on Workbench design cards (next
  to the author name)
- "Following" tab on `/studio/designs`: shows recent designs from
  people you follow
- Follower/following counts on profile pages
- Unfollow: click the "Following" button again (toggles)

### 2.5 Notifications

A lightweight notification system for community interactions.

#### Schema

```typescript
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  // "like" | "comment" | "remix" | "follow" | "new_design"
  actorId: uuid("actor_id")
    .references(() => users.id, { onDelete: "set null" }),
  actorName: text("actor_name"),
  // Reference to the relevant entity
  designId: uuid("design_id")
    .references(() => workbenchDesigns.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id")
    .references(() => workbenchComments.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Notification triggers

Create notifications when:

- Someone likes your Workbench design: "{name} liked your design '{title}'"
- Someone comments on your design: "{name} commented on '{title}'"
- Someone remixes your design: "{name} remixed your design '{title}'"
- Someone you follow publishes a new design: "{name} published '{title}'"
- Someone follows you: "{name} started following you"

#### UI

- Bell icon in the site header (next to the user avatar/menu)
- Unread count badge (red dot with number)
- Dropdown panel showing recent notifications
- Click a notification to navigate to the relevant design/comment/profile
- "Mark all as read" button
- `/account/notifications` page for the full notification history

#### API routes

```
GET   /api/notifications          — list user's notifications
PATCH /api/notifications/read     — mark all as read
PATCH /api/notifications/[id]     — mark one as read
```

### 2.6 Version history on Workbench designs

When an author updates a published Workbench design (re-publishes after
modifying), keep the previous version accessible.

#### Schema

```typescript
export const workbenchVersions = pgTable("workbench_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  designId: uuid("design_id")
    .notNull()
    .references(() => workbenchDesigns.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  data: jsonb("data").$type<StudioDesignFile>().notNull(),
  changelog: text("changelog").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### UI

On the design detail page, show a "Version history" section:

```
Version history
────────────────────────────
v3 (current) · Apr 28, 2026
  "Fixed finger joint spacing on side panels"

v2 · Apr 25, 2026
  "Added divider and lid handle"

v1 · Apr 20, 2026
  "Initial release"

[Open v2]  [Open v1]
```

"Open" loads that version's design data into the studio.

### 2.7 Moderation queue

#### Admin page: `/admin/workbench`

A simple moderation view for flagged or reported content.

- List of designs with status "flagged"
- For each: thumbnail, title, author, flag reason
- Actions: "Approve" (set status back to "published"), "Remove" (set
  to "removed"), "Ban author" (set all their designs to removed)

#### User reporting

On each Workbench design and each comment, a small "Report" link. Clicking
it asks for a reason (dropdown: "Spam", "Inappropriate content", "Copyright
violation", "Other") and sets the content's status to "flagged".

#### API routes

```
POST /api/workbench/designs/[id]/report   — flag a design
POST /api/workbench/comments/[id]/report  — flag a comment
GET  /api/admin/workbench/flagged         — list flagged content (admin)
PATCH /api/admin/workbench/[id]/moderate  — approve or remove (admin)
```

---

## PART 3: ADDITIONAL IMPROVEMENTS

### 3.1 AI generating complex path shapes

Now that the AI uses generators, add a `freeform-path` generator that
creates shapes from descriptive geometry rather than raw coordinates:

```typescript
interface FreeformPathParams {
  description: "leaf" | "heart" | "arrow" | "bracket-profile" |
               "arch" | "teardrop" | "keyhole" | "handle";
  width: number;
  height: number;
  // Each description maps to a hardcoded parametric path template
  // that scales to the given width/height
}
```

The templates are pre-computed SVG path data strings that scale cleanly.
This is NOT the LLM generating bezier curves. It's the LLM picking from
a library of tested shapes. The same approach as font glyphs: someone
drew them once, they scale forever.

Add 15-20 common maker shapes as templates:
leaf, heart, arrow (various), arch, teardrop, keyhole, handle/pull,
rounded-rectangle, oval, cross, T-shape, L-bracket, wedge, dovetail
profile, finger-joint-test strip

### 3.2 Tracking events for the studio

Add tracking now that the studio is a mature product:

```typescript
export const studioEvents = pgTable("studio_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  // "page_view" | "design_created" | "design_saved" | "svg_export"
  // | "shaper_export" | "laser_export" | "cnc_export"
  // | "ai_request" | "workbench_publish" | "workbench_download"
  // | "workbench_like" | "workbench_comment"
  designId: uuid("design_id"),
  country: text("country"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

Fire-and-forget pattern, same as all other tracking on the site.

Add to the admin events dashboard (`/admin/events`): a "Studio" section
showing usage stats.

---

## New npm dependencies

None. All generators are pure TypeScript math. The AI calls use the
existing OpenRouter integration via fetch.

---

## Testing checklist

### AI Assistant (rebuilt)
- [ ] "Draw a 100mm square" calls simple-shape generator, square appears
- [ ] "I need a box, 200x150x100, 6mm plywood" calls box generator,
      6 panels appear with correct dimensions
- [ ] "Add finger joints" calls box generator with jointType: "finger",
      panels have interlocking fingers
- [ ] Finger joints interlock correctly (finger width = material thickness)
- [ ] "Add a 30mm hole in the lid" calls hole generator, circle appears
      centered on the topmost panel
- [ ] "Make it bigger, 300mm wide" calls modify generator, box regenerates
- [ ] "Make me 4 coasters with my name" calls coaster generator, 4
      circles appear with text
- [ ] "Phone stand at 65 degrees" calls phone-stand generator, 2
      interlocking pieces appear
- [ ] AI asks for clarification when request is ambiguous
- [ ] AI errors are handled gracefully (toast message, no crash)
- [ ] Rate limit works (10 requests/minute)

### Comments
- [ ] Comment section visible on Workbench design detail page
- [ ] Can write and post a comment (auth required)
- [ ] Can reply to a comment (one level deep)
- [ ] Can delete own comment
- [ ] Comments show author name, relative time
- [ ] Max 2000 characters enforced

### User profiles
- [ ] `/profile/[userId]` shows public profile with designs
- [ ] Can edit display name, bio, avatar, website, location
- [ ] Avatar upload works
- [ ] Author names on Workbench cards link to profiles

### Collections
- [ ] Can create a collection from My Designs page
- [ ] Can add designs to a collection (from card menu)
- [ ] Collections show on My Designs page
- [ ] Public collections show on profile page

### Following
- [ ] Can follow a user from their profile or from a design card
- [ ] "Following" tab on My Designs shows followed users' designs
- [ ] Can unfollow (toggle button)
- [ ] Follower/following counts on profiles

### Notifications
- [ ] Bell icon in header with unread count
- [ ] Notifications created for: like, comment, remix, follow, new design
- [ ] Click notification navigates to the right page
- [ ] Mark as read works (individual and all)

### Version history
- [ ] Re-publishing a Workbench design creates a new version
- [ ] Version history visible on design detail page
- [ ] Can open a previous version in the studio

### Moderation
- [ ] Report link on designs and comments
- [ ] Flagged content appears in `/admin/workbench`
- [ ] Admin can approve or remove flagged content

### Tracking
- [ ] Studio events logged for page views, exports, AI requests
- [ ] Admin events dashboard shows Studio section

### Regression
- [ ] All Phase 1-6 features still work
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds

---

## For Claude Code

This is the largest phase in the project. Build order:

**Week 1: AI rebuild**
1. Generator library (box, simple-shape, hole, modify first)
2. Updated system prompt and response handler
3. Shape description resolver
4. Test the core loop: type request, AI returns generator call,
   generator produces shapes, shapes appear on canvas
5. Remaining generators (coaster, phone-stand, circle-pattern, etc.)
6. Freeform path templates

**Week 2: Community platform**
7. User profile schema + page + edit
8. Comments schema + API + UI
9. Collections schema + API + UI
10. Following schema + API + UI
11. Notifications schema + API + UI + triggers
12. Version history
13. Moderation queue
14. Tracking events

The AI rebuild is the highest priority. Get the box generator producing
correct finger joints before building anything else. The box-with-finger-
joints request is the benchmark: if it works, everything else will work
because the architecture is right.

For the box generator finger joint math, copy the proven formulas from
`BOX-JOINT-JIG-KNOWLEDGE.md`:
```
fingerCount = floor(edgeLength / (fingerWidth * 2))
slotWidth = fingerWidth = materialThickness
```
Do not invent new math. The Box Joint Jig tool has been live for months
and its geometry is proven correct.

---

*Phase 7 brief for the Jesper Makes 2D Design Studio. The AI that
understands your intent and the generators that get the math right.
A community that shares freely. This is the version you make the
YouTube video about.*
