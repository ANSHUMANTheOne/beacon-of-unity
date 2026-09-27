import { useEffect, useMemo, useState } from 'react';

interface LoadingScreenProps {
  visible: boolean;
  onComplete: () => void;
}

const STATUS_LINES = [
  'ESTABLISHING UPLINK',
  'SCANNING ORBITAL NETWORK',
  'DECRYPTING TELEMETRY',
  'AUTHENTICATING',
  'ACCESS GRANTED',
];

const HEX = '0123456789ABCDEF';
function randomHexLine(length: number) {
  let out = '';
  for (let i = 0; i < length; i++) out += HEX[Math.floor(Math.random() * HEX.length)];
  return out;
}

/**
 * Total runtime is intentionally short (~1.5s) -- a quick, dense "hacking in"
 * moment rather than a padded fake-progress screen.
 */
export function LoadingScreen({ visible, onComplete }: LoadingScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [granted, setGranted] = useState(false);

  const columns = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i / 14) * 100 + Math.random() * 3,
        delay: Math.random() * 0.4,
        duration: 1.1 + Math.random() * 0.6,
        text: randomHexLine(28),
      })),
    []
  );

  useEffect(() => {
    if (!visible) return;
    const stepMs = 220;
    const timers = STATUS_LINES.map((_, i) =>
      setTimeout(() => setStatusIndex(i), i * stepMs)
    );
    const grantTimer = setTimeout(() => setGranted(true), STATUS_LINES.length * stepMs + 60);
    const doneTimer = setTimeout(onComplete, STATUS_LINES.length * stepMs + 420);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(grantTimer);
      clearTimeout(doneTimer);
    };
  }, [visible, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#03040a] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        {columns.map((col) => (
          <div
            key={col.id}
            className="absolute top-0 font-mono-data text-[10px] leading-[14px] text-cyan-300/25"
            style={{
              left: `${col.left}%`,
              animation: `data-stream ${col.duration}s linear ${col.delay}s infinite`,
            }}
          >
            {col.text.split('').map((ch, i) => (
              <div key={i}>{ch}</div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(111,216,232,0.05) 0px, rgba(111,216,232,0.05) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className={`relative transition-transform duration-500 ${granted ? 'scale-[8] opacity-0' : 'scale-100 opacity-100'}`}>
        <svg width="140" height="140" viewBox="0 0 140 140" className="relative z-10">
          <defs>
            <radialGradient id="iris" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d3742" />
              <stop offset="55%" stopColor="#0a2530" />
              <stop offset="100%" stopColor="#051419" />
            </radialGradient>
          </defs>

          <circle cx="70" cy="70" r="64" fill="none" stroke="#6fd8e8" strokeOpacity="0.18" strokeWidth="0.6" />
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke="#6fd8e8"
            strokeOpacity="0.35"
            strokeWidth="0.8"
            strokeDasharray="2 6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 70 70"
              to="360 70 70"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>

          <path
            d="M 6 70 Q 70 20 134 70 Q 70 120 6 70 Z"
            fill="#03080b"
            stroke="#6fd8e8"
            strokeOpacity="0.5"
            strokeWidth="1"
          />

          <circle cx="70" cy="70" r="26" fill="url(#iris)" stroke="#6fd8e8" strokeOpacity="0.6" strokeWidth="0.8" />
          <circle cx="70" cy="70" r="10" fill="#010304" />

          <g>
            <path d="M 70 70 L 70 44 A 26 26 0 0 1 92 82 Z" fill="#6fd8e8" opacity="0.22">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 70 70"
                to="360 70 70"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          <g transform="translate(10,10)">
            <path d="M -8 -8 L -8 0 M -8 -8 L 0 -8" stroke="#6fd8e8" strokeOpacity="0.5" strokeWidth="1" fill="none" />
          </g>
          <g transform="translate(130,10) rotate(90)">
            <path d="M -8 -8 L -8 0 M -8 -8 L 0 -8" stroke="#6fd8e8" strokeOpacity="0.5" strokeWidth="1" fill="none" />
          </g>
          <g transform="translate(130,130) rotate(180)">
            <path d="M -8 -8 L -8 0 M -8 -8 L 0 -8" stroke="#6fd8e8" strokeOpacity="0.5" strokeWidth="1" fill="none" />
          </g>
          <g transform="translate(10,130) rotate(270)">
            <path d="M -8 -8 L -8 0 M -8 -8 L 0 -8" stroke="#6fd8e8" strokeOpacity="0.5" strokeWidth="1" fill="none" />
          </g>
        </svg>
      </div>

      <div className={`relative z-10 mt-7 flex flex-col items-center transition-opacity duration-200 ${granted ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-[15px] font-medium tracking-[0.32em] text-slate-100">GOD&apos;S EYE</h1>
        <p className="mt-3 h-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
          {STATUS_LINES[statusIndex]}
        </p>
        <div className="mt-4 h-px w-40 overflow-hidden bg-white/10">
          <div
            className="h-full bg-cyan-300/70 transition-all ease-linear"
            style={{
              width: `${((statusIndex + 1) / STATUS_LINES.length) * 100}%`,
              transitionDuration: '220ms',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes data-stream {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
