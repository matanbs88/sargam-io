import type { MidiNoteEvent } from "@/src/lib/midiToSargam";
import { midiToRelativeNote } from "@/src/lib/midiToSargam";

type FallingNotesPianoRollProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly rootMidi: number;
};

type PianoKey = {
  readonly midi: number;
  readonly isBlack: boolean;
  readonly left: number;
  readonly width: number;
};

const WHITE_NOTES = new Set([0, 2, 4, 5, 7, 9, 11]);
const BLACK_KEY_CENTER_OFFSET = 0.69;
const FIRST_MIDI = 60;
const LAST_MIDI = 84;
const ROLL_HEIGHT = 214;
const LOOK_AHEAD_MS = 2_800;

function isWhiteKey(midi: number): boolean {
  return WHITE_NOTES.has(((midi % 12) + 12) % 12);
}

function createPianoKeys(): readonly PianoKey[] {
  const whiteKeys = Array.from(
    { length: LAST_MIDI - FIRST_MIDI + 1 },
    (_, index) => FIRST_MIDI + index,
  ).filter(isWhiteKey);
  const whiteIndexByMidi = new Map(whiteKeys.map((midi, index) => [midi, index]));

  return Array.from({ length: LAST_MIDI - FIRST_MIDI + 1 }, (_, index) => {
    const midi = FIRST_MIDI + index;
    const isBlack = !isWhiteKey(midi);

    if (!isBlack) {
      return {
        midi,
        isBlack,
        left: ((whiteIndexByMidi.get(midi) ?? 0) / whiteKeys.length) * 100,
        width: 100 / whiteKeys.length,
      };
    }

    const precedingWhiteMidi = midi - 1;
    const precedingWhiteIndex = whiteIndexByMidi.get(precedingWhiteMidi) ?? 0;

    return {
      midi,
      isBlack,
      left:
        ((precedingWhiteIndex + BLACK_KEY_CENTER_OFFSET) / whiteKeys.length) *
        100,
      width: (100 / whiteKeys.length) * 0.62,
    };
  });
}

const PIANO_KEYS = createPianoKeys();

function getBarTop(event: MidiNoteEvent, currentTimeMs: number): number {
  const barHeight = Math.max(34, Math.min(112, event.durationMs * 0.16));
  const distanceFromStrikeLine =
    ((event.startMs - currentTimeMs) / LOOK_AHEAD_MS) * ROLL_HEIGHT;

  return ROLL_HEIGHT - barHeight - distanceFromStrikeLine;
}

/**
 * A timing-accurate piano roll for the local MIDI event clock. Bars land on
 * their matching piano key; their height represents event duration.
 */
export function FallingNotesPianoRoll({
  activeEventIndex,
  events,
  rootMidi,
}: FallingNotesPianoRollProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;
  const keyByMidi = new Map(PIANO_KEYS.map((key) => [key.midi, key]));

  return (
    <section
      aria-label="Falling MIDI piano roll"
      className="overflow-hidden rounded-2xl border border-teal/10 bg-charcoal shadow-inner"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-black text-white">Falling MIDI roll</p>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Bar height = note duration · bars land on their keys
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-soft">
          C4 — C6
        </span>
      </div>

      <div className="relative h-[280px] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-14 border-t-2 border-yellow-soft/80" />
        <span className="absolute bottom-[58px] left-3 rounded bg-yellow-soft px-1.5 py-0.5 text-[9px] font-black text-charcoal">
          strike line
        </span>

        {events.map((event, index) => {
          const key = keyByMidi.get(event.midi);
          if (key === undefined) return null;

          const isActive = index === activeEventIndex;
          const note = midiToRelativeNote(event.midi, rootMidi);
          const height = Math.max(34, Math.min(112, event.durationMs * 0.16));

          return (
            <div
              aria-hidden="true"
              className={[
                "absolute z-10 flex items-start justify-center rounded-t-md border border-white/15 pt-1 text-[9px] font-black transition-[top,background-color,opacity] duration-[420ms] ease-linear",
                key.isBlack ? "min-w-3" : "min-w-4",
                isActive
                  ? "bg-yellow-soft text-charcoal shadow-[0_0_20px_rgba(255,240,153,0.45)]"
                  : "bg-mint-emerald/90 text-white",
              ].join(" ")}
              key={`${event.startMs}-${event.midi}`}
              style={{
                height: `${height}px`,
                left: `${key.left}%`,
                top: `${getBarTop(event, currentTimeMs)}px`,
                width: `${key.width}%`,
              }}
            >
              <span className="hidden sm:inline">{note.sargamToken}</span>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 h-14 bg-white">
          {PIANO_KEYS.filter((key) => !key.isBlack).map((key) => {
            const isRoot = key.midi === rootMidi;
            const isActive = key.midi === events[activeEventIndex]?.midi;
            return (
              <div
                aria-hidden="true"
                className="absolute bottom-0 h-14 border-r border-teal/15 bg-white"
                key={key.midi}
                style={{ left: `${key.left}%`, width: `${key.width}%` }}
              >
                {isRoot ? <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-mint-emerald" /> : null}
                {isActive ? <span className="absolute inset-x-1 bottom-1 h-1 rounded-full bg-yellow-soft" /> : null}
              </div>
            );
          })}
          {PIANO_KEYS.filter((key) => key.isBlack).map((key) => {
            const isActive = key.midi === events[activeEventIndex]?.midi;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute top-0 z-20 h-8 -translate-x-1/2 rounded-b border border-white/15 bg-teal",
                  isActive ? "bg-yellow-soft" : "",
                ].join(" ")}
                key={key.midi}
                style={{ left: `${key.left + key.width / 2}%`, width: `${key.width}%` }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
