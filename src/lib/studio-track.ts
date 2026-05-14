/**
 * Fire-and-forget tracking for the Studio. Mirrors the box-joint-jig and
 * cone-lamp tracking patterns: client → POST /api/studio/track → DB
 * insert into studio_events. Failures are swallowed.
 */

export type StudioEventType =
  | "page_view"
  | "design_created"
  | "design_saved"
  | "svg_export"
  | "shaper_export"
  | "laser_export"
  | "cnc_export"
  | "marketplace_publish"
  | "marketplace_download"
  | "marketplace_like"
  | "marketplace_comment";

export interface TrackInput {
  eventType: StudioEventType;
  designId?: string | null;
  metadata?: Record<string, unknown>;
}

export function trackStudio(event: TrackInput): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/studio/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      /* noop */
    });
  } catch {
    /* noop */
  }
}
