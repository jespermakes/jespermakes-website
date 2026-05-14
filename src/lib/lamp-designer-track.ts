type EventType =
  | "page_view"
  | "step_completed"
  | "design_exported"
  | "design_published";

interface TrackParams {
  eventType: EventType;
  designId?: string;
  templateId?: string;
  metadata?: Record<string, unknown>;
}

export function trackLampDesigner(params: TrackParams): void {
  if (typeof window === "undefined") return;
  fetch("/api/lamp-designer/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch(() => {
    // fire-and-forget; tracking failures must never break the UI
  });
}
