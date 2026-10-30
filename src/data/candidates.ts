export type Candidate = {
  /** Identificador único dentro de la categoría. Se usa como ID del documento en Firestore. */
  id: string;
  title: string;
  /** Texto opcional debajo del título (ej. libro del personaje o curso del stand). */
  description?: string;
  /** Ruta en /public (ej. "/fotos/1.jpg") o URL remota permitida en next.config.ts */
  src: string;
};

export type Category = {
  /** Identificador de la categoría (solo letras, números y guiones). */
  id: string;
  name: string;
  description: string;
  candidates: Candidate[];
};

// Edita estas listas con las fotos reales del maratón.
export const categories: Category[] = [
  {
    id: "disfraces",
    name: "Disfraces",
    description: "Vota por el personaje mejor caracterizado.",
    candidates: [
      { id: "personaje-1", title: "Personaje 1", description: "Libro: ...", src: "https://picsum.photos/seed/disfraz1/800/600" },
      { id: "personaje-2", title: "Personaje 2", description: "Libro: ...", src: "https://picsum.photos/seed/disfraz2/800/600" },
      { id: "personaje-3", title: "Personaje 3", description: "Libro: ...", src: "https://picsum.photos/seed/disfraz3/800/600" },
      { id: "personaje-4", title: "Personaje 4", description: "Libro: ...", src: "https://picsum.photos/seed/disfraz4/800/600" },
    ],
  },
  {
    id: "stands",
    name: "Stands",
    description: "Vota por el stand más creativo.",
    candidates: [
      { id: "stand-1", title: "Stand 1", description: "Curso: ...", src: "https://picsum.photos/seed/stand1/800/600" },
      { id: "stand-2", title: "Stand 2", description: "Curso: ...", src: "https://picsum.photos/seed/stand2/800/600" },
      { id: "stand-3", title: "Stand 3", description: "Curso: ...", src: "https://picsum.photos/seed/stand3/800/600" },
      { id: "stand-4", title: "Stand 4", description: "Curso: ...", src: "https://picsum.photos/seed/stand4/800/600" },
    ],
  },
];
