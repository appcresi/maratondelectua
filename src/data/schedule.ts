// Horario de la votación (hora de Argentina, UTC-3).
// IMPORTANTE: si cambias estas fechas, actualiza también los valores
// en milisegundos de firestore.rules (función votingOpen) y vuelve a publicarlas.
export const VOTING_OPENS_AT = new Date("2026-10-30T17:00:00-03:00");
export const VOTING_CLOSES_AT = new Date("2026-11-02T13:00:00-03:00");

export type VotingStatus = "before" | "open" | "closed";

export function getVotingStatus(now: number = Date.now()): VotingStatus {
  if (now < VOTING_OPENS_AT.getTime()) return "before";
  if (now >= VOTING_CLOSES_AT.getTime()) return "closed";
  return "open";
}

const TIME_ZONE = "America/Argentina/Buenos_Aires";

/** Ej.: "13:00" (siempre en formato 24 h) */
export function formatTime(date: Date) {
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  });
}

/** Ej.: "sábado 31/10 a las 13:00" */
export function formatDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    timeZone: TIME_ZONE,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${get("weekday")} ${get("day")}/${get("month")} a las ${formatTime(date)}`;
}
