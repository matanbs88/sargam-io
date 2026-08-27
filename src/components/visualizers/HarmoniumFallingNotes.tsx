import {
  formatRelativeNote,
  midiToRelativeNote,
  type MidiNoteEvent,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { PERFORMANCE_PIANO_KEYS } from "@/src/lib/pianoGeometry";
import type {
  HarmoniumReedMode,
  HarmoniumReverbMode,
} from "@/src/features/practice/useDigitalAccompaniment";

type HarmoniumFallingNotesProps = {
  readonly activeEventIndex: number;
  readonly events: readonly MidiNoteEvent[];
  readonly harmoniumReedMode: HarmoniumReedMode;
  readonly harmoniumReverbMode: HarmoniumReverbMode;
  readonly notationSystem: NotationSystem;
  readonly onHarmoniumReedModeChange: (mode: HarmoniumReedMode) => void;
  readonly onHarmoniumReverbModeChange: (mode: HarmoniumReverbMode) => void;
  readonly rootMidi: number;
};

const ROLL_HEIGHT = 438;
const LOOK_AHEAD_MS = 4_000;

function getBarHeight(durationMs: number): number {
  return Math.max(52, Math.min(220, durationMs * 0.34));
}

function getBarTop(event: MidiNoteEvent, currentTimeMs: number): number {
  const height = getBarHeight(event.durationMs);
  const distanceFromStrikeLine =
    ((event.startMs - currentTimeMs) / LOOK_AHEAD_MS) * ROLL_HEIGHT;

  return ROLL_HEIGHT - height - distanceFromStrikeLine;
}

function keyLabel(midi: number): string {
  const pitchClass = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
    ((midi % 12) + 12) % 12
  ];
  return `${pitchClass}${Math.floor(midi / 12) - 1}`;
}

/**
 * Harmonium-specific performance surface. It keeps the same MIDI geometry as
 * the piano for exact note alignment, but presents a reed keyboard, Indian
 * labels and sustained note beams rather than a piano skin.
 */
export function HarmoniumFallingNotes({
  activeEventIndex,
  events,
  harmoniumReedMode,
  harmoniumReverbMode,
  notationSystem,
  onHarmoniumReedModeChange,
  onHarmoniumReverbModeChange,
  rootMidi,
}: HarmoniumFallingNotesProps) {
  const currentTimeMs = events[activeEventIndex]?.startMs ?? 0;
  const activeMidi = events[activeEventIndex]?.midi ?? rootMidi;
  const keyByMidi = new Map(PERFORMANCE_PIANO_KEYS.map((key) => [key.midi, key]));

  return (
    <section
      aria-label="Falling MIDI harmonium roll"
      className="relative overflow-hidden rounded-[0.9rem] border border-[#c78d46]/25 bg-[#090c10] shadow-[0_24px_64px_rgba(0,0,0,0.34)]"
    >
      <div className="absolute inset-x-0 top-0 z-30 flex flex-wrap items-start justify-between gap-3 bg-[linear-gradient(180deg,rgba(12,14,17,0.97),rgba(12,14,17,0.82),transparent)] px-4 py-4 sm:px-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#e7bd72]">
            Harmonium melody roll
          </p>
          <p className="mt-1 text-[10px] font-bold text-white/65">
            Reed keys · sustained beams · Sargam mapped to your Sa
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-yellow-soft/45 bg-yellow-soft px-2.5 py-1 text-[10px] font-black text-charcoal shadow-[0_0_15px_rgba(255,240,153,0.2)]">
            {keyLabel(rootMidi)} = Sa
          </span>
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/25 p-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
            <span className="px-1.5">Reeds</span>
            {(["single", "double"] as const).map((mode) => (
              <button
                aria-pressed={harmoniumReedMode === mode}
                className={[
                  "rounded px-2 py-1 transition",
                  harmoniumReedMode === mode
                    ? "bg-[#e7bd72] text-[#211307] shadow-[0_0_12px_rgba(231,189,114,0.28)]"
                    : "text-white/45 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                key={mode}
                onClick={() => onHarmoniumReedModeChange(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/25 p-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
            <span className="px-1.5">Space</span>
            {(["dry", "room"] as const).map((mode) => (
              <button
                aria-pressed={harmoniumReverbMode === mode}
                className={[
                  "rounded px-2 py-1 transition",
                  harmoniumReverbMode === mode
                    ? "bg-mint-emerald text-[#07121f] shadow-[0_0_12px_rgba(40,177,130,0.28)]"
                    : "text-white/45 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                key={mode}
                onClick={() => onHarmoniumReverbModeChange(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[540px] snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth sm:h-[610px]">
        <div className="relative h-full min-w-[560px] bg-[radial-gradient(ellipse_at_50%_65%,rgba(175,111,35,0.11),transparent_50%),#07090c] sm:min-w-0">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-[154px] top-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_62px]" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-[154px] top-0">
            {PERFORMANCE_PIANO_KEYS.filter((key) => !key.isBlack).map((key) => (
              <span className="absolute bottom-0 top-0 border-r border-white/[0.065]" key={key.midi} style={{ left: `${key.left}%`, width: `${key.width}%` }} />
            ))}
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-[154px] border-t border-[#e7bd72]/75 shadow-[0_-1px_18px_rgba(231,189,114,0.32)]" />
          <span className="absolute bottom-[160px] left-4 rounded-full border border-[#e7bd72]/35 bg-[#14100a]/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#e7bd72]">
            strike line
          </span>

          {events.map((event, index) => {
            const key = keyByMidi.get(event.midi);
            if (key === undefined) return null;

            const isActive = index === activeEventIndex;
            const note = midiToRelativeNote(event.midi, rootMidi);
            const height = getBarHeight(event.durationMs);
            const left = key.left;
            const top = getBarTop(event, currentTimeMs);

            return (
              <div
                aria-hidden="true"
                className={[
                  "absolute z-10 flex items-start justify-center rounded-md border pt-2 text-[10px] font-black backdrop-blur-md transition-[top,background-color,box-shadow,opacity,transform] duration-[420ms] ease-out",
                  key.isBlack ? "min-w-3" : "min-w-4",
                  notationSystem === "Sargam_HI" ? "font-devanagari" : "",
                  isActive
                    ? "border-yellow-soft/95 bg-[linear-gradient(180deg,rgba(255,247,187,0.98),rgba(220,157,53,0.88))] text-charcoal shadow-[0_8px_24px_rgba(255,240,153,0.4),inset_0_1px_0_rgba(255,255,255,0.92)]"
                    : index < activeEventIndex
                      ? "border-[#e7bd72]/30 bg-[linear-gradient(180deg,rgba(220,157,71,0.28),rgba(117,68,20,0.22))] text-white/45 opacity-35 shadow-[0_3px_10px_rgba(183,112,33,0.1)]"
                      : "border-[#e7bd72]/60 bg-[linear-gradient(180deg,rgba(220,157,71,0.9),rgba(117,68,20,0.72))] text-white shadow-[0_6px_17px_rgba(183,112,33,0.3),inset_0_1px_0_rgba(255,255,255,0.38)]",
                ].join(" ")}
                key={`${event.startMs}-${event.midi}`}
                style={{
                  height: `${height}px`,
                  left: `${left}%`,
                  top: `${top}px`,
                  width: `${key.width}%`,
                }}
              >
                <span className="hidden truncate px-1 sm:inline">
                  {formatRelativeNote(note, notationSystem)}
                </span>
              </div>
            );
          })}

          <div className="absolute inset-x-0 bottom-0 h-[154px] border-t border-[#e7bd72]/45 bg-[linear-gradient(180deg,#9b5e25_0%,#c8873d_9%,#7a431a_100%)] shadow-[inset_0_12px_18px_rgba(0,0,0,0.32)]">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,rgba(255,228,157,0.8)_0_18px,rgba(96,45,14,0.75)_18px_23px)] opacity-75" />
            <div aria-hidden="true" className="absolute inset-x-4 top-3 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.17em] text-[#ffe6a8]/75">
              <span>reed bank</span>
              <span className="flex items-center gap-1.5">
                {Array.from({ length: 6 }, (_, index) => (
                  <i className="h-1.5 w-5 rounded-full bg-[#f7d58d]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]" key={index} />
                ))}
              </span>
            </div>
            <div className="absolute inset-x-[1.4%] bottom-0 h-[126px] overflow-hidden rounded-t-[0.5rem] border border-[#3e200c]/70 bg-[#1c1009] shadow-[inset_0_5px_10px_rgba(255,211,130,0.12)]">
              {PERFORMANCE_PIANO_KEYS.filter((key) => !key.isBlack).map((key) => {
                const isRoot = key.midi === rootMidi;
                const isActive = key.midi === activeMidi;
                const relative = midiToRelativeNote(key.midi, rootMidi);
                return (
                  <div
                    aria-hidden="true"
                    className={[
                      "absolute bottom-0 h-full rounded-b-[0.35rem] border-r border-[#4e3018]/75 bg-[linear-gradient(90deg,#d9c9a0_0%,#fff6d7_42%,#c9af7f_100%)] shadow-[inset_0_-12px_13px_rgba(70,38,15,0.2),inset_0_1px_0_rgba(255,255,255,0.95)] transition-[transform,box-shadow,background] duration-150",
                      isActive ? "translate-y-1 bg-[linear-gradient(90deg,#e6b84b_0%,#fff4ad_45%,#d28c26_100%)] shadow-[inset_0_-5px_8px_rgba(120,66,10,0.35),0_0_18px_rgba(255,240,153,0.65)]" : "",
                    ].join(" ")}
                    key={key.midi}
                    style={{ left: `${key.left}%`, width: `${key.width}%` }}
                  >
                    <span className={["absolute left-1/2 top-3 -translate-x-1/2 text-[8px] font-black text-[#4b2c18]/60", notationSystem === "Sargam_HI" ? "font-devanagari" : ""].join(" ")}>
                      {formatRelativeNote(relative, notationSystem)}
                    </span>
                    {isRoot ? <span className="absolute bottom-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-mint-emerald shadow-[0_0_11px_rgba(40,177,130,0.9)]" /> : null}
                  </div>
                );
              })}
              {PERFORMANCE_PIANO_KEYS.filter((key) => key.isBlack).map((key) => {
                const isActive = key.midi === activeMidi;
                return <div aria-hidden="true" className={["absolute top-0 z-20 h-[76px] rounded-b-md border border-white/10 bg-[linear-gradient(90deg,#050506_0%,#3b2b1e_48%,#050506_100%)] shadow-[0_9px_10px_rgba(0,0,0,0.65),inset_0_2px_1px_rgba(255,255,255,0.16)]", isActive ? "translate-y-1 border-yellow-soft/85 bg-[linear-gradient(90deg,#8e5e17_0%,#ffe989_50%,#8e5e17_100%)] shadow-[0_3px_6px_rgba(0,0,0,0.42),0_0_18px_rgba(255,240,153,0.62)]" : ""].join(" ")} key={key.midi} style={{ left: `${key.left}%`, width: `${key.width}%` }} />;
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="border-t border-[#e7bd72]/15 bg-[#120d08] px-4 py-2.5 text-[9px] font-semibold leading-4 text-white/45 sm:px-5">
        Harmonium mode uses the same relative timeline, with a sustained reed guide and physical-key alignment. Sa follows the selected tonic.
      </p>
    </section>
  );
}
