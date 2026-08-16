import {
  BANSURI_FINGER_HOLE_POSITIONS,
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

type BansuriFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly notationSystem: NotationSystem;
  readonly rootMidi: number;
};

const LOOK_AHEAD_MS = 4_000;
const PLAYHEAD_PERCENT = 28;

function normalizedInterval(midi: number, rootMidi: number): number {
  return ((midi - rootMidi) % 12 + 12) % 12;
}

function getNoteWidth(durationMs: number): number {
  return Math.max(8, Math.min(31, (durationMs / LOOK_AHEAD_MS) * 100));
}

function getNoteLeft(startMs: number, currentTimeMs: number): number {
  return PLAYHEAD_PERCENT + ((startMs - currentTimeMs) / LOOK_AHEAD_MS) * 100;
}

function holeClass(state: BansuriHoleState): string {
  if (state === "closed") {
    return "border-mint-emerald/80 bg-teal shadow-[0_3px_7px_rgba(3,44,37,0.42),inset_0_1px_1px_rgba(255,255,255,0.25)]";
  }

  if (state === "half-open") {
    return "border-charcoal/80 bg-[linear-gradient(to_top,#136052_50%,#141b23_50%)] shadow-[inset_0_3px_5px_rgba(0,0,0,0.6)]";
  }

  return "border-charcoal/85 bg-charcoal shadow-[inset_0_3px_5px_rgba(0,0,0,0.65),inset_0_-1px_1px_rgba(255,255,255,0.08)]";
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

function BansuriFingeringRail({
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
      className="relative h-full overflow-hidden border-r border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_34%,rgba(255,255,255,0.012))]"
    >
      <div className="absolute bottom-[8%] left-[18%] top-[8%] w-14 rounded-full border border-[#dfbd79]/30 bg-[linear-gradient(90deg,#5d3d1c_0%,#9e6a34_18%,#e2be7a_50%,#9c6732_78%,#5b3b1b_100%)] shadow-[inset_1px_0_2px_rgba(255,255,255,0.24),inset_-3px_0_5px_rgba(35,21,8,0.24),0_10px_22px_rgba(0,0,0,0.22)] sm:left-[23%] sm:w-16">
        <span aria-hidden="true" className="absolute inset-x-1 top-[3%] border-t border-[#402610]/45" />
        <span aria-hidden="true" className="absolute inset-x-1 bottom-[3%] border-t border-[#402610]/45" />
      </div>

      <span
        aria-label="Embouchure hole"
        className="absolute left-[18%] top-[18%] h-4 w-4 rounded-full border border-charcoal/90 bg-charcoal shadow-[inset_0_3px_5px_rgba(0,0,0,0.72)] sm:left-[23%]"
      />

      {BANSURI_FINGER_HOLE_POSITIONS.map((top, index) => (
        <span
          aria-label={`Finger hole ${index + 1}: ${holes[index] ?? "open"}`}
          className={[
            "absolute left-[18%] h-5 w-5 -translate-x-0.5 -translate-y-1/2 rounded-full border transition duration-200 sm:left-[23%] sm:h-[22px] sm:w-[22px]",
            holeClass(holes[index] ?? "open"),
          ].join(" ")}
          key={index}
          role="img"
          style={{ top: `${top}%` }}
        />
      ))}

      {BANSURI_RUNWAY_LANES.filter((lane) => lane.isNaturalAnchor).map(
        (lane) => {
          const isSa = lane.interval === 0;
          const isActive = activeInterval === lane.interval;

          return (
            <span
              className={[
                "absolute left-[calc(18%+2.15rem)] -translate-y-1/2 rounded-r-md border px-1.5 py-1 text-[10px] font-black tracking-[0.04em] shadow-[0_3px_10px_rgba(0,0,0,0.18)] sm:left-[calc(23%+2.5rem)] sm:px-2 sm:text-[11px]",
                notationSystem === "Sargam_HI" ? "font-devanagari tracking-normal" : "",
                isActive
                  ? "border-yellow-soft bg-yellow-soft text-charcoal shadow-[0_0_16px_rgba(255,240,153,0.34)]"
                  : isSa
                    ? "border-mint-emerald/70 bg-mint-emerald/18 text-mint-emerald"
                    : "border-white/[0.14] bg-[#0a1019]/92 text-white/75",
              ].join(" ")}
              key={lane.interval}
              style={{ top: `${lane.top}%` }}
            >
              {formatLaneLabel(lane.interval, rootMidi, notationSystem)}
            </span>
          );
        },
      )}

      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[8px] font-black uppercase tracking-[0.18em] text-white/40">
        fingering
      </span>
    </aside>
  );
}

/**
 * A Bansuri runway anchors swaras to their six-hole reference landmarks.
 * It deliberately does not pretend a six-hole instrument is a twelve-key
 * piano: Sa sits at the three-closed-hole midpoint, while komal/tivra notes
 * appear between their surrounding natural-fingering anchors.
 */
export function BansuriFallingNotes({
  activeEventIndex,
  events,
  notationSystem,
  rootMidi,
}: BansuriFallingNotesProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;
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
      className="relative overflow-hidden rounded-[0.9rem] border border-white/[0.08] bg-[#06090e]"
    >
      <div className="absolute inset-x-0 top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-[linear-gradient(180deg,rgba(5,9,14,0.86),transparent)] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/85">
            Bansuri melody runway
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-white/45">
            Natural swaras align to fingering landmarks · beam width = duration
          </p>
          <p className="mt-1 max-w-md text-[9px] font-semibold leading-4 text-yellow-soft/75">
            Generic six-hole reference — adjust for flute key, maker, embouchure, and half-hole technique.
          </p>
        </div>
        <span
          className={[
            "rounded-full bg-yellow-soft px-3 py-1.5 text-[10px] font-black text-charcoal shadow-[0_0_16px_rgba(255,240,153,0.22)]",
            notationSystem === "Sargam_HI" ? "font-devanagari" : "",
          ].join(" ")}
        >
          {activeNotation}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="grid h-[500px] grid-cols-[132px_minmax(0,1fr)] bg-[#070a0f] sm:h-[560px] sm:grid-cols-[176px_minmax(0,1fr)]"
      >
        <BansuriFingeringRail
          activeInterval={activeInterval}
          holes={activeFingering?.holes ?? []}
          notationSystem={notationSystem}
          rootMidi={rootMidi}
        />

        <div className="relative min-w-0 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 right-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:100%_46px]" />
          {BANSURI_RUNWAY_LANES.map((lane) => {
            const isSa = lane.interval === 0;
            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute inset-x-0 border-t",
                  isSa
                    ? "border-mint-emerald/55 bg-mint-emerald/[0.055]"
                    : lane.isNaturalAnchor
                      ? "border-white/[0.12]"
                      : "border-white/[0.05] border-dashed",
                ].join(" ")}
                key={lane.interval}
                style={{ top: `${lane.top}%` }}
              />
            );
          })}

          <div aria-hidden="true" className="absolute inset-y-[12%] w-px bg-yellow-soft shadow-[0_0_16px_rgba(255,240,153,0.78)]" style={{ left: `${PLAYHEAD_PERCENT}%` }} />
          <span className="absolute top-[10%] -translate-x-1/2 rounded-full bg-yellow-soft px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-charcoal" style={{ left: `${PLAYHEAD_PERCENT}%` }}>
            play
          </span>

          {events.map((event, index) => {
            const interval = normalizedInterval(event.midi, rootMidi);
            const lane = getBansuriRunwayLane(interval);
            const isActive = index === activeEventIndex;
            const left = getNoteLeft(event.startMs, currentTimeMs);
            const width = getNoteWidth(event.durationMs);
            const note = midiToRelativeNote(event.midi, rootMidi);

            if (left < -width || left > 108) return null;

            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute z-10 flex h-[22px] items-center rounded-full border px-2.5 text-[10px] font-black backdrop-blur-md transition-[left,background-color,box-shadow] duration-[420ms] ease-linear sm:h-[25px]",
                  notationSystem === "Sargam_HI" ? "font-devanagari" : "",
                  isActive
                    ? "border-yellow-soft/90 bg-[linear-gradient(90deg,rgba(255,226,104,0.96),rgba(255,246,184,0.84))] text-charcoal shadow-[0_7px_18px_rgba(255,240,153,0.3),inset_0_1px_0_rgba(255,255,255,0.82)]"
                    : "border-mint-emerald/65 bg-[linear-gradient(90deg,rgba(38,145,126,0.86),rgba(67,178,151,0.64))] text-white shadow-[0_5px_14px_rgba(40,177,130,0.22),inset_0_1px_0_rgba(255,255,255,0.32)]",
                ].join(" ")}
                key={`${event.startMs}-${event.midi}`}
                style={{
                  left: `${left}%`,
                  top: `calc(${lane.top}% - 11px)`,
                  width: `${width}%`,
                }}
              >
                <span className="truncate">
                  {formatRelativeNote(note, notationSystem)}
                </span>
              </div>
            );
          })}

          <div className="absolute bottom-5 left-3 right-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.12em] text-white/25">
            <span>past</span>
            <span>next phrase</span>
          </div>
        </div>
      </div>
    </section>
  );
}
