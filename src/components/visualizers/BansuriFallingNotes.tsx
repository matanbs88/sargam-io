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
    return "border-mint-emerald/70 bg-teal shadow-[0_5px_8px_rgba(3,44,37,0.42),inset_0_1px_1px_rgba(255,255,255,0.24)]";
  }

  if (state === "half-open") {
    return "border-charcoal/80 bg-[linear-gradient(to_top,#136052_50%,#141b23_50%)] shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)]";
  }

  return "border-charcoal/85 bg-charcoal shadow-[inset_0_4px_6px_rgba(0,0,0,0.65),inset_0_-1px_1px_rgba(255,255,255,0.08)]";
}

function VerticalBansuri({
  holes,
}: {
  readonly holes: readonly BansuriHoleState[];
}) {
  return (
    <div aria-label="Active bansuri fingering" className="relative mx-auto h-[272px] w-20 sm:w-24">
      <span aria-hidden="true" className="absolute inset-x-2 top-0 h-7 rounded-t-full border border-[#8d4b1d]/50 bg-[repeating-linear-gradient(0deg,#b43b2a_0_3px,#f17e2e_3px_6px,#dcb43f_6px_8px)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),0_3px_8px_rgba(80,33,14,0.25)]" />
      <div className="absolute inset-x-3 bottom-0 top-5 rounded-b-full border border-[#8b5629]/55 bg-[linear-gradient(90deg,#754117_0%,#c77d30_18%,#f8df91_49%,#d88d3c_77%,#754117_100%)] shadow-[inset_3px_0_5px_rgba(255,255,255,0.3),inset_-6px_0_10px_rgba(70,35,8,0.25),0_12px_24px_rgba(0,0,0,0.3)]">
        <span aria-label="Embouchure hole" className="absolute left-1/2 top-[9%] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-charcoal/90 bg-charcoal shadow-[inset_0_4px_6px_rgba(0,0,0,0.7)]" />
        {Array.from({ length: 6 }, (_, index) => (
          <span
            aria-label={`Finger hole ${index + 1}: ${holes[index] ?? "open"}`}
            className={[
              "absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 transition duration-200",
              holeClass(holes[index] ?? "open"),
            ].join(" ")}
            key={index}
            role="img"
            style={{ top: `${27 + index * 11}%` }}
          />
        ))}
      </div>
      <span aria-hidden="true" className="absolute inset-x-2 bottom-2 h-7 rounded-b-full border border-[#8d4b1d]/50 bg-[repeating-linear-gradient(0deg,#b43b2a_0_3px,#f17e2e_3px_6px,#dcb43f_6px_8px)] shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),0_3px_8px_rgba(80,33,14,0.25)]" />
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
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold text-white/60">
            vertical fingering
          </span>
        </div>
      </div>

      <div className="grid min-h-[330px] grid-cols-[96px_minmax(0,1fr)] bg-[#070a0f] sm:grid-cols-[124px_minmax(0,1fr)]">
        <div className="relative flex flex-col items-center justify-center border-r border-white/[0.08] bg-[radial-gradient(ellipse_at_center,rgba(40,177,130,0.1),transparent_70%)] px-2">
          <VerticalBansuri holes={activeFingering?.holes ?? []} />
          <span className="mt-1 text-center text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
            Bansuri
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
