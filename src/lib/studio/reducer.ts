import type {
  HistorySnapshot,
  Shape,
  StudioDocument,
  StudioHistory,
} from "./types";
import {
  DEFAULT_GRID_SPACING,
  DEFAULT_ZOOM,
  HISTORY_LIMIT,
  MAX_ZOOM,
  MIN_ZOOM,
} from "./constants";

export interface StudioState {
  document: StudioDocument;
  history: StudioHistory;
}

export type StudioAction =
  | { type: "ADD_SHAPE"; shape: Shape; selectAfter?: boolean }
  | { type: "ADD_SHAPES"; shapes: Shape[]; selectAfter?: boolean }
  | {
      type: "REPLACE_SHAPES";
      removeIds: string[];
      add: Shape[];
      selectAdded?: boolean;
    }
  | { type: "UPDATE_SHAPES"; shapes: Shape[] }
  | { type: "DELETE_SELECTED" }
  | { type: "BRING_TO_FRONT"; ids: string[] }
  | { type: "SEND_TO_BACK"; ids: string[] }
  | {
      type: "LOAD_DESIGN";
      shapes: Shape[];
      gridSpacing: number;
      snapToGrid: boolean;
      unitDisplay: "mm" | "in";
    }
  | { type: "SELECT"; ids: string[] }
  | { type: "TOGGLE_SELECT"; id: string }
  | { type: "SELECT_ALL" }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_VIEWPORT"; viewportX: number; viewportY: number; zoom: number }
  | { type: "SET_PAN"; viewportX: number; viewportY: number }
  | { type: "SET_ZOOM"; zoom: number; viewportX: number; viewportY: number }
  | { type: "SET_GRID_SPACING"; gridSpacing: number }
  | { type: "SET_SNAP_TO_GRID"; snapToGrid: boolean }
  | { type: "SET_UNIT_DISPLAY"; unitDisplay: "mm" | "in" }
  | { type: "UNDO" }
  | { type: "REDO" };

const ACTIONS_THAT_MODIFY_SHAPES: StudioAction["type"][] = [
  "ADD_SHAPE",
  "ADD_SHAPES",
  "REPLACE_SHAPES",
  "UPDATE_SHAPES",
  "DELETE_SELECTED",
  "BRING_TO_FRONT",
  "SEND_TO_BACK",
];

export function emptyDocument(): StudioDocument {
  return {
    shapes: [],
    selectedIds: [],
    viewportX: -200,
    viewportY: -150,
    zoom: DEFAULT_ZOOM,
    gridSpacing: DEFAULT_GRID_SPACING,
    snapToGrid: true,
    unitDisplay: "mm",
  };
}

function snapshot(doc: StudioDocument): HistorySnapshot {
  return { shapes: doc.shapes, selectedIds: doc.selectedIds };
}

export function initialState(): StudioState {
  const doc = emptyDocument();
  return {
    document: doc,
    history: { past: [], present: snapshot(doc), future: [] },
  };
}

function clampZoom(z: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}

function pushHistory(
  history: StudioHistory,
  next: HistorySnapshot,
): StudioHistory {
  const past = [...history.past, history.present].slice(-HISTORY_LIMIT);
  return { past, present: next, future: [] };
}

function applyShapeMutation(
  state: StudioState,
  next: StudioDocument,
): StudioState {
  return {
    document: next,
    history: pushHistory(state.history, snapshot(next)),
  };
}

export function reducer(state: StudioState, action: StudioAction): StudioState {
  const doc = state.document;

  switch (action.type) {
    case "ADD_SHAPE": {
      const next: StudioDocument = {
        ...doc,
        shapes: [...doc.shapes, action.shape],
        selectedIds: action.selectAfter ? [action.shape.id] : doc.selectedIds,
      };
      return applyShapeMutation(state, next);
    }

    case "ADD_SHAPES": {
      if (action.shapes.length === 0) return state;
      const next: StudioDocument = {
        ...doc,
        shapes: [...doc.shapes, ...action.shapes],
        selectedIds: action.selectAfter
          ? action.shapes.map((s) => s.id)
          : doc.selectedIds,
      };
      return applyShapeMutation(state, next);
    }

    case "REPLACE_SHAPES": {
      const remove = new Set(action.removeIds);
      const next: StudioDocument = {
        ...doc,
        shapes: [
          ...doc.shapes.filter((s) => !remove.has(s.id)),
          ...action.add,
        ],
        selectedIds: action.selectAdded
          ? action.add.map((s) => s.id)
          : doc.selectedIds.filter((id) => !remove.has(id)),
      };
      return applyShapeMutation(state, next);
    }

    case "UPDATE_SHAPES": {
      const updates = new Map(action.shapes.map((s) => [s.id, s]));
      const nextShapes = doc.shapes.map((s) => updates.get(s.id) ?? s);
      const next: StudioDocument = { ...doc, shapes: nextShapes };
      return applyShapeMutation(state, next);
    }

    case "BRING_TO_FRONT": {
      const ids = new Set(action.ids);
      if (ids.size === 0) return state;
      const moved: Shape[] = [];
      const kept: Shape[] = [];
      for (const s of doc.shapes) {
        if (ids.has(s.id)) moved.push(s);
        else kept.push(s);
      }
      if (moved.length === 0) return state;
      const next: StudioDocument = { ...doc, shapes: [...kept, ...moved] };
      return applyShapeMutation(state, next);
    }

    case "SEND_TO_BACK": {
      const ids = new Set(action.ids);
      if (ids.size === 0) return state;
      const moved: Shape[] = [];
      const kept: Shape[] = [];
      for (const s of doc.shapes) {
        if (ids.has(s.id)) moved.push(s);
        else kept.push(s);
      }
      if (moved.length === 0) return state;
      const next: StudioDocument = { ...doc, shapes: [...moved, ...kept] };
      return applyShapeMutation(state, next);
    }

    case "DELETE_SELECTED": {
      if (doc.selectedIds.length === 0) return state;
      const ids = new Set(doc.selectedIds);
      const next: StudioDocument = {
        ...doc,
        shapes: doc.shapes.filter((s) => !ids.has(s.id)),
        selectedIds: [],
      };
      return applyShapeMutation(state, next);
    }

    case "SELECT":
      if (
        doc.selectedIds.length === action.ids.length &&
        doc.selectedIds.every((id, i) => id === action.ids[i])
      ) {
        return state;
      }
      return {
        ...state,
        document: { ...doc, selectedIds: action.ids },
      };

    case "TOGGLE_SELECT": {
      const exists = doc.selectedIds.includes(action.id);
      const nextIds = exists
        ? doc.selectedIds.filter((id) => id !== action.id)
        : [...doc.selectedIds, action.id];
      return { ...state, document: { ...doc, selectedIds: nextIds } };
    }

    case "SELECT_ALL":
      return {
        ...state,
        document: { ...doc, selectedIds: doc.shapes.map((s) => s.id) },
      };

    case "CLEAR_SELECTION":
      if (doc.selectedIds.length === 0) return state;
      return { ...state, document: { ...doc, selectedIds: [] } };

    case "SET_VIEWPORT":
      return {
        ...state,
        document: {
          ...doc,
          viewportX: action.viewportX,
          viewportY: action.viewportY,
          zoom: clampZoom(action.zoom),
        },
      };

    case "SET_PAN":
      return {
        ...state,
        document: {
          ...doc,
          viewportX: action.viewportX,
          viewportY: action.viewportY,
        },
      };

    case "SET_ZOOM":
      return {
        ...state,
        document: {
          ...doc,
          zoom: clampZoom(action.zoom),
          viewportX: action.viewportX,
          viewportY: action.viewportY,
        },
      };

    case "SET_GRID_SPACING":
      return {
        ...state,
        document: { ...doc, gridSpacing: Math.max(0.1, action.gridSpacing) },
      };

    case "SET_SNAP_TO_GRID":
      return { ...state, document: { ...doc, snapToGrid: action.snapToGrid } };

    case "SET_UNIT_DISPLAY":
      return {
        ...state,
        document: { ...doc, unitDisplay: action.unitDisplay },
      };

    case "UNDO": {
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const past = state.history.past.slice(0, -1);
      const future = [state.history.present, ...state.history.future];
      return {
        document: {
          ...doc,
          shapes: previous.shapes,
          selectedIds: previous.selectedIds,
        },
        history: { past, present: previous, future },
      };
    }

    case "LOAD_DESIGN": {
      // Replaces the whole document. History resets to a single snapshot
      // (loading a design is not undoable).
      const next: StudioDocument = {
        ...doc,
        shapes: action.shapes,
        selectedIds: [],
        gridSpacing: action.gridSpacing,
        snapToGrid: action.snapToGrid,
        unitDisplay: action.unitDisplay,
      };
      const snap = snapshot(next);
      return {
        document: next,
        history: { past: [], present: snap, future: [] },
      };
    }

    case "REDO": {
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const future = state.history.future.slice(1);
      const past = [...state.history.past, state.history.present].slice(
        -HISTORY_LIMIT,
      );
      return {
        document: {
          ...doc,
          shapes: next.shapes,
          selectedIds: next.selectedIds,
        },
        history: { past, present: next, future },
      };
    }

    default:
      return state;
  }
}

export function canUndo(state: StudioState): boolean {
  return state.history.past.length > 0;
}

export function canRedo(state: StudioState): boolean {
  return state.history.future.length > 0;
}

export function isShapeMutatingAction(action: StudioAction): boolean {
  return ACTIONS_THAT_MODIFY_SHAPES.includes(action.type);
}
