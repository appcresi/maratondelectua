import VotingBoard from "@/components/VotingBoard";
import { candidates } from "@/data/candidates";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Votación</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Vota por tu imagen favorita</p>
      </header>
      <VotingBoard candidates={candidates} />
    </main>
  );
}
