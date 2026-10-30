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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          {status === "closed"
            ? "Resultados finales."
            : hasVoted
              ? "¡Gracias por votar! Estos son los resultados en vivo."
              : `${category.description} Solo puedes votar una vez.`}
        </span>
        <span className="font-medium">Total de votos: {total}</span>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
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
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-zinc-900 ${
                isMine ? "border-emerald-500 ring-2 ring-emerald-500" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={c.src}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    {c.description && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{c.description}</p>
                    )}
                  </div>
                  {isMine && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Tu voto
                    </span>
                  )}
                </div>

                {showResults ? (
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{votes} votos</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => (user ? handleVote(c.id) : onLogin())}
                    disabled={!authReady || !isOpen || pending !== null}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
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
