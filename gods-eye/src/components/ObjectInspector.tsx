import { allCelestialBodies } from '../data/celestialBodies';
import { useAppState } from '../hooks/useAppState';
import type { ObjectCategory } from '../types/celestial';

const CATEGORY_LABEL: Record<ObjectCategory, string> = {
  planet: 'Planet',
  'near-earth-asteroid': 'Near-Earth Asteroid',
  'near-earth-comet': 'Near-Earth Comet',
  'potentially-hazardous-asteroid': 'Potentially Hazardous Asteroid',
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/[0.06] py-2.5">
      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <span className="font-mono-data text-[13px] text-slate-100">{value}</span>
    </div>
  );
}

export function ObjectInspector() {
  const { selectedObjectId, selectObject, followObjectId, followObject, stopFollowing, showOrbitForId, toggleShowOrbit } =
    useAppState();

  const body = allCelestialBodies.find((b) => b.id === selectedObjectId);
  const isOpen = Boolean(body);

  return (
    <div
      className={`pointer-events-auto w-[300px] rounded-md border border-white/10 bg-[#0a0f1a]/80 backdrop-blur-md transition-all duration-300 ${
        isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'
      }`}
    >
      {body && (
        <div key={body.id} className="animate-fade-in">
          <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {CATEGORY_LABEL[body.category]}
              </p>
              <h2 className="mt-0.5 text-[17px] font-medium text-slate-50">{body.name}</h2>
            </div>
            <button
              onClick={() => selectObject(null)}
              aria-label="Close inspector"
              className="text-slate-500 transition-colors hover:text-slate-200"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.3">
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3">
            {body.description && (
              <p className="mb-3 text-[12.5px] leading-relaxed text-slate-400">{body.description}</p>
            )}

            <p className="mb-1 mt-4 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Orbital Parameters
            </p>
            <Field label="Semi-major axis" value={`${body.orbitalElements.semiMajorAxisAu.toFixed(3)} AU`} />
            <Field label="Eccentricity" value={body.orbitalElements.eccentricity.toFixed(4)} />
            <Field label="Inclination" value={`${body.orbitalElements.inclinationDeg.toFixed(3)}\u00B0`} />
            <Field label="Orbital period" value={`${body.orbitalElements.orbitalPeriodDays.toFixed(1)} days`} />

            {(body.diameterMetersMin || body.earthCloseApproachAu) && (
              <>
                <p className="mb-1 mt-4 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Physical &amp; Approach Data
                </p>
                {body.diameterMetersMin && body.diameterMetersMax && (
                  <Field
                    label="Estimated diameter"
                    value={`${body.diameterMetersMin}\u2013${body.diameterMetersMax} m`}
                  />
                )}
                {body.earthCloseApproachAu && (
                  <Field label="Earth close approach" value={`${body.earthCloseApproachAu.toFixed(3)} AU`} />
                )}
                {body.isHazardous && (
                  <div className="mt-2 rounded-sm border border-[#d98f5a]/30 bg-[#d98f5a]/10 px-2.5 py-1.5 text-[11px] text-[#e3ab7c]">
                    Flagged potentially hazardous
                  </div>
                )}
              </>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => (followObjectId === body.id ? stopFollowing() : followObject(body.id))}
                className={`flex-1 rounded-sm border px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                  followObjectId === body.id
                    ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-200'
                    : 'border-white/15 text-slate-300 hover:bg-white/5'
                }`}
              >
                {followObjectId === body.id ? 'Following' : 'Follow Object'}
              </button>
              <button
                onClick={() => toggleShowOrbit(body.id)}
                className={`flex-1 rounded-sm border px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                  showOrbitForId === body.id
                    ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-200'
                    : 'border-white/15 text-slate-300 hover:bg-white/5'
                }`}
              >
                Show Orbit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
