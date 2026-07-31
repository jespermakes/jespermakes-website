# 3D Lamp Designer - Build Tasks

Read the full PRD at LAMP-DESIGNER-PRD.md for detailed specs.
Read the vision and research docs in /home/jesper/claude-code-workspace/3D Lamp Generator/ for context.

IMPORTANT: This is Next.js 14.2 with React 18. Do NOT use em-dashes anywhere. Use the existing Tailwind theme (cream, wood, forest). Test each phase with `npx next build` before committing. Push to main after each phase to trigger deploy.

## Phase 1: Foundation & 3D Scene
- [x] Install three, @react-three/fiber, @react-three/drei as dependencies
- [x] Create /src/lib/lamp-designer/types.ts with all TypeScript types (LampParameters, LampTemplate, LampConstraint, StepId, etc.)
- [x] Create /src/lib/lamp-designer/templates.ts with 3 starting templates (cone, dome, cylinder) each defining a profile curve
- [x] Create /src/lib/lamp-designer/geometry.ts with generateLampGeometry() that creates a hollow BufferGeometry from a profile curve via revolution
- [x] Create /src/components/lamp-designer/lamp-mesh.tsx that renders the parametric lamp geometry with proper materials (translucent outer, slight glow)
- [x] Create /src/components/lamp-designer/scene.tsx with R3F Canvas, OrbitControls, lighting (ambient + point light as bulb), ground plane with shadow, wrapped in dynamic import with ssr:false
- [x] Create /src/components/lamp-designer/step-nav.tsx - vertical step indicator (8 steps with icons and names)
- [x] Create /src/app/lamp-designer/layout.tsx with metadata (title: "3D Lamp Designer | Jesper Makes")
- [x] Create /src/app/lamp-designer/page.tsx with the main layout: left step nav, center 3D preview, right controls panel, step state management
- [x] Add "Lamp Designer" to Creator Tools dropdown in /src/app/layout.tsx and /src/components/mobile-nav.tsx
- [x] Verify build passes with `npx next build`
- [x] Git commit and push Phase 1

## Phase 2: Step Components & Guided Journey
- [x] Create /src/components/lamp-designer/steps/context-step.tsx - "Where will this lamp live?" with visual cards (Bedside, Dining, Reading, Hallway, Desk, Shelf) that set constraints
- [x] Create /src/components/lamp-designer/steps/form-step.tsx - choose from 3 templates, each shown with name and description
- [x] Create /src/components/lamp-designer/steps/shape-step.tsx - sliders for height, top diameter, bottom diameter, curve tension, wall thickness with real-time preview updates
- [x] Create /src/components/lamp-designer/steps/light-step.tsx - warmth, spread, direction controls with plain-language guidance
- [x] Create /src/components/lamp-designer/steps/pattern-step.tsx - predefined pattern selection (Smooth, Vertical lines, Horizontal rings, Diamond grid, Hexagonal, Organic)
- [x] Create /src/components/lamp-designer/steps/check-step.tsx - material recommendation, print settings, bulb compatibility, dimension summary
- [x] Create /src/components/lamp-designer/steps/reveal-step.tsx - beauty shot with room context, on/off toggle
- [x] Create /src/components/lamp-designer/steps/export-step.tsx - download buttons (STL), publish to marketplace button, MakerWorld link
- [x] Wire all steps into page.tsx with proper state flow
- [x] Verify build passes with `npx next build`
- [x] Git commit and push Phase 2

## Phase 3: Constraint Engine
- [x] Create /src/lib/lamp-designer/constraints.ts with constraint functions: shieldingAngle, bulbFit, thermalClearance, proportionCheck, wallThickness, overhangAngle, openingRatio
- [x] Each constraint returns { ok, value, message, severity }
- [x] Integrate constraint display into shape-step.tsx (visual indicators, warning messages)
- [x] Add soft resistance to sliders when approaching constraint boundaries
- [x] Verify build passes with `npx next build`
- [x] Git commit and push Phase 3

## Phase 4: Pattern System
- [x] Create /src/lib/lamp-designer/patterns.ts with pattern definitions
- [x] Implement pattern application to lamp geometry (texture-based approach for MVP: apply patterns as opacity/alpha maps on the lamp material)
- [x] Light interaction with patterns (shadow projection through perforations onto ground plane)
- [x] Wire pattern selection into pattern-step.tsx with live preview
- [x] Verify build passes with `npx next build`
- [x] Git commit and push Phase 4

## Phase 5: Export Pipeline
- [x] Create /src/lib/lamp-designer/export-stl.ts using Three.js STLExporter (binary format)
- [x] Create /src/lib/lamp-designer/export-3mf.ts generating 3MF ZIP with XML mesh data
- [x] Wire download buttons in export-step.tsx to trigger exports
- [x] Generate print settings card as downloadable PDF or text summary
- [x] Verify build passes with `npx next build`
- [x] Git commit and push Phase 5

## Phase 6: Database & Account Integration
- [x] Add lampDesigns table to /src/lib/db/schema.ts (id, userId, name, parameters jsonb, thumbnail, context, templateId, timestamps)
- [x] Create migration script at /scripts/apply-migration-lamp-designs.ts
- [x] Create /src/app/api/lamp-designer/save/route.ts - POST to save design
- [x] Create /src/app/api/lamp-designer/designs/route.ts - GET to list user's designs
- [x] Create /src/app/api/lamp-designer/designs/[id]/route.ts - GET to load a design
- [x] Add save/load UI to the lamp designer page (save button in top bar, load from "Open..." dialog)
- [x] Add "Lamp" category to marketplace categories
- [x] Wire "Publish to Marketplace" in export step to create a workbenchDesigns entry with lamp data
- [x] Verify build passes with `npx next build`
- [x] Git commit and push Phase 6

## Phase 7: Polish & Final Deploy
- [x] Add loading skeleton/suspense boundary while Three.js loads
- [x] Responsive layout: mobile step navigation, bottom sheet controls
- [x] Add lamp-designer to sitemap.ts
- [x] Create analytics tracking (page_view, step_completed, design_exported, design_published) via /src/lib/lamp-designer-track.ts and API route
- [x] Final build test with `npx next build`
- [x] Git commit and push Phase 7
