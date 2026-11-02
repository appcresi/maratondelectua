"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { User } from "firebase/auth";
import {
  AlreadyVotedError,
  castVote,
  subscribeToMyVote,
  subscribeToResults,
} from "@/lib/votes";
import type { Category } from "@/data/candidates";
import { VOTING_OPENS_AT, formatTime, type VotingStatus } from "@/data/schedule";
import Podium from "./Podium";

type Props = {
  category: Category;
  user: User | null;
  authReady: boolean;
  /** null mientras aún no se conoce la hora en el navegador. */
  status: VotingStatus | null;
  onLogin: () => void;
};

// Chispas que salen de la tarjeta al votar: emoji y dirección de cada una.
const BURST = [
  { emoji: "📚", dx: -90, dy: -110, rot: -30 },
  { emoji: "✨", dx: 0, dy: -140, rot: 20 },
  { emoji: "⭐", dx: 90, dy: -110, rot: 40 },
  { emoji: "📖", dx: -120, dy: -30, rot: -15 },
  { emoji: "✨", dx: 120, dy: -30, rot: 15 },
  { emoji: "🪶", dx: -60, dy: -170, rot: -45 },
  { emoji: "⭐", dx: 60, dy: -170, rot: 30 },
];

// Con "?podio" en el link se ve el podio antes del cierre (para revisarlo).
function usePodiumPreview() {
  return useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).has("podio"),
    () => false,
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function CategoryBoard({ category, user, authReady, status, onLogin }: Props) {
  // Se guarda junto al uid para no mostrar el voto de una sesión anterior.
  const [vote, setVote] = useState<{ uid: string; candidateId: string | null } | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<string | null>(null);

  useEffect(() => subscribeToResults(category.id, setCounts), [category.id]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    return subscribeToMyVote(category.id, uid, (candidateId) => setVote({ uid, candidateId }));
  }, [category.id, user]);

  const myVote = user && vote?.uid === user.uid ? vote.candidateId : null;
  const total = category.candidates.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);
  // De más votado a menos votado; los empates mantienen el orden de la lista.
  const ranked = [...category.candidates].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  const hasVoted = myVote !== null;
  const isOpen = status === "open";
  // Al cerrar la votación todos ven los resultados, hayan votado o no.
  const showResults = hasVoted || status === "closed";
  const podiumPreview = usePodiumPreview();
  const showPodium = status === "closed" || podiumPreview;

  // Animación FLIP: cuando cambia el ranking, cada tarjeta se desliza desde
  // su posición anterior a la nueva en lugar de saltar.
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const prevPositions = useRef(new Map<string, { x: number; y: number }>());
  useLayoutEffect(() => {
    const animate = !prefersReducedMotion();
    itemRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const next = { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
      const prev = prevPositions.current.get(id);
      if (animate && prev && (prev.x !== next.x || prev.y !== next.y)) {
        el.animate(
          [{ transform: `translate(${prev.x - next.x}px, ${prev.y - next.y}px)` }, { transform: "none" }],
          { duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      }
      prevPositions.current.set(id, next);
    });
  });

  async function handleVote(candidateId: string) {
    if (!user || hasVoted || pending || !isOpen) return;
    setPending(candidateId);
    setError(null);
    try {
      await castVote(category.id, user.uid, candidateId);
      setCelebrate(candidateId);
      setTimeout(() => setCelebrate(null), 1300);
    } catch (e) {
      setError(e instanceof AlreadyVotedError ? e.message : "No se pudo registrar el voto.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span className="italic">
          {status === "closed"
            ? "Resultados finales."
            : hasVoted
              ? "¡Gracias por votar! Estos son los resultados en vivo."
              : `${category.description} Solo puedes votar una vez.`}
        </span>
        <span className="font-semibold">Total de votos: {total}</span>
      </div>

      {error && (
        <p className="mb-6 animate-fade-in rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      {showPodium && <Podium ranked={ranked} counts={counts} />}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((c) => {
          const votes = counts[c.id] ?? 0;
          const percent = total ? Math.round((votes / total) * 100) : 0;
          const isMine = myVote === c.id;
          // El retraso de entrada usa la posición original (fija) para que no
          // cambie cuando la tarjeta se reordena.
          const entranceDelay = Math.min(category.candidates.indexOf(c), 8) * 70;

          return (
            <li
              key={c.id}
              ref={(el) => {
                if (el) itemRefs.current.set(c.id, el);
                else itemRefs.current.delete(c.id);
              }}
              className="relative"
            >
              <div
                style={{ animationDelay: `${entranceDelay}ms` }}
                className={`group relative h-full animate-fade-up rounded-sm border bg-card p-3 shadow-[4px_4px_0_0_var(--line)] transition duration-300 hover:-translate-y-1 hover:shadow-[6px_10px_0_0_var(--line)] ${
                  isMine ? "border-accent ring-2 ring-accent" : "border-line"
                }`}
              >
                {isMine && (
                  // Señalador de libro sobre la tarjeta votada
                  <span className="absolute -top-1 right-5 z-10 animate-ribbon bg-accent px-2 pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-accent-ink [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]">
                    Tu voto
                  </span>
                )}

                {celebrate === c.id && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
                    {BURST.map((p, i) => (
                      <span
                        key={i}
                        className="absolute left-1/2 top-2/3 animate-burst text-2xl"
                        style={
                          {
                            "--dx": `${p.dx}px`,
                            "--dy": `${p.dy}px`,
                            "--rot": `${p.rot}deg`,
                            animationDelay: `${i * 40}ms`,
                          } as CSSProperties
                        }
                      >
                        {p.emoji}
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative aspect-[3/4] w-full overflow-hidden border border-line">
                  <Image
                    src={c.src}
                    alt={c.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover sepia-[.15] transition duration-700 group-hover:scale-105 group-hover:sepia-0"
                  />
                </div>

                <div className="flex flex-col gap-3 px-1 pb-1 pt-4">
                  <div className="text-center">
                    <h3 className="font-display text-xl font-bold leading-tight">{c.title}</h3>
                    {c.description && <p className="mt-1 text-sm italic text-muted">{c.description}</p>}
                  </div>

                  {showResults ? (
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{votes} votos</span>
                        <span key={percent} className="inline-block animate-pop font-semibold">
                          {percent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full origin-left animate-grow rounded-full bg-accent transition-[width] duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => (user ? handleVote(c.id) : onLogin())}
                      disabled={!authReady || !isOpen || pending !== null}
                      className="rounded-md bg-accent px-4 py-2 font-display font-semibold text-accent-ink transition hover:scale-[1.03] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {status === "before"
                        ? `Abre a las ${formatTime(VOTING_OPENS_AT)}`
                        : pending === c.id
                          ? "Votando..."
                          : user
                            ? "Votar"
                            : "Inicia sesión para votar"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
