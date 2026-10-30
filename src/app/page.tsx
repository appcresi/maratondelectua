import Image from "next/image";
import VotingApp from "@/components/VotingApp";
import { categories } from "@/data/candidates";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-10 text-center">
        <div className="mx-auto mb-8 w-fit rounded-md bg-white px-4 py-2 shadow-sm">
          <Image
            src="/logocolegio.jpeg"
            alt="Mano Amiga Santa María"
            width={1600}
            height={413}
            loading="eager"
            className="h-10 w-auto sm:h-12"
          />
        </div>
        <Image
          src="/logofestivalliterario.jpg"
          alt="Festival Literario"
          width={1024}
          height={1024}
          loading="eager"
          className="mx-auto mb-4 h-36 w-36 rounded-2xl border-4 border-line object-cover shadow-md sm:h-44 sm:w-44"
        />
        <p className="text-sm uppercase tracking-[0.3em] text-gold">❦ Votación ❦</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Maratón de Lectura
        </h1>
        <div aria-hidden="true" className="mx-auto mt-4 flex max-w-xs items-center gap-3 text-gold">
          <span className="h-px flex-1 bg-current" />
          <span>📖</span>
          <span className="h-px flex-1 bg-current" />
        </div>
        <p className="mt-4 text-lg italic text-muted">
          Vota por el mejor disfraz de personaje y por el mejor stand
        </p>
      </header>

      <VotingApp categories={categories} />

      <footer className="mt-16 border-t border-line pt-6 text-center text-sm italic text-muted">
        <p>“Yo, que me figuraba el Paraíso bajo la especie de una biblioteca.”</p>
        <p className="mt-1 not-italic">— Jorge Luis Borges, <cite>Poema de los dones</cite></p>
      </footer>
    </main>
  );
}
