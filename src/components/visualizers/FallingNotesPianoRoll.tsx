import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
} from "@/src/lib/midiToSargam";

type FallingNotesPianoRollProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly notationSystem: NotationSystem;
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
// Four octaves give the performance canvas the physical breadth of a real
// keyboard while keeping all of the transposed mock phrase in view.
const FIRST_MIDI = 48; // C3
const LAST_MIDI = 96; // C7
const ROLL_HEIGHT = 482;
const LOOK_AHEAD_MS = 4_000;

function getBarHeight(durationMs: number): number {
  return Math.max(58, Math.min(218, durationMs * 0.34));
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
  notationSystem,
  rootMidi,
}: FallingNotesPianoRollProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;
  const keyByMidi = new Map(PIANO_KEYS.map((key) => [key.midi, key]));

  return (
    <section
      aria-label="Falling MIDI piano roll"
      className="relative overflow-hidden rounded-[0.9rem] border border-white/[0.08] bg-[#06090e] shadow-[0_24px_64px_rgba(0,0,0,0.32)]"
    >
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-[linear-gradient(180deg,rgba(5,9,14,0.76),transparent)] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/85">Performance piano roll</p>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Bar height = note duration · bars land on their keys
          </p>
        </div>
        <span aria-label="C3 through C7" className="sr-only">
          C4 — C6
        </span>
      </div>

      <span className="absolute right-4 top-3 z-40 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-yellow-soft sm:right-5">
        C3 — C7
      </span>

      <div className="relative h-[520px] overflow-hidden bg-[#070a0f] sm:h-[620px]">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[138px] top-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_64px]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[138px] top-0">
          {PIANO_KEYS.filter((key) => !key.isBlack).map((key) => (
            <span className="absolute bottom-0 top-0 border-r border-white/[0.075]" key={key.midi} style={{ left: `${key.left}%`, width: `${key.width}%` }} />
          ))}
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[138px] h-32 bg-[radial-gradient(ellipse_at_center_bottom,rgba(88,166,255,0.13),transparent_68%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[138px] border-t border-performance-blue/80 shadow-[0_-1px_18px_rgba(88,166,255,0.42)]" />
        <span className="absolute bottom-[144px] left-4 rounded-full border border-performance-blue/35 bg-[#0b111a]/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-performance-blue">
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
                "absolute z-10 flex items-start justify-center rounded-md border border-white/30 pt-2 text-[10px] font-black backdrop-blur-md transition-[top,background-color,opacity,box-shadow] duration-[420ms] ease-linear",
                key.isBlack ? "min-w-3" : "min-w-4",
                isActive
                  ? "bg-[linear-gradient(180deg,rgba(255,248,197,0.94),rgba(255,218,104,0.78))] text-charcoal shadow-[0_8px_20px_rgba(255,240,153,0.28),inset_0_1px_0_rgba(255,255,255,0.82)]"
                  : "bg-[linear-gradient(180deg,rgba(63,170,153,0.84),rgba(19,96,82,0.68))] text-white shadow-[0_6px_16px_rgba(40,177,130,0.22),inset_0_1px_0_rgba(255,255,255,0.38)]",
              ].join(" ")}
              key={`${event.startMs}-${event.midi}`}
              style={{
                height: `${height}px`,
                left: `${key.left}%`,
                top: `${getBarTop(event, currentTimeMs)}px`,
                width: `${key.width}%`,
              }}
            >
              <span
                className={
                  notationSystem === "Sargam_HI"
                    ? "hidden font-devanagari sm:inline"
                    : "hidden sm:inline"
                }
              >
                {formatRelativeNote(note, notationSystem)}
              </span>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 h-[108px] border-t border-white/30 bg-[#d6d4cf] shadow-[inset_0_12px_18px_rgba(0,0,0,0.12)] sm:h-[138px]">
          {PIANO_KEYS.filter((key) => !key.isBlack).map((key) => {
            const isRoot = key.midi === rootMidi;
            const isActive = key.midi === events[activeEventIndex]?.midi;
            const isC = key.midi % 12 === 0;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute bottom-0 h-[108px] rounded-b-[0.42rem] border-r border-[#1f2937]/65 bg-[linear-gradient(90deg,#e7e5df_0%,#fffefa_45%,#d8d5cf_100%)] shadow-[inset_0_-11px_13px_rgba(38,32,24,0.18),inset_0_1px_0_rgba(255,255,255,0.98)] transition-[transform,box-shadow,background] duration-150 sm:h-[138px]",
                  isActive
                    ? "translate-y-1 bg-[linear-gradient(90deg,#bad6ed_0%,#eaf8ff_45%,#9fc8e6_100%)] shadow-[inset_0_-5px_8px_rgba(26,76,115,0.32),inset_0_2px_8px_rgba(255,255,255,0.95),0_0_18px_rgba(88,166,255,0.42)]"
                    : "",
                ].join(" ")}
                key={key.midi}
                style={{ left: `${key.left}%`, width: `${key.width}%` }}
              >
                {isC ? (
                  <span className="absolute left-1/2 top-3 -translate-x-1/2 text-[8px] font-black tracking-[0.08em] text-charcoal/35 sm:text-[9px]">
                    C{Math.floor(key.midi / 12) - 1}
                  </span>
                ) : null}
                {isRoot ? <span className="absolute bottom-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-mint-emerald shadow-[0_0_10px_rgba(40,177,130,0.9)]" /> : null}
                {isActive ? <span className="absolute inset-x-1.5 bottom-2 h-2 rounded-full bg-performance-blue shadow-[0_0_11px_rgba(88,166,255,0.95)]" /> : null}
              </div>
            );
          })}
          {PIANO_KEYS.filter((key) => key.isBlack).map((key) => {
            const isActive = key.midi === events[activeEventIndex]?.midi;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute top-0 z-20 h-[70px] -translate-x-1/2 rounded-b-md border border-white/10 bg-[linear-gradient(90deg,#05080d_0%,#1a2432_48%,#05080d_100%)] shadow-[0_9px_10px_rgba(0,0,0,0.58),inset_0_2px_1px_rgba(255,255,255,0.18)] transition-[transform,box-shadow,background] duration-150 sm:h-[88px]",
                  isActive ? "translate-y-1 border-performance-blue/80 bg-[linear-gradient(90deg,#1c4e80_0%,#70bcff_50%,#1c4e80_100%)] shadow-[0_3px_6px_rgba(0,0,0,0.42),0_0_18px_rgba(88,166,255,0.64),inset_0_2px_6px_rgba(225,248,255,0.8)]" : "",
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
