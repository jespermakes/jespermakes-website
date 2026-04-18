export type RubioEventType =
  | "session_start"
  | "product_recommended"
  | "species_selected"
  | "color_selected"
  | "summary_viewed"
  | "guide_printed";

export interface RubioTrackData {
  eventType: RubioEventType;
  product?: string | null;
  species?: string | null;
  colorId?: string | null;
  colorLabel?: string | null;
  surfaceArea?: number | null;
  unit?: string | null;
}

export function trackRubioGuide(data: RubioTrackData): void {
  try {
    fetch("/api/rubio-guide/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch {
    // Swallow any synchronous errors
  }
}
