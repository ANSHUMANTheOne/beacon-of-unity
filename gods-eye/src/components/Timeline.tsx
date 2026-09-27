import { useAppState } from '../hooks/useAppState';

const SPEED_STEPS = [1, 4, 20, 100, 500];

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function Timeline() {
  const { isPlaying, togglePlaying, speedMultiplier, setSpeedMultiplier, simulatedDate, setSimulatedDate } =
    useAppState();

  // Represent the scrubber as +/- 3 years around "now" for a tangible range.
  const rangeMs = 1000 * 60 * 60 * 24 * 365 * 3;
  const nowMs = Date.now();
  const scrubValue = Math.min(
    1,
    Math.max(0, (simulatedDate.getTime() - (nowMs - rangeMs)) / (rangeMs * 2))
  );

  const handleScrub = (value: number) => {
    const newTime = nowMs - rangeMs + value * rangeMs * 2;
    setSimulatedDate(new Date(newTime));
  };

  return (
    <div className="pointer-events-auto flex w-[min(680px,92vw)] items-center gap-4 rounded-md border border-white/10 bg-[#0a0f1a]/70 px-4 py-3 backdrop-blur-md">
      <button
        onClick={togglePlaying}
        aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/10 text-slate-200 transition-colors hover:bg-white/10"
      >
        {isPlaying ? (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
            <rect width="3.2" height="11" />
            <rect x="7.8" width="3.2" height="11" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
            <polygon points="0,0 11,5.5 0,11" />
          </svg>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={1}
          step={0.0001}
          value={scrubValue}
          onChange={(e) => handleScrub(parseFloat(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono-data text-[11px] tracking-wide text-slate-300">
            {formatDate(simulatedDate)}
          </span>
          <div className="flex items-center gap-1">
            {SPEED_STEPS.map((step) => (
              <button
                key={step}
                onClick={() => setSpeedMultiplier(step)}
                className={`rounded-sm px-1.5 py-0.5 font-mono-data text-[10px] transition-colors ${
                  speedMultiplier === step
                    ? 'bg-cyan-300/15 text-cyan-200'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {step}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
