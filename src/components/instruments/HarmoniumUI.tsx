import { midiToRelativeNote } from "@/src/lib/midiToSargam";

type HarmoniumUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

type HarmoniumKey = {
  readonly midi: number;
  readonly label: string;
  readonly left?: string;
};

const WHITE_KEYS: readonly HarmoniumKey[] = [
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

const BLACK_KEYS: readonly HarmoniumKey[] = [
  { midi: 61, label: "C#4", left: "4.3%" },
  { midi: 63, label: "D#4", left: "11%" },
  { midi: 66, label: "F#4", left: "24.3%" },
  { midi: 68, label: "G#4", left: "31%" },
  { midi: 70, label: "A#4", left: "37.7%" },
  { midi: 73, label: "C#5", left: "51%" },
  { midi: 75, label: "D#5", left: "57.7%" },
  { midi: 78, label: "F#5", left: "71%" },
  { midi: 80, label: "G#5", left: "77.7%" },
  { midi: 82, label: "A#5", left: "84.3%" },
];

function SargamLabel({ midi, rootMidi }: { readonly midi: number; readonly rootMidi: number }) {
  const note = midiToRelativeNote(midi, rootMidi);

  return (
    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-teal/75">
      {note.sargamToken}{note.octaveMarker}
    </span>
  );
}

/** A presentational harmonium reference with relative Sargam labels. */
export function HarmoniumUI({
  activeMidi,
  rootMidi,
}: HarmoniumUIProps) {
  return (
    <section aria-label="Harmonium reference" className="overflow-hidden rounded-[1.15rem] bg-[linear-gradient(145deg,#f7e3bd_0%,#d9a05b_38%,#7d431b_100%)] p-4 shadow-[0_20px_45px_rgba(76,42,13,0.24),inset_0_1px_0_rgba(255,255,255,0.55)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#4f2914]">Harmonium mode</p>
          <p className="mt-1 text-xs text-[#4f2914]/70">
            Relative Sargam labels for right-hand melody practice.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#5b2f14]/25 bg-[#5b2f14]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#4f2914]">
          <span className="h-2 w-2 rounded-full bg-[#5b2f14] shadow-[0_0_7px_rgba(91,47,20,0.55)]" />
          reed instrument
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-[#4f2914]/70">
        <span className="rounded-full bg-mint-emerald px-2.5 py-1 text-white shadow-[0_5px_12px_rgba(40,177,130,0.25)]">Sa: MIDI {rootMidi}</span>
        <span className="rounded-full border border-[#5b2f14]/20 bg-[#fff5dc]/70 px-2.5 py-1">Relative melody reference</span>
        <span>Tanpura controls live in the practice layer.</span>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[0.85rem] border border-[#5b2f14]/30 bg-[linear-gradient(180deg,#a9642a_0%,#6b3516_100%)] p-3 shadow-[inset_0_3px_8px_rgba(255,219,153,0.22),0_12px_22px_rgba(76,42,13,0.22)]">
        <div aria-hidden="true" className="mb-3 flex items-center justify-between rounded-md bg-[#3a1d0d]/75 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#ffe0a0]">
          <span>reed bank</span>
          <span className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, index) => <i className="h-1.5 w-7 rounded-full bg-[#f4c875]/75" key={index} />)}
          </span>
        </div>
        <div className="relative h-44 select-none overflow-x-auto">
        <div className="relative min-w-[640px]">
          <div className="grid h-44 grid-cols-[repeat(15,minmax(0,1fr))] overflow-hidden rounded-b-xl border border-teal/25 shadow-sm">
            {WHITE_KEYS.map((key) => {
              const isActive = key.midi === activeMidi;
              const isSa = key.midi === rootMidi;

              return (
                <div
                  aria-label={key.label + (isActive ? ", active note" : "") + (isSa ? ", Sa" : "")}
                  className={[
                    "relative border-r border-teal/20 last:border-r-0",
                    isActive ? "bg-yellow-soft" : "bg-white",
                  ].join(" ")}
                  key={key.midi}
                  role="img"
                >
                  <SargamLabel midi={key.midi} rootMidi={rootMidi} />
                  {isSa ? <span aria-label="Sa" className="absolute bottom-8 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-mint-emerald ring-2 ring-white" /> : null}
                </div>
              );
            })}
          </div>

          {BLACK_KEYS.map((key) => {
            const isActive = key.midi === activeMidi;
            const isSa = key.midi === rootMidi;

            return (
              <div
                aria-label={key.label + (isActive ? ", active note" : "") + (isSa ? ", Sa" : "")}
                className={[
                  "absolute top-0 z-10 h-[62%] w-[4.2%] rounded-b-lg shadow-md",
                  isActive ? "bg-yellow-soft" : "bg-charcoal",
                ].join(" ")}
                key={key.midi}
                role="img"
                style={{ left: key.left }}
              >
                {isSa ? <span aria-label="Sa" className="absolute bottom-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-mint-emerald ring-2 ring-white" /> : null}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
