import {
  BANSURI_FINGER_HOLE_POSITIONS,
  type BansuriHoleState,
} from "@/src/lib/bansuriFingering";

type BansuriFluteProps = {
  readonly holes: readonly BansuriHoleState[];
  readonly label?: string;
};

function holeY(position: number): number {
  // The visual runway uses the same percentage positions for natural swaras.
  return position * 5.4;
}

/**
 * A deliberately restrained, vector Bansuri: bamboo grain and hole depth are
 * rendered in SVG, not simulated with decorative CSS bands or raster art.
 */
export function BansuriFlute({ holes, label = "Six-hole Bansuri" }: BansuriFluteProps) {
  return (
    <svg
      aria-label={label}
      className="h-full w-full overflow-visible"
      preserveAspectRatio="none"
      role="img"
      viewBox="0 0 148 540"
    >
      <defs>
        <linearGradient id="bansuri-bamboo" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#543116" />
          <stop offset="0.14" stopColor="#9d642c" />
          <stop offset="0.46" stopColor="#f4cb76" />
          <stop offset="0.61" stopColor="#ffd98b" />
          <stop offset="0.84" stopColor="#a7662d" />
          <stop offset="1" stopColor="#4d2d15" />
        </linearGradient>
        <radialGradient id="bansuri-hole" cx="38%" cy="32%" r="72%">
          <stop offset="0" stopColor="#05080b" />
          <stop offset="0.56" stopColor="#0c1420" />
          <stop offset="1" stopColor="#382311" />
        </radialGradient>
        <linearGradient id="bansuri-finger" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#46c8a2" />
          <stop offset="1" stopColor="#0f6959" />
        </linearGradient>
        <filter id="bansuri-finger-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" floodColor="#06231f" floodOpacity="0.55" stdDeviation="2" />
        </filter>
      </defs>

      <rect
        fill="url(#bansuri-bamboo)"
        height="496"
        rx="37"
        stroke="#f7d58d"
        strokeOpacity="0.52"
        width="74"
        x="37"
        y="22"
      />
      <path d="M45 60C63 43 86 43 103 60M45 478C63 495 86 495 103 478" fill="none" stroke="#6d3c1b" strokeOpacity="0.38" strokeWidth="1.5" />
      <path d="M54 29V511M94 29V511" fill="none" stroke="#fff4c9" strokeOpacity="0.13" strokeWidth="1.4" />
      <path d="M38 73H110M38 467H110" stroke="#6c3b1a" strokeOpacity="0.4" strokeWidth="2" />
      <circle cx="74" cy="98" fill="url(#bansuri-hole)" r="9" stroke="#3e2513" strokeWidth="2" />

      {BANSURI_FINGER_HOLE_POSITIONS.map((position, index) => {
        const state = holes[index] ?? "open";
        const y = holeY(position);

        return (
          <g key={index}>
            <circle cx="74" cy={y} fill="url(#bansuri-hole)" r="11" stroke="#4b2c15" strokeWidth="2" />
            {state === "closed" ? (
              <circle cx="74" cy={y} fill="url(#bansuri-finger)" filter="url(#bansuri-finger-shadow)" r="10" stroke="#86f0d0" strokeOpacity="0.48" />
            ) : null}
            {state === "half-open" ? (
              <path d={`M63 ${y}a11 11 0 0 0 22 0Z`} fill="url(#bansuri-finger)" filter="url(#bansuri-finger-shadow)" stroke="#86f0d0" strokeOpacity="0.48" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
