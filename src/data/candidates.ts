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
  /** Emoji que se muestra en la pestaña. */
  icon: string;
  description: string;
  candidates: Candidate[];
};

// Edita estas listas con las fotos reales del maratón.
export const categories: Category[] = [
  {
    id: "disfraces",
    name: "Disfraces",
    icon: "🎭",
    description: "Vota por el personaje mejor caracterizado.",
    candidates: [
      { id: "personaje-1", title: "Personaje 1", src: "/fotos/personaje1.jpeg" },
      { id: "personaje-2", title: "Personaje 2", src: "/fotos/personaje2.jpeg" },
    ],
  },
  {
    id: "stands",
    name: "Stands",
    icon: "🎪",
    description: "Vota por el stand más creativo.",
    candidates: [
      { id: "stand-1", title: "South Park", src: "/fotos/stand1.jpeg" },
      { id: "stand-2", title: "Harry Potter", src: "/fotos/stand2.jpeg" },
    ],
  },
];
