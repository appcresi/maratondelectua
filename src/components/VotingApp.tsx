"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { subscribeToResults } from "@/lib/votes";
import type { Category } from "@/data/candidates";
import {
  VOTING_CLOSES_AT,
  VOTING_OPENS_AT,
  formatDateTime,
  formatTime,
  getVotingStatus,
  type VotingStatus,
} from "@/data/schedule";
import CategoryBoard from "./CategoryBoard";

// Hora actual redondeada al segundo; se actualiza sola para la cuenta regresiva
// y para abrir/cerrar la votación sin recargar. Es null hasta que carga el navegador.
function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function useNow(): number | null {
  return useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
}

const STATUS_TEXT: Record<VotingStatus, string> = {
  before: `La votación abre a las ${formatTime(VOTING_OPENS_AT)} y cierra el ${formatDateTime(VOTING_CLOSES_AT)}.`,
  open: `¡La votación está abierta! Cierra el ${formatDateTime(VOTING_CLOSES_AT)}.`,
  closed: "La votación terminó. Estos son los resultados finales.",
};

const LOGIN_ERRORS: Record<string, string> = {
  "auth/unauthorized-domain":
    "Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).",
  "auth/operation-not-allowed": "El inicio de sesión con Google no está habilitado en Firebase.",
  "auth/configuration-not-found": "El inicio de sesión con Google no está habilitado en Firebase.",
  "auth/invalid-api-key": "Faltan las variables de entorno de Firebase en el servidor.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Faltan las variables de entorno de Firebase en el servidor.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.",
  "auth/operation-not-supported-in-this-environment":
    "Este navegador no permite iniciar sesión. Abre el link en Chrome o Safari.",
  "auth/network-request-failed": "Sin conexión a internet. Inténtalo de nuevo.",
};

function Countdown({ now, status }: { now: number; status: VotingStatus }) {
  if (status === "closed") {
    return <p className="font-display text-2xl font-bold">Votación cerrada</p>;
  }

  const target = status === "before" ? VOTING_OPENS_AT : VOTING_CLOSES_AT;
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const units = [
    { value: Math.floor(totalSeconds / 3600), label: "horas" },
    { value: Math.floor((totalSeconds % 3600) / 60), label: "min" },
    { value: totalSeconds % 60, label: "seg" },
  ];

  return (
    <div className="flex items-start justify-center gap-2 sm:justify-start">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-start gap-2">
          {i > 0 && <span className="pt-1 font-display text-3xl text-gold">:</span>}
          <div className="text-center">
            <span className="block min-w-[3ch] overflow-hidden rounded-md bg-accent px-2 py-1 font-display text-3xl font-bold tabular-nums text-accent-ink shadow-md">
              {/* La clave cambia con el número, así cada cambio dispara el "tic". */}
              <span key={u.value} className="inline-block animate-tick">
                {String(u.value).padStart(2, "0")}
              </span>
            </span>
            <span className="mt-1 block text-xs uppercase tracking-wider text-muted">{u.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VotingApp({ categories }: { categories: Category[] }) {
  const now = useNow();
  const status = now === null ? null : getVotingStatus(now);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const [error, setError] = useState<string | null>(null);
  // Total de votos por categoría. Como cada persona vota una sola vez por
  // categoría, el total es la cantidad de personas que votaron en ella.
  const [voters, setVoters] = useState<Record<string, number>>({});

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const unsubs = categories.map((c) =>
      subscribeToResults(c.id, (counts) => {
        const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
        setVoters((prev) => ({ ...prev, [c.id]: total }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [categories]);

  async function handleLogin() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code ?? "desconocido";
      // Cerrar la ventana emergente no es un error que haya que mostrar.
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      setError(`${LOGIN_ERRORS[code] ?? "No se pudo iniciar sesión con Google."} (${code})`);
    }
  }

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div className="w-full">
      {now !== null && status && (
        <section className="mb-6 grid animate-fade-up gap-6 rounded-lg border border-line bg-card p-5 shadow-sm sm:grid-cols-2">
          <div className="text-center sm:text-left">
            <h2 className="mb-3 text-sm uppercase tracking-[0.2em] text-gold">
              {status === "before" ? "La votación abre en" : status === "open" ? "La votación cierra en" : "Fin de la votación"}
            </h2>
            <Countdown now={now} status={status} />
            <p className="mt-3 text-sm italic text-muted">{STATUS_TEXT[status]}</p>
          </div>

          <div className="border-t border-line pt-5 text-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-left">
            <h2 className="mb-3 text-sm uppercase tracking-[0.2em] text-gold">Personas que votaron</h2>
            <ul className="flex justify-center gap-8 sm:justify-start">
              {categories.map((c) => (
                <li key={c.id}>
                  <span
                    key={voters[c.id] ?? 0}
                    className="inline-block animate-pop font-display text-4xl font-bold tabular-nums"
                  >
                    {voters[c.id] ?? 0}
                  </span>
                  <span className="block text-sm text-muted">
                    <span aria-hidden="true">{c.icon}</span> {c.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3 text-sm shadow-sm">
        {!authReady ? (
          <span className="text-muted">Cargando...</span>
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
              className="text-muted underline-offset-4 hover:text-accent hover:underline"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <span className="italic text-muted">Inicia sesión para votar.</span>
            <button
              onClick={handleLogin}
              className="rounded-md bg-accent px-4 py-2 font-display font-semibold text-accent-ink transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
            >
              Iniciar sesión con Google
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      {/* Pestañas tipo índice de libro */}
      <div role="tablist" className="mb-8 flex gap-2 border-b-2 border-line">
        {categories.map((c) => {
          const selected = c.id === active.id;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(c.id)}
              className={`-mb-0.5 flex flex-1 items-center justify-center gap-2 rounded-t-lg border-2 px-4 py-3 font-display text-lg font-bold transition ${
                selected
                  ? "border-line border-b-card bg-card text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className={`text-2xl leading-none transition-transform duration-300 ${selected ? "scale-125 animate-bob" : ""}`}
              >
                {c.icon}
              </span>
              {c.name}
            </button>
          );
        })}
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
