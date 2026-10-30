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
 * Estructura en Firestore:
 *   votes/{uid}        -> { imageId, createdAt }   (un documento por persona)
 *   results/{imageId}  -> { votes }                (contador por imagen)
 */

export class AlreadyVotedError extends Error {
  constructor() {
    super("Ya has votado.");
  }
}

export async function castVote(uid: string, imageId: string) {
  const voteRef = doc(db, "votes", uid);
  const resultRef = doc(db, "results", imageId);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(voteRef);
    if (existing.exists()) throw new AlreadyVotedError();

    tx.set(voteRef, { imageId, createdAt: serverTimestamp() });
    tx.set(resultRef, { votes: increment(1) }, { merge: true });
  });
}

export function subscribeToMyVote(
  uid: string,
  callback: (imageId: string | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "votes", uid), (snap) => {
    callback(snap.exists() ? (snap.data().imageId as string) : null);
  });
}

export function subscribeToResults(
  callback: (counts: Record<string, number>) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "results"), (snap) => {
    const counts: Record<string, number> = {};
    snap.forEach((d) => {
      counts[d.id] = (d.data().votes as number) ?? 0;
    });
    callback(counts);
  });
}
