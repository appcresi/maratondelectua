import {
  collection,
  doc,
  increment,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Estructura en Firestore (una rama por categoría):
 *   categories/{categoryId}/votes/{uid}          -> { candidateId, createdAt }  (un voto por persona)
 *   categories/{categoryId}/results/{candidateId} -> { votes }                  (contador)
 */

export class AlreadyVotedError extends Error {
  constructor() {
    super("Ya votaste en esta categoría.");
  }
}

export async function castVote(categoryId: string, uid: string, candidateId: string) {
  const voteRef = doc(db, "categories", categoryId, "votes", uid);
  const resultRef = doc(db, "categories", categoryId, "results", candidateId);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(voteRef);
    if (existing.exists()) throw new AlreadyVotedError();

    tx.set(voteRef, { candidateId, createdAt: serverTimestamp() });
    tx.set(resultRef, { votes: increment(1) }, { merge: true });
  });
}

export function subscribeToMyVote(
  categoryId: string,
  uid: string,
  callback: (candidateId: string | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "categories", categoryId, "votes", uid), (snap) => {
    callback(snap.exists() ? (snap.data().candidateId as string) : null);
  });
}

export function subscribeToResults(
  categoryId: string,
  callback: (counts: Record<string, number>) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "categories", categoryId, "results"), (snap) => {
    const counts: Record<string, number> = {};
    snap.forEach((d) => {
      counts[d.id] = (d.data().votes as number) ?? 0;
    });
    callback(counts);
  });
}
