import {
  getBansuriReferenceFingering,
  type BansuriHoleState,
} from "@/src/lib/bansuriFingering";
import type { MidiNoteEvent } from "@/src/lib/midiToSargam";
import { midiToRelativeNote } from "@/src/lib/midiToSargam";

type BansuriFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly rootMidi: number;
};

const LOOK_AHEAD_MS = 4_000;
const PLAYHEAD_PERCENT = 28;
const NOTE_LANES = 12;

function normalizedInterval(midi: number, rootMidi: number): number {
  return ((midi - rootMidi) % 12 + 12) % 12;
}

function getNoteWidth(durationMs: number): number {
  return Math.max(7, Math.min(31, (durationMs / LOOK_AHEAD_MS) * 100));
}

function getNoteLeft(startMs: number, currentTimeMs: number): number {
  return PLAYHEAD_PERCENT + ((startMs - currentTimeMs) / LOOK_AHEAD_MS) * 100;
}

function holeClass(state: BansuriHoleState): string {
  if (state === "closed") {
    return "border-mint-emerald/70 bg-teal shadow-[0_2px_5px_rgba(3,44,37,0.32),inset_0_1px_1px_rgba(255,255,255,0.2)]";
  }

  if (state === "half-open") {
    return "border-charcoal/80 bg-[linear-gradient(to_top,#136052_50%,#141b23_50%)] shadow-[inset_0_3px_5px_rgba(0,0,0,0.6)]";
  }

  return "border-charcoal/85 bg-charcoal shadow-[inset_0_3px_5px_rgba(0,0,0,0.65),inset_0_-1px_1px_rgba(255,255,255,0.08)]";
}

function VerticalBansuri({
  holes,
}: {
  readonly holes: readonly BansuriHoleState[];
}) {
  return (
    <div aria-label="Active bansuri fingering" className="relative mx-auto h-[270px] w-12">
      <div className="absolute inset-x-1 bottom-0 top-0 rounded-full border border-[#dfbd79]/25 bg-[linear-gradient(90deg,#62421f_0%,#9c6933_18%,#d9b574_50%,#9d6933_78%,#60401e_100%)] shadow-[inset_1px_0_2px_rgba(255,255,255,0.2),inset_-3px_0_5px_rgba(35,21,8,0.2),0_7px_16px_rgba(0,0,0,0.22)]">
        <span aria-hidden="true" className="absolute inset-x-0 top-[3%] border-t border-[#402610]/35" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-[3%] border-t border-[#402610]/35" />
        <span aria-label="Embouchure hole" className="absolute left-1/2 top-[10%] h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-charcoal/90 bg-charcoal shadow-[inset_0_3px_5px_rgba(0,0,0,0.72)]" />
        {Array.from({ length: 6 }, (_, index) => (
          <span
            aria-label={`Finger hole ${index + 1}: ${holes[index] ?? "open"}`}
            className={[
              "absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border transition duration-200",
              holeClass(holes[index] ?? "open"),
            ].join(" ")}
            key={index}
            role="img"
            style={{ top: `${28 + index * 11}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Vocal-style melodic runway for bansuri. The fixed vertical flute reflects
 * the active fingering while timed Sargam beams travel toward the playhead.
 */
export function BansuriFallingNotes({
  activeEventIndex,
  events,
  rootMidi,
}: BansuriFallingNotesProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;
  const activeEvent = events[activeEventIndex];
  const activeFingering = getBansuriReferenceFingering(
    activeEvent?.midi ?? null,
    rootMidi,
  );

  return (
    <section
      aria-label="Bansuri melody runway"
      className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-[#06090e] shadow-[0_24px_54px_rgba(1,6,13,0.42)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0b111a] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/85">
            Bansuri melody runway
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Lane = relative swara · beam width = note duration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-yellow-soft px-2.5 py-1 text-[10px] font-black text-charcoal">
            {activeFingering?.label ?? "Choose a note"}
          </span>
        </div>
      </div>

      <div className="grid min-h-[330px] grid-cols-[72px_minmax(0,1fr)] bg-[#070a0f] sm:grid-cols-[92px_minmax(0,1fr)]">
        <div className="relative flex flex-col items-center justify-center border-r border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_34%,rgba(255,255,255,0.01))] px-2">
          <VerticalBansuri holes={activeFingering?.holes ?? []} />
          <span className="mt-2 text-center text-[8px] font-black uppercase tracking-[0.18em] text-white/35">
            Fingering
          </span>
        </div>

        <div className="relative min-w-0 overflow-hidden py-4">
          <div aria-hidden="true" className="absolute inset-y-4 left-0 w-9 border-r border-white/[0.08] bg-[#0a0e15]/80 sm:w-11" />
          {Array.from({ length: NOTE_LANES }, (_, lane) => {
            const interval = NOTE_LANES - lane - 1;
            const label = midiToRelativeNote(rootMidi + interval, rootMidi).sargamToken;
            const isSa = interval === 0;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute inset-x-0 border-t",
                  isSa ? "border-mint-emerald/40 bg-mint-emerald/[0.035]" : "border-white/[0.055]",
                ].join(" ")}
                key={interval}
                style={{ top: `${(lane / NOTE_LANES) * 100}%`, height: `${100 / NOTE_LANES}%` }}
              >
                <span className={isSa ? "absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-mint-emerald sm:left-3" : "absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white/30 sm:left-3"}>
                  {label}
                </span>
              </div>
            );
          })}

          <div aria-hidden="true" className="absolute bottom-4 top-4 w-px bg-yellow-soft shadow-[0_0_15px_rgba(255,240,153,0.72)]" style={{ left: `${PLAYHEAD_PERCENT}%` }} />
          <span className="absolute top-4 -translate-x-1/2 rounded-full bg-yellow-soft px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-charcoal" style={{ left: `${PLAYHEAD_PERCENT}%` }}>play</span>

          {events.map((event, index) => {
            const interval = normalizedInterval(event.midi, rootMidi);
            const lane = NOTE_LANES - interval - 1;
            const isActive = index === activeEventIndex;
            const left = getNoteLeft(event.startMs, currentTimeMs);
            const width = getNoteWidth(event.durationMs);
            const note = midiToRelativeNote(event.midi, rootMidi);

            if (left < -width || left > 108) return null;

            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute z-10 flex h-[19px] items-center rounded-full border px-2 text-[9px] font-black backdrop-blur-md transition-[left,background-color,box-shadow] duration-[420ms] ease-linear sm:h-[22px]",
                  isActive
                    ? "border-yellow-soft/90 bg-[linear-gradient(90deg,rgba(255,226,104,0.94),rgba(255,246,184,0.82))] text-charcoal shadow-[0_0_26px_rgba(255,240,153,0.62),inset_0_1px_0_rgba(255,255,255,0.8)]"
                    : "border-mint-emerald/60 bg-[linear-gradient(90deg,rgba(40,177,130,0.76),rgba(89,212,172,0.48))] text-white shadow-[0_0_20px_rgba(40,177,130,0.38),inset_0_1px_0_rgba(255,255,255,0.38)]",
                ].join(" ")}
                key={`${event.startMs}-${event.midi}`}
                style={{
                  left: `calc(${left}% + 2.75rem)`,
                  top: `calc(1rem + ${lane * (100 / NOTE_LANES)}% + 2px)`,
                  width: `${width}%`,
                }}
              >
                <span className="truncate">{note.sargamToken}</span>
              </div>
            );
          })}

          <div className="absolute bottom-4 left-12 right-3 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.12em] text-white/25 sm:left-14">
            <span>past</span>
            <span>next phrase</span>
          </div>
        </div>
      </div>
    </section>
  );
}
