export type Candidate = {
  /** Identificador único. Se usa como ID del documento en Firestore. */
  id: string;
  title: string;
  /** Ruta en /public (ej. "/fotos/1.jpg") o URL remota permitida en next.config.ts */
  src: string;
};

// Edita esta lista con las imágenes de tu votación.
export const candidates: Candidate[] = [
  { id: "foto-1", title: "Foto 1", src: "https://picsum.photos/seed/maraton1/800/600" },
  { id: "foto-2", title: "Foto 2", src: "https://picsum.photos/seed/maraton2/800/600" },
  { id: "foto-3", title: "Foto 3", src: "https://picsum.photos/seed/maraton3/800/600" },
  { id: "foto-4", title: "Foto 4", src: "https://picsum.photos/seed/maraton4/800/600" },
  { id: "foto-5", title: "Foto 5", src: "https://picsum.photos/seed/maraton5/800/600" },
  { id: "foto-6", title: "Foto 6", src: "https://picsum.photos/seed/maraton6/800/600" },
];
