import {
  getBansuriReferenceFingering,
  type BansuriHoleState,
} from "@/src/lib/bansuriFingering";

export { getBansuriReferenceFingering } from "@/src/lib/bansuriFingering";

type BansuriChartUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

function Hole({
  index,
  state,
}: {
  readonly index: number;
  readonly state: BansuriHoleState;
}) {
  const holeClass =
    state === "closed"
      ? "bg-teal"
      : state === "half-open"
        ? "bg-white"
        : "bg-cream";

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-right text-xs font-bold text-charcoal/55">
        {index}
      </span>
      <span
        aria-label={`Hole ${index}: ${state}`}
        className={[
          "relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-teal/60",
          holeClass,
        ].join(" ")}
        role="img"
      >
        {state === "half-open" ? (
          <span className="absolute bottom-0 h-1/2 w-full bg-teal" />
        ) : null}
      </span>
    </div>
  );
}

/** A visual learning reference; calibration follows a player-specific profile. */
export function BansuriChartUI({
  activeMidi,
  rootMidi,
}: BansuriChartUIProps) {
  const fingering = getBansuriReferenceFingering(activeMidi, rootMidi);

  return (
    <section
      aria-label="Six-hole bansuri fingering reference"
      className="rounded-2xl border border-teal/10 bg-cream p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal">Bansuri reference</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Six finger-hole chart relative to Sa.
          </p>
        </div>
        <span className="w-fit rounded-full bg-mint-emerald px-2.5 py-1 text-xs font-bold text-white">
          {fingering?.label ?? "No active note"}
        </span>
      </div>

      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
        {Array.from({ length: 6 }, (_, index) => (
          <Hole
            index={index + 1}
            key={index}
            state={fingering?.holes[index] ?? "open"}
          />
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-charcoal/60">
        Closed holes are teal, open holes are empty, and half-open holes are
        half filled. The embouchure is not a finger hole. This is a learning
        reference; exact fingerings depend on flute design, octave, breath, and
        playing style.
      </p>
    </section>
  );
}
