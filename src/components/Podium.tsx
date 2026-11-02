import Image from "next/image";
import type { Candidate } from "@/data/candidates";

type Props = {
  /** Participantes ya ordenados de más a menos votado. */
  ranked: Candidate[];
  counts: Record<string, number>;
};

const MEDALS = ["🥇", "🥈", "🥉"];

// Estilo de cada puesto: color del marco, alto del escalón y retraso de la animación
// (sube primero el 3°, después el 2° y al final el 1°).
const PLACE_STYLE = [
  { ring: "ring-[#d4af37]", step: "h-40 sm:h-48", block: "from-[#f3d36b] to-[#b8901f]", photo: "h-24 w-24 sm:h-32 sm:w-32", delay: 900 },
  { ring: "ring-[#b8b8b8]", step: "h-28 sm:h-36", block: "from-[#e4e4e4] to-[#9a9a9a]", photo: "h-20 w-20 sm:h-28 sm:w-28", delay: 500 },
  { ring: "ring-[#cd7f32]", step: "h-20 sm:h-24", block: "from-[#e3a46b] to-[#a0602a]", photo: "h-20 w-20 sm:h-24 sm:w-24", delay: 100 },
];

export default function Podium({ ranked, counts }: Props) {
  // Solo entran al podio los que tienen al menos un voto.
  const top = ranked.filter((c) => (counts[c.id] ?? 0) > 0).slice(0, 3);
  if (top.length === 0) return null;

  // Puesto real según los votos: los empatados comparten el mismo puesto.
  const placeOf = (c: Candidate) => {
    const votes = counts[c.id] ?? 0;
    return 1 + ranked.filter((o) => (counts[o.id] ?? 0) > votes).length;
  };

  // Orden visual del podio: 2°, 1°, 3°.
  const slots = [top[1], top[0], top[2]];

  return (
    <section aria-label="Podio" className="mb-12 animate-fade-in">
      <h2 className="mb-2 text-center font-display text-3xl font-bold">🏆 Podio</h2>
      <p className="mb-8 text-center italic text-muted">¡Felicitaciones a los ganadores!</p>

      <ol className="mx-auto flex max-w-2xl items-end justify-center gap-2 sm:gap-4">
        {slots.map((c, slot) => {
          // Lugar del escalón (0 = 1°, 1 = 2°, 2 = 3°) según su posición visual.
          const step = slot === 1 ? 0 : slot === 0 ? 1 : 2;
          const style = PLACE_STYLE[step];

          if (!c) return <li key={slot} className="flex-1" aria-hidden="true" />;

          const place = placeOf(c);
          const votes = counts[c.id] ?? 0;
          const tied = top.some((o) => o.id !== c.id && placeOf(o) === place);

          return (
            <li key={c.id} className="flex min-w-0 flex-1 flex-col items-center">
              {/* Foto y datos: caen sobre el escalón cuando termina de subir */}
              <div
                className="relative mb-3 flex animate-drop flex-col items-center text-center"
                style={{ animationDelay: `${style.delay + 400}ms` }}
              >
                {place === 1 && (
                  <span aria-hidden="true" className="absolute -top-7 z-10 animate-bob text-3xl sm:text-4xl">
                    👑
                  </span>
                )}
                <div className={`relative overflow-hidden rounded-full ring-4 ${style.ring} shadow-lg ${style.photo}`}>
                  <Image src={c.src} alt={c.title} fill sizes="128px" className="object-cover" />
                </div>
                <span aria-hidden="true" className="-mt-4 text-3xl drop-shadow">
                  {MEDALS[place - 1] ?? "🏅"}
                </span>
                <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-tight sm:text-base">
                  {c.title}
                </h3>
                <p className="text-xs text-muted sm:text-sm">
                  {votes} {votes === 1 ? "voto" : "votos"}
                  {tied && " · empate"}
                </p>
              </div>

              {/* Escalón */}
              <div
                className={`flex w-full origin-bottom animate-rise items-start justify-center rounded-t-md border border-b-0 border-black/10 bg-gradient-to-b pt-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.5)] ${style.block} ${style.step}`}
                style={{ animationDelay: `${style.delay}ms` }}
              >
                <span className="font-display text-4xl font-bold text-white/90 drop-shadow sm:text-5xl">
                  {place}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {/* Base del podio */}
      <div className="mx-auto h-3 max-w-2xl rounded-b-md bg-ink/80 shadow-md" />
    </section>
  );
}
