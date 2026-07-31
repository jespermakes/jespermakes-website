# 3D Lamp Designer - Product Requirements Document

## Overview

Build a guided, browser-based 3D lamp designer at `/lamp-designer` on jespermakes.com. The tool walks anyone through designing a 3D-printable lamp, step by step, with real-time 3D preview and built-in constraints that guarantee the result works as a lamp.

This lives in the existing Next.js 14.2 codebase alongside the 2D Design Studio and Marketplace.

## Technical Stack

- Next.js 14.2 App Router (existing)
- React 18 (existing)
- TypeScript 5 (existing)
- Tailwind CSS (existing, uses custom theme: cream, wood, forest, etc.)
- **Three.js + @react-three/fiber + @react-three/drei** (NEW - for 3D preview)
- Drizzle ORM + PostgreSQL (existing, for saving designs)
- Vercel Blob (existing, for thumbnails)

## Build Phases (Sequential)

### Phase 1: Foundation & 3D Scene

**Route setup:**
- Create `/src/app/lamp-designer/page.tsx` (client component)
- Create `/src/app/lamp-designer/layout.tsx` with metadata
- Add "Lamp Designer" to Creator Tools dropdown in layout.tsx and mobile-nav.tsx

**3D Scene:**
- Install three, @react-three/fiber, @react-three/drei
- Create `/src/components/lamp-designer/scene.tsx` - Canvas with:
  - OrbitControls (limited vertical rotation)
  - Soft ambient + point light (simulating bulb)
  - Ground plane with shadow
  - Auto-rotating lamp mesh
- Create `/src/components/lamp-designer/lamp-mesh.tsx` - generates hollow lamp geometry from parameters

**Basic parametric geometry:**
- Revolution-of-profile approach: define a 2D profile curve, revolve it 360 degrees
- Start with a simple cone: top radius, bottom radius, height
- Generate BufferGeometry with inner and outer walls (wall thickness parameter)
- Close top and bottom edges

**Page layout:**
- Left panel: step-by-step journey UI (narrow sidebar)
- Center: 3D preview (fills remaining space)
- Right panel: contextual controls for current step
- Mobile: steps at top, 3D preview below, controls in bottom sheet

### Phase 2: Geometry Engine & Base Shapes

**Three starting templates (each already a "good lamp"):**

1. **Cone** - Classic Henningsen-inspired. Params: top radius, bottom radius, height, curve tension
2. **Dome** - Noguchi-inspired hemisphere. Params: radius, height, squash factor
3. **Cylinder** - Modern pendant. Params: radius, height, taper

**Profile curve system:**
- Each template defines a profile as an array of 2D points
- Cubic Bezier interpolation between points for smooth curves
- Revolution around Y axis with configurable segment count (32-64)
- Wall thickness applied as an offset normal to the profile

**Geometry generation (`/src/lib/lamp-designer/geometry.ts`):**
- `generateLampGeometry(profile, wallThickness, segments)` returns BufferGeometry
- Produces inner wall, outer wall, top rim, bottom rim
- Computes normals for proper lighting
- Must be watertight and manifold (for export)

### Phase 3: The 8-Step Guided Journey

**Step navigation component** (`/src/components/lamp-designer/step-nav.tsx`):
- Vertical step indicator on left side
- Steps: Context, Form, Shape, Light, Pattern, Check, Reveal, Export
- Each step has an icon, name, and completion state
- Can go back to previous steps freely

**Step 0 - Context** (`/src/components/lamp-designer/steps/context-step.tsx`):
- "Where will this lamp live?" - visual cards
- Options: Bedside table, Dining table, Reading corner, Hallway, Desk, Shelf
- Each sets invisible constraints:
  - eyeHeight range (for shielding angle calc)
  - suggested proportions
  - suggested light direction (down vs ambient)
- Beautiful illustration or photo for each context

**Step 1 - Form** (`steps/form-step.tsx`):
- Choose from 3 starting templates
- Each shown as a lit 3D thumbnail (small Canvas per card, or static render)
- Selecting one loads its profile into the parametric engine
- Brief description of each: "Clean lines, directed light" / "Soft glow, gentle curves" / "Modern, even light"

**Step 2 - Shape** (`steps/shape-step.tsx`):
- Sliders for the active template's parameters
- Height, top diameter, bottom diameter, curve tension, wall thickness
- All changes update 3D preview in real time
- Constraint indicators:
  - Shielding angle meter (green/yellow/red)
  - Proportion ratio display
  - "The bulb would be visible from seated height" warning
- Sliders have soft stops at constraint boundaries (resist but don't block)

**Step 3 - Light** (`steps/light-step.tsx`):
- Three controls in plain language:
  - "How warm" (color temperature slider: cool white to warm amber)
  - "How wide" (beam angle: focused pool to wide wash)
  - "Which way" (light direction: down/up/ambient)
- 3D preview updates to show light behavior:
  - Ground plane shows light pool
  - Walls (optional backdrop) show light spread
- One-sentence guidance that updates: "Bring the opening down to focus light on the table"

**Step 4 - Pattern** (`steps/pattern-step.tsx`):
- Predefined pattern library (no full pattern editor in MVP):
  - Smooth (no pattern)
  - Vertical lines
  - Horizontal rings
  - Diamond grid
  - Hexagonal
  - Organic/flowing
- Pattern applied as a texture or as actual geometry (perforations)
- 3D preview shows how light interacts with pattern (shadow projection)
- Each pattern has a name and small preview icon

**Step 5 - Reality Check** (`steps/check-step.tsx`):
- Material recommendation: "Print in translucent PETG for best results"
- Print mode: "Vase mode (spiralize), 0.6mm nozzle"
- Bulb compatibility: "Fits standard E27 LED bulb"
- Dimensions summary
- Any warnings (thermal clearance, overhang angle)
- All presented as calm, clear statements, not a wall of red

**Step 6 - Reveal** (`steps/reveal-step.tsx`):
- Beauty shot: lamp shown in a room context
- Orbit controls enabled for the user to admire their design
- Light on and off toggle
- "Share" button (copies a link or generates an image)

**Step 7 - Export** (`steps/export-step.tsx`):
- Download STL button
- Download 3MF button (if feasible)
- Print settings summary card
- "Publish to Marketplace" button (if logged in)
- "Upload to MakerWorld" link with instructions
- Hardware guide: bulb type, socket, wiring safety basics

### Phase 4: Constraint Engine

**File: `/src/lib/lamp-designer/constraints.ts`**

Constraints computed in real time from the current geometry:

1. **Shielding angle**: angle from bulb center to shade lip. Must be >= 25 degrees. Warn at 25-30, good at 30+.
2. **Bulb fit**: inner diameter at socket entry >= bulb max diameter + 5mm clearance (E27 = 65mm max, so >= 70mm)
3. **Thermal clearance**: gap from bulb to shade inner wall >= 20mm (PETG) or >= 50mm (PLA)
4. **Proportion check**: height/diameter ratio between 0.5 and 2.5
5. **Wall thickness**: minimum 0.8mm
6. **Overhang angle**: no section steeper than 45 degrees from vertical (vase mode printability)
7. **Opening ratio**: top/bottom opening ratio between 0.2 and 1.5

Each constraint returns: { ok: boolean, value: number, message: string, severity: "info" | "warn" | "error" }

### Phase 5: Export Pipeline

**STL Export** (`/src/lib/lamp-designer/export-stl.ts`):
- Use Three.js STLExporter
- Binary STL format
- Ensure geometry is manifold before export

**3MF Export** (`/src/lib/lamp-designer/export-3mf.ts`):
- 3MF is a ZIP containing XML + mesh data
- Generate the XML structure with mesh triangles
- Include material zones if multi-material
- Include suggested print settings in metadata

**Thumbnail generation:**
- Render a snapshot of the 3D scene to canvas
- Convert to PNG/JPEG blob
- Upload to Vercel Blob for marketplace/saved designs

### Phase 6: Database & Account Integration

**New table: `lampDesigns`** (add to schema.ts):
```
lampDesigns:
  id: uuid PK
  userId: uuid FK -> users (nullable for anonymous)
  name: text
  parameters: jsonb (the full parametric state)
  thumbnail: text (URL)
  context: text (bedside/dining/etc)
  templateId: text (cone/dome/cylinder)
  createdAt: timestamp
  updatedAt: timestamp
```

**Save/Load API routes:**
- POST `/api/lamp-designer/save` - save design (requires auth)
- GET `/api/lamp-designer/designs` - list user's saved designs
- GET `/api/lamp-designer/designs/[id]` - load a specific design

**Marketplace integration:**
- Add "Lamp" and "3D Print" categories to marketplace
- Publish flow: save design -> generate thumbnail -> create workbenchDesigns entry
- "Open in Lamp Designer" button on marketplace cards with category "Lamp"
- Store the parametric state in the workbenchDesigns.data field

### Phase 7: Polish

- Loading skeleton while Three.js initializes
- Responsive layout for mobile/tablet
- Keyboard shortcuts (1-8 for steps, arrow keys for parameter nudge)
- OpenGraph meta image
- Analytics tracking (page_view, step_completed, design_exported, design_published)
- Performance: lazy-load Three.js bundle, suspense boundary

## Design Language

Match the existing jespermakes.com aesthetic:
- Colors: cream background, wood text, forest accents
- Typography: serif headings, system sans body
- Rounded corners, soft shadows
- The warm "workshop bench" feel from the vision doc

## File Structure

```
src/
  app/
    lamp-designer/
      layout.tsx
      page.tsx
  components/
    lamp-designer/
      scene.tsx
      lamp-mesh.tsx
      step-nav.tsx
      steps/
        context-step.tsx
        form-step.tsx
        shape-step.tsx
        light-step.tsx
        pattern-step.tsx
        check-step.tsx
        reveal-step.tsx
        export-step.tsx
  lib/
    lamp-designer/
      geometry.ts
      constraints.ts
      templates.ts
      patterns.ts
      export-stl.ts
      export-3mf.ts
      types.ts
```

## E27 Bulb Reference Dimensions

- Max diameter: 60mm (standard A60/A19)
- Socket diameter: 27mm
- Total height with socket: ~120mm
- LED bulb max surface temp: ~40-60C (safe for PETG at 20mm clearance)

## Constraints Summary (from research)

From Henningsen: shade must hide bulb from viewing angles, logarithmic spiral curves, 3:2:1 proportion ratios
From Noguchi: material translucency as primary variable, lightness and warmth
From lighting engineering: shielding angle >= 30deg, UGR <= 19 for comfort, beam angle determines light spread

## IMPORTANT Implementation Notes

- This is Next.js 14.2 with React 18 (NOT React 19, NOT Next.js 15)
- Use `"use client"` directive on all components that use Three.js/R3F
- Three.js Canvas must be wrapped in a dynamic import with `ssr: false` to avoid server-side rendering issues
- Use the existing Tailwind theme colors (cream, wood, wood-light, forest, etc.)
- Follow existing code patterns: see cone-lamp/page.tsx and studio/(canvas)/page.tsx for reference
- Do NOT use em-dashes anywhere. Use commas, hyphens, "to", or restructure.
- The Vercel deployment is connected to GitHub. Push to main to deploy.
- Test builds with `npx next build` before committing.
