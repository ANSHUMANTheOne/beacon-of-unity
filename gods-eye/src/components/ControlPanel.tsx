import { useAppState } from '../hooks/useAppState';
import type { ObjectCategory } from '../types/celestial';

const CATEGORIES: { id: ObjectCategory; label: string }[] = [
  { id: 'planet', label: 'Planets' },
  { id: 'near-earth-asteroid', label: 'Near-Earth Asteroids' },
  { id: 'near-earth-comet', label: 'Near-Earth Comets' },
  { id: 'potentially-hazardous-asteroid', label: 'Potentially Hazardous Asteroids' },
];

export function ControlPanel() {
  const { visibility, toggleVisibility } = useAppState();

  return (
    <div className="pointer-events-auto w-64 rounded-md border border-white/10 bg-[#0a0f1a]/70 backdrop-blur-md">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-slate-400">Objects</p>
      </div>
      <ul className="py-1">
        {CATEGORIES.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => toggleVisibility(id)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] text-slate-200 transition-colors hover:bg-white/5"
            >
              <span className={visibility[id] ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
              <span
                className={`h-3 w-3 rounded-full border transition-colors ${
                  visibility[id]
                    ? 'border-cyan-300/60 bg-cyan-300/70'
                    : 'border-slate-600 bg-transparent'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
