import {
  getBansuriReferenceFingering,
  getBansuriTimelineXPosition,
  type BansuriHoleState,
} from "@/src/lib/bansuriFingering";
import type { MidiNoteEvent } from "@/src/lib/midiToSargam";

type BansuriFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly rootMidi: number;
};

const ROLL_HEIGHT = 214;
const LOOK_AHEAD_MS = 2_800;

function getBarHeight(durationMs: number): number {
  return Math.max(34, Math.min(112, durationMs * 0.16));
}

function getBarTop(event: MidiNoteEvent, currentTimeMs: number): number {
  return (
    ROLL_HEIGHT -
    getBarHeight(event.durationMs) -
    ((event.startMs - currentTimeMs) / LOOK_AHEAD_MS) * ROLL_HEIGHT
  );
}

function holeStateClass(state: BansuriHoleState, isActive: boolean): string {
  if (state === "closed") {
    return isActive
      ? "border-yellow-soft bg-yellow-soft text-charcoal shadow-[0_0_18px_rgba(255,240,153,0.35)]"
      : "border-mint-emerald/70 bg-mint-emerald/85 text-white";
  }

  if (state === "half-open") {
    return isActive
      ? "border-yellow-soft bg-[linear-gradient(to_top,#fff099_50%,transparent_50%)] text-yellow-soft"
      : "border-mint-emerald/65 bg-[linear-gradient(to_top,rgba(40,177,130,0.85)_50%,transparent_50%)] text-mint-emerald";
  }

  return isActive
    ? "border-yellow-soft/90 bg-transparent text-yellow-soft"
    : "border-white/25 bg-transparent text-white/45";
}

function FingerHole({ state }: { readonly state: BansuriHoleState }) {
  const fillClass =
    state === "closed"
      ? "bg-teal"
      : state === "half-open"
        ? "bg-[linear-gradient(to_top,#136052_50%,#faf9f6_50%)]"
        : "bg-cream";

  return <span className={["absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal shadow-inner", fillClass].join(" ")} />;
}

/** Six physical fingering lanes aligned precisely with the Bansuri below. */
export function BansuriFallingNotes({
  activeEventIndex,
  events,
  rootMidi,
}: BansuriFallingNotesProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;
  const activeFingering = getBansuriReferenceFingering(
    events[activeEventIndex]?.midi ?? null,
    rootMidi,
  );
  const closedCount = activeFingering?.holes.filter((state) => state === "closed").length ?? 0;
  const halfOpenCount = activeFingering?.holes.filter((state) => state === "half-open").length ?? 0;

  return (
    <section aria-label="Bansuri fingering roll" className="overflow-hidden rounded-2xl border border-teal/10 bg-charcoal shadow-inner">
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div><p className="text-xs font-black text-white">Bansuri fingering roll</p><p className="mt-0.5 text-[10px] font-bold text-white/45">Six cue lanes are locked to their physical finger holes.</p></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-yellow-soft px-2.5 py-1 text-[10px] font-black text-charcoal">{activeFingering?.label ?? "No active note"}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">{closedCount} closed{halfOpenCount > 0 ? ` · ${halfOpenCount} half` : ""}</span></div>
      </div>

      <div className="relative h-[300px] overflow-hidden">
        {Array.from({ length: 6 }, (_, holeIndex) => <div aria-hidden="true" className="absolute bottom-[73px] top-0 border-l border-dashed border-white/10" key={holeIndex} style={{ left: `${getBansuriTimelineXPosition(holeIndex)}%` }} />)}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[72px] border-t-2 border-yellow-soft/80" />
        <span className="absolute bottom-[76px] left-3 rounded bg-yellow-soft px-1.5 py-0.5 text-[9px] font-black text-charcoal">contact line</span>

        {events.map((event, eventIndex) => {
          const fingering = getBansuriReferenceFingering(event.midi, rootMidi);
          if (fingering === null) return null;
          const isActive = eventIndex === activeEventIndex;
          const top = getBarTop(event, currentTimeMs);
          const height = getBarHeight(event.durationMs);

          return fingering.holes.map((state, holeIndex) => (
            <div aria-hidden="true" className={["absolute z-10 flex w-7 min-w-7 -translate-x-1/2 items-start justify-center rounded-t-full border pt-1 text-[8px] font-black transition-[top,background-color,border-color,opacity] duration-[420ms] ease-linear sm:w-8 sm:min-w-8", holeStateClass(state, isActive)].join(" ")} key={`${event.startMs}-${holeIndex}`} style={{ height: `${height}px`, left: `${getBansuriTimelineXPosition(holeIndex)}%`, top: `${top}px` }}>{holeIndex === 0 ? fingering.label.slice(0, 1) : ""}</div>
          ));
        })}

        <div className="absolute inset-x-[7%] bottom-3 h-14 rounded-full border-2 border-yellow-soft/70 bg-yellow-soft shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
          <span className="absolute left-[8%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-teal bg-charcoal" />
          <span className="absolute -top-4 left-[5.5%] text-[9px] font-black uppercase tracking-[0.12em] text-white/45">embouchure</span>
          {Array.from({ length: 6 }, (_, holeIndex) => <span aria-label={`Finger hole ${holeIndex + 1}: ${activeFingering?.holes[holeIndex] ?? "open"}`} className="absolute top-1/2" key={holeIndex} role="img" style={{ left: `${35 + holeIndex * 8}%` }}><FingerHole state={activeFingering?.holes[holeIndex] ?? "open"} /></span>)}
          <span className="absolute bottom-1.5 right-[5%] text-[9px] font-black uppercase tracking-[0.12em] text-teal/65">6 holes</span>
        </div>
      </div>
    </section>
  );
}
