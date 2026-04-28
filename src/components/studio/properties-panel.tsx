"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NumberField } from "./number-field";
import {
  COLOR_PRESETS,
  DEFAULT_FILL,
  DEFAULT_STROKE,
} from "@/lib/studio/constants";
import {
  displayToMm,
  formatDisplay,
  mmToDisplay,
} from "@/lib/studio/geometry";
import { estimateTextBox } from "@/lib/studio/shape-factory";
import type { Shape } from "@/lib/studio/types";

interface DocSettings {
  gridSpacing: number;
  snapToGrid: boolean;
  unitDisplay: "mm" | "in";
  zoom: number;
}

interface PropertiesPanelProps {
  selectedShapes: Shape[];
  unit: "mm" | "in";
  doc: DocSettings;
  /** When set, focuses the text-edit textarea for that shape. */
  editingTextShapeId: string | null;
  /** When set, the panel shows node-editing controls instead of bbox edits. */
  nodeEditingShapeId: string | null;
  onUpdateShape: (next: Shape) => void;
  onDeleteSelected: () => void;
  onSetGridSpacing: (mm: number) => void;
  onSetSnapToGrid: (v: boolean) => void;
  onSetUnitDisplay: (u: "mm" | "in") => void;
  onFitAll: () => void;
  onTextEditDone: () => void;
  onEnterNodeEdit: (shapeId: string) => void;
  onExitNodeEdit: () => void;
}

const SECTION_LABEL =
  "text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40";

export function PropertiesPanel(props: PropertiesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Expand properties panel"
        className="h-full w-6 border-l border-wood/[0.08] bg-white text-wood-light/60 hover:text-wood"
      >
        <span className="block rotate-90 text-[10px] font-bold uppercase tracking-[0.2em]">
          Properties
        </span>
      </button>
    );
  }

  return (
    <aside className="flex h-full w-[280px] flex-col border-l border-wood/[0.08] bg-white">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <span className={SECTION_LABEL}>Properties</span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse panel"
          className="text-wood-light/60 hover:text-wood"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path
              d="M9 3 L4 8 L9 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <PanelBody {...props} />
      </div>
    </aside>
  );
}

function PanelBody({
  selectedShapes,
  unit,
  doc,
  editingTextShapeId,
  nodeEditingShapeId,
  onUpdateShape,
  onDeleteSelected,
  onSetGridSpacing,
  onSetSnapToGrid,
  onSetUnitDisplay,
  onFitAll,
  onTextEditDone,
  onEnterNodeEdit,
  onExitNodeEdit,
}: PropertiesPanelProps) {
  if (nodeEditingShapeId) {
    const editing = selectedShapes.find((s) => s.id === nodeEditingShapeId);
    const count = editing?.points?.length ?? 0;
    return (
      <div className="flex flex-col gap-5">
        <Section label="Node editing">
          <p className="text-sm text-wood">
            {count} node{count === 1 ? "" : "s"}
          </p>
          <p className="text-[11px] text-wood-light/60">
            Drag nodes or handles to reshape. Press Esc to finish.
          </p>
          <button
            type="button"
            onClick={onExitNodeEdit}
            className="rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood hover:border-forest/40"
          >
            Done editing
          </button>
        </Section>
      </div>
    );
  }

  if (selectedShapes.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyStateHints />
        <Section label="Document">
          <NumberField
            label="Grid"
            value={doc.gridSpacing}
            onCommit={onSetGridSpacing}
            min={0.1}
            suffix="mm"
            format={(v) => v.toString()}
            parse={(raw) => Number.parseFloat(raw)}
          />
          <label className="flex items-center gap-2 pl-8 text-sm text-wood">
            <input
              type="checkbox"
              checked={doc.snapToGrid}
              onChange={(e) => onSetSnapToGrid(e.target.checked)}
              className="h-3.5 w-3.5 accent-forest"
            />
            Snap to grid
          </label>
        </Section>
        <Section label="Units">
          <div className="flex gap-1">
            {(["mm", "in"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onSetUnitDisplay(u)}
                className={`flex-1 rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                  doc.unitDisplay === u
                    ? "border-forest bg-forest/[0.08] text-forest"
                    : "border-wood/[0.12] bg-white/70 text-wood-light hover:border-forest/40"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </Section>
        <Section label="Viewport">
          <div className="flex items-center justify-between text-sm text-wood">
            <span>Zoom</span>
            <span className="font-mono text-wood-light">
              {Math.round(doc.zoom * 100) / 100}× px/mm
            </span>
          </div>
          <button
            type="button"
            onClick={onFitAll}
            className="rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood hover:border-forest/40"
          >
            Fit all
          </button>
        </Section>
      </div>
    );
  }

  if (selectedShapes.length > 1) {
    return (
      <div className="flex flex-col gap-5">
        <Section label="Selection">
          <p className="text-sm text-wood">
            {selectedShapes.length} shapes selected
          </p>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-1.5 text-sm text-red-700 hover:border-red-400"
          >
            Delete selected
          </button>
        </Section>
      </div>
    );
  }

  const shape = selectedShapes[0];
  return (
    <SingleShapeEditor
      shape={shape}
      unit={unit}
      onUpdateShape={onUpdateShape}
      onDelete={onDeleteSelected}
      editingTextShapeId={editingTextShapeId}
      onTextEditDone={onTextEditDone}
      onEnterNodeEdit={onEnterNodeEdit}
    />
  );
}

function SingleShapeEditor({
  shape,
  unit,
  onUpdateShape,
  onDelete,
  editingTextShapeId,
  onTextEditDone,
  onEnterNodeEdit,
}: {
  shape: Shape;
  unit: "mm" | "in";
  onUpdateShape: (s: Shape) => void;
  onDelete: () => void;
  editingTextShapeId: string | null;
  onTextEditDone: () => void;
  onEnterNodeEdit: (shapeId: string) => void;
}) {
  const formatDim = useCallback(
    (mm: number) => formatDisplay(mm, unit),
    [unit],
  );
  const parseDim = useCallback(
    (raw: string) => {
      const n = Number.parseFloat(raw);
      if (Number.isNaN(n)) return Number.NaN;
      return displayToMm(n, unit);
    },
    [unit],
  );
  const formatPlain = useCallback(
    (mm: number) => mmToDisplay(mm, unit).toString(),
    [unit],
  );

  const isCircle = shape.type === "circle";
  const isLine = shape.type === "line";
  const isText = shape.type === "text";
  const isPath = shape.type === "path";
  const pointCount = shape.points?.length ?? 0;
  const canNodeEdit = isPath && pointCount > 0;

  return (
    <div className="flex flex-col gap-5">
      <Section label={shape.type}>
        <NumberField
          label="X"
          value={shape.x}
          onCommit={(v) => onUpdateShape({ ...shape, x: v })}
          format={formatPlain}
          parse={parseDim}
          suffix={unit}
        />
        <NumberField
          label="Y"
          value={shape.y}
          onCommit={(v) => onUpdateShape({ ...shape, y: v })}
          format={formatPlain}
          parse={parseDim}
          suffix={unit}
        />
      </Section>
      {isText ? (
        <TextFields
          shape={shape}
          unit={unit}
          autoFocus={editingTextShapeId === shape.id}
          formatPlain={formatPlain}
          parseDim={parseDim}
          onUpdateShape={onUpdateShape}
          onEditDone={onTextEditDone}
        />
      ) : isCircle ? (
        <Section label="Size">
          <NumberField
            label="Ø"
            value={shape.width}
            onCommit={(v) =>
              onUpdateShape({ ...shape, width: v, height: v })
            }
            format={formatDim}
            parse={parseDim}
            min={0}
            suffix={unit}
          />
        </Section>
      ) : isLine ? (
        <LineEndpointFields
          shape={shape}
          unit={unit}
          formatPlain={formatPlain}
          parseDim={parseDim}
          onUpdateShape={onUpdateShape}
        />
      ) : (
        <Section label="Size">
          <NumberField
            label="W"
            value={shape.width}
            onCommit={(v) => onUpdateShape({ ...shape, width: v })}
            format={formatDim}
            parse={parseDim}
            min={0}
            suffix={unit}
          />
          <NumberField
            label="H"
            value={shape.height}
            onCommit={(v) => onUpdateShape({ ...shape, height: v })}
            format={formatDim}
            parse={parseDim}
            min={0}
            suffix={unit}
          />
        </Section>
      )}
      {!isLine ? (
        <Section label="Rotation">
          <NumberField
            label="°"
            value={shape.rotation}
            onCommit={(v) => onUpdateShape({ ...shape, rotation: v })}
            format={(v) => v.toFixed(1)}
            parse={(raw) => Number.parseFloat(raw)}
            suffix="°"
          />
        </Section>
      ) : null}
      <Section label={isText ? "Color" : "Stroke"}>
        <ColorSwatches
          value={shape.stroke}
          allowNone={false}
          onChange={(c) => onUpdateShape({ ...shape, stroke: c })}
        />
        {!isText ? (
          <NumberField
            label="W"
            value={shape.strokeWidth}
            onCommit={(v) => onUpdateShape({ ...shape, strokeWidth: v })}
            min={0}
            format={(v) => v.toString()}
            parse={(raw) => Number.parseFloat(raw)}
            suffix="mm"
          />
        ) : null}
      </Section>
      {!isLine && !isText ? (
        <Section label="Fill">
          <ColorSwatches
            value={shape.fill}
            allowNone={true}
            onChange={(c) => onUpdateShape({ ...shape, fill: c })}
          />
        </Section>
      ) : null}
      {canNodeEdit ? (
        <Section label="Path">
          <p className="text-[11px] text-wood-light/60">
            {pointCount} node{pointCount === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={() => onEnterNodeEdit(shape.id)}
            className="rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood hover:border-forest/40"
          >
            Edit nodes
          </button>
        </Section>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="mt-2 rounded-xl border border-red-200 bg-red-50/70 px-3 py-1.5 text-sm text-red-700 hover:border-red-400"
      >
        Delete shape
      </button>
    </div>
  );
}

function TextFields({
  shape,
  unit,
  autoFocus,
  formatPlain,
  parseDim,
  onUpdateShape,
  onEditDone,
}: {
  shape: Shape;
  unit: "mm" | "in";
  autoFocus: boolean;
  formatPlain: (mm: number) => string;
  parseDim: (raw: string) => number;
  onUpdateShape: (s: Shape) => void;
  onEditDone: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    }
  }, [autoFocus, shape.id]);

  const setText = (next: string) => {
    const fontSize = shape.fontSize ?? 10;
    const { width, height } = estimateTextBox(next, fontSize);
    onUpdateShape({ ...shape, text: next, width, height });
  };

  const setFontSize = (next: number) => {
    const text = shape.text ?? "";
    const { width, height } = estimateTextBox(text, next);
    onUpdateShape({ ...shape, fontSize: next, width, height });
  };

  const setFontFamily = (family: string) => {
    onUpdateShape({ ...shape, fontFamily: family });
  };

  const setAlign = (anchor: "start" | "middle" | "end") => {
    onUpdateShape({ ...shape, textAnchor: anchor });
  };

  const fontFamily = shape.fontFamily ?? "Inter, sans-serif";
  const align = shape.textAnchor ?? "middle";

  return (
    <>
      <Section label="Text">
        <textarea
          ref={textareaRef}
          value={shape.text ?? ""}
          onChange={(e) => setText(e.target.value)}
          onBlur={onEditDone}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
          rows={3}
          className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
        />
      </Section>
      <Section label="Font">
        <NumberField
          label="Sz"
          value={shape.fontSize ?? 10}
          onCommit={setFontSize}
          format={formatPlain}
          parse={parseDim}
          min={0.1}
          suffix={unit}
        />
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
        >
          <option value="Inter, sans-serif">Inter</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="ui-monospace, monospace">Monospace</option>
        </select>
      </Section>
      <Section label="Align">
        <div className="flex gap-1">
          {(
            [
              { v: "start" as const, label: "L" },
              { v: "middle" as const, label: "C" },
              { v: "end" as const, label: "R" },
            ]
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setAlign(opt.v)}
              aria-label={`Align ${opt.v}`}
              className={`flex-1 rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                align === opt.v
                  ? "border-forest bg-forest/[0.08] text-forest"
                  : "border-wood/[0.12] bg-white/70 text-wood-light hover:border-forest/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

function LineEndpointFields({
  shape,
  unit,
  formatPlain,
  parseDim,
  onUpdateShape,
}: {
  shape: Shape;
  unit: "mm" | "in";
  formatPlain: (mm: number) => string;
  parseDim: (raw: string) => number;
  onUpdateShape: (s: Shape) => void;
}) {
  const ax = shape.x + (shape.x1 ?? 0);
  const ay = shape.y + (shape.y1 ?? 0);
  const bx = shape.x + (shape.x2 ?? 0);
  const by = shape.y + (shape.y2 ?? 0);

  const setEndpoint = (which: 1 | 2, x: number, y: number) => {
    const a = which === 1 ? { x, y } : { x: ax, y: ay };
    const b = which === 2 ? { x, y } : { x: bx, y: by };
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    onUpdateShape({
      ...shape,
      x: cx,
      y: cy,
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y),
      x1: a.x - cx,
      y1: a.y - cy,
      x2: b.x - cx,
      y2: b.y - cy,
    });
  };

  return (
    <Section label="Endpoints">
      <NumberField
        label="X1"
        value={ax}
        onCommit={(v) => setEndpoint(1, v, ay)}
        format={formatPlain}
        parse={parseDim}
        suffix={unit}
      />
      <NumberField
        label="Y1"
        value={ay}
        onCommit={(v) => setEndpoint(1, ax, v)}
        format={formatPlain}
        parse={parseDim}
        suffix={unit}
      />
      <NumberField
        label="X2"
        value={bx}
        onCommit={(v) => setEndpoint(2, v, by)}
        format={formatPlain}
        parse={parseDim}
        suffix={unit}
      />
      <NumberField
        label="Y2"
        value={by}
        onCommit={(v) => setEndpoint(2, bx, v)}
        format={formatPlain}
        parse={parseDim}
        suffix={unit}
      />
    </Section>
  );
}

function EmptyStateHints() {
  const items: { key: string; label: string }[] = [
    { key: "R", label: "Rectangle" },
    { key: "C", label: "Circle" },
    { key: "L", label: "Line" },
    { key: "T", label: "Text" },
  ];
  return (
    <div className="flex flex-col items-center gap-3 pt-2 text-center text-wood-light/40">
      <p className="text-xs">Draw something to get started.</p>
      <ul className="flex flex-col gap-1.5 text-[11px]">
        {items.map((it) => (
          <li key={it.key} className="flex items-center justify-center gap-2">
            <kbd className="rounded border border-wood/15 bg-white/60 px-1.5 py-0.5 font-mono text-[10px] text-wood-light/70">
              {it.key}
            </kbd>
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={SECTION_LABEL}>{label}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function ColorSwatches({
  value,
  allowNone,
  onChange,
}: {
  value: string;
  allowNone: boolean;
  onChange: (color: string) => void;
}) {
  const [hex, setHex] = useState(() =>
    value === DEFAULT_FILL || value === "none" ? "" : value,
  );
  const isNone = value === "none";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {allowNone ? (
          <button
            type="button"
            aria-label="No fill"
            onClick={() => onChange("none")}
            className={`relative h-6 w-6 rounded-md border ${isNone ? "border-forest" : "border-wood/20"} bg-white`}
          >
            <span className="absolute inset-0 m-auto block h-full w-px rotate-45 bg-red-500" />
          </button>
        ) : null}
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => onChange(c)}
            className={`h-6 w-6 rounded-md border ${value.toLowerCase() === c.toLowerCase() ? "border-forest" : "border-wood/20"}`}
            style={{ background: c }}
          />
        ))}
      </div>
      <input
        type="text"
        value={hex}
        placeholder="#hex"
        onChange={(e) => setHex(e.target.value)}
        onBlur={() => {
          const trimmed = hex.trim();
          if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
            const normalized =
              trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
            setHex(normalized);
            onChange(normalized);
          } else {
            setHex(value === "none" || value === DEFAULT_FILL ? "" : value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-xs font-mono text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
      />
    </div>
  );
}

export const STROKE_DEFAULTS = {
  stroke: DEFAULT_STROKE,
  fill: DEFAULT_FILL,
};
