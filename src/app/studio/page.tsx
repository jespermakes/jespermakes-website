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
import { Toolbar } from "@/components/studio/toolbar";
import { ToolOverlay } from "@/components/studio/tool-overlay";
import {
  canRedo,
  canUndo,
  initialState,
  reducer,
} from "@/lib/studio/reducer";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/studio/constants";
import { rectFromCorners, screenToDoc, snapPoint } from "@/lib/studio/geometry";
import {
  createCircle,
  createLine,
  createRectangle,
} from "@/lib/studio/shape-factory";
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
      screenPointFromEvent,
    ],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (panRef.current && panRef.current.pointerId === e.pointerId) {
        const screen = screenPointFromEvent(e);
        const dxMm = (screen.x - panRef.current.startScreenX) / doc.zoom;
        const dyMm = (screen.y - panRef.current.startScreenY) / doc.zoom;
        dispatch({
          type: "SET_PAN",
          viewportX: panRef.current.startViewportX - dxMm,
          viewportY: panRef.current.startViewportY - dyMm,
        });
        return;
      }

      if (!drawing) return;
      const matchesDrag =
        drawing.kind === "drag" && drawing.pointerId === e.pointerId;
      const matchesTwoClick = drawing.kind === "two-click";
      if (!matchesDrag && !matchesTwoClick) return;

      const screen = screenPointFromEvent(e);
      const docPoint = screenToDoc(
        screen.x,
        screen.y,
        doc.viewportX,
        doc.viewportY,
        doc.zoom,
      );
      setDrawing({
        ...drawing,
        currentDocX: docPoint.x,
        currentDocY: docPoint.y,
        shift: e.shiftKey,
      });
    },
    [doc.zoom, doc.viewportX, doc.viewportY, drawing, screenPointFromEvent],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (panRef.current && panRef.current.pointerId === e.pointerId) {
        panRef.current = null;
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        return;
      }

      if (
        drawing &&
        drawing.kind === "drag" &&
        drawing.pointerId === e.pointerId
      ) {
        const shift = e.shiftKey || drawing.shift;
        let { startDocX: ax, startDocY: ay } = drawing;
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
    [drawing, doc.gridSpacing, doc.snapToGrid],
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
  }, [spaceHeld]);

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

  const handleExport = useCallback(() => {
    // Wired in a later step.
  }, []);

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
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <Canvas
          ref={svgRef}
          shapes={doc.shapes}
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
          onWheel={handleWheel}
          overlay={
            <ToolOverlay
              preview={previewShape}
              zoomScale={1 / doc.zoom}
              marquee={null}
            />
          }
        />
      </div>
    </div>
  );
}
