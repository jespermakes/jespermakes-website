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
  createRectangle,
} from "@/lib/studio/shape-factory";
import {
  resizeLineEndpoint,
  resizeRectLikeShape,
  rotateShape,
} from "@/lib/studio/transform";
import { downloadSVG, exportSVG } from "@/lib/studio/export-svg";
import type { LineEndpointHandle, ResizeHandle } from "@/lib/studio/geometry";
import type { Shape, Tool } from "@/lib/studio/types";

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

  // Active drawing operation (rectangle/circle drag, or line two-click).
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
      };
  const [drawing, setDrawing] = useState<DrawingState | null>(null);

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
          const dx = t.currentDocX - t.startDocX;
          const dy = t.currentDocY - t.startDocY;
          const sdx = snapped ? Math.round(dx / grid) * grid : dx;
          const sdy = snapped ? Math.round(dy / grid) * grid : dy;
          if (sdx !== 0 || sdy !== 0) {
            const updated: Shape[] = [];
            t.originals.forEach((orig, id) => {
              const s = doc.shapes.find((sh) => sh.id === id);
              if (!s) return;
              updated.push({ ...s, x: orig.x + sdx, y: orig.y + sdy });
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

      switch (e.key) {
        case "v":
        case "V":
        case "Escape":
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
        case "Delete":
        case "Backspace":
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
  }, [spaceHeld, setActiveTool, handleFitAll]);

  const cursor = useMemo(() => {
    if (panRef.current) return "grabbing";
    if (spaceHeld) return "grab";
    if (activeTool === "select") return "default";
    return "crosshair";
  }, [activeTool, spaceHeld]);

  const previewShape = useMemo<Shape | null>(() => {
    if (!drawing) return null;
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
  }, [drawing]);

  // Live shape overrides while a transform is in progress (no history churn).
  const liveShapeOverrides = useMemo<Map<string, Shape>>(() => {
    const overrides = new Map<string, Shape>();
    if (!transform) return overrides;
    if (transform.kind === "move") {
      const dx = transform.currentDocX - transform.startDocX;
      const dy = transform.currentDocY - transform.startDocY;
      transform.originals.forEach((orig, id) => {
        const s = doc.shapes.find((sh) => sh.id === id);
        if (!s) return;
        overrides.set(id, { ...s, x: orig.x + dx, y: orig.y + dy });
      });
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
    return overrides;
  }, [transform, doc.shapes]);

  const displayShapes = useMemo<Shape[]>(() => {
    if (liveShapeOverrides.size === 0) return doc.shapes;
    return doc.shapes.map((s) => liveShapeOverrides.get(s.id) ?? s);
  }, [doc.shapes, liveShapeOverrides]);

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

  const handleExport = useCallback(() => {
    if (doc.shapes.length === 0) return;
    const svg = exportSVG(doc.shapes);
    downloadSVG(svg, "design.svg");
  }, [doc.shapes]);

  return (
    <div className="flex h-full w-full">
      <Toolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        onExport={handleExport}
        canUndo={canUndo(state)}
        canRedo={canRedo(state)}
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
          <div ref={containerRef} className="relative overflow-hidden">
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setCursorDocPos(null)}
            onWheel={handleWheel}
            overlay={
              <>
                {selectedSingleShape && !drawing ? (
                  <SelectionHandles
                    shape={selectedSingleShape}
                    zoomScale={1 / doc.zoom}
                  />
                ) : null}
                <ToolOverlay
                  preview={previewShape}
                  zoomScale={1 / doc.zoom}
                  marquee={marqueeRect}
                />
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
