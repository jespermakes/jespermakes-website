"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageSection, ModuleKind, ModuleData } from "@/lib/homepage/types";
import { MODULE_LABELS, MODULE_KINDS } from "@/lib/homepage/types";
import HeroForm from "./homepage-forms/hero-form";
import AboutForm from "./homepage-forms/about-form";
import CreatorToolsForm from "./homepage-forms/creator-tools-form";
import FeedForm from "./homepage-forms/feed-form";
import AdminNewsletterForm from "./homepage-forms/newsletter-form";

interface Props {
  initialSections: PageSection[];
}

export default function HomepageEditor({ initialSections }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === e.active.id);
    const newIdx = sections.findIndex((s) => s.id === e.over!.id);
    const next = arrayMove(sections, oldIdx, newIdx);
    setSections(next);
    await fetch("/api/admin/homepage/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((s) => s.id) }),
    });
  }

  async function toggleVisible(section: PageSection) {
    const optimistic = sections.map((s) => (s.id === section.id ? { ...s, visible: !s.visible } : s));
    setSections(optimistic);
    await fetch(`/api/admin/homepage/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !section.visible }),
    });
  }

  async function saveData(section: PageSection, newData: ModuleData) {
    setSaving(section.id);
    const res = await fetch(`/api/admin/homepage/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: newData }),
    });
    setSaving(null);
    if (res.ok) {
      setSections(sections.map((s) => (s.id === section.id ? { ...s, data: newData } : s)));
      setExpandedId(null);
    } else {
      alert("Save failed. Check the console.");
    }
  }

  async function removeSection(section: PageSection) {
    if (!confirm(`Remove "${MODULE_LABELS[section.kind]}" section? You can re-add it later.`)) return;
    const res = await fetch(`/api/admin/homepage/${section.id}`, { method: "DELETE" });
    if (res.ok) setSections(sections.filter((s) => s.id !== section.id));
  }

  async function addSection(kind: ModuleKind) {
    setAddOpen(false);
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    if (res.ok) {
      const { section } = await res.json();
      setSections([...sections, section]);
      setExpandedId(section.id);
    }
  }

  function summaryOf(section: PageSection): string {
    const d = section.data as unknown as Record<string, unknown>;
    return (d.title as string) || MODULE_LABELS[section.kind];
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5">
            {sections.map((section) => (
              <SortableCard
                key={section.id}
                section={section}
                expanded={expandedId === section.id}
                onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
                onToggleVisible={() => toggleVisible(section)}
                onRemove={() => removeSection(section)}
                onSave={(newData) => saveData(section, newData)}
                saving={saving === section.id}
                summary={summaryOf(section)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-3">
        {addOpen ? (
          <div className="rounded-xl border border-wood/15 bg-white/60 p-4">
            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/50 uppercase">Add a section</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MODULE_KINDS.map((k) => (
                <button
                  key={k}
                  onClick={() => addSection(k)}
                  className="rounded-lg border border-wood/15 bg-white px-3 py-2.5 text-left text-sm hover:border-wood/30"
                >
                  {MODULE_LABELS[k]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAddOpen(false)}
              className="mt-3 text-xs text-wood-light/60 hover:text-wood"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddOpen(true)}
            className="w-full rounded-xl border-2 border-dashed border-wood/20 bg-transparent px-4 py-4 text-sm font-medium text-wood-light/70 hover:border-wood/40 hover:text-wood"
          >
            + Add section
          </button>
        )}
      </div>
    </>
  );
}

function SortableCard({
  section,
  expanded,
  onToggleExpand,
  onToggleVisible,
  onRemove,
  onSave,
  saving,
  summary,
}: {
  section: PageSection;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  onSave: (data: ModuleData) => void;
  saving: boolean;
  summary: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "rounded-xl border bg-white/60 transition-all " +
        (expanded ? "border-forest shadow-[0_0_0_3px_rgba(90,122,90,0.1)]" : "border-wood/8")
      }
    >
      <div className="flex items-center gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-wood-light/30 hover:text-wood-light/60"
          aria-label="Drag to reorder"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="4" cy="3" r="1.2" />
            <circle cx="10" cy="3" r="1.2" />
            <circle cx="4" cy="7" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="4" cy="11" r="1.2" />
            <circle cx="10" cy="11" r="1.2" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/50 uppercase">{MODULE_LABELS[section.kind]}</div>
          <div className="mt-0.5 text-sm font-medium text-wood truncate">{summary}</div>
        </div>
        <button
          onClick={onToggleVisible}
          className={
            "rounded px-2 py-1 text-[11px] font-semibold " +
            (section.visible
              ? "bg-forest/10 text-forest"
              : "bg-wood/8 text-wood-light/70")
          }
          type="button"
        >
          {section.visible ? "Visible" : "Hidden"}
        </button>
        <button
          onClick={onToggleExpand}
          className="rounded-md border border-wood/15 bg-transparent px-3 py-1.5 text-xs font-semibold text-wood hover:bg-wood/5"
          type="button"
        >
          {expanded ? "Collapse" : "Edit"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-wood/8 bg-wood/[0.02] p-5">
          <EditForm section={section} onSave={onSave} saving={saving} />
          <div className="mt-4 border-t border-wood/8 pt-3">
            <button
              onClick={onRemove}
              className="text-xs text-wood-light/60 hover:text-red-700"
              type="button"
            >
              Remove this section
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditForm({ section, onSave, saving }: { section: PageSection; onSave: (d: ModuleData) => void; saving: boolean }) {
  switch (section.kind) {
    case "hero":
      return <HeroForm initial={section.data as import("@/lib/homepage/types").HeroData} onSave={onSave} saving={saving} />;
    case "about":
      return <AboutForm initial={section.data as import("@/lib/homepage/types").AboutData} onSave={onSave} saving={saving} />;
    case "creator_tools":
      return <CreatorToolsForm initial={section.data as import("@/lib/homepage/types").CreatorToolsData} onSave={onSave} saving={saving} />;
    case "blog":
    case "shop":
    case "youtube":
      return <FeedForm kind={section.kind} initial={section.data as import("@/lib/homepage/types").FeedData} onSave={onSave} saving={saving} />;
    case "newsletter":
      return <AdminNewsletterForm initial={section.data as import("@/lib/homepage/types").NewsletterData} onSave={onSave} saving={saving} />;
  }
}
