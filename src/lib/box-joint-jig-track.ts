type EventType = "page_view" | "svg_download" | "pdf_download" | "guide_view";

interface TrackParams {
  eventType: EventType;
  unit?: "mm" | "in";
  thickness?: number;
  fingers?: number;
  hasCustomTitle?: boolean;
  hasCustomLabel?: boolean;
}

export function trackBoxJointJig(params: TrackParams): void {
  if (typeof window === "undefined") return;
  fetch("/api/box-joint-jig/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch(() => {});
}
