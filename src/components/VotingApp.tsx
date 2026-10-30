"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import type { Category } from "@/data/candidates";
import CategoryBoard from "./CategoryBoard";

export default function VotingApp({ categories }: { categories: Category[] }) {
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
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              c.id === active.id
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <CategoryBoard
        key={active.id}
        category={active}
        user={user}
        authReady={authReady}
        onLogin={handleLogin}
      />
    </div>
  );
}
