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
import { Canvas } from "@/components/studio/canvas";
import { NodeOverlay } from "@/components/studio/node-overlay";
import { PenOverlay } from "@/components/studio/pen-overlay";
import { PropertiesPanel } from "@/components/studio/properties-panel";
import { Ruler, RulerCorner } from "@/components/studio/ruler";
import { SelectionHandles } from "@/components/studio/selection-handles";
import { StatusBar } from "@/components/studio/status-bar";
import { Toolbar } from "@/components/studio/toolbar";
import { ToolOverlay } from "@/components/studio/tool-overlay";
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
  rescalePathToBounds,
  resizeLineEndpoint,
  resizeRectLikeShape,
  rotateShape,
} from "@/lib/studio/transform";
import {
  applyNodeDrag,
  generateArcPoints,
  generatePolygonPoints,
  syncPathBounds,
} from "@/lib/studio/path-ops";
import { downloadSVG, exportSVG } from "@/lib/studio/export-svg";
import { applyBoolean, type BooleanOp } from "@/lib/studio/boolean-ops";
import { parseSVG, recenterImportedShapes } from "@/lib/studio/svg-import";
import {
  applyMoveSnap,
  snapThresholdMm,
  type GuideLine,
} from "@/lib/studio/guides";
import type { LineEndpointHandle, ResizeHandle } from "@/lib/studio/geometry";
import type { PathPoint, Shape, Tool } from "@/lib/studio/types";

// Module-level clipboard: shapes copied within the app, not the system
// clipboard. Persists across mount cycles within a single page session.
let clipboard: Shape[] | null = null;
const PASTE_OFFSET_MM = 10;

export default function StudioPage() {
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
      const isMiddle = e.button === 1;
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
        // Handle clicks (resize, rotate, line endpoint) take priority.
        const handleEl = targetEl?.closest?.("[data-handle]") as
          | (HTMLElement | SVGElement)
          | null;
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
          // No shift: select if not already, then prime a move.
          let nextSelected = doc.selectedIds;
          if (!doc.selectedIds.includes(shapeId)) {
            dispatch({ type: "SELECT", ids: [shapeId] });
            nextSelected = [shapeId];
          }
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
              updated.push({
                ...s,
                x: orig.x + result.dx,
                y: orig.y + result.dy,
              });
            });
            if (updated.length > 0)
              dispatch({ type: "UPDATE_SHAPES", shapes: updated });
          }
        } else if (t.kind === "resize") {
          const cursor = snapped
            ? snapPoint(t.currentDocX, t.currentDocY, grid, true)
            : { x: t.currentDocX, y: t.currentDocY };
          const next = resizeRectLikeShape(
            t.original,
            t.handle,
            cursor.x,
            cursor.y,
            shiftAtUp || t.shift,
          );
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
      setActiveTool,
    ],
  );
  // Note: doc.zoom + applyMoveSnap dep already in scope via state above.

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
          setActiveTool("rectangle");
          break;
        case "c":
        case "C":
          setActiveTool("circle");
          break;
        case "l":
        case "L":
          setActiveTool("line");
          break;
        case "t":
        case "T":
          setActiveTool("text");
          break;
        case "p":
        case "P":
          setActiveTool("pen");
          break;
        case "g":
        case "G":
          setActiveTool("polygon");
          break;
        case "a":
        case "A":
          setActiveTool("arc");
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
        overrides.set(id, {
          ...s,
          x: orig.x + result.dx,
          y: orig.y + result.dy,
        });
      });
      guides.push(...result.guides);
    } else if (transform.kind === "resize") {
      const next = resizeRectLikeShape(
        transform.original,
        transform.handle,
        transform.currentDocX,
        transform.currentDocY,
        transform.shift,
      );
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
    if (liveShapeOverrides.size === 0 && !liveNodePoints) return doc.shapes;
    return doc.shapes.map((s) => {
      if (liveNodePoints && s.id === nodeEditingShapeId) {
        return { ...s, points: liveNodePoints };
      }
      return liveShapeOverrides.get(s.id) ?? s;
    });
  }, [doc.shapes, liveShapeOverrides, liveNodePoints, nodeEditingShapeId]);

  const selectedSingleShape = useMemo<Shape | null>(() => {
    if (doc.selectedIds.length !== 1) return null;
    const id = doc.selectedIds[0];
    return displayShapes.find((s) => s.id === id) ?? null;
  }, [doc.selectedIds, displayShapes]);

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

  const handleExport = useCallback(() => {
    if (doc.shapes.length === 0) return;
    const svg = exportSVG(doc.shapes);
    downloadSVG(svg, "design.svg");
  }, [doc.shapes]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  return (
    <div className="flex h-full w-full">
      <Toolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        onExport={handleExport}
        onImport={handleImportClick}
        onBooleanUnion={() => handleBoolean("union")}
        onBooleanDifference={() => handleBoolean("difference")}
        onBooleanIntersection={() => handleBoolean("intersection")}
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
            onPointerLeave={() => setCursorDocPos(null)}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            overlay={
              <>
                {selectedSingleShape && !drawing && !nodeEditingShapeId ? (
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
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFitAll={handleFitAll}
        />
      </div>
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
    </div>
  );
}
