import VotingApp from "@/components/VotingApp";
import { categories } from "@/data/candidates";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Maratón de Lectura</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Vota por el mejor disfraz de personaje y por el mejor stand
        </p>
      </header>
      <VotingApp categories={categories} />
    </main>
  );
}
