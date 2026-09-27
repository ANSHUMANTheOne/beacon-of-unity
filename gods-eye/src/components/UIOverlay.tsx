import { useAppState } from '../hooks/useAppState';

function formatFullDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function UIOverlay() {
  const { simulatedDate, isPlaying } = useAppState();

  return (
    <>
      <div className="pointer-events-none absolute left-6 top-6">
        <h1 className="text-[15px] font-medium tracking-[0.22em] text-slate-100">GOD&apos;S EYE</h1>
        <p className="mt-1 font-mono-data text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Near-Earth Object Observatory
        </p>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 text-right">
        <p className="font-mono-data text-[12px] tracking-wide text-slate-300">
          {formatFullDate(simulatedDate)}
        </p>
        <div className="mt-1 flex items-center justify-end gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-cyan-300' : 'bg-slate-600'}`}
            style={isPlaying ? { boxShadow: '0 0 6px 1px rgba(111,216,232,0.7)' } : undefined}
          />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {isPlaying ? 'Live Simulation' : 'Paused'}
          </span>
        </div>
      </div>
    </>
  );
}
