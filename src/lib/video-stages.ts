export const LONGFORM_STAGES = [
  "idea",
  "scripting",
  "recording_video",
  "recording_voiceover",
  "with_editor",
  "review",
  "published",
] as const;

export const SHORTS_STAGES = [
  "idea",
  "scripted",
  "recorded",
  "published",
] as const;

export type LongformStage = (typeof LONGFORM_STAGES)[number];
export type ShortsStage = (typeof SHORTS_STAGES)[number];
export type VideoKind = "longform" | "shorts";

export const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  scripting: "Scripting",
  recording_video: "Recording video",
  recording_voiceover: "Recording voiceover",
  with_editor: "With editor",
  review: "Review",
  scripted: "Scripted",
  recorded: "Recorded",
  published: "Published",
};

// Stages considered "actively in production" — used for the home-page block
// and for any "what am I working on right now" queries
export const LONGFORM_ACTIVE_STAGES: LongformStage[] = [
  "scripting",
  "recording_video",
  "recording_voiceover",
  "with_editor",
  "review",
];

export const SHORTS_ACTIVE_STAGES: ShortsStage[] = ["scripted", "recorded"];

export function validStagesFor(kind: VideoKind): readonly string[] {
  return kind === "longform" ? LONGFORM_STAGES : SHORTS_STAGES;
}

export function isValidStage(kind: VideoKind, stage: string): boolean {
  return validStagesFor(kind).includes(stage as LongformStage | ShortsStage);
}
