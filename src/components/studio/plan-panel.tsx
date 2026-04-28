"use client";

import { useState } from "react";
import { NumberField } from "./number-field";
import {
  displayToMm,
  formatDisplay,
  mmToDisplay,
} from "@/lib/studio/geometry";
import {
  newToolId,
} from "@/lib/studio/tool-library";
import type {
  CuttingTool,
  MaterialSettings,
  Shape,
} from "@/lib/studio/types";

interface PlanPanelProps {
  selectedShapes: Shape[];
  unit: "mm" | "in";
  material: MaterialSettings;
  tools: CuttingTool[];
  activeTool: CuttingTool | null;
  showKerfCompensation: boolean;
  onSetMaterial: (next: MaterialSettings) => void;
  onSetActiveTool: (toolId: string) => void;
  onUpsertTool: (tool: CuttingTool) => void;
  onDeleteTool: (toolId: string) => void;
  onSetKerfCompensation: (show: boolean) => void;
}

const SECTION_LABEL =
  "text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40";

export function PlanPanel(props: PlanPanelProps) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-wood/[0.08] bg-white">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <span className={SECTION_LABEL}>Plan</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-6">
          <MaterialSection
            material={props.material}
            unit={props.unit}
            onSetMaterial={props.onSetMaterial}
          />
          <ToolSection
            tools={props.tools}
            activeTool={props.activeTool}
            unit={props.unit}
            onSetActiveTool={props.onSetActiveTool}
            onUpsertTool={props.onUpsertTool}
            onDeleteTool={props.onDeleteTool}
          />
          <KerfSection
            show={props.showKerfCompensation}
            kerfMm={props.activeTool?.kerf ?? 0}
            onChange={props.onSetKerfCompensation}
          />
        </div>
      </div>
    </aside>
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

function MaterialSection({
  material,
  unit,
  onSetMaterial,
}: {
  material: MaterialSettings;
  unit: "mm" | "in";
  onSetMaterial: (m: MaterialSettings) => void;
}) {
  const formatPlain = (mm: number) => mmToDisplay(mm, unit).toString();
  const formatDim = (mm: number) => formatDisplay(mm, unit);
  const parseDim = (raw: string) => {
    const n = Number.parseFloat(raw);
    if (Number.isNaN(n)) return Number.NaN;
    return displayToMm(n, unit);
  };
  return (
    <Section label="Material">
      <input
        type="text"
        value={material.name}
        onChange={(e) => onSetMaterial({ ...material, name: e.target.value })}
        placeholder="Material name"
        className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
      />
      <NumberField
        label="W"
        value={material.width}
        onCommit={(v) => onSetMaterial({ ...material, width: Math.max(1, v) })}
        min={1}
        format={formatDim}
        parse={parseDim}
        suffix={unit}
      />
      <NumberField
        label="H"
        value={material.height}
        onCommit={(v) => onSetMaterial({ ...material, height: Math.max(1, v) })}
        min={1}
        format={formatDim}
        parse={parseDim}
        suffix={unit}
      />
      <NumberField
        label="T"
        value={material.thickness}
        onCommit={(v) =>
          onSetMaterial({ ...material, thickness: Math.max(0.1, v) })
        }
        min={0.1}
        format={formatPlain}
        parse={parseDim}
        suffix={unit}
      />
    </Section>
  );
}

function ToolSection({
  tools,
  activeTool,
  unit,
  onSetActiveTool,
  onUpsertTool,
  onDeleteTool,
}: {
  tools: CuttingTool[];
  activeTool: CuttingTool | null;
  unit: "mm" | "in";
  onSetActiveTool: (toolId: string) => void;
  onUpsertTool: (tool: CuttingTool) => void;
  onDeleteTool: (toolId: string) => void;
}) {
  const [editing, setEditing] = useState<CuttingTool | null>(null);

  return (
    <Section label="Tool">
      <select
        value={activeTool?.id ?? ""}
        onChange={(e) => onSetActiveTool(e.target.value)}
        className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
      >
        {tools.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {activeTool ? (
        <div className="flex flex-col gap-0.5 rounded-md bg-cream/60 px-3 py-2 text-[11px] text-wood-light">
          <span>Type: {activeTool.type === "laser" ? "Laser" : "Router"}</span>
          <span>
            Diameter: {formatDisplay(activeTool.diameter, unit)} {unit}
          </span>
          <span>
            Kerf: {formatDisplay(activeTool.kerf, unit)} {unit}
          </span>
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            setEditing({
              id: newToolId(),
              name: "New tool",
              type: "router_bit",
              diameter: 3,
              kerf: 3,
            })
          }
          className="rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-xs text-wood hover:border-forest/40"
        >
          + Add tool
        </button>
        {activeTool ? (
          <button
            type="button"
            onClick={() => setEditing({ ...activeTool })}
            className="rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-xs text-wood hover:border-forest/40"
          >
            Edit
          </button>
        ) : null}
      </div>
      {editing ? (
        <ToolEditor
          tool={editing}
          unit={unit}
          existing={tools}
          onSave={(t) => {
            onUpsertTool(t);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          onDelete={
            tools.find((t) => t.id === editing.id)
              ? () => {
                  onDeleteTool(editing.id);
                  setEditing(null);
                }
              : undefined
          }
        />
      ) : null}
    </Section>
  );
}

function ToolEditor({
  tool,
  unit,
  onSave,
  onCancel,
  onDelete,
}: {
  tool: CuttingTool;
  unit: "mm" | "in";
  existing: CuttingTool[];
  onSave: (t: CuttingTool) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState(tool);
  const formatDim = (mm: number) => formatDisplay(mm, unit);
  const parseDim = (raw: string) => {
    const n = Number.parseFloat(raw);
    if (Number.isNaN(n)) return Number.NaN;
    return displayToMm(n, unit);
  };
  return (
    <div className="flex flex-col gap-2 rounded-md border border-wood/[0.08] bg-cream/40 p-3">
      <input
        type="text"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder="Tool name"
        className="w-full rounded-md border border-wood/[0.12] bg-white px-2 py-1 text-sm"
      />
      <select
        value={draft.type}
        onChange={(e) =>
          setDraft({
            ...draft,
            type: e.target.value === "laser" ? "laser" : "router_bit",
          })
        }
        className="w-full rounded-md border border-wood/[0.12] bg-white px-2 py-1 text-sm"
      >
        <option value="router_bit">Router bit</option>
        <option value="laser">Laser</option>
      </select>
      <NumberField
        label="Ø"
        value={draft.diameter}
        onCommit={(v) =>
          setDraft({ ...draft, diameter: Math.max(0.001, v) })
        }
        min={0.001}
        format={formatDim}
        parse={parseDim}
        suffix={unit}
      />
      <NumberField
        label="K"
        value={draft.kerf}
        onCommit={(v) => setDraft({ ...draft, kerf: Math.max(0, v) })}
        min={0}
        format={formatDim}
        parse={parseDim}
        suffix={unit}
      />
      <div className="flex justify-between gap-2">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-1 text-xs text-red-700 hover:border-red-400"
          >
            Delete
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-wood/[0.12] bg-white px-3 py-1 text-xs text-wood hover:border-forest/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-xl bg-wood px-3 py-1 text-xs font-medium text-cream hover:bg-wood-light"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function KerfSection({
  show,
  kerfMm,
  onChange,
}: {
  show: boolean;
  kerfMm: number;
  onChange: (v: boolean) => void;
}) {
  return (
    <Section label="Kerf compensation">
      <label className="flex items-center gap-2 text-sm text-wood">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 accent-forest"
        />
        Show kerf offset
      </label>
      <p className="text-[11px] text-wood-light/60">
        Kerf: {kerfMm.toFixed(2)} mm (from active tool)
      </p>
    </Section>
  );
}
