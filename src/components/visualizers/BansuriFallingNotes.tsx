import type { MidiNoteEvent } from "@/src/lib/midiToSargam";
import { midiToRelativeNote } from "@/src/lib/midiToSargam";

type BansuriFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly rootMidi: number;
};

const ROLL_HEIGHT = 214;
const LOOK_AHEAD_MS = 2_800;
const FINGER_HOLE_POSITIONS = [35, 43, 51, 59, 67, 75] as const;

function getBarTop(event: MidiNoteEvent, currentTimeMs: number): number {
  const barHeight = Math.max(34, Math.min(112, event.durationMs * 0.16));
  const distanceFromStrikeLine =
    ((event.startMs - currentTimeMs) / LOOK_AHEAD_MS) * ROLL_HEIGHT;

  return ROLL_HEIGHT - barHeight - distanceFromStrikeLine;
}

/**
 * A horizontal Bansuri practice roll. Pitch lanes are relative to Sa and the
 * falling bars meet a six-finger-hole Bansuri reference at the strike line.
 */
export function BansuriFallingNotes({
  activeEventIndex,
  events,
  rootMidi,
}: BansuriFallingNotesProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;

  return (
    <section
      aria-label="Falling MIDI Bansuri roll"
      className="overflow-hidden rounded-2xl border border-teal/10 bg-charcoal shadow-inner"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-black text-white">Bansuri falling roll</p>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Relative pitch lanes · 6 finger holes + blow hole
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-soft">
          Sa reference
        </span>
      </div>

      <div className="relative h-[280px] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[72px] border-t-2 border-yellow-soft/80" />
        <span className="absolute bottom-[76px] left-3 rounded bg-yellow-soft px-1.5 py-0.5 text-[9px] font-black text-charcoal">
          strike line
        </span>

        {events.map((event, index) => {
          const relativeNote = midiToRelativeNote(event.midi, rootMidi);
          const isActive = index === activeEventIndex;
          const height = Math.max(34, Math.min(112, event.durationMs * 0.16));
          const left = 8 + (relativeNote.interval / 11) * 84;

          return (
            <div
              aria-hidden="true"
              className={[
                "absolute z-10 flex w-[7.6%] min-w-6 -translate-x-1/2 items-start justify-center rounded-t-md border border-white/15 pt-1 text-[9px] font-black transition-[top,background-color,opacity] duration-[420ms] ease-linear",
                isActive
                  ? "bg-yellow-soft text-charcoal shadow-[0_0_20px_rgba(255,240,153,0.45)]"
                  : "bg-mint-emerald/90 text-white",
              ].join(" ")}
              key={`${event.startMs}-${event.midi}`}
              style={{ height: `${height}px`, left: `${left}%`, top: `${getBarTop(event, currentTimeMs)}px` }}
            >
              {relativeNote.sargamToken}
            </div>
          );
        })}

        <div className="absolute inset-x-[7%] bottom-3 h-14 rounded-full border-2 border-yellow-soft/70 bg-yellow-soft shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
          <span className="absolute left-[8%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-teal bg-charcoal" />
          <span className="absolute -top-4 left-[6.5%] text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
            blow
          </span>
          {FINGER_HOLE_POSITIONS.map((position, index) => (
            <span
              aria-hidden="true"
              className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-teal bg-teal shadow-inner"
              key={position}
              style={{ left: `${position}%` }}
            >
              <span className="sr-only">Finger hole {index + 1}</span>
            </span>
          ))}
          <span className="absolute bottom-1.5 right-[5%] text-[9px] font-black uppercase tracking-[0.12em] text-teal/65">
            6 holes
          </span>
        </div>
      </div>
    </section>
  );
}
