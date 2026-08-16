import { midiToRelativeNote } from "@/src/lib/midiToSargam";

type DroneMode = "SaPa" | "SaMa";

type HarmoniumUIProps = {
  readonly activeMidi: number | null;
  readonly droneMode: DroneMode;
  readonly isDronePlaying: boolean;
  readonly onDroneModeChange: (mode: DroneMode) => void;
  readonly onToggleDrone: () => void;
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
  droneMode,
  isDronePlaying,
  onDroneModeChange,
  onToggleDrone,
  rootMidi,
}: HarmoniumUIProps) {
  const droneInterval = droneMode === "SaPa" ? 7 : 5;
  const droneLabel = droneMode === "SaPa" ? "Sa + Pa" : "Sa + Ma";

  return (
    <section aria-label="Harmonium reference" className="rounded-2xl border border-teal/10 bg-cream p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal">Harmonium mode</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Relative Sargam labels for right-hand melody practice.
          </p>
        </div>
        <div aria-label="Drone setting" className="flex rounded-xl bg-white p-1 shadow-sm" role="group">
          {(["SaPa", "SaMa"] as const).map((mode) => {
            const isActive = droneMode === mode;

            return (
              <button
                aria-pressed={isActive}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-black transition",
                  isActive ? "bg-teal text-white" : "text-charcoal/55 hover:text-teal",
                ].join(" ")}
                key={mode}
                onClick={() => onDroneModeChange(mode)}
                type="button"
              >
                {mode === "SaPa" ? "Sa + Pa" : "Sa + Ma"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-charcoal/60">
        <span className="rounded-full bg-mint-emerald px-2.5 py-1 text-white">Sa: MIDI {rootMidi}</span>
        <span className="rounded-full border border-teal/10 bg-white px-2.5 py-1">Synth drone: {droneLabel}</span>
        <button aria-pressed={isDronePlaying} className={["rounded-full px-3 py-1.5 text-xs font-black transition", isDronePlaying ? "bg-yellow-soft text-charcoal shadow-[0_2px_0_#d8ca70]" : "bg-teal text-white hover:brightness-95"].join(" ")} onClick={onToggleDrone} type="button">{isDronePlaying ? "Stop drone" : "Start drone"}</button>
        <span className="text-charcoal/40">Synth reference only; sampled Tanpura is future work.</span>
      </div>

      <div className="relative mt-5 h-44 select-none overflow-x-auto">
        <div className="relative min-w-[640px]">
          <div className="grid h-44 grid-cols-[repeat(15,minmax(0,1fr))] overflow-hidden rounded-b-xl border border-teal/25 shadow-sm">
            {WHITE_KEYS.map((key) => {
              const isActive = key.midi === activeMidi;
              const isSa = key.midi === rootMidi;
              const isDrone = key.midi === rootMidi + droneInterval;

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
                  {isDrone ? <span aria-label="Drone note" className="absolute bottom-8 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-teal/45" /> : null}
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
    </section>
  );
}
