/** Cuenta regresiva días : horas : min : seg hasta `target`. */
export default function CountdownDigits({ now, target }: { now: number; target: Date }) {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const units = [
    // Los días solo se muestran mientras falte al menos uno.
    ...(days > 0 ? [{ value: days, label: days === 1 ? "día" : "días" }] : []),
    { value: Math.floor((totalSeconds % 86400) / 3600), label: "horas" },
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
