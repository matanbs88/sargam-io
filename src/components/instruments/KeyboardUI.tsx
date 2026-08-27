import { PERFORMANCE_PIANO_KEYS } from "@/src/lib/pianoGeometry";

type KeyboardUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

function keyLabel(midi: number): string {
  const pitchClass = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
    ((midi % 12) + 12) % 12
  ];
  return `${pitchClass}${Math.floor(midi / 12) - 1}`;
}

function SaMarker({ isRoot }: { readonly isRoot: boolean }) {
  return isRoot ? (
    <span
      aria-label="Sa"
      className="absolute bottom-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-mint-emerald shadow-[0_0_11px_rgba(40,177,130,0.92)] ring-2 ring-white/85"
      title="Sa"
    />
  ) : null;
}

/**
 * A wide, four-octave physical keyboard reference. The same geometry is used
 * by the performance piano roll, so an active note always reaches its key.
 */
export function KeyboardUI({ activeMidi, rootMidi }: KeyboardUIProps) {
  const whiteKeys = PERFORMANCE_PIANO_KEYS.filter((key) => !key.isBlack);
  const blackKeys = PERFORMANCE_PIANO_KEYS.filter((key) => key.isBlack);

  return (
    <section
      aria-label="Four-octave keyboard reference"
      className="overflow-hidden rounded-[0.9rem] border border-teal/10 bg-white p-4 shadow-[0_18px_40px_rgba(15,61,54,0.11)] sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-teal">
            Keyboard reference
          </p>
          <p className="mt-1 text-xs text-charcoal/55">
            The mint marker is Sa. Yellow shows the played note.
          </p>
        </div>
        <span className="rounded-full border border-mint-emerald/20 bg-mint-emerald/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-teal">
          {keyLabel(rootMidi)} is Sa
        </span>
      </div>

      <div className="overflow-x-auto rounded-[0.7rem] bg-charcoal p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),0_12px_24px_rgba(3,14,24,0.24)] sm:p-3">
        <div className="relative h-52 min-w-[760px] select-none overflow-hidden rounded-b-[0.45rem] rounded-t-[0.18rem] bg-[#c9c9c5]">
          {whiteKeys.map((key) => {
            const isActive = key.midi === activeMidi;
            const isC = key.midi % 12 === 0;

            return (
              <div
                aria-label={`${keyLabel(key.midi)}${isActive ? ", active note" : ""}${key.midi === rootMidi ? ", Sa" : ""}`}
                className={[
                  "absolute bottom-0 h-full rounded-b-[0.35rem] border-r border-charcoal/70 bg-white shadow-[inset_0_-10px_12px_rgba(24,32,42,0.14),inset_0_1px_0_rgba(255,255,255,0.98)] transition-[transform,box-shadow,background] duration-150 last:border-r-0",
                  isActive
                    ? "translate-y-1 bg-yellow-soft shadow-[inset_0_-5px_8px_rgba(145,105,10,0.28),inset_0_2px_8px_rgba(255,255,255,0.96),0_0_18px_rgba(255,240,153,0.65)]"
                    : "",
                ].join(" ")}
                key={key.midi}
                role="img"
                style={{ left: `${key.left}%`, width: `${key.width}%` }}
              >
                {isC ? (
                  <span className="absolute left-1/2 top-3 -translate-x-1/2 text-[9px] font-black tracking-[0.08em] text-charcoal/35">
                    C{Math.floor(key.midi / 12) - 1}
                  </span>
                ) : null}
                <SaMarker isRoot={key.midi === rootMidi} />
              </div>
            );
          })}

          {blackKeys.map((key) => {
            const isActive = key.midi === activeMidi;

            return (
              <div
                aria-label={`${keyLabel(key.midi)}${isActive ? ", active note" : ""}${key.midi === rootMidi ? ", Sa" : ""}`}
                className={[
                  "absolute top-0 z-10 h-[61%] rounded-b-[0.28rem] border border-charcoal/90 border-t-white/20 bg-charcoal shadow-[0_8px_10px_rgba(0,0,0,0.55),inset_0_2px_1px_rgba(255,255,255,0.16)] transition-[transform,box-shadow,background] duration-150",
                  isActive
                    ? "translate-y-1 border-yellow-soft bg-yellow-soft shadow-[0_2px_5px_rgba(0,0,0,0.35),inset_0_2px_6px_rgba(255,255,255,0.72),0_0_16px_rgba(255,240,153,0.62)]"
                    : "",
                ].join(" ")}
                key={key.midi}
                role="img"
                style={{ left: `${key.left}%`, width: `${key.width}%` }}
              >
                <SaMarker isRoot={key.midi === rootMidi} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
