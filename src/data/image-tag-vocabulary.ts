export const IMAGE_TAG_VOCABULARY = {
  material: {
    label: "Material",
    multi: false,
    values: [
      "plywood",
      "pallet-wood",
      "oak",
      "walnut",
      "pine",
      "birch",
      "mixed-wood",
    ] as const,
  },
  sponsors: {
    label: "Sponsors",
    multi: true,
    values: [
      "carhartt",
      "rubio-monocoat",
      "festool",
      "bambu-lab",
      "xtool",
      "wisa-plywood",
    ] as const,
  },
  toolCategories: {
    label: "Tool category",
    multi: true,
    values: [
      "hand-tools",
      "power-tools",
      "cnc",
      "laser",
      "3d-print",
      "measuring",
      "clamping",
    ] as const,
  },
  shotType: {
    label: "Shot type",
    multi: false,
    values: [
      "hero",
      "detail",
      "process",
      "b-roll",
      "portrait",
    ] as const,
  },
  who: {
    label: "Who",
    multi: true,
    values: [
      "jesper",
      "wife",
      "hands-only",
    ] as const,
  },
  setting: {
    label: "Setting",
    multi: false,
    values: [
      "workshop",
      "outdoors",
      "studio",
    ] as const,
  },
} as const;

export type VocabularyField = keyof typeof IMAGE_TAG_VOCABULARY;

export const VOCABULARY_FIELDS: VocabularyField[] = [
  "material",
  "sponsors",
  "toolCategories",
  "shotType",
  "who",
  "setting",
];

export function isValidTagValue(field: VocabularyField, value: string): boolean {
  return (IMAGE_TAG_VOCABULARY[field].values as readonly string[]).includes(value);
}
