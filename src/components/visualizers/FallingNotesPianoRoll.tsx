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
const ROLL_HEIGHT = 312;
const LOOK_AHEAD_MS = 4_000;

function getBarHeight(durationMs: number): number {
  return Math.max(48, Math.min(152, durationMs * 0.26));
}

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
  const barHeight = getBarHeight(event.durationMs);
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
      className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-[#06090e] shadow-[0_24px_54px_rgba(1,6,13,0.42)]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0b111a] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/85">Performance piano roll</p>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Bar height = note duration · bars land on their keys
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-soft">
          C4 — C6
        </span>
      </div>

      <div className="relative h-[410px] overflow-hidden bg-[#070a0f]">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[88px] top-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_52px]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[88px] top-0">
          {PIANO_KEYS.filter((key) => !key.isBlack).map((key) => (
            <span className="absolute bottom-0 top-0 border-r border-white/[0.075]" key={key.midi} style={{ left: `${key.left}%`, width: `${key.width}%` }} />
          ))}
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[88px] h-24 bg-[radial-gradient(ellipse_at_center_bottom,rgba(88,166,255,0.09),transparent_68%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[88px] border-t border-performance-blue/80 shadow-[0_-1px_14px_rgba(88,166,255,0.34)]" />
        <span className="absolute bottom-[94px] left-3 rounded-full border border-performance-blue/35 bg-[#0b111a] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-performance-blue">
          strike line
        </span>

        {events.map((event, index) => {
          const key = keyByMidi.get(event.midi);
          if (key === undefined) return null;

          const isActive = index === activeEventIndex;
          const note = midiToRelativeNote(event.midi, rootMidi);
          const height = getBarHeight(event.durationMs);

          return (
            <div
              aria-hidden="true"
              className={[
                "absolute z-10 flex items-start justify-center rounded-md border border-white/25 pt-1.5 text-[9px] font-black backdrop-blur-[2px] transition-[top,background-color,opacity,box-shadow] duration-[420ms] ease-linear",
                key.isBlack ? "min-w-3" : "min-w-4",
                isActive
                  ? "bg-[linear-gradient(180deg,rgba(255,244,177,0.98),rgba(255,218,93,0.88))] text-charcoal shadow-[0_0_28px_rgba(255,240,153,0.56),inset_0_1px_0_rgba(255,255,255,0.74)]"
                  : "bg-[linear-gradient(180deg,rgba(105,183,255,0.96),rgba(49,122,208,0.82))] text-white shadow-[0_0_22px_rgba(88,166,255,0.44),inset_0_1px_0_rgba(255,255,255,0.4)]",
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

        <div className="absolute inset-x-0 bottom-0 h-[88px] border-t border-white/30 bg-[#d6d4cf] shadow-[inset_0_12px_18px_rgba(0,0,0,0.12)]">
          {PIANO_KEYS.filter((key) => !key.isBlack).map((key) => {
            const isRoot = key.midi === rootMidi;
            const isActive = key.midi === events[activeEventIndex]?.midi;
            return (
              <div
                aria-hidden="true"
                className="absolute bottom-0 h-[88px] rounded-b-sm border-r border-[#1f2937]/65 bg-[linear-gradient(90deg,#ecebe7_0%,#fffefa_45%,#dfddd7_100%)] shadow-[inset_0_-8px_10px_rgba(38,32,24,0.17),inset_0_1px_0_rgba(255,255,255,0.96)]"
                key={key.midi}
                style={{ left: `${key.left}%`, width: `${key.width}%` }}
              >
                {isRoot ? <span className="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-mint-emerald shadow-[0_0_8px_rgba(40,177,130,0.8)]" /> : null}
                {isActive ? <span className="absolute inset-x-1 bottom-1.5 h-1.5 rounded-full bg-performance-blue shadow-[0_0_8px_rgba(88,166,255,0.9)]" /> : null}
              </div>
            );
          })}
          {PIANO_KEYS.filter((key) => key.isBlack).map((key) => {
            const isActive = key.midi === events[activeEventIndex]?.midi;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute top-0 z-20 h-[56px] -translate-x-1/2 rounded-b-md border border-white/10 bg-[linear-gradient(90deg,#05080d_0%,#1a2432_48%,#05080d_100%)] shadow-[0_7px_8px_rgba(0,0,0,0.54),inset_0_2px_1px_rgba(255,255,255,0.15)]",
                  isActive ? "translate-y-0.5 border-performance-blue/80 bg-[linear-gradient(90deg,#245b91_0%,#69b7ff_50%,#245b91_100%)] shadow-[0_2px_5px_rgba(0,0,0,0.38),0_0_14px_rgba(88,166,255,0.55)]" : "",
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
