"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import {
  AlreadyVotedError,
  castVote,
  subscribeToMyVote,
  subscribeToResults,
} from "@/lib/votes";
import type { Candidate } from "@/data/candidates";

export default function VotingBoard({ candidates }: { candidates: Candidate[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) setMyVote(null);
    });
  }, []);

  useEffect(() => subscribeToResults(setCounts), []);

  useEffect(() => {
    if (!user) return;
    return subscribeToMyVote(user.uid, setMyVote);
  }, [user]);

  const total = candidates.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);
  const hasVoted = myVote !== null;

  async function handleLogin() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      // Cerrar la ventana emergente no es un error que haya que mostrar.
      if ((e as { code?: string }).code !== "auth/popup-closed-by-user") {
        setError("No se pudo iniciar sesión con Google.");
      }
    }
  }

  async function handleVote(imageId: string) {
    if (!user || hasVoted || pending) return;
    setPending(imageId);
    setError(null);
    try {
      await castVote(user.uid, imageId);
    } catch (e) {
      setError(e instanceof AlreadyVotedError ? e.message : "No se pudo registrar el voto.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {!authReady ? (
          <span className="text-zinc-500">Cargando...</span>
        ) : user ? (
          <>
            <span className="flex items-center gap-2">
              {user.photoURL && (
                <Image
                  src={user.photoURL}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span>
                Hola, <strong>{user.displayName ?? user.email}</strong>
              </span>
            </span>
            <button
              onClick={() => signOut(auth)}
              className="text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-white"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <span className="text-zinc-600 dark:text-zinc-400">Inicia sesión para votar.</span>
            <button
              onClick={handleLogin}
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Iniciar sesión con Google
            </button>
          </>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          {hasVoted ? "¡Gracias por votar! Estos son los resultados en vivo." : "Elige tu imagen favorita. Solo puedes votar una vez."}
        </span>
        <span className="font-medium">Total de votos: {total}</span>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((c) => {
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
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{c.title}</h2>
                  {isMine && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Tu voto
                    </span>
                  )}
                </div>

                {hasVoted ? (
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
                    onClick={() => (user ? handleVote(c.id) : handleLogin())}
                    disabled={!authReady || pending !== null}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {pending === c.id ? "Votando..." : user ? "Votar" : "Inicia sesión para votar"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
