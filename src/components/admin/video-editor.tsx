"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LONGFORM_STAGES,
  SHORTS_STAGES,
  STAGE_LABELS,
  type VideoKind,
} from "@/lib/video-stages";
import type { Video, VideoTask } from "@/lib/db/schema";

interface LinkedTool {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

export function VideoEditor({
  video,
  kind,
  initialTasks,
  initialTools,
}: {
  video: Video;
  kind: VideoKind;
  initialTasks: VideoTask[];
  initialTools: LinkedTool[];
}) {
  const router = useRouter();
  const stages = kind === "longform" ? LONGFORM_STAGES : SHORTS_STAGES;

  const [title, setTitle] = useState(video.title);
  const [stage, setStage] = useState<string>(video.stage);
  const [sponsor, setSponsor] = useState(video.sponsor ?? "");
  const [targetPublishDate, setTargetPublishDate] = useState(
    video.targetPublishDate ? new Date(video.targetPublishDate).toISOString().slice(0, 10) : ""
  );
  const [youtubeId, setYoutubeId] = useState(video.youtubeId ?? "");
  const [scriptNotes, setScriptNotes] = useState(video.scriptNotes ?? "");
  const [sponsorContact, setSponsorContact] = useState(video.sponsorContact ?? "");
  const [notes, setNotes] = useState(video.notes ?? "");

  const [tasks, setTasks] = useState<VideoTask[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<"jesper" | "bearatski" | "">("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          stage,
          sponsor: sponsor.trim() || null,
          targetPublishDate: targetPublishDate || null,
          youtubeId: youtubeId.trim() || null,
          scriptNotes: scriptNotes || null,
          sponsorContact: sponsorContact.trim() || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        setError(err.error || "Save failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hide "${title}"? You can restore later from the DB.`)) return;
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, { method: "DELETE" });
      if (res.ok) router.push(`/admin/videos/${kind}`);
      else setError("Hide failed");
    } catch {
      setError("Hide failed");
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const res = await fetch(`/api/admin/videos/${video.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle.trim(),
        assignee: newTaskAssignee || null,
      }),
    });
    if (res.ok) {
      const { task } = await res.json();
      setTasks([...tasks, task]);
      setNewTaskTitle("");
      setNewTaskAssignee("");
    }
  };

  const toggleTask = async (taskId: string, done: boolean) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done } : t)));
    await fetch(`/api/admin/videos/${video.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
  };

  const setTaskAssignee = async (taskId: string, assignee: string | null) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, assignee } : t)));
    await fetch(`/api/admin/videos/${video.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignee }),
    });
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    await fetch(`/api/admin/videos/${video.id}/tasks/${taskId}`, { method: "DELETE" });
  };

  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <a
          href={`/admin/videos/${kind}`}
          className="text-sm text-wood-light/60 hover:text-wood no-underline mr-auto"
        >
          &larr; Back to {kind === "longform" ? "Long-form" : "Shorts"}
        </a>
        <button
          onClick={save}
          disabled={saving}
          className="bg-wood text-cream rounded-xl py-2 px-5 text-sm font-semibold disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-red-700/70 hover:text-red-700 px-3 py-2"
        >
          Hide
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            />
          </Field>
          <Field label="Stage">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </Field>
          {kind === "longform" && (
            <>
              <Field label="Sponsor">
                <input
                  type="text"
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                />
              </Field>
              <Field label="Target publish date">
                <input
                  type="date"
                  value={targetPublishDate}
                  onChange={(e) => setTargetPublishDate(e.target.value)}
                  className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                />
              </Field>
            </>
          )}
          {stage === "published" && (
            <div className="md:col-span-2">
              <Field label="YouTube ID">
                <input
                  type="text"
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  placeholder="e.g. jOXvrHeSLzs"
                  className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
            Open tasks ({openTasks.length})
          </div>
          <div className="space-y-1.5 mb-3">
            {openTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={(done) => toggleTask(task.id, done)}
                onAssign={(assignee) => setTaskAssignee(task.id, assignee)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
            {openTasks.length === 0 && (
              <div className="text-xs text-wood-light/40 italic">No open tasks.</div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }}
              placeholder="Add task..."
              className="flex-1 bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value as "jesper" | "bearatski" | "")}
              className="bg-white/70 border border-wood/[0.12] rounded-xl px-2 py-2 text-wood text-xs"
            >
              <option value="">Unassigned</option>
              <option value="jesper">Jesper</option>
              <option value="bearatski">BearAtSki</option>
            </select>
            <button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="bg-forest/10 border border-forest/25 text-forest rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-30"
            >
              Add
            </button>
          </div>

          {doneTasks.length > 0 && (
            <details className="mt-6">
              <summary className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase cursor-pointer">
                Completed ({doneTasks.length})
              </summary>
              <div className="space-y-1.5 mt-3">
                {doneTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={(done) => toggleTask(task.id, done)}
                    onAssign={(assignee) => setTaskAssignee(task.id, assignee)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Script notes */}
        <Field label="Script notes">
          <textarea
            value={scriptNotes}
            onChange={(e) => setScriptNotes(e.target.value)}
            rows={8}
            placeholder="Outline, beats, voiceover notes..."
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm font-mono"
          />
        </Field>

        {/* Sponsor contact (longform only) */}
        {kind === "longform" && (
          <Field label="Sponsor contact (free text)">
            <input
              type="text"
              value={sponsorContact}
              onChange={(e) => setSponsorContact(e.target.value)}
              placeholder="e.g. Pia at Festool DK, pia@festool.dk"
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            />
          </Field>
        )}

        {/* Running notes */}
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Ongoing log — what happened, what you figured out, what still bothers you."
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </Field>

        {/* Linked tools (longform only) */}
        {kind === "longform" && initialTools.length > 0 && (
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
              Linked tools
            </div>
            <div className="flex flex-wrap gap-2">
              {initialTools.map((t) => (
                <a
                  key={t.id}
                  href={`/admin/tools/${t.id}`}
                  className="bg-white/50 border border-wood/[0.08] rounded-xl px-3 py-1.5 text-xs text-wood no-underline hover:border-wood/[0.15]"
                >
                  {t.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onAssign,
  onDelete,
}: {
  task: VideoTask;
  onToggle: (done: boolean) => void;
  onAssign: (assignee: string | null) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group">
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => onToggle(e.target.checked)}
        className="accent-forest"
      />
      <div className={"flex-1 text-sm " + (task.done ? "text-wood-light/40 line-through" : "text-wood")}>
        {task.title}
      </div>
      <select
        value={task.assignee ?? ""}
        onChange={(e) => onAssign(e.target.value || null)}
        className="bg-white/70 border border-wood/[0.12] rounded-lg px-2 py-1 text-[11px] text-wood-light/70"
      >
        <option value="">Unassigned</option>
        <option value="jesper">Jesper</option>
        <option value="bearatski">BearAtSki</option>
      </select>
      <button
        onClick={onDelete}
        className="text-xs text-wood-light/30 hover:text-red-700 opacity-0 group-hover:opacity-100 px-1"
      >
        &times;
      </button>
    </div>
  );
}
