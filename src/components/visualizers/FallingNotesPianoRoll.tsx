import { useEffect, useRef } from "react";
import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import {
  PERFORMANCE_PIANO_KEYS,
} from "@/src/lib/pianoGeometry";

type FallingNotesPianoRollProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly notationSystem: NotationSystem;
  readonly rootMidi: number;
};

const ROLL_HEIGHT = 482;
const LOOK_AHEAD_MS = 4_000;

function getBarHeight(durationMs: number): number {
  return Math.max(58, Math.min(218, durationMs * 0.34));
}

function getBarTop(event: MidiNoteEvent, currentTimeMs: number): number {
  const barHeight = getBarHeight(event.durationMs);
  const distanceFromStrikeLine =
    ((event.startMs - currentTimeMs) / LOOK_AHEAD_MS) * ROLL_HEIGHT;

  return ROLL_HEIGHT - barHeight - distanceFromStrikeLine;
}

function formatPlaybackTimestamp(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
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
  const keyByMidi = new Map(
    PERFORMANCE_PIANO_KEYS.map((key) => [key.midi, key]),
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeMidi = events[activeEventIndex]?.midi ?? rootMidi;
  const activeKey = PERFORMANCE_PIANO_KEYS.find(
    (key) => key.midi === activeMidi,
  );

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (
      scrollContainer === null ||
      activeKey === undefined ||
      scrollContainer.scrollWidth <= scrollContainer.clientWidth
    ) {
      return;
    }

    const activeKeyCenter =
      ((activeKey.left + activeKey.width / 2) / 100) *
      scrollContainer.scrollWidth;
    const targetScrollLeft = Math.max(
      0,
      activeKeyCenter - scrollContainer.clientWidth / 2,
    );

    scrollContainer.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }, [activeKey]);

  return (
    <section
      aria-label="Falling MIDI piano roll"
      className="relative overflow-hidden rounded-[0.9rem] border border-white/[0.08] bg-[#06090e] shadow-[0_24px_64px_rgba(0,0,0,0.32)]"
    >
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-[linear-gradient(180deg,rgba(5,9,14,0.76),transparent)] px-4 py-3 sm:px-5">
        <div>
          <h3 className="font-heading text-xl leading-none text-white sm:text-2xl">Performance piano roll</h3>
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

      <div
        className="h-[620px] snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
        ref={scrollContainerRef}
      >
      <div className="relative h-[620px] min-w-[760px] bg-[#070a0f]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[482px] bg-[radial-gradient(ellipse_at_center_bottom,rgba(88,166,255,0.1),transparent_58%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[482px]">
          {PERFORMANCE_PIANO_KEYS.filter((key) => !key.isBlack).map((key) => (
            <span className="absolute bottom-0 top-0 border-r border-white/[0.075]" key={key.midi} style={{ left: `${key.left}%`, width: `${key.width}%` }} />
          ))}
        </div>
        <div aria-label={`Strike line at ${formatPlaybackTimestamp(currentTimeMs)}`} className="absolute inset-x-0 top-[481px] z-[25] h-[2px] bg-performance-blue shadow-[0_0_4px_rgba(88,166,255,0.95),0_0_22px_rgba(88,166,255,0.72)]" role="separator" />

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
                "absolute z-10 flex items-end justify-center overflow-hidden rounded-full border border-white/30 pb-2 text-[10px] font-black backdrop-blur-md transition-[top,background-color,opacity,box-shadow,transform] duration-[420ms] ease-out",
                isActive
                  ? "bg-[linear-gradient(180deg,rgba(255,248,197,0.94),rgba(255,218,104,0.78))] text-charcoal shadow-[0_8px_20px_rgba(255,240,153,0.28),inset_0_1px_0_rgba(255,255,255,0.82)]"
                  : index < activeEventIndex
                    ? "bg-[linear-gradient(180deg,rgba(63,170,153,0.3),rgba(19,96,82,0.22))] text-white/45 opacity-35 shadow-[0_3px_10px_rgba(40,177,130,0.1)]"
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

        <div className="absolute inset-x-0 bottom-0 h-[138px] border-t border-[#1f2937]/80 bg-[#d8d7d2] shadow-[inset_0_12px_18px_rgba(0,0,0,0.12)]">
          {PERFORMANCE_PIANO_KEYS.filter((key) => !key.isBlack).map((key) => {
            const isRoot = key.midi === rootMidi;
            const isActive = key.midi === events[activeEventIndex]?.midi;
            const isC = key.midi % 12 === 0;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute bottom-0 h-[138px] snap-start rounded-b-[0.32rem] border-r border-[#1f2937]/70 bg-white shadow-[inset_0_-10px_12px_rgba(24,32,42,0.14),inset_0_1px_0_rgba(255,255,255,0.98)] transition-[transform,box-shadow,background] duration-150 last:border-r-0",
                  isActive
                    ? "translate-y-1 bg-yellow-soft shadow-[inset_0_-5px_8px_rgba(145,105,10,0.28),inset_0_2px_8px_rgba(255,255,255,0.95),0_0_18px_rgba(255,240,153,0.6)]"
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
          {PERFORMANCE_PIANO_KEYS.filter((key) => key.isBlack).map((key) => {
            const isActive = key.midi === events[activeEventIndex]?.midi;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute top-0 z-20 h-[88px] rounded-b-[0.3rem] border border-charcoal/90 border-t-white/20 bg-charcoal shadow-[0_8px_10px_rgba(0,0,0,0.55),inset_0_2px_1px_rgba(255,255,255,0.16)] transition-[transform,box-shadow,background] duration-150",
                  isActive ? "translate-y-1 border-yellow-soft bg-yellow-soft shadow-[0_2px_5px_rgba(0,0,0,0.35),0_0_16px_rgba(255,240,153,0.62),inset_0_2px_6px_rgba(255,255,255,0.72)]" : "",
                ].join(" ")}
                key={key.midi}
                style={{ left: `${key.left}%`, width: `${key.width}%` }}
              />
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
