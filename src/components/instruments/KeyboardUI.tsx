type KeyboardUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

type PianoKey = {
  readonly midi: number;
  readonly label: string;
  readonly left?: string;
};

const WHITE_KEYS: readonly PianoKey[] = [
  { midi: 60, label: "C4" },
  { midi: 62, label: "D4" },
  { midi: 64, label: "E4" },
  { midi: 65, label: "F4" },
  { midi: 67, label: "G4" },
  { midi: 69, label: "A4" },
  { midi: 71, label: "B4" },
  { midi: 72, label: "C5" },
  { midi: 74, label: "D5" },
  { midi: 76, label: "E5" },
  { midi: 77, label: "F5" },
  { midi: 79, label: "G5" },
  { midi: 81, label: "A5" },
  { midi: 83, label: "B5" },
  { midi: 84, label: "C6" },
];

const BLACK_KEYS: readonly PianoKey[] = [
  { midi: 61, label: "C♯4", left: "4.3%" },
  { midi: 63, label: "D♯4", left: "11%" },
  { midi: 66, label: "F♯4", left: "24.3%" },
  { midi: 68, label: "G♯4", left: "31%" },
  { midi: 70, label: "A♯4", left: "37.7%" },
  { midi: 73, label: "C♯5", left: "51%" },
  { midi: 75, label: "D♯5", left: "57.7%" },
  { midi: 78, label: "F♯5", left: "71%" },
  { midi: 80, label: "G♯5", left: "77.7%" },
  { midi: 82, label: "A♯5", left: "84.3%" },
];

function SaMarker({ isRoot }: { readonly isRoot: boolean }) {
  return isRoot ? (
    <span
      aria-label="Sa"
      className="absolute bottom-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-mint-emerald ring-2 ring-white"
      title="Sa"
    />
  ) : null;
}

/**
 * A static two-octave piano visualization. The component is presentational:
 * the parent owns the active-note and selected-Sa state.
 */
export function KeyboardUI({ activeMidi, rootMidi }: KeyboardUIProps) {
  return (
    <section
      aria-label="Two-octave keyboard"
      className="rounded-[1.15rem] bg-white p-4 shadow-teal-soft sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-teal">Keyboard reference</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Yellow is the active note. The mint dot marks Sa.
          </p>
        </div>
        <span className="rounded-full bg-mint-emerald px-2.5 py-1 text-xs font-bold text-white">
          Sa: MIDI {rootMidi}
        </span>
      </div>

      <div className="relative h-44 select-none">
        <div className="grid h-full grid-cols-[repeat(15,minmax(0,1fr))] overflow-hidden rounded-b-[0.9rem] border border-teal/20 bg-[#ece8de] shadow-[inset_0_-8px_14px_rgba(70,55,32,0.14)]">
          {WHITE_KEYS.map((key) => {
            const isActive = key.midi === activeMidi;

            return (
              <div
                aria-label={
                  key.label +
                  (isActive ? ", active note" : "") +
                  (key.midi === rootMidi ? ", Sa" : "")
                }
                className={[
                  "relative rounded-b-md border-r border-teal/15 bg-[#fffefa] shadow-[inset_0_-7px_9px_rgba(67,52,28,0.11),inset_0_1px_0_rgba(255,255,255,0.98)] transition duration-150 last:border-r-0",
                  isActive
                    ? "translate-y-1 bg-yellow-soft shadow-[inset_0_3px_10px_rgba(135,111,19,0.25),inset_0_-3px_5px_rgba(255,255,255,0.52)]"
                    : "",
                ].join(" ")}
                key={key.midi}
                role="img"
              >
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-charcoal/55">
                  {key.label}
                </span>
                <SaMarker isRoot={key.midi === rootMidi} />
              </div>
            );
          })}
        </div>

        {BLACK_KEYS.map((key) => {
          const isActive = key.midi === activeMidi;

          return (
            <div
              aria-label={
                key.label +
                (isActive ? ", active note" : "") +
                (key.midi === rootMidi ? ", Sa" : "")
              }
              className={[
                "absolute top-0 z-10 h-[62%] w-[4.2%] rounded-b-lg border border-white/10 bg-charcoal shadow-[0_9px_10px_rgba(0,0,0,0.42),inset_0_2px_1px_rgba(255,255,255,0.14)] transition duration-150",
                isActive
                  ? "translate-y-1 border-yellow-soft/70 bg-yellow-soft text-charcoal shadow-[0_3px_5px_rgba(0,0,0,0.3),inset_0_3px_9px_rgba(135,111,19,0.24)]"
                  : "",
              ].join(" ")}
              key={key.midi}
              role="img"
              style={{ left: key.left }}
            >
              <SaMarker isRoot={key.midi === rootMidi} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
