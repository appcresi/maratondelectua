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
      { id: "personaje-3", title: "Gato de Cheshire", description: "Alicia en el País de las Maravillas", src: "/fotos/personaje3.jpeg" },
      { id: "personaje-4", title: "Reina Blanca", description: "Alicia en el País de las Maravillas", src: "/fotos/personaje4.jpeg" },
      { id: "personaje-5", title: "Conejo Blanco", description: "Alicia en el País de las Maravillas", src: "/fotos/personaje5.jpeg" },
      { id: "personaje-6", title: "Personaje 6", src: "/fotos/personaje6.jpeg" },
      { id: "personaje-7", title: "Ryder", description: "Paw Patrol", src: "/fotos/personaje7.jpeg" },
      { id: "personaje-8", title: "Chase", description: "Paw Patrol", src: "/fotos/personaje8.jpeg" },
      { id: "personaje-9", title: "Personaje 9", description: "Paw Patrol", src: "/fotos/personaje9.jpeg" },
      { id: "personaje-10", title: "Personaje 10", src: "/fotos/personaje10.jpeg" },
      { id: "personaje-11", title: "Personaje 11", src: "/fotos/personaje11.jpeg" },
      { id: "personaje-12", title: "Personaje 12", src: "/fotos/personaje12.jpeg" },
      { id: "personaje-13", title: "Personaje 13", src: "/fotos/personaje13.jpeg" },
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
      { id: "stand-3", title: "Paw Patrol", src: "/fotos/stand3.jpeg" },
      { id: "stand-4", title: "Son como niños", src: "/fotos/stand4.jpeg" },
      { id: "stand-5", title: "Superheroínas", src: "/fotos/stand5.jpeg" },
      { id: "stand-6", title: "Alicia en el País de las Maravillas", src: "/fotos/stand6.jpeg" },
      { id: "stand-7", title: "Tortugas Ninja", src: "/fotos/stan7.jpeg" },
    ],
  },
];
