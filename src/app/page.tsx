import Image from "next/image";
import VotingApp from "@/components/VotingApp";
import { categories } from "@/data/candidates";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-10 text-center">
        {/* En celular los logos van arriba del título; desde tablet, a cada lado. */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
          <div className="order-1 rounded-md bg-white px-3 py-2 shadow-sm">
            <Image
              src="/logocolegio.jpeg"
              alt="Mano Amiga Santa María"
              width={1600}
              height={413}
              loading="eager"
              className="h-10 w-auto lg:h-14"
            />
          </div>

          <div className="order-3 w-full sm:order-2 sm:w-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">❦ Votación ❦</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Maratón de Lectura
            </h1>
          </div>

          <Image
            src="/logofestivalliterario.jpg"
            alt="Festival Literario"
            width={1024}
            height={1024}
            loading="eager"
            className="order-2 h-24 w-24 rounded-2xl border-4 border-line object-cover shadow-md sm:order-3 lg:h-32 lg:w-32"
          />
        </div>

        <div aria-hidden="true" className="mx-auto mt-6 flex max-w-xs items-center gap-3 text-gold">
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
