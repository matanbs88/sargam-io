import { BansuriFlute } from "@/src/components/instruments/BansuriFlute";
import {
  getBansuriReferenceFingering,
  type BansuriHoleState,
} from "@/src/lib/bansuriFingering";

export { getBansuriReferenceFingering } from "@/src/lib/bansuriFingering";

type BansuriChartUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

function stateLabel(state: BansuriHoleState): string {
  if (state === "closed") return "closed";
  if (state === "half-open") return "half-open";
  return "open";
}

/** A restrained visual learning reference; the player profile owns calibration. */
export function BansuriChartUI({
  activeMidi,
  rootMidi,
}: BansuriChartUIProps) {
  const fingering = getBansuriReferenceFingering(activeMidi, rootMidi);
  const holes = fingering?.holes ?? [];

  return (
    <section
      aria-label="Six-hole Bansuri fingering reference"
      className="overflow-hidden rounded-[1rem] border border-teal/10 bg-[linear-gradient(145deg,#ffffff_0%,#edf0eb_100%)] shadow-[0_18px_40px_rgba(15,61,54,0.11)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-teal">
            Bansuri reference
          </p>
          <p className="mt-1 text-xs text-charcoal/55">
            Six finger holes, plus a separate blowing hole.
          </p>
        </div>
        <span className="rounded-full border border-mint-emerald/20 bg-mint-emerald/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-teal">
          {fingering?.label ?? "Choose a note"}
        </span>
      </div>

      <div className="grid items-center gap-5 px-5 py-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:px-6 sm:py-6">
        <div className="mx-auto h-[280px] w-[92px] drop-shadow-[0_18px_20px_rgba(73,43,10,0.2)]">
          <BansuriFlute holes={holes} />
        </div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Current fingering states">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              className="rounded-lg border border-teal/10 bg-white/75 px-3 py-2.5 text-center shadow-[0_5px_12px_rgba(15,61,54,0.06)]"
              key={index}
            >
              <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-charcoal/40">
                Hole {index + 1}
              </span>
              <span className="mt-1 block text-xs font-black capitalize text-teal">
                {stateLabel(holes[index] ?? "open")}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="border-t border-teal/10 bg-white/50 px-5 py-3 text-xs leading-5 text-charcoal/55 sm:px-6">
        Reference only: flute key, maker, breath, octave, and half-hole technique
        determine the final fingering.
      </p>
    </section>
  );
}
