"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  AlreadyVotedError,
  castVote,
  subscribeToMyVote,
  subscribeToResults,
} from "@/lib/votes";
import type { Category } from "@/data/candidates";
import { VOTING_OPENS_AT, formatTime, type VotingStatus } from "@/data/schedule";

type Props = {
  category: Category;
  user: User | null;
  authReady: boolean;
  /** null mientras aún no se conoce la hora en el navegador. */
  status: VotingStatus | null;
  onLogin: () => void;
};

export default function CategoryBoard({ category, user, authReady, status, onLogin }: Props) {
  // Se guarda junto al uid para no mostrar el voto de una sesión anterior.
  const [vote, setVote] = useState<{ uid: string; candidateId: string | null } | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToResults(category.id, setCounts), [category.id]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    return subscribeToMyVote(category.id, uid, (candidateId) => setVote({ uid, candidateId }));
  }, [category.id, user]);

  const myVote = user && vote?.uid === user.uid ? vote.candidateId : null;
  const total = category.candidates.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);
  const hasVoted = myVote !== null;
  const isOpen = status === "open";
  // Al cerrar la votación todos ven los resultados, hayan votado o no.
  const showResults = hasVoted || status === "closed";

  async function handleVote(candidateId: string) {
    if (!user || hasVoted || pending || !isOpen) return;
    setPending(candidateId);
    setError(null);
    try {
      await castVote(category.id, user.uid, candidateId);
    } catch (e) {
      setError(e instanceof AlreadyVotedError ? e.message : "No se pudo registrar el voto.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section>
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
        <p className="mb-6 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.candidates.map((c) => {
          const votes = counts[c.id] ?? 0;
          const percent = total ? Math.round((votes / total) * 100) : 0;
          const isMine = myVote === c.id;

          return (
            <li
              key={c.id}
              className={`relative rounded-sm border bg-card p-3 shadow-[4px_4px_0_0_var(--line)] transition ${
                isMine ? "border-accent ring-2 ring-accent" : "border-line"
              }`}
            >
              {isMine && (
                // Señalador de libro sobre la tarjeta votada
                <span
                  className="absolute -top-1 right-5 z-10 bg-accent px-2 pb-4 pt-2 text-xs font-bold uppercase tracking-wider text-accent-ink [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]"
                >
                  Tu voto
                </span>
              )}

              <div className="relative aspect-[3/4] w-full overflow-hidden border border-line">
                <Image
                  src={c.src}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover sepia-[.15]"
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
                      <span className="font-semibold">{percent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => (user ? handleVote(c.id) : onLogin())}
                    disabled={!authReady || !isOpen || pending !== null}
                    className="rounded-md bg-accent px-4 py-2 font-display font-semibold text-accent-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
