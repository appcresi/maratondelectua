"use client";

import Image from "next/image";
import { useState } from "react";
import { categories } from "@/data/candidates";
import { MENTIONS_REVEAL_AT, mentionGroups, type Mention } from "@/data/mentions";
import { formatDateTime } from "@/data/schedule";
import CountdownDigits from "./CountdownDigits";

function findCandidate(m: Mention) {
  if (!m.candidateId) return null;
  return categories.find((c) => c.id === m.categoryId)?.candidates.find((c) => c.id === m.candidateId) ?? null;
}

function MysteryCard({ label }: { label: string }) {
  return (
    <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md border-2 border-gold bg-ink shadow-lg">
      {/* Brillo que cruza la tarjeta */}
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_35%,rgba(214,173,87,0.35)_50%,transparent_65%)] bg-[length:250%_100%]"
      />
      <span aria-hidden="true" className="absolute left-3 top-3 animate-twinkle text-lg">✨</span>
      <span aria-hidden="true" className="absolute bottom-4 right-3 animate-twinkle text-lg [animation-delay:1s]">✨</span>
      <span className="animate-glow font-display text-7xl font-bold text-gold sm:text-8xl" aria-label={`${label} misterioso`}>
        ?
      </span>
    </div>
  );
}

export default function Mentions({ now }: { now: number }) {
  const revealed = now >= MENTIONS_REVEAL_AT.getTime();
  const [activeTitle, setActiveTitle] = useState(mentionGroups[0].title);
  const group = mentionGroups.find((g) => g.title === activeTitle) ?? mentionGroups[0];

  return (
    <section className="mb-8 animate-fade-up rounded-lg border border-line bg-card p-5 shadow-sm">
      <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">🎖️ Menciones especiales por curso</h2>

      {revealed ? (
        <p className="mt-2 text-center italic text-muted">¡Felicitaciones!</p>
      ) : (
        <div className="mt-3 text-center">
          <p className="mb-3 italic text-muted">
            Es un misterio… se revela el {formatDateTime(MENTIONS_REVEAL_AT)}.
          </p>
          <div className="flex justify-center">
            <CountdownDigits now={now} target={MENTIONS_REVEAL_AT} />
          </div>
        </div>
      )}

      {/* Pestañas por curso */}
      <div role="tablist" aria-label="Curso" className="mx-auto mt-8 flex max-w-2xl gap-1 rounded-lg bg-paper p-1">
        {mentionGroups.map((g) => {
          const selected = g.title === group.title;
          return (
            <button
              key={g.title}
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTitle(g.title)}
              className={`flex-1 rounded-md px-2 py-2 font-display text-sm font-bold transition sm:text-base ${
                selected ? "bg-accent text-accent-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {g.title}
            </button>
          );
        })}
      </div>

      {/* La clave reinicia las animaciones al cambiar de curso */}
      <div key={group.title} role="tabpanel" className="mt-6 animate-fade-in">
        <ol className="mx-auto grid max-w-2xl grid-cols-3 items-end gap-3 sm:gap-6">
          {group.mentions.map((m, i) => {
            const candidate = revealed ? findCandidate(m) : null;
            return (
              <li key={i} className="flex flex-col items-center text-center">
                <span className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">{m.label}</span>

                {candidate ? (
                  <div className="w-full animate-drop" style={{ animationDelay: `${i * 300}ms` }}>
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border-2 border-gold shadow-lg">
                      <Image src={candidate.src} alt={candidate.title} fill sizes="200px" className="object-cover" />
                    </div>
                    <h4 className="mt-2 line-clamp-2 font-display text-sm font-bold leading-tight sm:text-base">
                      {candidate.title}
                    </h4>
                  </div>
                ) : (
                  <>
                    <MysteryCard label={m.label} />
                    {revealed && <p className="mt-2 text-xs italic text-muted">Próximamente</p>}
                  </>
                )}

                {/* Pedestal */}
                <div
                  className="mt-3 h-10 w-full origin-bottom animate-rise rounded-t-md border border-b-0 border-black/10 bg-gradient-to-b from-[#f3d36b] to-[#b8901f] shadow-[inset_0_2px_0_rgba(255,255,255,0.5)]"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              </li>
            );
          })}
        </ol>
        <div className="mx-auto h-2 max-w-2xl rounded-b-md bg-ink/80" />
      </div>
    </section>
  );
}
