import { BansuriFlute } from "@/src/components/instruments/BansuriFlute";
import {
  BANSURI_RUNWAY_LANES,
  getBansuriReferenceFingering,
  getBansuriRunwayLane,
  type BansuriHoleState,
} from "@/src/lib/bansuriFingering";
import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { usePlaybackClock } from "@/src/lib/usePlaybackClock";

type BansuriFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly isPlaying: boolean;
  readonly notationSystem: NotationSystem;
  readonly playbackRate: number;
  readonly rootMidi: number;
};

const LOOK_AHEAD_MS = 4_000;
const PLAYHEAD_PERCENT = 26;

function normalizedInterval(midi: number, rootMidi: number): number {
  return ((midi - rootMidi) % 12 + 12) % 12;
}

function getNoteWidth(durationMs: number): number {
  return Math.min(100, (durationMs / LOOK_AHEAD_MS) * 100);
}

function getNoteLeft(startMs: number, currentTimeMs: number): number {
  return PLAYHEAD_PERCENT + ((startMs - currentTimeMs) / LOOK_AHEAD_MS) * 100;
}

function formatPlaybackTimestamp(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function formatLaneLabel(
  interval: number,
  rootMidi: number,
  notationSystem: NotationSystem,
): string {
  return formatRelativeNote(
    midiToRelativeNote(rootMidi + interval, rootMidi),
    notationSystem,
  );
}

function FingeringLandmarks({
  activeInterval,
  holes,
  notationSystem,
  rootMidi,
}: {
  readonly activeInterval: number | null;
  readonly holes: readonly BansuriHoleState[];
  readonly notationSystem: NotationSystem;
  readonly rootMidi: number;
}) {
  return (
    <aside
      aria-label="Bansuri fingering landmarks"
      className="relative min-w-0 border-r border-white/[0.08] bg-[radial-gradient(ellipse_at_50%_45%,rgba(210,159,75,0.16),transparent_58%),linear-gradient(180deg,#0c141d_0%,#071018_100%)]"
    >
      <div className="absolute inset-y-0 left-1/2 w-[92px] -translate-x-1/2 drop-shadow-[0_20px_24px_rgba(0,0,0,0.42)] sm:w-[116px]">
        <BansuriFlute holes={holes} label="Current six-hole Bansuri fingering" />
      </div>

      {BANSURI_RUNWAY_LANES.filter((lane) => lane.isNaturalAnchor).map(
        (lane) => {
          const isSa = lane.interval === 0;
          const isActive = activeInterval === lane.interval;

          return (
            <span
              className={[
                "absolute left-[calc(50%+2.5rem)] -translate-y-1/2 rounded-md border px-1.5 py-1 text-[9px] font-black tracking-[0.04em] shadow-[0_4px_12px_rgba(0,0,0,0.24)] sm:left-[calc(50%+4.2rem)] sm:px-2 sm:text-[11px]",
                notationSystem === "Sargam_HI" ? "font-devanagari tracking-normal" : "",
                isActive
                  ? "border-yellow-soft bg-yellow-soft text-charcoal shadow-[0_0_18px_rgba(255,240,153,0.48)]"
                  : isSa
                    ? "border-mint-emerald/70 bg-mint-emerald/18 text-mint-emerald"
                    : "border-white/[0.16] bg-[#0c1621]/95 text-white/75",
              ].join(" ")}
              key={lane.interval}
              style={{ top: `${lane.top}%` }}
            >
              {formatLaneLabel(lane.interval, rootMidi, notationSystem)}
            </span>
          );
        },
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/55">
          six-hole reference
        </span>
      </div>
    </aside>
  );
}

/**
 * A vertical pitch runway for Bansuri. Natural Swaras share their exact Y
 * position with the related hole landmarks; altered swaras sit between them.
 */
export function BansuriFallingNotes({
  activeEventIndex,
  events,
  isPlaying,
  notationSystem,
  playbackRate,
  rootMidi,
}: BansuriFallingNotesProps) {
  const currentTimeMs = usePlaybackClock({
    baseTimeMs: events[activeEventIndex]?.startMs ?? 0,
    endTimeMs:
      activeEventIndex === events.length - 1
        ? (events[activeEventIndex]?.startMs ?? 0) +
          (events[activeEventIndex]?.durationMs ?? 0)
        : undefined,
    isPlaying,
    playbackRate,
  });

  const activeEvent = events[activeEventIndex];
  const activeInterval = activeEvent
    ? normalizedInterval(activeEvent.midi, rootMidi)
    : null;
  const activeFingering = getBansuriReferenceFingering(
    activeEvent?.midi ?? null,
    rootMidi,
  );
  const activeNotation = activeEvent
    ? formatRelativeNote(
        midiToRelativeNote(activeEvent.midi, rootMidi),
        notationSystem,
      )
    : "Choose a note";

  return (
    <section
      aria-label="Bansuri melody runway"
      className="overflow-hidden rounded-[0.9rem] border border-white/[0.1] bg-[#06090e] shadow-[0_24px_64px_rgba(0,0,0,0.32)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,30,43,0.94),rgba(9,15,23,0.96))] px-4 py-4 sm:px-5">
        <div>
          <h3 className="font-heading text-xl leading-none text-white sm:text-2xl">
            Bansuri melody runway
          </h3>
          <p className="mt-1 text-[10px] font-semibold text-white/65">
            Natural Swaras share a line with their fingering landmark.
          </p>
        </div>
        <span
          className={[
            "rounded-full border border-yellow-soft/50 bg-yellow-soft px-3 py-1.5 text-[10px] font-black text-charcoal shadow-[0_0_16px_rgba(255,240,153,0.28)]",
            notationSystem === "Sargam_HI" ? "font-devanagari" : "",
          ].join(" ")}
        >
          {activeNotation}
        </span>
      </div>

      <div className="grid h-[520px] grid-cols-[clamp(148px,22vw,252px)_minmax(0,1fr)] bg-[#070a0f] sm:h-[590px]">
        <FingeringLandmarks
          activeInterval={activeInterval}
          holes={activeFingering?.holes ?? []}
          notationSystem={notationSystem}
          rootMidi={rootMidi}
        />

        <div className="relative min-w-0 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100%_46px]" />
          {BANSURI_RUNWAY_LANES.map((lane) => {
            const isSa = lane.interval === 0;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute inset-x-0 border-t",
                  isSa
                    ? "border-mint-emerald/65 bg-mint-emerald/[0.06]"
                    : lane.isNaturalAnchor
                      ? "border-white/[0.14]"
                      : "border-white/[0.05] border-dashed",
                ].join(" ")}
                key={lane.interval}
                style={{ top: `${lane.top}%` }}
              />
            );
          })}

          <div aria-hidden="true" className="absolute inset-y-0 w-px bg-yellow-soft shadow-[0_0_18px_rgba(255,240,153,0.84)]" style={{ left: `${PLAYHEAD_PERCENT}%` }} />
          <span aria-label={`Playhead at ${formatPlaybackTimestamp(currentTimeMs)}`} className="absolute top-3 -translate-x-1/2 rounded-full bg-yellow-soft px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-charcoal" style={{ left: `${PLAYHEAD_PERCENT}%` }}>
            {formatPlaybackTimestamp(currentTimeMs)} · play
          </span>

          {events.map((event, index) => {
            const interval = normalizedInterval(event.midi, rootMidi);
            const lane = getBansuriRunwayLane(interval);
            const isActive = index === activeEventIndex;
            const isPast = index < activeEventIndex;
            const left = getNoteLeft(event.startMs, currentTimeMs);
            const width = getNoteWidth(event.durationMs);
            const note = midiToRelativeNote(event.midi, rootMidi);

            if (left < -width || left > 108) return null;

            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute z-10 flex h-[24px] items-center overflow-hidden rounded-full border px-2.5 text-[10px] font-black backdrop-blur-md transition-[left,background-color,box-shadow,opacity,transform] duration-[120ms] ease-out sm:h-[28px]",
                  notationSystem === "Sargam_HI" ? "font-devanagari" : "",
                  isActive
                    ? "border-yellow-soft/90 bg-[linear-gradient(90deg,rgba(255,223,100,0.98),rgba(255,247,191,0.9))] text-charcoal shadow-[0_8px_22px_rgba(255,240,153,0.38),inset_0_1px_0_rgba(255,255,255,0.84)]"
                    : isPast
                      ? "border-mint-emerald/30 bg-[linear-gradient(90deg,rgba(15,105,89,0.32),rgba(69,191,155,0.22))] text-white/45 opacity-35 shadow-[0_3px_10px_rgba(40,177,130,0.1)]"
                      : "border-mint-emerald/65 bg-[linear-gradient(90deg,rgba(15,105,89,0.9),rgba(69,191,155,0.72))] text-white shadow-[0_6px_17px_rgba(40,177,130,0.25),inset_0_1px_0_rgba(255,255,255,0.32)]",
                ].join(" ")}
                key={`${event.startMs}-${event.midi}`}
                style={{
                  left: `${left}%`,
                  top: `calc(${lane.top}% - 12px)`,
                  width: `${width}%`,
                }}
              >
                <span className="truncate">
                  {formatRelativeNote(note, notationSystem)}
                </span>
              </div>
            );
          })}

          <div className="absolute bottom-4 left-3 right-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.13em] text-white/50">
            <span>past</span>
            <span>next phrase</span>
          </div>
        </div>
      </div>

      <p className="border-t border-white/[0.07] bg-[#09111b] px-4 py-2.5 text-[9px] font-semibold leading-4 text-white/58 sm:px-5">
        Generic six-hole reference. Calibrate for flute key, maker, embouchure,
        octave, and half-hole technique before treating a fingering as final.
      </p>
    </section>
  );
}
