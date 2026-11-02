// Menciones especiales: se muestran como un misterio ("?") hasta la fecha de
// revelación y después aparecen la foto y el nombre de cada una.
export const MENTIONS_REVEAL_AT = new Date("2026-11-03T13:00:00-03:00");

export type Mention = {
  /** "Personaje" o "Stand": se muestra arriba de cada lugar. */
  label: string;
  categoryId: "disfraces" | "stands";
  /** ID del participante en src/data/candidates.ts (null = todavía sin definir). */
  candidateId: string | null;
};

export type MentionGroup = {
  /** Título del grupo (por ejemplo, el curso). */
  title: string;
  mentions: Mention[];
};

// Un grupo por curso, cada uno con 2 personajes y 1 stand.
// Para cargar una mención, reemplaza `null` por el ID del participante
// (por ejemplo "personaje-24" o "stand-21").
export const mentionGroups: MentionGroup[] = [
  {
    title: "1° año",
    mentions: [
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Stand", categoryId: "stands", candidateId: null },
    ],
  },
  {
    title: "2° año",
    mentions: [
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Stand", categoryId: "stands", candidateId: null },
    ],
  },
  {
    title: "3° año",
    mentions: [
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Stand", categoryId: "stands", candidateId: null },
    ],
  },
  {
    title: "4° año",
    mentions: [
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Stand", categoryId: "stands", candidateId: null },
    ],
  },
  {
    title: "5° año",
    mentions: [
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Personaje", categoryId: "disfraces", candidateId: null },
      { label: "Stand", categoryId: "stands", candidateId: null },
    ],
  },
];
