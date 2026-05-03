"use client";

import { useEffect, useRef, useState } from "react";
import {
  isGeneratorTool,
  runGenerator,
  type GeneratorResult,
} from "@/lib/studio/generators";
import type { MaterialSettings, Shape } from "@/lib/studio/types";

export interface AIHistoryEntry {
  id: string;
  prompt: string;
  message: string;
  toolName: string;
  shapeCount: number;
  modificationsCount: number;
}

interface AIPanelProps {
  open: boolean;
  isLoggedIn: boolean;
  existingShapes: Shape[];
  material: MaterialSettings;
  onClose: () => void;
  /**
   * Receives the result of running the AI's chosen generator. The caller
   * is responsible for dispatching shapes into the document.
   */
  onResult: (result: {
    toolName: string;
    generated: GeneratorResult;
    message: string;
    promptText: string;
  }) => void;
}

const SECTION_LABEL =
  "text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40";

export function AIPanel({
  open,
  isLoggedIn,
  existingShapes,
  material,
  onClose,
  onResult,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AIHistoryEntry[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const generate = async () => {
    const text = prompt.trim();
    if (!text || busy) return;
    if (!isLoggedIn) {
      setError("Sign in to use the AI assistant.");
      return;
    }
    setBusy(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const conversationHistory = history.slice(-3).flatMap<{
        role: "user" | "assistant";
        content: string;
      }>((h) => [
        { role: "user", content: h.prompt },
        { role: "assistant", content: h.message },
      ]);
      const res = await fetch("/api/studio/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          prompt: text,
          existingShapes: existingShapes.slice(0, 60),
          material,
          conversationHistory,
        }),
      });
      const json = (await res.json()) as {
        tool?: string;
        params?: Record<string, unknown>;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "AI request failed.");
        return;
      }
      const message = json.message ?? "";
      const toolName = json.tool ?? "clarify";
      if (toolName === "clarify") {
        // Just push the message into history; nothing to dispatch.
        setHistory((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            prompt: text,
            message,
            toolName,
            shapeCount: 0,
            modificationsCount: 0,
          },
        ]);
        setPrompt("");
        return;
      }
      if (!isGeneratorTool(toolName)) {
        setError(`Unknown tool: ${toolName}`);
        return;
      }
      const generated = runGenerator(toolName, json.params ?? {}, {
        shapes: existingShapes,
        materialThickness: material.thickness,
        unit: "mm",
      });
      if (!generated) {
        setError("Generator failed to run.");
        return;
      }
      onResult({
        toolName,
        generated,
        message,
        promptText: text,
      });
      setHistory((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          prompt: text,
          message,
          toolName,
          shapeCount: generated.shapesToAdd?.length ?? 0,
          modificationsCount:
            (generated.shapesToRemove?.length ?? 0) +
            (generated.shapesToUpdate?.length ?? 0),
        },
      ]);
      setPrompt("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // user cancelled
      }
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  };

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-wood/[0.08] bg-white">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <span className={SECTION_LABEL}>✦ Design Assistant</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close assistant"
          className="text-wood-light/60 hover:text-wood"
        >
          ×
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        <p className="text-[12px] leading-snug text-wood-light">
          Describe what you want to build. The assistant uses your current
          material ({material.thickness} mm {material.name.toLowerCase()})
          when sizing joints.
        </p>
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void generate();
              }
            }}
            rows={4}
            placeholder="e.g. I need a box with finger joints, 200×150×100 mm, from 6 mm plywood"
            className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
            disabled={busy}
          />
          {busy ? (
            <div className="flex items-center justify-between rounded-md bg-cream/60 px-3 py-2 text-[12px] text-wood-light">
              <span>✦ Thinking… this takes a few seconds.</span>
              <button
                type="button"
                onClick={cancel}
                className="rounded-md border border-wood/[0.12] bg-white px-2 py-0.5 text-[11px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void generate()}
              disabled={!prompt.trim()}
              className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream hover:bg-wood-light disabled:opacity-50"
            >
              Generate ✦
            </button>
          )}
          {error ? (
            <p className="rounded-md bg-red-50/70 px-3 py-2 text-[12px] text-red-700">
              {error}
            </p>
          ) : null}
          {!isLoggedIn ? (
            <p className="text-[11px] text-wood-light/60">
              Sign in to use the AI assistant — designs cost a small amount
              per generation.
            </p>
          ) : null}
        </div>
        {history.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-wood/[0.06] pt-3">
            <span className={SECTION_LABEL}>Previous</span>
            <ul className="flex flex-col gap-3 text-[12px]">
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <li
                    key={h.id}
                    className="rounded-md border border-wood/[0.06] bg-cream/50 px-3 py-2"
                  >
                    <p className="text-wood">“{h.prompt}”</p>
                    <p className="mt-1 text-wood-light">{h.message}</p>
                    <p className="mt-1 text-[10px] text-wood-light/60">
                      {h.toolName !== "clarify" ? (
                        <>
                          {h.toolName} · {h.shapeCount} shape
                          {h.shapeCount === 1 ? "" : "s"}
                          {h.modificationsCount > 0
                            ? ` · ${h.modificationsCount} changed`
                            : ""}
                        </>
                      ) : (
                        "needs clarification"
                      )}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

interface FloatingButtonProps {
  onClick: () => void;
}

export function AIFloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Open AI design assistant (/)"
      aria-label="Open AI design assistant"
      className="absolute bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-wood px-4 py-2 text-sm font-medium text-cream shadow-lg transition-colors hover:bg-wood-light"
    >
      <span aria-hidden>✦</span>
      Ask AI
    </button>
  );
}
