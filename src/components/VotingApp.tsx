"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import type { Category } from "@/data/candidates";
import {
  VOTING_CLOSES_AT,
  VOTING_OPENS_AT,
  formatTime,
  getVotingStatus,
  type VotingStatus,
} from "@/data/schedule";
import CategoryBoard from "./CategoryBoard";

// Revisa la hora cada segundo para abrir/cerrar la votación sin recargar.
function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function useVotingStatus(): VotingStatus | null {
  return useSyncExternalStore(subscribeToClock, () => getVotingStatus(), () => null);
}

const STATUS_BANNER: Record<VotingStatus, { text: string; className: string }> = {
  before: {
    text: `La votación abre a las ${formatTime(VOTING_OPENS_AT)} y cierra a las ${formatTime(VOTING_CLOSES_AT)}.`,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  open: {
    text: `¡La votación está abierta! Cierra a las ${formatTime(VOTING_CLOSES_AT)}.`,
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  closed: {
    text: "La votación terminó. Estos son los resultados finales.",
    className: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  },
};

export default function VotingApp({ categories }: { categories: Category[] }) {
  const status = useVotingStatus();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

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

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div className="w-full">
      {status && (
        <p className={`mb-4 rounded-2xl px-4 py-3 text-center text-sm font-medium ${STATUS_BANNER[status].className}`}>
          {STATUS_BANNER[status].text}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {!authReady ? (
          <span className="text-zinc-500">Cargando...</span>
        ) : user ? (
          <>
            <span className="flex items-center gap-2">
              {user.photoURL && (
                <Image src={user.photoURL} alt="" width={28} height={28} className="rounded-full" />
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

      {error && (
        <p className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div role="tablist" className="mb-6 flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
        {categories.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === active.id}
            onClick={() => setActiveId(c.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition ${
              c.id === active.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              {c.icon}
            </span>
            {c.name}
          </button>
        ))}
      </div>

      <CategoryBoard
        key={active.id}
        category={active}
        user={user}
        authReady={authReady}
        status={status}
        onLogin={handleLogin}
      />
    </div>
  );
}
