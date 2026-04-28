"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Canvas } from "@/components/studio/canvas";
import {
  ContextMenu,
  type ContextMenuItemOrSeparator,
} from "@/components/studio/context-menu";
import { NodeOverlay } from "@/components/studio/node-overlay";
import { PenOverlay } from "@/components/studio/pen-overlay";
import { KerfOverlay } from "@/components/studio/kerf-overlay";
import { MaterialOutline } from "@/components/studio/material-outline";
import { PlanPanel } from "@/components/studio/plan-panel";
import { PropertiesPanel } from "@/components/studio/properties-panel";
import { Ruler, RulerCorner } from "@/components/studio/ruler";
import { SelectionHandles } from "@/components/studio/selection-handles";
import { StatusBar } from "@/components/studio/status-bar";
import { Toolbar } from "@/components/studio/toolbar";
import { ToolOverlay } from "@/components/studio/tool-overlay";
import { TopBar, type SaveStatus } from "@/components/studio/top-bar";
import { WelcomeOverlay } from "@/components/studio/welcome-overlay";
import {
  canRedo,
  canUndo,
  initialState,
  reducer,
} from "@/lib/studio/reducer";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/studio/constants";
import {
  boxesIntersect,
  rectFromCorners,
  screenToDoc,
  shapeBounds,
  shapesBounds,
  snapPoint,
} from "@/lib/studio/geometry";
import {
  createCircle,
  createLine,
  createPath,
  createRectangle,
  createText,
  generateId,
} from "@/lib/studio/shape-factory";
import {
  rescalePathDataToBounds,
  rescalePathToBounds,
  resizeLineEndpoint,
  resizeRectLikeShape,
  rotateShape,
  translateShape,
} from "@/lib/studio/transform";
import {
  applyNodeDrag,
  generateArcPoints,
  generatePolygonPoints,
  shapeToPath,
  syncPathBounds,
} from "@/lib/studio/path-ops";
import {
  findActiveTool,
  loadTools,
  saveTools as persistTools,
} from "@/lib/studio/tool-library";
import { shapesWithCutTypeColors } from "@/lib/studio/cut-types";
import { applyBoolean, type BooleanOp } from "@/lib/studio/boolean-ops";
import {
  buildDesignFile,
  downloadDesignFile,
  parseDesignFile,
} from "@/lib/studio/file-format";
import {
  downloadProfileExport,
  rememberProfile,
  type ExportProfile,
} from "@/lib/studio/export-profiles";
import { parseSVG, recenterImportedShapes } from "@/lib/studio/svg-import";
import {
  applyMoveSnap,
  snapThresholdMm,
  type GuideLine,
} from "@/lib/studio/guides";
import type { LineEndpointHandle, ResizeHandle } from "@/lib/studio/geometry";
import type {
  CuttingTool,
  PathPoint,
  Shape,
  Tool,
} from "@/lib/studio/types";

// Module-level clipboard: shapes copied within the app, not the system
// clipboard. Persists across mount cycles within a single page session.
let clipboard: Shape[] | null = null;
const PASTE_OFFSET_MM = 10;

export default function StudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? null;

  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const { document: doc } = state;

  const [activeTool, setActiveToolState] = useState<Tool>("select");
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Cancel any in-progress draw whenever the active tool changes.
  const setActiveTool = useCallback((t: Tool) => {
    setActiveToolState(t);
    setDrawing(null);
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Track canvas pixel dimensions so we can compute the viewBox in mm.
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cursorDocPos, setCursorDocPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [editingTextShapeId, setEditingTextShapeId] = useState<string | null>(
    null,
  );
  const [nodeEditingShapeId, setNodeEditingShapeId] = useState<string | null>(
    null,
  );
  const [selectedNodeIndices, setSelectedNodeIndices] = useState<number[]>([]);
  /** Tracks an in-progress node or handle drag while in node editing mode. */
  type NodeDrag =
    | {
        kind: "node";
        pointerId: number;
        nodeIndex: number;
        startDocX: number;
        startDocY: number;
        currentDocX: number;
        currentDocY: number;
        origPoints: PathPoint[];
      }
    | {
        kind: "handle";
        pointerId: number;
        nodeIndex: number;
        which: "in" | "out";
        startDocX: number;
        startDocY: number;
        currentDocX: number;
        currentDocY: number;
        origPoints: PathPoint[];
        alt: boolean;
      };
  const [nodeDrag, setNodeDrag] = useState<NodeDrag | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetShapeId: string | null;
  } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  // Document metadata used by the design-file format and (in Group 7) cloud
  // save. These default to a fresh "Untitled" design.
  const [designName, setDesignName] = useState("Untitled");
  const [designId, setDesignId] = useState<string | null>(null);
  const [designCreatedAt, setDesignCreatedAt] = useState<string | null>(null);

  // Tool library — persisted in localStorage so the same shop set follows
  // the user across designs.
  const [tools, setTools] = useState<CuttingTool[]>([]);
  useEffect(() => {
    setTools(loadTools());
  }, []);
  const activeCuttingTool = useMemo(
    () => findActiveTool(tools, doc.activeToolId),
    [tools, doc.activeToolId],
  );
  // Default the document's activeToolId to the first tool the first time
  // the library loads (otherwise the kerf section reads 0).
  useEffect(() => {
    if (!doc.activeToolId && tools.length > 0) {
      dispatch({ type: "SET_ACTIVE_TOOL_ID", toolId: tools[0].id });
    }
  }, [tools, doc.activeToolId]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("never-saved");
  // Tracks whether the document has changed since the last successful save.
  // Set on every shape mutation, cleared after a successful save.
  const dirtyRef = useRef(false);
  const isInitialDocRef = useRef(true);

  useEffect(() => {
    // Skip the very first run (initial mount).
    if (isInitialDocRef.current) {
      isInitialDocRef.current = false;
      return;
    }
    dirtyRef.current = true;
    setSaveStatus((s) => (s === "saving" ? s : designId ? "dirty" : s));
  }, [doc.shapes, designName, doc.gridSpacing, doc.snapToGrid, doc.unitDisplay, designId]);
  // Idle for hints — flips false after the first user action.
  const [idle, setIdle] = useState(true);
  // Cursor screen position (for the floating tool-hint label). Null when the
  // pointer is outside the canvas.
  const [cursorScreenPos, setCursorScreenPos] = useState<
    { x: number; y: number } | null
  >(null);

  // First-visit welcome overlay.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem("studio_onboarding_seen")) {
        setShowWelcome(true);
      }
    } catch {
      // Ignore localStorage failures (private mode etc.).
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    try {
      localStorage.setItem("studio_onboarding_seen", "1");
    } catch {
      /* noop */
    }
    setShowWelcome(false);
  }, []);

  // Mark idle false on first user action of any kind.
  const markActive = useCallback(() => {
    setIdle(false);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Clear text editing whenever the selection no longer contains the shape.
  useEffect(() => {
    if (!editingTextShapeId) return;
    if (!doc.selectedIds.includes(editingTextShapeId)) {
      setEditingTextShapeId(null);
    }
  }, [doc.selectedIds, editingTextShapeId]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const viewWidthMm = canvasSize.width > 0 ? canvasSize.width / doc.zoom : 0;
  const viewHeightMm = canvasSize.height > 0 ? canvasSize.height / doc.zoom : 0;

  // Pan state — track an in-progress pan (with the original viewport snapshot
  // so we don't accumulate floating-point drift).
  const panRef = useRef<
    | {
        pointerId: number;
        startScreenX: number;
        startScreenY: number;
        startViewportX: number;
        startViewportY: number;
      }
    | null
  >(null);

  // Active drawing operation (rectangle/circle drag, or line two-click,
  // or pen click-by-click + drag for handles).
  type DrawingState =
    | {
        kind: "drag";
        tool: "rectangle" | "circle";
        pointerId: number;
        startDocX: number;
        startDocY: number;
        currentDocX: number;
        currentDocY: number;
        shift: boolean;
      }
    | {
        kind: "two-click";
        tool: "line";
        startDocX: number;
        startDocY: number;
        currentDocX: number;
        currentDocY: number;
        shift: boolean;
      }
    | {
        kind: "pen";
        tool: "pen";
        points: PathPoint[];
        currentDocX: number;
        currentDocY: number;
        startScreenX: number;
        startScreenY: number;
        dragging: { pointerId: number; pointIndex: number; alt: boolean } | null;
        shift: boolean;
        hoveringFirstPoint: boolean;
      }
    | {
        kind: "drag-radius";
        tool: "polygon";
        pointerId: number;
        centerDocX: number;
        centerDocY: number;
        currentDocX: number;
        currentDocY: number;
        shift: boolean;
      }
    | {
        kind: "arc";
        tool: "arc";
        stage: "radius" | "sweep";
        pointerId: number | null;
        centerDocX: number;
        centerDocY: number;
        currentDocX: number;
        currentDocY: number;
        radius: number;
        startAngleDeg: number;
        sweepDeg: number;
        prevAngleDeg: number;
        shift: boolean;
      };
  const [drawing, setDrawing] = useState<DrawingState | null>(null);

  // Polygon-tool persistent settings.
  const [polygonSides, setPolygonSides] = useState(6);
  const [polygonStar, setPolygonStar] = useState(false);
  const [polygonInnerPct, setPolygonInnerPct] = useState(50);

  // Active select-tool interaction (marquee drag).
  type SelectInteraction = {
    kind: "marquee";
    pointerId: number;
    additive: boolean;
    startDocX: number;
    startDocY: number;
    currentDocX: number;
    currentDocY: number;
  };
  const [selectInteraction, setSelectInteraction] =
    useState<SelectInteraction | null>(null);

  // Transformation interactions: move (drag selected shapes), resize (drag a
  // resize handle), rotate (drag the rotation handle).
  type TransformInteraction =
    | {
        kind: "move";
        pointerId: number;
        startDocX: number;
        startDocY: number;
        currentDocX: number;
        currentDocY: number;
        originals: Map<string, { x: number; y: number }>;
      }
    | {
        kind: "resize";
        pointerId: number;
        targetId: string;
        handle: ResizeHandle;
        original: Shape;
        currentDocX: number;
        currentDocY: number;
        shift: boolean;
      }
    | {
        kind: "resize-line";
        pointerId: number;
        targetId: string;
        handle: LineEndpointHandle;
        original: Shape;
        currentDocX: number;
        currentDocY: number;
      }
    | {
        kind: "rotate";
        pointerId: number;
        targetId: string;
        original: Shape;
        initialPointerAngleDeg: number;
        currentDocX: number;
        currentDocY: number;
        shift: boolean;
      };
  const [transform, setTransform] = useState<TransformInteraction | null>(null);

  const screenPointFromEvent = useCallback(
    (e: ReactPointerEvent<SVGSVGElement> | ReactWheelEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      setIdle(false);
      const isMiddle = e.button === 1;
      // In Review mode all interactions except pan are disabled.
      if (doc.mode === "review" && !spaceHeld && !isMiddle) {
        return;
      }
      const wantsPan = spaceHeld || isMiddle;
      const screen = screenPointFromEvent(e);
      if (wantsPan) {
        panRef.current = {
          pointerId: e.pointerId,
          startScreenX: screen.x,
          startScreenY: screen.y,
          startViewportX: doc.viewportX,
          startViewportY: doc.viewportY,
        };
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;
      const docPoint = screenToDoc(
        screen.x,
        screen.y,
        doc.viewportX,
        doc.viewportY,
        doc.zoom,
      );

      // Node-editing mode intercepts pointer events on its target shape.
      if (nodeEditingShapeId) {
        const targetEl = e.target as Element | null;
        const handleEl = targetEl?.closest?.("[data-node-handle]") as
          | (HTMLElement | SVGElement)
          | null;
        if (handleEl) {
          const which = handleEl.dataset?.nodeHandle as "in" | "out";
          const idx = Number(handleEl.dataset?.nodeIndex);
          const editingShape = doc.shapes.find(
            (s) => s.id === nodeEditingShapeId,
          );
          if (editingShape && editingShape.points && Number.isFinite(idx)) {
            setNodeDrag({
              kind: "handle",
              pointerId: e.pointerId,
              nodeIndex: idx,
              which,
              startDocX: docPoint.x,
              startDocY: docPoint.y,
              currentDocX: docPoint.x,
              currentDocY: docPoint.y,
              origPoints: editingShape.points,
              alt: e.altKey,
            });
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            e.preventDefault();
            return;
          }
        }
        const nodeEl = targetEl?.closest?.("[data-node-index]") as
          | (HTMLElement | SVGElement)
          | null;
        if (nodeEl && !handleEl) {
          const idx = Number(nodeEl.dataset?.nodeIndex);
          if (Number.isFinite(idx)) {
            // Update node selection.
            if (e.shiftKey) {
              setSelectedNodeIndices((prev) =>
                prev.includes(idx)
                  ? prev.filter((i) => i !== idx)
                  : [...prev, idx],
              );
            } else if (!selectedNodeIndices.includes(idx)) {
              setSelectedNodeIndices([idx]);
            }
            const editingShape = doc.shapes.find(
              (s) => s.id === nodeEditingShapeId,
            );
            if (editingShape && editingShape.points) {
              setNodeDrag({
                kind: "node",
                pointerId: e.pointerId,
                nodeIndex: idx,
                startDocX: docPoint.x,
                startDocY: docPoint.y,
                currentDocX: docPoint.x,
                currentDocY: docPoint.y,
                origPoints: editingShape.points,
              });
              (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            }
            e.preventDefault();
            return;
          }
        }
        // Click on a different shape exits node editing and selects it.
        const shapeTarget = targetEl?.closest?.("[data-shape-id]") as
          | (HTMLElement | SVGElement)
          | null;
        const shapeId = shapeTarget?.dataset?.shapeId;
        if (shapeId && shapeId !== nodeEditingShapeId) {
          setNodeEditingShapeId(null);
          setSelectedNodeIndices([]);
          dispatch({ type: "SELECT", ids: [shapeId] });
          e.preventDefault();
          return;
        }
        // Click on empty canvas: deselect nodes (don't exit editing on a
        // single click — Escape exits).
        if (!shapeId) {
          setSelectedNodeIndices([]);
          e.preventDefault();
          return;
        }
        // Click on the editing shape itself but not on a node — no-op.
        e.preventDefault();
        return;
      }

      if (activeTool === "select") {
        const targetEl = e.target as Element | null;
        const planMode = doc.mode !== "design";
        // Handle clicks (resize, rotate, line endpoint) take priority.
        const handleEl = !planMode
          ? (targetEl?.closest?.("[data-handle]") as
              | (HTMLElement | SVGElement)
              | null)
          : null;
        const handleKey = handleEl?.dataset?.handle;
        if (handleKey && doc.selectedIds.length === 1) {
          const targetId = doc.selectedIds[0];
          const original = doc.shapes.find((s) => s.id === targetId);
          if (original) {
            if (handleKey === "rotate") {
              const dx = docPoint.x - original.x;
              const dy = docPoint.y - original.y;
              const initialPointerAngleDeg =
                (Math.atan2(dy, dx) * 180) / Math.PI;
              setTransform({
                kind: "rotate",
                pointerId: e.pointerId,
                targetId,
                original,
                initialPointerAngleDeg,
                currentDocX: docPoint.x,
                currentDocY: docPoint.y,
                shift: e.shiftKey,
              });
            } else if (
              handleKey === "endpoint-1" ||
              handleKey === "endpoint-2"
            ) {
              setTransform({
                kind: "resize-line",
                pointerId: e.pointerId,
                targetId,
                handle: handleKey,
                original,
                currentDocX: docPoint.x,
                currentDocY: docPoint.y,
              });
            } else {
              setTransform({
                kind: "resize",
                pointerId: e.pointerId,
                targetId,
                handle: handleKey as ResizeHandle,
                original,
                currentDocX: docPoint.x,
                currentDocY: docPoint.y,
                shift: e.shiftKey,
              });
            }
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            e.preventDefault();
            return;
          }
        }

        const shapeTarget = targetEl?.closest?.("[data-shape-id]") as
          | (HTMLElement | SVGElement)
          | null;
        const shapeId = shapeTarget?.dataset?.shapeId;
        if (shapeId) {
          if (e.shiftKey) {
            // Pure selection toggle — no move-priming on shift-click.
            dispatch({ type: "TOGGLE_SELECT", id: shapeId });
            e.preventDefault();
            return;
          }
          // No shift: select if not already, then prime a move (Design only).
          let nextSelected = doc.selectedIds;
          if (!doc.selectedIds.includes(shapeId)) {
            dispatch({ type: "SELECT", ids: [shapeId] });
            nextSelected = [shapeId];
          }
          if (!planMode) {
            const originals = new Map<string, { x: number; y: number }>();
            for (const id of nextSelected) {
              const s = doc.shapes.find((sh) => sh.id === id);
              if (s) originals.set(id, { x: s.x, y: s.y });
            }
            if (originals.size > 0) {
              setTransform({
                kind: "move",
                pointerId: e.pointerId,
                startDocX: docPoint.x,
                startDocY: docPoint.y,
                currentDocX: docPoint.x,
                currentDocY: docPoint.y,
                originals,
              });
              (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            }
          }
          e.preventDefault();
          return;
        }
        // Empty canvas: start a marquee. We treat a no-movement gesture as a
        // click-to-deselect on pointer-up.
        setSelectInteraction({
          kind: "marquee",
          pointerId: e.pointerId,
          additive: e.shiftKey,
          startDocX: docPoint.x,
          startDocY: docPoint.y,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
        });
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }

      if (activeTool === "rectangle" || activeTool === "circle") {
        setDrawing({
          kind: "drag",
          tool: activeTool,
          pointerId: e.pointerId,
          startDocX: docPoint.x,
          startDocY: docPoint.y,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          shift: e.shiftKey,
        });
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }

      if (activeTool === "text") {
        const snapped = snapPoint(
          docPoint.x,
          docPoint.y,
          doc.gridSpacing,
          doc.snapToGrid,
        );
        const shape = createText({ x: snapped.x, y: snapped.y });
        dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
        setActiveTool("select");
        setEditingTextShapeId(shape.id);
        e.preventDefault();
        return;
      }

      if (activeTool === "polygon") {
        setDrawing({
          kind: "drag-radius",
          tool: "polygon",
          pointerId: e.pointerId,
          centerDocX: docPoint.x,
          centerDocY: docPoint.y,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          shift: e.shiftKey,
        });
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }

      if (activeTool === "arc") {
        // If we're already in stage 2 (sweeping), this click finalizes.
        if (drawing && drawing.kind === "arc" && drawing.stage === "sweep") {
          let sweep = drawing.sweepDeg;
          if (e.shiftKey || drawing.shift) {
            sweep = Math.round(sweep / 15) * 15;
          }
          if (Math.abs(sweep) > 0.01) {
            const points = generateArcPoints(
              drawing.centerDocX,
              drawing.centerDocY,
              drawing.radius,
              drawing.startAngleDeg,
              sweep,
            );
            if (points.length >= 2) {
              const shape = createPath({ points, closed: false });
              dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
              setActiveTool("select");
            }
          }
          setDrawing(null);
          e.preventDefault();
          return;
        }
        // Otherwise begin stage 1 (drag for radius + start angle).
        setDrawing({
          kind: "arc",
          tool: "arc",
          stage: "radius",
          pointerId: e.pointerId,
          centerDocX: docPoint.x,
          centerDocY: docPoint.y,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          radius: 0,
          startAngleDeg: 0,
          sweepDeg: 0,
          prevAngleDeg: 0,
          shift: e.shiftKey,
        });
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }

      if (activeTool === "pen") {
        const HOVER_THRESHOLD_MM = 8 / Math.max(0.0001, doc.zoom);
        // Already drawing a pen path?
        if (drawing && drawing.kind === "pen") {
          const first = drawing.points[0];
          const distFirst = first
            ? Math.hypot(docPoint.x - first.x, docPoint.y - first.y)
            : Infinity;
          if (distFirst <= HOVER_THRESHOLD_MM && drawing.points.length >= 2) {
            // Close the path.
            const shape = createPath({
              points: drawing.points,
              closed: true,
            });
            dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
            setActiveTool("select");
            setDrawing(null);
            e.preventDefault();
            return;
          }
          // Add a new corner point. Optionally constrain angle from previous.
          const last = drawing.points[drawing.points.length - 1];
          let nx = docPoint.x;
          let ny = docPoint.y;
          if (e.shiftKey && last) {
            const dx = nx - last.x;
            const dy = ny - last.y;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
              const angle = Math.atan2(dy, dx);
              const stepped =
                Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
              nx = last.x + Math.cos(stepped) * len;
              ny = last.y + Math.sin(stepped) * len;
            }
          }
          const newIdx = drawing.points.length;
          setDrawing({
            ...drawing,
            points: [...drawing.points, { x: nx, y: ny }],
            currentDocX: nx,
            currentDocY: ny,
            startScreenX: screen.x,
            startScreenY: screen.y,
            dragging: {
              pointerId: e.pointerId,
              pointIndex: newIdx,
              alt: e.altKey,
            },
            shift: e.shiftKey,
            hoveringFirstPoint: false,
          });
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
          e.preventDefault();
          return;
        }
        // First click: begin a new pen path.
        setDrawing({
          kind: "pen",
          tool: "pen",
          points: [{ x: docPoint.x, y: docPoint.y }],
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          startScreenX: screen.x,
          startScreenY: screen.y,
          dragging: { pointerId: e.pointerId, pointIndex: 0, alt: e.altKey },
          shift: e.shiftKey,
          hoveringFirstPoint: false,
        });
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }

      if (activeTool === "line") {
        if (!drawing) {
          // First click — record start, await the second click.
          setDrawing({
            kind: "two-click",
            tool: "line",
            startDocX: docPoint.x,
            startDocY: docPoint.y,
            currentDocX: docPoint.x,
            currentDocY: docPoint.y,
            shift: e.shiftKey,
          });
        } else if (drawing.kind === "two-click" && drawing.tool === "line") {
          // Second click — finalize.
          let bx = docPoint.x;
          let by = docPoint.y;
          if (e.shiftKey) {
            const dx = bx - drawing.startDocX;
            const dy = by - drawing.startDocY;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
              const angle = Math.atan2(dy, dx);
              const stepped =
                Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
              bx = drawing.startDocX + Math.cos(stepped) * len;
              by = drawing.startDocY + Math.sin(stepped) * len;
            }
          }
          const a = snapPoint(
            drawing.startDocX,
            drawing.startDocY,
            doc.gridSpacing,
            doc.snapToGrid,
          );
          const b = snapPoint(bx, by, doc.gridSpacing, doc.snapToGrid);
          if (a.x !== b.x || a.y !== b.y) {
            const shape = createLine({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
            dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
            setActiveTool("select");
          }
          setDrawing(null);
        }
        e.preventDefault();
        return;
      }
    },
    [
      activeTool,
      drawing,
      spaceHeld,
      doc.viewportX,
      doc.viewportY,
      doc.zoom,
      doc.gridSpacing,
      doc.snapToGrid,
      doc.selectedIds,
      doc.shapes,
      nodeEditingShapeId,
      selectedNodeIndices,
      screenPointFromEvent,
      setActiveTool,
    ],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const screen = screenPointFromEvent(e);
      const docPoint = screenToDoc(
        screen.x,
        screen.y,
        doc.viewportX,
        doc.viewportY,
        doc.zoom,
      );
      setCursorDocPos(docPoint);
      setCursorScreenPos({ x: e.clientX, y: e.clientY });

      if (panRef.current && panRef.current.pointerId === e.pointerId) {
        const dxMm = (screen.x - panRef.current.startScreenX) / doc.zoom;
        const dyMm = (screen.y - panRef.current.startScreenY) / doc.zoom;
        dispatch({
          type: "SET_PAN",
          viewportX: panRef.current.startViewportX - dxMm,
          viewportY: panRef.current.startViewportY - dyMm,
        });
        return;
      }

      if (nodeDrag && nodeDrag.pointerId === e.pointerId) {
        setNodeDrag({
          ...nodeDrag,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          ...(nodeDrag.kind === "handle"
            ? { alt: nodeDrag.alt || e.altKey }
            : {}),
        } as NodeDrag);
        return;
      }

      if (transform && transform.pointerId === e.pointerId) {
        setTransform({
          ...transform,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          ...((transform.kind === "rotate" || transform.kind === "resize")
            ? { shift: e.shiftKey }
            : {}),
        } as TransformInteraction);
        return;
      }

      if (
        selectInteraction &&
        selectInteraction.pointerId === e.pointerId &&
        selectInteraction.kind === "marquee"
      ) {
        setSelectInteraction({
          ...selectInteraction,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
        });
        return;
      }

      if (!drawing) return;
      if (
        drawing.kind === "drag-radius" &&
        drawing.pointerId === e.pointerId
      ) {
        setDrawing({
          ...drawing,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          shift: e.shiftKey,
        });
        return;
      }
      if (drawing.kind === "arc") {
        if (drawing.stage === "radius") {
          if (drawing.pointerId !== e.pointerId) return;
          setDrawing({
            ...drawing,
            currentDocX: docPoint.x,
            currentDocY: docPoint.y,
            shift: e.shiftKey,
          });
          return;
        }
        // stage === "sweep" — accumulate winding from prevAngleDeg
        const dx = docPoint.x - drawing.centerDocX;
        const dy = docPoint.y - drawing.centerDocY;
        const newAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
        let delta = newAngleDeg - drawing.prevAngleDeg;
        // Shortest-signed delta in (-180, 180]
        delta = ((((delta + 180) % 360) + 360) % 360) - 180;
        const nextSweep = drawing.sweepDeg + delta;
        setDrawing({
          ...drawing,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          sweepDeg: nextSweep,
          prevAngleDeg: newAngleDeg,
          shift: e.shiftKey,
        });
        return;
      }
      if (drawing.kind === "pen") {
        const HOVER_THRESHOLD_MM = 8 / Math.max(0.0001, doc.zoom);
        const first = drawing.points[0];
        const distFirst = first
          ? Math.hypot(docPoint.x - first.x, docPoint.y - first.y)
          : Infinity;
        const hoveringFirstPoint =
          drawing.points.length >= 2 && distFirst <= HOVER_THRESHOLD_MM;

        let nextPoints = drawing.points;
        const dragging = drawing.dragging;
        if (dragging) {
          const idx = dragging.pointIndex;
          const target = drawing.points[idx];
          if (target) {
            const handleOut = { x: docPoint.x, y: docPoint.y };
            const handleIn =
              dragging.alt || e.altKey
                ? target.handleIn
                : { x: 2 * target.x - docPoint.x, y: 2 * target.y - docPoint.y };
            nextPoints = drawing.points.slice();
            nextPoints[idx] = { ...target, handleIn, handleOut };
          }
        }

        setDrawing({
          ...drawing,
          points: nextPoints,
          currentDocX: docPoint.x,
          currentDocY: docPoint.y,
          shift: e.shiftKey,
          hoveringFirstPoint,
          dragging: drawing.dragging
            ? { ...drawing.dragging, alt: drawing.dragging.alt || e.altKey }
            : null,
        });
        return;
      }
      const matchesDrag =
        drawing.kind === "drag" && drawing.pointerId === e.pointerId;
      const matchesTwoClick = drawing.kind === "two-click";
      if (!matchesDrag && !matchesTwoClick) return;

      setDrawing({
        ...drawing,
        currentDocX: docPoint.x,
        currentDocY: docPoint.y,
        shift: e.shiftKey,
      });
    },
    [
      doc.zoom,
      doc.viewportX,
      doc.viewportY,
      drawing,
      selectInteraction,
      transform,
      nodeDrag,
      screenPointFromEvent,
    ],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (panRef.current && panRef.current.pointerId === e.pointerId) {
        panRef.current = null;
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (transform && transform.pointerId === e.pointerId) {
        const t = transform;
        const shiftAtUp = e.shiftKey;
        const grid = doc.gridSpacing;
        const snapped = doc.snapToGrid;
        if (t.kind === "move") {
          const rawDx = t.currentDocX - t.startDocX;
          const rawDy = t.currentDocY - t.startDocY;
          const movingShapes = doc.shapes.filter((s) =>
            t.originals.has(s.id),
          );
          const staticShapes = doc.shapes.filter(
            (s) => !t.originals.has(s.id),
          );
          const result = applyMoveSnap({
            movingShapes,
            rawDx,
            rawDy,
            staticShapes,
            threshold: snapThresholdMm(doc.zoom),
            gridSpacing: grid,
            snapToGrid: snapped,
          });
          if (result.dx !== 0 || result.dy !== 0) {
            const updated: Shape[] = [];
            t.originals.forEach((orig, id) => {
              const s = doc.shapes.find((sh) => sh.id === id);
              if (!s) return;
              updated.push(
                translateShape(s, orig.x + result.dx, orig.y + result.dy),
              );
            });
            if (updated.length > 0)
              dispatch({ type: "UPDATE_SHAPES", shapes: updated });
          }
        } else if (t.kind === "resize") {
          const cursor = snapped
            ? snapPoint(t.currentDocX, t.currentDocY, grid, true)
            : { x: t.currentDocX, y: t.currentDocY };
          let next = resizeRectLikeShape(
            t.original,
            t.handle,
            cursor.x,
            cursor.y,
            shiftAtUp || t.shift,
          );
          if (next.type === "path") {
            if (t.original.points && t.original.points.length > 0) {
              next = {
                ...next,
                points: rescalePathToBounds(
                  t.original,
                  next,
                  t.original.points,
                ),
              };
            } else if (t.original.pathData) {
              next = {
                ...next,
                pathData: rescalePathDataToBounds(
                  t.original,
                  next,
                  t.original.pathData,
                ),
              };
            }
          }
          dispatch({ type: "UPDATE_SHAPES", shapes: [next] });
        } else if (t.kind === "resize-line") {
          const cursor = snapped
            ? snapPoint(t.currentDocX, t.currentDocY, grid, true)
            : { x: t.currentDocX, y: t.currentDocY };
          const next = resizeLineEndpoint(
            t.original,
            t.handle,
            cursor.x,
            cursor.y,
          );
          dispatch({ type: "UPDATE_SHAPES", shapes: [next] });
        } else if (t.kind === "rotate") {
          const next = rotateShape(
            t.original,
            t.currentDocX,
            t.currentDocY,
            t.initialPointerAngleDeg,
            shiftAtUp || t.shift,
          );
          if (next.rotation !== t.original.rotation) {
            dispatch({ type: "UPDATE_SHAPES", shapes: [next] });
          }
        }
        setTransform(null);
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (
        selectInteraction &&
        selectInteraction.kind === "marquee" &&
        selectInteraction.pointerId === e.pointerId
      ) {
        const r = rectFromCorners(
          selectInteraction.startDocX,
          selectInteraction.startDocY,
          selectInteraction.currentDocX,
          selectInteraction.currentDocY,
        );
        const screenWidthPx = r.width * doc.zoom;
        const screenHeightPx = r.height * doc.zoom;
        const moved = screenWidthPx > 2 || screenHeightPx > 2;
        if (!moved) {
          // Click on empty canvas — clear selection unless additive.
          if (!selectInteraction.additive) {
            dispatch({ type: "CLEAR_SELECTION" });
          }
        } else {
          const marqueeBox = {
            minX: r.x - r.width / 2,
            minY: r.y - r.height / 2,
            maxX: r.x + r.width / 2,
            maxY: r.y + r.height / 2,
          };
          const intersected = doc.shapes
            .filter((s) => boxesIntersect(shapeBounds(s), marqueeBox))
            .map((s) => s.id);
          const next = selectInteraction.additive
            ? Array.from(new Set([...doc.selectedIds, ...intersected]))
            : intersected;
          dispatch({ type: "SELECT", ids: next });
        }
        setSelectInteraction(null);
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (nodeDrag && nodeDrag.pointerId === e.pointerId) {
        const editingShape = doc.shapes.find(
          (s) => s.id === nodeEditingShapeId,
        );
        if (editingShape && editingShape.points) {
          const dx = nodeDrag.currentDocX - nodeDrag.startDocX;
          const dy = nodeDrag.currentDocY - nodeDrag.startDocY;
          const next = applyNodeDrag(
            nodeDrag,
            editingShape.points,
            dx,
            dy,
            e.altKey,
          );
          if (next !== editingShape.points) {
            const updated = syncPathBounds({
              ...editingShape,
              points: next,
            });
            dispatch({ type: "UPDATE_SHAPES", shapes: [updated] });
          }
        }
        setNodeDrag(null);
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (
        drawing &&
        drawing.kind === "arc" &&
        drawing.stage === "radius" &&
        drawing.pointerId === e.pointerId
      ) {
        const dx = drawing.currentDocX - drawing.centerDocX;
        const dy = drawing.currentDocY - drawing.centerDocY;
        const radius = Math.hypot(dx, dy);
        if (radius < 0.0001) {
          // Cancel — too small.
          setDrawing(null);
        } else {
          const startAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
          setDrawing({
            ...drawing,
            stage: "sweep",
            pointerId: null,
            radius,
            startAngleDeg,
            prevAngleDeg: startAngleDeg,
          });
        }
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (
        drawing &&
        drawing.kind === "drag-radius" &&
        drawing.pointerId === e.pointerId
      ) {
        const dx = drawing.currentDocX - drawing.centerDocX;
        const dy = drawing.currentDocY - drawing.centerDocY;
        const radius = Math.hypot(dx, dy);
        let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (e.shiftKey || drawing.shift) {
          angleDeg = Math.round(angleDeg / 15) * 15;
        }
        if (radius > 0.0001) {
          // First vertex at angle (rotation = angleDeg + 90 because
          // generatePolygonPoints subtracts 90).
          const points = generatePolygonPoints(
            drawing.centerDocX,
            drawing.centerDocY,
            radius,
            polygonSides,
            polygonStar,
            polygonInnerPct,
            angleDeg + 90,
          );
          if (points.length > 0) {
            const shape = createPath({ points, closed: true });
            dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
            setActiveTool("select");
          }
        }
        setDrawing(null);
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (
        drawing &&
        drawing.kind === "pen" &&
        drawing.dragging &&
        drawing.dragging.pointerId === e.pointerId
      ) {
        // If the user barely moved, treat the latest point as a corner — drop
        // its handles so it stays a sharp corner.
        const screen = screenPointFromEvent(e);
        const dragDistPx = Math.hypot(
          screen.x - drawing.startScreenX,
          screen.y - drawing.startScreenY,
        );
        let nextPoints = drawing.points;
        if (dragDistPx < 2) {
          const idx = drawing.dragging.pointIndex;
          const t = drawing.points[idx];
          if (t) {
            nextPoints = drawing.points.slice();
            nextPoints[idx] = {
              ...t,
              handleIn: undefined,
              handleOut: undefined,
            };
          }
        }
        setDrawing({
          ...drawing,
          points: nextPoints,
          dragging: null,
        });
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (
        drawing &&
        drawing.kind === "drag" &&
        drawing.pointerId === e.pointerId
      ) {
        const shift = e.shiftKey || drawing.shift;
        const { startDocX: ax, startDocY: ay } = drawing;
        let bx = drawing.currentDocX;
        let by = drawing.currentDocY;
        if (shift) {
          const dx = bx - ax;
          const dy = by - ay;
          const size = Math.max(Math.abs(dx), Math.abs(dy));
          bx = ax + Math.sign(dx || 1) * size;
          by = ay + Math.sign(dy || 1) * size;
        }
        const a = snapPoint(ax, ay, doc.gridSpacing, doc.snapToGrid);
        const b = snapPoint(bx, by, doc.gridSpacing, doc.snapToGrid);
        const r = rectFromCorners(a.x, a.y, b.x, b.y);
        if (r.width > 0 && r.height > 0) {
          const shape: Shape =
            drawing.tool === "rectangle" ? createRectangle(r) : createCircle(r);
          dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
          setActiveTool("select");
        }
        setDrawing(null);
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }
    },
    [
      drawing,
      selectInteraction,
      transform,
      doc.gridSpacing,
      doc.snapToGrid,
      doc.zoom,
      doc.shapes,
      doc.selectedIds,
      nodeDrag,
      nodeEditingShapeId,
      polygonSides,
      polygonStar,
      polygonInnerPct,
      screenPointFromEvent,
      setActiveTool,
    ],
  );

  const handleWheel = useCallback(
    (e: ReactWheelEvent<SVGSVGElement>) => {
      const screen = screenPointFromEvent(e);
      // Doc point under cursor before zoom.
      const beforeDoc = screenToDoc(
        screen.x,
        screen.y,
        doc.viewportX,
        doc.viewportY,
        doc.zoom,
      );
      const factor = Math.exp(-e.deltaY * 0.0015);
      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, doc.zoom * factor),
      );
      // Keep beforeDoc under the cursor: viewport = doc - screen/zoom.
      const nextViewportX = beforeDoc.x - screen.x / nextZoom;
      const nextViewportY = beforeDoc.y - screen.y / nextZoom;
      dispatch({
        type: "SET_ZOOM",
        zoom: nextZoom,
        viewportX: nextViewportX,
        viewportY: nextViewportY,
      });
    },
    [doc.zoom, doc.viewportX, doc.viewportY, screenPointFromEvent],
  );

  const handleFitAll = useCallback(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;
    const bounds =
      doc.shapes.length > 0
        ? shapesBounds(doc.shapes)
        : { minX: -100, minY: -100, maxX: 100, maxY: 100 };
    if (!bounds) return;
    const pad = 20;
    const w = bounds.maxX - bounds.minX + pad * 2;
    const h = bounds.maxY - bounds.minY + pad * 2;
    if (w <= 0 || h <= 0) return;
    const zoomX = canvasSize.width / w;
    const zoomY = canvasSize.height / h;
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));
    const visibleW = canvasSize.width / nextZoom;
    const visibleH = canvasSize.height / nextZoom;
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    dispatch({
      type: "SET_VIEWPORT",
      viewportX: cx - visibleW / 2,
      viewportY: cy - visibleH / 2,
      zoom: nextZoom,
    });
  }, [canvasSize.height, canvasSize.width, doc.shapes]);

  const zoomCentered = useCallback(
    (factor: number) => {
      if (canvasSize.width === 0) return;
      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, doc.zoom * factor),
      );
      const centerScreenX = canvasSize.width / 2;
      const centerScreenY = canvasSize.height / 2;
      const beforeDocX = doc.viewportX + centerScreenX / doc.zoom;
      const beforeDocY = doc.viewportY + centerScreenY / doc.zoom;
      dispatch({
        type: "SET_ZOOM",
        zoom: nextZoom,
        viewportX: beforeDocX - centerScreenX / nextZoom,
        viewportY: beforeDocY - centerScreenY / nextZoom,
      });
    },
    [canvasSize.height, canvasSize.width, doc.zoom, doc.viewportX, doc.viewportY],
  );

  const handleCopy = useCallback(() => {
    const sel = doc.shapes.filter((s) => doc.selectedIds.includes(s.id));
    if (sel.length === 0) return;
    clipboard = sel.map((s) => ({ ...s }));
    showToast(sel.length === 1 ? "Copied" : `Copied ${sel.length}`);
  }, [doc.shapes, doc.selectedIds, showToast]);

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return;
    const newShapes = clipboard.map((s) => ({
      ...s,
      id: generateId(),
      x: s.x + PASTE_OFFSET_MM,
      y: s.y + PASTE_OFFSET_MM,
    }));
    dispatch({ type: "ADD_SHAPES", shapes: newShapes, selectAfter: true });
  }, []);

  const handleDuplicate = useCallback(() => {
    const sel = doc.shapes.filter((s) => doc.selectedIds.includes(s.id));
    if (sel.length === 0) return;
    const newShapes = sel.map((s) => ({
      ...s,
      id: generateId(),
      x: s.x + PASTE_OFFSET_MM,
      y: s.y + PASTE_OFFSET_MM,
    }));
    dispatch({ type: "ADD_SHAPES", shapes: newShapes, selectAfter: true });
  }, [doc.shapes, doc.selectedIds]);

  const handleCut = useCallback(() => {
    const sel = doc.shapes.filter((s) => doc.selectedIds.includes(s.id));
    if (sel.length === 0) return;
    clipboard = sel.map((s) => ({ ...s }));
    showToast(sel.length === 1 ? "Cut" : `Cut ${sel.length}`);
    dispatch({ type: "DELETE_SELECTED" });
  }, [doc.shapes, doc.selectedIds, showToast]);

  const buildCurrentDesignFile = useCallback(
    () =>
      buildDesignFile({
        name: designName,
        createdAt: designCreatedAt ?? undefined,
        shapes: doc.shapes,
        gridSpacing: doc.gridSpacing,
        snapToGrid: doc.snapToGrid,
        unitDisplay: doc.unitDisplay,
      }),
    [
      designCreatedAt,
      designName,
      doc.gridSpacing,
      doc.shapes,
      doc.snapToGrid,
      doc.unitDisplay,
    ],
  );

  const handleSaveToFile = useCallback(() => {
    const file = buildCurrentDesignFile();
    if (!designCreatedAt) setDesignCreatedAt(file.createdAt);
    downloadDesignFile(file);
    showToast("Saved to file");
  }, [buildCurrentDesignFile, designCreatedAt, showToast]);

  const handleCloudSave = useCallback(async () => {
    if (!isLoggedIn) {
      // Not logged in — fall back to local file save.
      handleSaveToFile();
      return;
    }
    setSaveStatus("saving");
    const file = buildCurrentDesignFile();
    if (!designCreatedAt) setDesignCreatedAt(file.createdAt);
    try {
      if (!designId) {
        const res = await fetch("/api/studio/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: designName, data: file }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          design: { id: string };
        };
        setDesignId(json.design.id);
        // Update URL so refresh keeps the design loaded.
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("id", json.design.id);
          window.history.replaceState({}, "", url.toString());
        } catch {
          /* noop */
        }
      } else {
        const res = await fetch(`/api/studio/designs/${designId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: designName, data: file }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      dirtyRef.current = false;
      setSaveStatus("saved");
    } catch (err) {
      console.error("studio cloud save failed:", err);
      setSaveStatus("error");
      showToast("Save failed");
    }
  }, [
    buildCurrentDesignFile,
    designCreatedAt,
    designId,
    designName,
    handleSaveToFile,
    isLoggedIn,
    showToast,
  ]);

  // Auto-save every 30 seconds if there are unsaved changes and the design
  // already has an ID.
  useEffect(() => {
    if (!isLoggedIn || !designId) return;
    const interval = setInterval(() => {
      if (dirtyRef.current && saveStatus !== "saving") {
        void handleCloudSave();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, designId, handleCloudSave, saveStatus]);

  // Load the design when the URL has ?id=...
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || id === designId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/studio/designs/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            // Not logged in — drop the id, leave canvas empty.
            return;
          }
          showToast("Couldn't load design.");
          return;
        }
        const json = (await res.json()) as {
          design: {
            id: string;
            name: string;
            data: { canvasSettings?: { gridSpacing?: number; snapToGrid?: boolean; unitDisplay?: "mm" | "in" }; shapes?: Shape[]; createdAt?: string };
            createdAt?: string;
          };
        };
        if (cancelled) return;
        const data = json.design.data;
        const settings = data.canvasSettings ?? {};
        dispatch({
          type: "LOAD_DESIGN",
          shapes: Array.isArray(data.shapes) ? data.shapes : [],
          gridSpacing:
            typeof settings.gridSpacing === "number" ? settings.gridSpacing : 10,
          snapToGrid:
            typeof settings.snapToGrid === "boolean" ? settings.snapToGrid : true,
          unitDisplay: settings.unitDisplay === "in" ? "in" : "mm",
        });
        setDesignName(json.design.name || "Untitled");
        setDesignId(json.design.id);
        setDesignCreatedAt(data.createdAt ?? json.design.createdAt ?? null);
        dirtyRef.current = false;
        setSaveStatus("saved");
      } catch (err) {
        console.error("studio load failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleNewDesign = useCallback(() => {
    if (dirtyRef.current) {
      const ok = window.confirm(
        "You have unsaved changes. Discard them and start a new design?",
      );
      if (!ok) return;
    }
    dispatch({
      type: "LOAD_DESIGN",
      shapes: [],
      gridSpacing: 10,
      snapToGrid: true,
      unitDisplay: doc.unitDisplay,
    });
    setDesignName("Untitled");
    setDesignId(null);
    setDesignCreatedAt(null);
    dirtyRef.current = false;
    setSaveStatus("never-saved");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* noop */
    }
  }, [doc.unitDisplay]);

  const handleOpenFromFile = useCallback(() => {
    designFileInputRef.current?.click();
  }, []);

  const handleOpenDesigns = useCallback(() => {
    if (isLoggedIn) {
      router.push("/studio/designs");
    } else {
      handleOpenFromFile();
    }
  }, [isLoggedIn, router, handleOpenFromFile]);

  const handleDesignFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseDesignFile(text);
        if (!parsed.ok) {
          showToast(parsed.error);
          return;
        }
        dispatch({
          type: "LOAD_DESIGN",
          shapes: parsed.file.shapes,
          gridSpacing: parsed.file.canvasSettings.gridSpacing,
          snapToGrid: parsed.file.canvasSettings.snapToGrid,
          unitDisplay: parsed.file.canvasSettings.unitDisplay,
        });
        setDesignName(parsed.file.name);
        setDesignCreatedAt(parsed.file.createdAt);
        setDesignId(null);
        showToast("Loaded design");
      } catch {
        showToast("Failed to read file.");
      }
    },
    [showToast],
  );

  const handleConvertToPath = useCallback(
    (shapeId: string) => {
      const shape = doc.shapes.find((s) => s.id === shapeId);
      if (!shape) return;
      if (
        shape.type !== "rectangle" &&
        shape.type !== "circle" &&
        shape.type !== "line"
      ) {
        return;
      }
      const { points, closed } = shapeToPath(shape);
      if (points.length === 0) return;
      const newShape = createPath({
        points,
        closed,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        fill: shape.fill,
      });
      newShape.rotation = shape.rotation;
      dispatch({
        type: "REPLACE_SHAPES",
        removeIds: [shape.id],
        add: [newShape],
        selectAdded: true,
      });
    },
    [doc.shapes],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const targetEl = e.target as Element | null;
      const shapeTarget = targetEl?.closest?.("[data-shape-id]") as
        | (HTMLElement | SVGElement)
        | null;
      const shapeId = shapeTarget?.dataset?.shapeId ?? null;
      if (shapeId && !doc.selectedIds.includes(shapeId)) {
        dispatch({ type: "SELECT", ids: [shapeId] });
      }
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetShapeId: shapeId,
      });
    },
    [doc.selectedIds],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleAssignCutType = useCallback(
    (cutType: import("@/lib/studio/types").CutType) => {
      if (doc.selectedIds.length === 0) return;
      const updated = doc.shapes
        .filter((s) => doc.selectedIds.includes(s.id))
        .map((s) => ({ ...s, cutType }));
      if (updated.length > 0) {
        dispatch({ type: "UPDATE_SHAPES", shapes: updated });
      }
    },
    [doc.shapes, doc.selectedIds],
  );

  const handleSetCutDepth = useCallback(
    (depth: number) => {
      if (doc.selectedIds.length === 0) return;
      const updated = doc.shapes
        .filter((s) => doc.selectedIds.includes(s.id))
        .map((s) => ({ ...s, cutDepth: depth }));
      if (updated.length > 0) {
        dispatch({ type: "UPDATE_SHAPES", shapes: updated });
      }
    },
    [doc.shapes, doc.selectedIds],
  );

  const handleApplyDogbones = useCallback(
    (_style: "standard" | "tbone") => {
      // Implemented in the dogbone group; placeholder for now so the
      // panel button doesn't dangle.
      void _style;
      showToast("Dogbones — coming next");
    },
    [showToast],
  );

  const handleAutoTabs = useCallback(
    (_count: number) => {
      void _count;
      showToast("Tabs — coming next");
    },
    [showToast],
  );

  const handleClearTabs = useCallback(() => {
    if (doc.selectedIds.length === 0) return;
    const updated = doc.shapes
      .filter((s) => doc.selectedIds.includes(s.id))
      .map((s) => ({ ...s, tabs: [] }));
    if (updated.length > 0) {
      dispatch({ type: "UPDATE_SHAPES", shapes: updated });
    }
  }, [doc.shapes, doc.selectedIds]);

  const handleBoolean = useCallback(
    (op: BooleanOp) => {
      const sel = doc.shapes.filter((s) => doc.selectedIds.includes(s.id));
      if (sel.length < 2) return;
      const result = applyBoolean(sel, op);
      if (!result) {
        showToast("Shapes don't overlap.");
        return;
      }
      dispatch({
        type: "REPLACE_SHAPES",
        removeIds: sel.map((s) => s.id),
        add: [result],
        selectAdded: true,
      });
    },
    [doc.shapes, doc.selectedIds, showToast],
  );

  const finalizePenAsOpen = useCallback(() => {
    if (!drawing || drawing.kind !== "pen") return;
    if (drawing.points.length >= 2) {
      const shape = createPath({ points: drawing.points, closed: false });
      dispatch({ type: "ADD_SHAPE", shape, selectAfter: true });
    }
    setDrawing(null);
    setActiveTool("select");
  }, [drawing, setActiveTool]);

  const handleZoomIn = useCallback(() => zoomCentered(1.25), [zoomCentered]);
  const handleZoomOut = useCallback(() => zoomCentered(1 / 1.25), [zoomCentered]);
  const handleZoomReset = useCallback(() => {
    if (canvasSize.width === 0) return;
    const nextZoom = 3.78;
    const centerScreenX = canvasSize.width / 2;
    const centerScreenY = canvasSize.height / 2;
    const beforeDocX = doc.viewportX + centerScreenX / doc.zoom;
    const beforeDocY = doc.viewportY + centerScreenY / doc.zoom;
    dispatch({
      type: "SET_ZOOM",
      zoom: nextZoom,
      viewportX: beforeDocX - centerScreenX / nextZoom,
      viewportY: beforeDocY - centerScreenY / nextZoom,
    });
  }, [
    canvasSize.height,
    canvasSize.width,
    doc.viewportX,
    doc.viewportY,
    doc.zoom,
  ]);

  // Keyboard shortcuts.
  useEffect(() => {
    const isEditableTarget = () => {
      const el = window.document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (el as HTMLElement).isContentEditable
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spaceHeld && !isEditableTarget()) {
        setSpaceHeld(true);
        e.preventDefault();
        return;
      }
      if (isEditableTarget()) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "z" || e.key === "Z")) {
        if (e.shiftKey) dispatch({ type: "REDO" });
        else dispatch({ type: "UNDO" });
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "y" || e.key === "Y")) {
        dispatch({ type: "REDO" });
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "a" || e.key === "A")) {
        dispatch({ type: "SELECT_ALL" });
        e.preventDefault();
        return;
      }
      if (meta && e.key === "0") {
        handleFitAll();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "c" || e.key === "C")) {
        handleCopy();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "v" || e.key === "V")) {
        handlePaste();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "d" || e.key === "D")) {
        handleDuplicate();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "x" || e.key === "X")) {
        handleCut();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "s" || e.key === "S")) {
        void handleCloudSave();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === "o" || e.key === "O")) {
        handleOpenFromFile();
        e.preventDefault();
        return;
      }

      if (e.key === "Enter") {
        if (drawing && drawing.kind === "pen") {
          finalizePenAsOpen();
          e.preventDefault();
          return;
        }
      }

      if (e.key === "Escape") {
        // Priority order per Phase 2 spec, plus node editing (highest).
        if (nodeEditingShapeId) {
          setNodeEditingShapeId(null);
          setSelectedNodeIndices([]);
          e.preventDefault();
          return;
        }
        if (drawing && drawing.kind === "pen") {
          if (drawing.points.length >= 2) {
            finalizePenAsOpen();
          } else {
            setDrawing(null);
            setActiveTool("select");
          }
          e.preventDefault();
          return;
        }
        if (editingTextShapeId) {
          setEditingTextShapeId(null);
        } else if (doc.selectedIds.length > 0) {
          dispatch({ type: "CLEAR_SELECTION" });
        } else if (activeTool !== "select") {
          setActiveTool("select");
        } else if (drawing) {
          setDrawing(null);
        }
        e.preventDefault();
        return;
      }

      switch (e.key) {
        case "v":
        case "V":
          setActiveTool("select");
          setDrawing(null);
          break;
        case "r":
        case "R":
          if (doc.mode === "design") setActiveTool("rectangle");
          break;
        case "c":
        case "C":
          if (doc.mode === "design") setActiveTool("circle");
          break;
        case "l":
        case "L":
          if (doc.mode === "design") setActiveTool("line");
          break;
        case "t":
        case "T":
          if (doc.mode === "design") setActiveTool("text");
          break;
        case "p":
        case "P":
          if (doc.mode === "design") setActiveTool("pen");
          break;
        case "g":
        case "G":
          if (doc.mode === "design") setActiveTool("polygon");
          break;
        case "a":
        case "A":
          if (doc.mode === "design") setActiveTool("arc");
          break;
        case "1":
          dispatch({ type: "SET_MODE", mode: "design" });
          break;
        case "2":
          dispatch({ type: "SET_MODE", mode: "plan" });
          if (activeTool !== "select") setActiveTool("select");
          break;
        case "3":
          dispatch({ type: "SET_MODE", mode: "review" });
          if (activeTool !== "select") setActiveTool("select");
          break;
        case "Delete":
        case "Backspace":
          if (nodeEditingShapeId && selectedNodeIndices.length > 0) {
            const editingShape = doc.shapes.find(
              (s) => s.id === nodeEditingShapeId,
            );
            if (editingShape && editingShape.points) {
              const remove = new Set(selectedNodeIndices);
              const nextPts = editingShape.points.filter(
                (_, i) => !remove.has(i),
              );
              if (nextPts.length === 0) {
                // Delete the whole shape and exit node editing.
                dispatch({ type: "SELECT", ids: [editingShape.id] });
                dispatch({ type: "DELETE_SELECTED" });
                setNodeEditingShapeId(null);
                setSelectedNodeIndices([]);
              } else {
                const closed =
                  editingShape.closed && nextPts.length >= 3
                    ? true
                    : false;
                const updated = syncPathBounds({
                  ...editingShape,
                  points: nextPts,
                  closed,
                });
                dispatch({ type: "UPDATE_SHAPES", shapes: [updated] });
                setSelectedNodeIndices([]);
              }
              e.preventDefault();
              break;
            }
          }
          dispatch({ type: "DELETE_SELECTED" });
          e.preventDefault();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [
    spaceHeld,
    setActiveTool,
    handleFitAll,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleCut,
    handleCloudSave,
    handleOpenFromFile,
    finalizePenAsOpen,
    activeTool,
    drawing,
    editingTextShapeId,
    doc.selectedIds,
    doc.shapes,
    nodeEditingShapeId,
    selectedNodeIndices,
  ]);

  const cursor = useMemo(() => {
    if (panRef.current) return "grabbing";
    if (spaceHeld) return "grab";
    if (activeTool === "select") return "default";
    return "crosshair";
  }, [activeTool, spaceHeld]);

  const previewShape = useMemo<Shape | null>(() => {
    if (!drawing) return null;
    if (drawing.kind === "pen") return null;
    if (drawing.kind === "arc") {
      if (drawing.stage === "radius") {
        const dx = drawing.currentDocX - drawing.centerDocX;
        const dy = drawing.currentDocY - drawing.centerDocY;
        const radius = Math.hypot(dx, dy);
        if (radius < 0.0001) return null;
        // Show a single radius line as the preview during stage 1.
        return createLine({
          x1: drawing.centerDocX,
          y1: drawing.centerDocY,
          x2: drawing.currentDocX,
          y2: drawing.currentDocY,
        });
      }
      let sweep = drawing.sweepDeg;
      if (drawing.shift) sweep = Math.round(sweep / 15) * 15;
      if (Math.abs(sweep) < 0.001) return null;
      const points = generateArcPoints(
        drawing.centerDocX,
        drawing.centerDocY,
        drawing.radius,
        drawing.startAngleDeg,
        sweep,
      );
      if (points.length < 2) return null;
      return createPath({ points, closed: false });
    }
    if (drawing.kind === "drag-radius") {
      const dx = drawing.currentDocX - drawing.centerDocX;
      const dy = drawing.currentDocY - drawing.centerDocY;
      const radius = Math.hypot(dx, dy);
      if (radius < 0.0001) return null;
      let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (drawing.shift) angleDeg = Math.round(angleDeg / 15) * 15;
      const points = generatePolygonPoints(
        drawing.centerDocX,
        drawing.centerDocY,
        radius,
        polygonSides,
        polygonStar,
        polygonInnerPct,
        angleDeg + 90,
      );
      if (points.length === 0) return null;
      return createPath({ points, closed: true });
    }
    if (drawing.kind === "drag") {
      const { startDocX: ax, startDocY: ay } = drawing;
      let bx = drawing.currentDocX;
      let by = drawing.currentDocY;
      if (drawing.shift) {
        const dx = bx - ax;
        const dy = by - ay;
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        bx = ax + Math.sign(dx || 1) * size;
        by = ay + Math.sign(dy || 1) * size;
      }
      const r = rectFromCorners(ax, ay, bx, by);
      if (r.width === 0 && r.height === 0) return null;
      if (drawing.tool === "rectangle") return createRectangle(r);
      return createCircle(r);
    }
    // two-click line preview
    let bx = drawing.currentDocX;
    let by = drawing.currentDocY;
    if (drawing.shift) {
      const dx = bx - drawing.startDocX;
      const dy = by - drawing.startDocY;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const angle = Math.atan2(dy, dx);
        const stepped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        bx = drawing.startDocX + Math.cos(stepped) * len;
        by = drawing.startDocY + Math.sin(stepped) * len;
      }
    }
    return createLine({
      x1: drawing.startDocX,
      y1: drawing.startDocY,
      x2: bx,
      y2: by,
    });
  }, [drawing, polygonSides, polygonStar, polygonInnerPct]);

  // Live shape overrides + smart guides while a transform is in progress
  // (no history churn).
  const liveTransform = useMemo<{
    overrides: Map<string, Shape>;
    guides: GuideLine[];
  }>(() => {
    const overrides = new Map<string, Shape>();
    const guides: GuideLine[] = [];
    if (!transform) return { overrides, guides };
    if (transform.kind === "move") {
      const rawDx = transform.currentDocX - transform.startDocX;
      const rawDy = transform.currentDocY - transform.startDocY;
      const movingShapes = doc.shapes.filter((s) =>
        transform.originals.has(s.id),
      );
      const staticShapes = doc.shapes.filter(
        (s) => !transform.originals.has(s.id),
      );
      const result = applyMoveSnap({
        movingShapes,
        rawDx,
        rawDy,
        staticShapes,
        threshold: snapThresholdMm(doc.zoom),
        gridSpacing: doc.gridSpacing,
        snapToGrid: doc.snapToGrid,
      });
      transform.originals.forEach((orig, id) => {
        const s = doc.shapes.find((sh) => sh.id === id);
        if (!s) return;
        overrides.set(
          id,
          translateShape(s, orig.x + result.dx, orig.y + result.dy),
        );
      });
      guides.push(...result.guides);
    } else if (transform.kind === "resize") {
      let next = resizeRectLikeShape(
        transform.original,
        transform.handle,
        transform.currentDocX,
        transform.currentDocY,
        transform.shift,
      );
      if (next.type === "path") {
        if (transform.original.points && transform.original.points.length > 0) {
          next = {
            ...next,
            points: rescalePathToBounds(
              transform.original,
              next,
              transform.original.points,
            ),
          };
        } else if (transform.original.pathData) {
          next = {
            ...next,
            pathData: rescalePathDataToBounds(
              transform.original,
              next,
              transform.original.pathData,
            ),
          };
        }
      }
      overrides.set(transform.targetId, next);
    } else if (transform.kind === "resize-line") {
      const next = resizeLineEndpoint(
        transform.original,
        transform.handle,
        transform.currentDocX,
        transform.currentDocY,
      );
      overrides.set(transform.targetId, next);
    } else if (transform.kind === "rotate") {
      const next = rotateShape(
        transform.original,
        transform.currentDocX,
        transform.currentDocY,
        transform.initialPointerAngleDeg,
        transform.shift,
      );
      overrides.set(transform.targetId, next);
    }
    return { overrides, guides };
  }, [transform, doc.shapes, doc.zoom, doc.gridSpacing, doc.snapToGrid]);

  const liveShapeOverrides = liveTransform.overrides;
  const activeGuides = liveTransform.guides;

  // Apply a live override for the path shape currently being node-edited
  // while a node/handle drag is in progress.
  const liveNodePoints = useMemo<PathPoint[] | null>(() => {
    if (!nodeDrag || !nodeEditingShapeId) return null;
    const editingShape = doc.shapes.find((s) => s.id === nodeEditingShapeId);
    if (!editingShape || !editingShape.points) return null;
    const dx = nodeDrag.currentDocX - nodeDrag.startDocX;
    const dy = nodeDrag.currentDocY - nodeDrag.startDocY;
    return applyNodeDrag(
      nodeDrag,
      editingShape.points,
      dx,
      dy,
      nodeDrag.kind === "handle" ? nodeDrag.alt : false,
    );
  }, [nodeDrag, nodeEditingShapeId, doc.shapes]);

  const displayShapes = useMemo<Shape[]>(() => {
    let shapes = doc.shapes;
    if (liveShapeOverrides.size > 0 || liveNodePoints) {
      shapes = doc.shapes.map((s) => {
        if (liveNodePoints && s.id === nodeEditingShapeId) {
          return { ...s, points: liveNodePoints };
        }
        return liveShapeOverrides.get(s.id) ?? s;
      });
    }
    if (doc.mode !== "design") {
      shapes = shapesWithCutTypeColors(shapes);
    }
    return shapes;
  }, [
    doc.shapes,
    doc.mode,
    liveShapeOverrides,
    liveNodePoints,
    nodeEditingShapeId,
  ]);

  const selectedSingleShape = useMemo<Shape | null>(() => {
    if (doc.selectedIds.length !== 1) return null;
    const id = doc.selectedIds[0];
    return displayShapes.find((s) => s.id === id) ?? null;
  }, [doc.selectedIds, displayShapes]);

  const contextMenuItems = useMemo<ContextMenuItemOrSeparator[]>(() => {
    if (!contextMenu) return [];
    const hasSelection = doc.selectedIds.length > 0;
    const multiSelected = doc.selectedIds.length > 1;
    const target =
      contextMenu.targetShapeId ?? (hasSelection ? doc.selectedIds[0] : null);
    const targetShape = target
      ? doc.shapes.find((s) => s.id === target) ?? null
      : null;
    const canPaste = clipboard !== null && clipboard.length > 0;

    if (multiSelected) {
      return [
        {
          key: "cut",
          label: "Cut",
          shortcut: "Ctrl+X",
          onSelect: handleCut,
        },
        {
          key: "copy",
          label: "Copy",
          shortcut: "Ctrl+C",
          onSelect: handleCopy,
        },
        {
          key: "duplicate",
          label: "Duplicate",
          shortcut: "Ctrl+D",
          onSelect: handleDuplicate,
        },
        { separator: true },
        {
          key: "delete",
          label: "Delete",
          shortcut: "Del",
          onSelect: () => dispatch({ type: "DELETE_SELECTED" }),
        },
        { separator: true },
        {
          key: "union",
          label: "Union",
          onSelect: () => handleBoolean("union"),
        },
        {
          key: "difference",
          label: "Difference",
          onSelect: () => handleBoolean("difference"),
        },
        {
          key: "intersection",
          label: "Intersection",
          onSelect: () => handleBoolean("intersection"),
        },
        { separator: true },
        {
          key: "front",
          label: "Bring to Front",
          onSelect: () =>
            dispatch({ type: "BRING_TO_FRONT", ids: doc.selectedIds }),
        },
        {
          key: "back",
          label: "Send to Back",
          onSelect: () =>
            dispatch({ type: "SEND_TO_BACK", ids: doc.selectedIds }),
        },
      ];
    }

    if (targetShape) {
      const isPath =
        targetShape.type === "path" &&
        targetShape.points &&
        targetShape.points.length > 0;
      const isConvertible =
        targetShape.type === "rectangle" ||
        targetShape.type === "circle" ||
        targetShape.type === "line";
      return [
        {
          key: "cut",
          label: "Cut",
          shortcut: "Ctrl+X",
          onSelect: handleCut,
        },
        {
          key: "copy",
          label: "Copy",
          shortcut: "Ctrl+C",
          onSelect: handleCopy,
        },
        {
          key: "paste",
          label: "Paste",
          shortcut: "Ctrl+V",
          disabled: !canPaste,
          onSelect: handlePaste,
        },
        {
          key: "duplicate",
          label: "Duplicate",
          shortcut: "Ctrl+D",
          onSelect: handleDuplicate,
        },
        { separator: true },
        {
          key: "delete",
          label: "Delete",
          shortcut: "Del",
          onSelect: () => dispatch({ type: "DELETE_SELECTED" }),
        },
        { separator: true },
        {
          key: "edit-nodes",
          label: "Edit Nodes",
          shortcut: "Enter",
          disabled: !isPath,
          onSelect: () => {
            setNodeEditingShapeId(targetShape.id);
            setSelectedNodeIndices([]);
          },
        },
        {
          key: "convert",
          label: "Convert to Path",
          disabled: !isConvertible,
          onSelect: () => handleConvertToPath(targetShape.id),
        },
        { separator: true },
        {
          key: "front",
          label: "Bring to Front",
          onSelect: () =>
            dispatch({ type: "BRING_TO_FRONT", ids: [targetShape.id] }),
        },
        {
          key: "back",
          label: "Send to Back",
          onSelect: () =>
            dispatch({ type: "SEND_TO_BACK", ids: [targetShape.id] }),
        },
      ];
    }

    // Empty canvas / no target.
    return [
      {
        key: "paste",
        label: "Paste",
        shortcut: "Ctrl+V",
        disabled: !canPaste,
        onSelect: handlePaste,
      },
      { separator: true },
      {
        key: "select-all",
        label: "Select All",
        shortcut: "Ctrl+A",
        onSelect: () => dispatch({ type: "SELECT_ALL" }),
      },
      {
        key: "fit-all",
        label: "Fit All",
        shortcut: "Ctrl+0",
        onSelect: handleFitAll,
      },
    ];
  }, [
    contextMenu,
    doc.selectedIds,
    doc.shapes,
    handleCopy,
    handleCut,
    handleDuplicate,
    handlePaste,
    handleBoolean,
    handleConvertToPath,
    handleFitAll,
  ]);

  const marqueeRect = useMemo(() => {
    if (!selectInteraction || selectInteraction.kind !== "marquee") return null;
    const r = rectFromCorners(
      selectInteraction.startDocX,
      selectInteraction.startDocY,
      selectInteraction.currentDocX,
      selectInteraction.currentDocY,
    );
    if (r.width <= 0 && r.height <= 0) return null;
    return {
      x: r.x - r.width / 2,
      y: r.y - r.height / 2,
      width: r.width,
      height: r.height,
    };
  }, [selectInteraction]);

  const selectedShapes = useMemo(
    () => doc.shapes.filter((s) => doc.selectedIds.includes(s.id)),
    [doc.shapes, doc.selectedIds],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Finalize an in-progress pen path on double-click.
      if (drawing && drawing.kind === "pen") {
        finalizePenAsOpen();
        return;
      }
      const targetEl = e.target as Element | null;
      const shapeTarget = targetEl?.closest?.("[data-shape-id]") as
        | (HTMLElement | SVGElement)
        | null;
      const shapeId = shapeTarget?.dataset?.shapeId;
      if (!shapeId) return;
      const shape = doc.shapes.find((s) => s.id === shapeId);
      if (!shape) return;
      if (shape.type === "text") {
        dispatch({ type: "SELECT", ids: [shapeId] });
        setEditingTextShapeId(shapeId);
        return;
      }
      if (shape.type === "path" && shape.points && shape.points.length > 0) {
        dispatch({ type: "SELECT", ids: [shapeId] });
        setNodeEditingShapeId(shapeId);
        setSelectedNodeIndices([]);
      }
    },
    [doc.shapes, drawing, finalizePenAsOpen],
  );

  const handleExportProfile = useCallback(
    (profile: ExportProfile) => {
      if (doc.shapes.length === 0) {
        showToast("Nothing to export.");
        return;
      }
      rememberProfile(profile);
      downloadProfileExport(doc.shapes, profile, designName);
    },
    [doc.shapes, designName, showToast],
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const designFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const importSVGString = useCallback(
    (svgText: string) => {
      const result = parseSVG(svgText);
      if (result.shapes.length === 0) {
        showToast("Couldn't read that SVG.");
        return;
      }
      // Center on the current viewport.
      const viewportCenterX =
        doc.viewportX + (canvasSize.width / 2) / Math.max(0.0001, doc.zoom);
      const viewportCenterY =
        doc.viewportY + (canvasSize.height / 2) / Math.max(0.0001, doc.zoom);
      const centered = recenterImportedShapes(
        result.shapes,
        viewportCenterX,
        viewportCenterY,
      );
      dispatch({
        type: "ADD_SHAPES",
        shapes: centered,
        selectAfter: true,
      });
      const skippedMsg =
        result.skipped.length > 0
          ? `Imported ${centered.length} shape${centered.length === 1 ? "" : "s"} — skipped ${result.skipped.join(", ")}.`
          : `Imported ${centered.length} shape${centered.length === 1 ? "" : "s"}.`;
      showToast(skippedMsg);
    },
    [
      canvasSize.height,
      canvasSize.width,
      doc.viewportX,
      doc.viewportY,
      doc.zoom,
      showToast,
    ],
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-importing the same file
      if (!file) return;
      try {
        const text = await file.text();
        importSVGString(text);
      } catch {
        showToast("Failed to read file.");
      }
    },
    [importSVGString, showToast],
  );

  const handleCanvasDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      if (!/svg/i.test(file.type) && !file.name.toLowerCase().endsWith(".svg")) {
        showToast("Drop an SVG file.");
        return;
      }
      try {
        const text = await file.text();
        importSVGString(text);
      } catch {
        showToast("Failed to read file.");
      }
    },
    [importSVGString, showToast],
  );

  const handleCanvasDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
        setIsDragging(true);
      }
    },
    [],
  );

  const handleCanvasDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        designName={designName}
        onRenameCommit={(n) => setDesignName(n)}
        saveStatus={saveStatus}
        isLoggedIn={isLoggedIn}
        userInitial={userInitial}
        mode={doc.mode}
        onModeChange={(m) => {
          dispatch({ type: "SET_MODE", mode: m });
          if (m !== "design" && activeTool !== "select") {
            setActiveTool("select");
          }
        }}
        onSave={handleCloudSave}
        onNewDesign={handleNewDesign}
        onOpenDesigns={handleOpenDesigns}
      />
      <div className="flex min-h-0 w-full flex-1">
      <Toolbar
        activeTool={activeTool}
        drawingDisabled={doc.mode !== "design"}
        onSelectTool={(t) => {
          markActive();
          setActiveTool(t);
        }}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        onExportProfile={handleExportProfile}
        onSaveToFile={handleSaveToFile}
        onImport={handleImportClick}
        onBooleanUnion={() => handleBoolean("union")}
        onBooleanDifference={() => handleBoolean("difference")}
        onBooleanIntersection={() => handleBoolean("intersection")}
        onShowHelp={() => setShowWelcome(true)}
        canBoolean={selectedShapes.length >= 2}
        canUndo={canUndo(state)}
        canRedo={canRedo(state)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={designFileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleDesignFileSelected}
      />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: "24px 1fr", gridTemplateRows: "24px 1fr" }}>
          <RulerCorner
            unit={doc.unitDisplay}
            onToggleUnit={() =>
              dispatch({
                type: "SET_UNIT_DISPLAY",
                unitDisplay: doc.unitDisplay === "mm" ? "in" : "mm",
              })
            }
          />
          <Ruler
            orientation="horizontal"
            viewportStart={doc.viewportX}
            zoom={doc.zoom}
            unit={doc.unitDisplay}
            cursorDocPos={cursorDocPos?.x ?? null}
          />
          <Ruler
            orientation="vertical"
            viewportStart={doc.viewportY}
            zoom={doc.zoom}
            unit={doc.unitDisplay}
            cursorDocPos={cursorDocPos?.y ?? null}
          />
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            onContextMenu={handleContextMenu}
          >
            {toast ? (
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-wood/90 px-3 py-1 text-xs font-medium text-cream shadow-lg">
                {toast}
              </div>
            ) : null}
            {isDragging ? (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-forest/10 ring-2 ring-inset ring-forest/40">
                <span className="rounded-full bg-cream px-4 py-2 text-sm font-medium text-forest shadow-md">
                  Drop SVG to import
                </span>
              </div>
            ) : null}
            <Canvas
            ref={svgRef}
            shapes={displayShapes}
            selectedIds={doc.selectedIds}
            viewportX={doc.viewportX}
            viewportY={doc.viewportY}
            zoom={doc.zoom}
            gridSpacing={doc.gridSpacing}
            viewWidthMm={viewWidthMm}
            viewHeightMm={viewHeightMm}
            cursor={cursor}
            shapesInteractive={
              activeTool === "select" || nodeEditingShapeId !== null
            }
            dimNonId={nodeEditingShapeId}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              setCursorDocPos(null);
              setCursorScreenPos(null);
            }}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            overlay={
              <>
                {doc.mode !== "design" ? (
                  <MaterialOutline
                    material={doc.material}
                    zoomScale={1 / doc.zoom}
                    unit={doc.unitDisplay}
                  />
                ) : null}
                {doc.mode === "plan" && doc.showKerfCompensation && activeCuttingTool ? (
                  <KerfOverlay
                    shapes={displayShapes}
                    kerfMm={activeCuttingTool.kerf}
                    zoomScale={1 / doc.zoom}
                  />
                ) : null}
                {selectedSingleShape &&
                !drawing &&
                !nodeEditingShapeId &&
                doc.mode === "design" ? (
                  <SelectionHandles
                    shape={selectedSingleShape}
                    zoomScale={1 / doc.zoom}
                  />
                ) : null}
                {nodeEditingShapeId
                  ? (() => {
                      const editingShape = displayShapes.find(
                        (s) => s.id === nodeEditingShapeId,
                      );
                      const pts = editingShape?.points;
                      if (!pts || pts.length === 0) return null;
                      return (
                        <NodeOverlay
                          points={pts}
                          selectedNodeIndices={selectedNodeIndices}
                          zoomScale={1 / doc.zoom}
                        />
                      );
                    })()
                  : null}
                <ToolOverlay
                  preview={previewShape}
                  zoomScale={1 / doc.zoom}
                  marquee={marqueeRect}
                  guides={activeGuides}
                  viewport={{
                    x: doc.viewportX,
                    y: doc.viewportY,
                    width: viewWidthMm,
                    height: viewHeightMm,
                  }}
                />
                {drawing && drawing.kind === "pen" ? (
                  <PenOverlay
                    points={drawing.points}
                    cursorDoc={{
                      x: drawing.currentDocX,
                      y: drawing.currentDocY,
                    }}
                    dragging={!!drawing.dragging}
                    hoveringFirstPoint={drawing.hoveringFirstPoint}
                    zoomScale={1 / doc.zoom}
                  />
                ) : null}
              </>
            }
          />
          </div>
        </div>
        <StatusBar
          cursorDocPos={cursorDocPos}
          unit={doc.unitDisplay}
          selectedShapes={selectedShapes}
          zoom={doc.zoom}
          showIdleHints={idle}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFitAll={handleFitAll}
        />
      </div>
      {doc.mode === "design" ? (
        <PropertiesPanel
          selectedShapes={selectedShapes}
          unit={doc.unitDisplay}
          doc={{
            gridSpacing: doc.gridSpacing,
            snapToGrid: doc.snapToGrid,
            unitDisplay: doc.unitDisplay,
            zoom: doc.zoom,
          }}
          editingTextShapeId={editingTextShapeId}
          nodeEditingShapeId={nodeEditingShapeId}
          polygonSettings={{
            sides: polygonSides,
            star: polygonStar,
            innerPct: polygonInnerPct,
          }}
          polygonToolActive={activeTool === "polygon"}
          onTextEditDone={() => setEditingTextShapeId(null)}
          onEnterNodeEdit={(id) => {
            setNodeEditingShapeId(id);
            setSelectedNodeIndices([]);
          }}
          onExitNodeEdit={() => {
            setNodeEditingShapeId(null);
            setSelectedNodeIndices([]);
          }}
          onSetPolygonSides={setPolygonSides}
          onSetPolygonStar={setPolygonStar}
          onSetPolygonInnerPct={setPolygonInnerPct}
          onUpdateShape={(next) =>
            dispatch({ type: "UPDATE_SHAPES", shapes: [next] })
          }
          onDeleteSelected={() => dispatch({ type: "DELETE_SELECTED" })}
          onSetGridSpacing={(mm) =>
            dispatch({ type: "SET_GRID_SPACING", gridSpacing: mm })
          }
          onSetSnapToGrid={(v) =>
            dispatch({ type: "SET_SNAP_TO_GRID", snapToGrid: v })
          }
          onSetUnitDisplay={(u) =>
            dispatch({ type: "SET_UNIT_DISPLAY", unitDisplay: u })
          }
          onFitAll={handleFitAll}
        />
      ) : doc.mode === "plan" ? (
        <PlanPanel
          selectedShapes={selectedShapes}
          unit={doc.unitDisplay}
          material={doc.material}
          tools={tools}
          activeTool={activeCuttingTool}
          showKerfCompensation={doc.showKerfCompensation}
          onSetMaterial={(m) => dispatch({ type: "SET_MATERIAL", material: m })}
          onSetActiveTool={(id) => {
            dispatch({ type: "SET_ACTIVE_TOOL_ID", toolId: id });
          }}
          onUpsertTool={(t) => {
            const next = tools.some((x) => x.id === t.id)
              ? tools.map((x) => (x.id === t.id ? t : x))
              : [...tools, t];
            setTools(next);
            persistTools(next);
            dispatch({ type: "SET_ACTIVE_TOOL_ID", toolId: t.id });
          }}
          onDeleteTool={(id) => {
            const next = tools.filter((x) => x.id !== id);
            setTools(next);
            persistTools(next);
            if (doc.activeToolId === id) {
              dispatch({
                type: "SET_ACTIVE_TOOL_ID",
                toolId: next[0]?.id ?? null,
              });
            }
          }}
          onSetKerfCompensation={(v) =>
            dispatch({ type: "SET_KERF_COMPENSATION", show: v })
          }
          onAssignCutType={handleAssignCutType}
          onSetCutDepth={handleSetCutDepth}
          onApplyDogbones={handleApplyDogbones}
          onAutoTabs={handleAutoTabs}
          onClearTabs={handleClearTabs}
        />
      ) : null}
      </div>
      {contextMenu ? (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={closeContextMenu}
        />
      ) : null}
      {showWelcome ? <WelcomeOverlay onDismiss={dismissWelcome} /> : null}
      {cursorScreenPos &&
      activeTool !== "select" &&
      !drawing &&
      !nodeEditingShapeId &&
      !showWelcome &&
      cursorHintForTool(activeTool) ? (
        <div
          className="pointer-events-none fixed z-30 rounded bg-wood/80 px-2 py-1 text-xs text-cream shadow-sm"
          style={{
            left: cursorScreenPos.x + 14,
            top: cursorScreenPos.y + 14,
          }}
        >
          {cursorHintForTool(activeTool)}
        </div>
      ) : null}
    </div>
  );
}

function cursorHintForTool(tool: Tool): string | null {
  switch (tool) {
    case "rectangle":
    case "circle":
      return "Click and drag to draw";
    case "line":
      return "Click to set start point";
    case "pen":
      return "Click to place points, drag for curves";
    case "text":
      return "Click to place text";
    case "polygon":
      return "Click and drag to draw";
    case "arc":
      return "Click and drag for radius";
    default:
      return null;
  }
}
