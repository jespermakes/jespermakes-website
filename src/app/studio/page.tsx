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
import {
  canRedo,
  canUndo,
  initialState,
  reducer,
} from "@/lib/studio/reducer";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/studio/constants";
import { screenToDoc } from "@/lib/studio/geometry";
import type { Tool } from "@/lib/studio/types";

export default function StudioPage() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const { document: doc } = state;

  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [spaceHeld, setSpaceHeld] = useState(false);

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
      if (wantsPan) {
        const screen = screenPointFromEvent(e);
        panRef.current = {
          pointerId: e.pointerId,
          startScreenX: screen.x,
          startScreenY: screen.y,
          startViewportX: doc.viewportX,
          startViewportY: doc.viewportY,
        };
        (e.target as Element).setPointerCapture?.(e.pointerId);
        e.preventDefault();
        return;
      }
    },
    [spaceHeld, doc.viewportX, doc.viewportY, screenPointFromEvent],
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
    },
    [doc.zoom, screenPointFromEvent],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (panRef.current && panRef.current.pointerId === e.pointerId) {
        panRef.current = null;
        (e.target as Element).releasePointerCapture?.(e.pointerId);
        return;
      }
    },
    [],
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
        />
      </div>
    </div>
  );
}
