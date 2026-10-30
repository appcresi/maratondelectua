// Horario de la votación (hora de Argentina, UTC-3).
// IMPORTANTE: si cambias estas fechas, actualiza también los valores
// en milisegundos de firestore.rules (función votingOpen) y vuelve a publicarlas.
export const VOTING_OPENS_AT = new Date("2026-10-30T16:20:00-03:00");
export const VOTING_CLOSES_AT = new Date("2026-10-30T16:45:00-03:00");

export type VotingStatus = "before" | "open" | "closed";

export function getVotingStatus(now: number = Date.now()): VotingStatus {
  if (now < VOTING_OPENS_AT.getTime()) return "before";
  if (now >= VOTING_CLOSES_AT.getTime()) return "closed";
  return "open";
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
