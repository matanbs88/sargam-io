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
 * A restrained vector Bansuri. The SVG keeps the six finger holes on the same
 * percentage grid used by the falling-note runway, so the visual reference
 * remains anatomically legible at every size.
 */
export function BansuriFlute({ holes, label = "Six-hole Bansuri" }: BansuriFluteProps) {
  return (
    <svg
      aria-label={label}
      className="h-full w-full overflow-visible drop-shadow-[0_20px_22px_rgba(0,0,0,0.34)]"
      preserveAspectRatio="none"
      role="img"
      viewBox="0 0 148 540"
    >
      <defs>
        <linearGradient id="bansuri-bamboo" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5a3218" />
          <stop offset="0.1" stopColor="#9e6028" />
          <stop offset="0.34" stopColor="#e8ae55" />
          <stop offset="0.51" stopColor="#ffe09a" />
          <stop offset="0.7" stopColor="#d8913b" />
          <stop offset="0.9" stopColor="#8b4e21" />
          <stop offset="1" stopColor="#482812" />
        </linearGradient>
        <linearGradient id="bansuri-end" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#6b3917" />
          <stop offset="0.35" stopColor="#c97b2d" />
          <stop offset="0.52" stopColor="#f6bc61" />
          <stop offset="0.72" stopColor="#b56725" />
          <stop offset="1" stopColor="#572c13" />
        </linearGradient>
        <radialGradient id="bansuri-hole" cx="38%" cy="32%" r="72%">
          <stop offset="0" stopColor="#020408" />
          <stop offset="0.58" stopColor="#0b1420" />
          <stop offset="1" stopColor="#3b2412" />
        </radialGradient>
        <linearGradient id="bansuri-finger" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#46c8a2" />
          <stop offset="1" stopColor="#0f6959" />
        </linearGradient>
        <linearGradient id="bansuri-highlight" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff8dc" stopOpacity="0.72" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
        <filter id="bansuri-finger-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" floodColor="#06231f" floodOpacity="0.55" stdDeviation="2" />
        </filter>
        <filter id="bansuri-body-shadow" x="-50%" y="-10%" width="200%" height="120%">
          <feDropShadow dx="0" dy="8" floodColor="#160b04" floodOpacity="0.54" stdDeviation="7" />
        </filter>
      </defs>

      <rect
        fill="url(#bansuri-bamboo)"
        filter="url(#bansuri-body-shadow)"
        height="500"
        rx="27"
        stroke="#f7d58d"
        strokeOpacity="0.62"
        strokeWidth="1.5"
        width="82"
        x="33"
        y="20"
      />

      {/* Clean binding rings: subtle enough to read as construction, not stripes. */}
      <g opacity="0.88">
        <rect fill="url(#bansuri-end)" height="10" rx="5" width="86" x="31" y="28" />
        <rect fill="none" height="4" rx="2" stroke="#f4c66d" strokeOpacity="0.8" strokeWidth="1.5" width="88" x="30" y="41" />
        <rect fill="url(#bansuri-end)" height="10" rx="5" width="86" x="31" y="502" />
        <rect fill="none" height="4" rx="2" stroke="#f4c66d" strokeOpacity="0.8" strokeWidth="1.5" width="88" x="30" y="495" />
      </g>

      <path d="M44 64C59 48 89 48 104 64" fill="none" stroke="#6d3c1b" strokeOpacity="0.28" strokeWidth="1.5" />
      <path d="M45 477C61 492 87 492 103 477" fill="none" stroke="#6d3c1b" strokeOpacity="0.28" strokeWidth="1.5" />
      <path d="M52 32V508M96 32V508" fill="none" stroke="#fff4c9" strokeOpacity="0.16" strokeWidth="1.4" />
      <path d="M58 32V508" fill="none" stroke="url(#bansuri-highlight)" strokeOpacity="0.44" strokeWidth="3" />

      {/* Embouchure hole. It is deliberately separated from the six finger holes. */}
      <circle cx="74" cy="14" fill="url(#bansuri-hole)" r="8" stroke="#3e2513" strokeWidth="2" />
      <path d="M68 18C72 22 76 22 80 18" fill="none" stroke="#ffe3a1" strokeOpacity="0.46" strokeWidth="1" />

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
