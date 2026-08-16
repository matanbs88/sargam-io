import {
  DISPLAY_FRET_COUNT,
  midiToGuitarString,
  STANDARD_GUITAR_TUNING,
} from "@/src/lib/guitar";

type GuitarTabsUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

const FRETS = Array.from(
  { length: DISPLAY_FRET_COUNT + 1 },
  (_, index) => index,
);

/**
 * Standard-tuning visual reference. The active MIDI pitch is mapped to one
 * deterministic, low-travel string/fret position for the current mock player.
 */
export function GuitarTabsUI({ activeMidi, rootMidi }: GuitarTabsUIProps) {
  const activePosition =
    activeMidi === null ? null : midiToGuitarString(activeMidi);
  const rootPosition = midiToGuitarString(rootMidi);

  return (
    <section
      aria-label="Guitar fretboard reference"
      className="rounded-[1.15rem] bg-white p-5 shadow-teal-soft sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal">Guitar reference</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Standard tuning. Yellow marks the active note; mint marks Sa.
          </p>
        </div>
        <span className="w-fit rounded-full bg-mint-emerald px-2.5 py-1 text-xs font-bold text-white">
          {activePosition
            ? "String " +
              activePosition.stringNumber +
              " · fret " +
              activePosition.fret
            : "Note outside 12 frets"}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[42px_repeat(13,minmax(0,1fr))] text-center text-[10px] font-bold text-charcoal/50">
            <span />
            {FRETS.map((fret) => (
              <span key={fret}>{fret}</span>
            ))}
          </div>

          <div className="mt-2 space-y-1">
            {STANDARD_GUITAR_TUNING.map((string) => (
              <div
                className="grid grid-cols-[42px_repeat(13,minmax(0,1fr))] items-center"
                key={string.stringNumber}
              >
                <span className="text-right text-xs font-bold text-teal">
                  {string.label}
                </span>
                {FRETS.map((fret) => {
                  const isActive =
                    activePosition?.stringNumber === string.stringNumber &&
                    activePosition.fret === fret;
                  const isRoot =
                    rootPosition?.stringNumber === string.stringNumber &&
                    rootPosition.fret === fret;

                  return (
                    <span
                      aria-label={
                        "String " +
                        string.stringNumber +
                        ", fret " +
                        fret +
                        (isActive ? ", active note" : "") +
                        (isRoot ? ", Sa" : "")
                      }
                      className="relative flex h-8 items-center justify-center border-l border-teal/15"
                      key={fret}
                      role="img"
                    >
                      <span className="absolute h-px w-full bg-teal/55" />
                      {isActive ? (
                        <span className="relative z-10 grid h-6 w-6 place-items-center rounded-full bg-yellow-soft text-[10px] font-black text-charcoal shadow-sm">
                          {fret}
                        </span>
                      ) : null}
                      {isRoot ? (
                        <span
                          aria-label="Sa"
                          className="absolute bottom-0.5 right-1 h-2 w-2 rounded-full bg-mint-emerald ring-1 ring-white"
                          title="Sa"
                        />
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
