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
      ? "border-mint-emerald/60 bg-teal shadow-[0_5px_8px_rgba(9,63,54,0.34),inset_0_1px_1px_rgba(255,255,255,0.2)]"
      : state === "half-open"
        ? "border-charcoal/75 bg-[linear-gradient(to_top,#136052_50%,#121a25_50%)] shadow-[inset_0_4px_6px_rgba(0,0,0,0.58)]"
        : "border-charcoal/80 bg-charcoal shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),inset_0_-1px_1px_rgba(255,255,255,0.08)]";

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-right text-xs font-bold text-charcoal/55">
        {index}
      </span>
      <span
        aria-label={`Hole ${index}: ${state}`}
        className={[
          "relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2",
          holeClass,
        ].join(" ")}
        role="img"
      >
        {state === "half-open" ? (
          <span className="absolute bottom-0 h-1/2 w-full bg-teal/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]" />
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
      className="rounded-[1.15rem] bg-white p-5 shadow-teal-soft sm:p-6"
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

      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2 rounded-[1.1rem] border border-[#8b5629]/35 bg-[linear-gradient(90deg,#8b5223_0%,#d28d3c_18%,#f6d985_48%,#d28d3c_77%,#78451e_100%)] p-4 shadow-[inset_0_2px_3px_rgba(255,255,255,0.42),inset_0_-8px_12px_rgba(73,39,12,0.2),0_12px_24px_rgba(68,43,14,0.18)]">
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
