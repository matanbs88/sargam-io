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
    <div className="relative flex flex-col items-center gap-2">
      <span
        aria-label={`Hole ${index}: ${state}`}
        className={[
          "relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2",
          holeClass,
        ].join(" ")}
        role="img"
      >
        {state === "half-open" ? (
          <span className="absolute bottom-0 h-1/2 w-full bg-teal/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]" />
        ) : null}
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-charcoal/55">{index}</span>
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

      <div className="relative mx-auto mt-7 max-w-2xl px-3 py-10">
        <div aria-hidden="true" className="absolute inset-y-7 left-0 w-8 rounded-l-full border border-[#8d4b1d]/45 bg-[repeating-linear-gradient(90deg,#b43b2a_0_3px,#f17e2e_3px_6px,#dcb43f_6px_8px)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.42),0_3px_8px_rgba(80,33,14,0.26)]" />
        <div aria-hidden="true" className="absolute inset-y-7 right-0 w-8 rounded-r-full border border-[#8d4b1d]/45 bg-[repeating-linear-gradient(90deg,#b43b2a_0_3px,#f17e2e_3px_6px,#dcb43f_6px_8px)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.42),0_3px_8px_rgba(80,33,14,0.26)]" />
        <div className="relative flex min-h-28 items-center justify-evenly rounded-full border border-[#8b5629]/40 bg-[linear-gradient(180deg,#8e4f20_0%,#c77d30_16%,#f8df91_48%,#d88d3c_78%,#754117_100%)] px-12 shadow-[inset_0_3px_5px_rgba(255,255,255,0.48),inset_0_-10px_14px_rgba(70,35,8,0.27),0_14px_25px_rgba(68,43,14,0.2)]">
          <span aria-label="Embouchure hole" className="absolute left-[9%] h-5 w-5 rounded-full border-2 border-charcoal/85 bg-charcoal shadow-[inset_0_4px_6px_rgba(0,0,0,0.65),inset_0_-1px_1px_rgba(255,255,255,0.08)]" />
          {Array.from({ length: 6 }, (_, index) => <Hole index={index + 1} key={index} state={fingering?.holes[index] ?? "open"} />)}
        </div>
        <span className="absolute bottom-0 left-[8%] text-[9px] font-black uppercase tracking-[0.12em] text-charcoal/45">embouchure</span>
        <span className="absolute bottom-0 right-[7%] text-[9px] font-black uppercase tracking-[0.12em] text-charcoal/45">hand-tied threads</span>
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
