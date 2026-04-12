type EventType = "page_view" | "svg_download" | "guide_open";

interface TrackParams {
  eventType: EventType;
  thickness?: number; // in mm
}

export function trackConeLamp(params: TrackParams): void {
  if (typeof window === "undefined") return;
  fetch("/api/cone-lamp/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch(() => {
    // fire-and-forget; tracking failures must never break the UI
  });
}
