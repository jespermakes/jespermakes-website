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
  subjects: {
    label: "Subject",
    multi: true,
    values: [
      "jig",
      "planter",
      "box-joint",
      "cabinet",
      "shelf",
      "tool-closeup",
      "workshop",
      "finished-piece",
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
  "subjects",
  "shotType",
  "who",
  "setting",
];

export function isValidTagValue(field: VocabularyField, value: string): boolean {
  return (IMAGE_TAG_VOCABULARY[field].values as readonly string[]).includes(value);
}
