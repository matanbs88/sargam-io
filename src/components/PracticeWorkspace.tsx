import type { ReactNode } from "react";
import { TaalCycle } from "@/src/components/TaalCycle";
import { TablaPracticeUI } from "@/src/components/TablaPracticeUI";
import type { NotationSystem } from "@/src/lib/midiToSargam";
import type { EventLoopRange } from "@/src/lib/playback";
import type { TaalDefinition, TaalId } from "@/src/lib/taal";

type Instrument = "Harmonium" | "Keyboard" | "Bansuri" | "Guitar" | "Sitar" | "None";
type Visualizer = "Piano" | "Bansuri";

type RootOption = { readonly label: string; readonly midi: number };
type NotationOption = {
  readonly detail: string;
  readonly id: NotationSystem;
  readonly label: string;
};
type InstrumentOption = {
  readonly description: string;
  readonly id: Instrument;
  readonly label: string;
};

type PracticeWorkspaceProps = {
  readonly activeEventIndex: number;
  readonly displayedMatra: number;
  readonly formattedNotes: readonly string[];
  readonly hasManualEdits: boolean;
  readonly instrumentOptions: readonly InstrumentOption[];
  readonly instrumentPanel: ReactNode;
  readonly isMetronomePlaying: boolean;
  readonly isPlaying: boolean;
  readonly isTransposed: boolean;
  readonly lastEventIndex: number;
  readonly loopAnchorIndex: number | null;
  readonly loopRange: EventLoopRange | null;
  readonly notationOptions: readonly NotationOption[];
  readonly notationSystem: NotationSystem;
  readonly onAdjustActiveNote: (semitones: -1 | 1) => void;
  readonly onCinemaView: () => void;
  readonly onClearLoop: () => void;
  readonly onInstrumentChange: (instrument: Instrument) => void;
  readonly onMoveNote: (direction: -1 | 1) => void;
  readonly onNotationChange: (notation: NotationSystem) => void;
  readonly onPlaybackRateChange: (rate: number) => void;
  readonly onResetNoteEdits: () => void;
  readonly onRootChange: (midi: number) => void;
  readonly onSelectEvent: (index: number) => void;
  readonly onSetLoopPoint: () => void;
  readonly onStartAnother: () => void;
  readonly onTaalChange: (taal: TaalId) => void;
  readonly onTempoChange: (tempo: number) => void;
  readonly onToggleMetronome: () => void;
  readonly onTogglePlayback: () => void;
  readonly onVisualizerChange: (visualizer: Visualizer) => void;
  readonly performanceVisualizer: ReactNode;
  readonly playbackProgress: number;
  readonly playbackRate: number;
  readonly practiceTempoBpm: number;
  readonly rootOptions: readonly RootOption[];
  readonly selectedInstrument: Instrument;
  readonly selectedRootLabel: string;
  readonly selectedRootMidi: number;
  readonly selectedTaal: TaalDefinition;
  readonly selectedTaalId: TaalId;
  readonly selectedVisualizer: Visualizer;
  readonly songTitle: string;
  readonly speedOptions: readonly number[];
  readonly taalOptions: readonly TaalDefinition[];
  readonly tanpuraControl: ReactNode;
  readonly tempoBpm: number;
};

/** The studio deliberately privileges one performance surface over dashboard cards. */
export function PracticeWorkspace({
  activeEventIndex,
  displayedMatra,
  formattedNotes,
  hasManualEdits,
  instrumentOptions,
  instrumentPanel,
  isMetronomePlaying,
  isPlaying,
  isTransposed,
  lastEventIndex,
  loopAnchorIndex,
  loopRange,
  notationOptions,
  notationSystem,
  onAdjustActiveNote,
  onCinemaView,
  onClearLoop,
  onInstrumentChange,
  onMoveNote,
  onNotationChange,
  onPlaybackRateChange,
  onResetNoteEdits,
  onRootChange,
  onSelectEvent,
  onSetLoopPoint,
  onStartAnother,
  onTaalChange,
  onTempoChange,
  onToggleMetronome,
  onTogglePlayback,
  onVisualizerChange,
  performanceVisualizer,
  playbackProgress,
  playbackRate,
  practiceTempoBpm,
  rootOptions,
  selectedInstrument,
  selectedRootLabel,
  selectedRootMidi,
  selectedTaal,
  selectedTaalId,
  selectedVisualizer,
  songTitle,
  speedOptions,
  taalOptions,
  tanpuraControl,
  tempoBpm,
}: PracticeWorkspaceProps) {
  return (
    <section
      aria-live="polite"
      className="studio-workspace bg-[#07121f] px-3 py-7 text-white sm:px-5 sm:py-10"
      id="studio"
    >
      <div className="mx-auto max-w-[1580px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-mint-emerald">
              Practice session
            </p>
            <h2 className="mt-1 truncate font-display text-3xl leading-none text-white sm:text-4xl">
              {songTitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
            <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-white/55">
              {selectedRootLabel} = Sa
            </span>
            <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-white/55">
              {tempoBpm} BPM
            </span>
            {isTransposed ? (
              <span className="rounded-full bg-mint-emerald px-3 py-1.5 text-white">
                Transposed
              </span>
            ) : null}
            <button
              className="rounded-full bg-white/[0.06] px-3 py-1.5 text-white/70 transition hover:bg-white/[0.12] hover:text-white"
              onClick={onStartAnother}
              type="button"
            >
              New
            </button>
          </div>
        </header>

        <section
          aria-label="Practice controls"
          className="studio-control-rail mb-3 flex flex-col gap-4 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <label className="flex items-center gap-3 text-xs font-black text-white/75" htmlFor="root-midi">
            <span className="text-[10px] uppercase tracking-[0.16em] text-mint-emerald">Sa</span>
            <span className="hidden sm:inline">Choose your Sa</span>
            <select
              className="appearance-none rounded-md border border-white/[0.09] bg-white/[0.055] px-3 py-2 text-xs font-black text-white outline-none transition focus:border-mint-emerald/70 focus:ring-2 focus:ring-mint-emerald/30"
              id="root-midi"
              onChange={(event) => onRootChange(Number(event.target.value))}
              value={selectedRootMidi}
            >
              {rootOptions.map((option) => (
                <option className="text-charcoal" key={option.midi} value={option.midi}>
                  {option.label} is Sa
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Notation
            </span>
            <div aria-label="Notation system" className="flex rounded-md bg-white/[0.045] p-1" role="group">
              {notationOptions.map((option) => {
                const isActive = option.id === notationSystem;
                return (
                  <button
                    aria-pressed={isActive}
                    className={[
                      "rounded px-3 py-2 text-left transition sm:px-4",
                      isActive
                        ? "bg-mint-emerald text-white shadow-[0_5px_15px_rgba(40,177,130,0.2)]"
                        : "text-white/50 hover:bg-white/[0.07] hover:text-white",
                    ].join(" ")}
                    key={option.id}
                    onClick={() => onNotationChange(option.id)}
                    type="button"
                  >
                    <span className={option.id === "Sargam_HI" ? "block font-devanagari text-xs font-black" : "block text-xs font-black"}>
                      {option.label}
                    </span>
                    <span className={isActive ? "mt-0.5 block text-[8px] font-bold text-white/65" : "mt-0.5 block text-[8px] font-bold text-white/30"}>
                      {option.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="Melody line" className="studio-melody-strip mb-3 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-mint-emerald">Melody</p>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[9px] font-black text-white/45">{formattedNotes.length} notes</span>
            </div>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {formattedNotes.map((note, index) => {
                const isActive = index === activeEventIndex;
                const isInLoop = loopRange !== null && index >= loopRange.startIndex && index <= loopRange.endIndex;
                const isLoopAnchor = index === loopAnchorIndex;

                return (
                  <button
                    aria-label={`Set active note ${index + 1}`}
                    aria-pressed={isActive}
                    className={[
                      "grid h-9 min-w-9 place-items-center rounded-md px-1 text-sm font-black transition duration-200",
                      notationSystem === "Sargam_HI" ? "font-devanagari" : "font-mono",
                      isActive
                        ? "scale-105 bg-yellow-soft text-charcoal shadow-[0_0_16px_rgba(255,240,153,0.35)]"
                        : isLoopAnchor
                          ? "bg-performance-blue text-[#07121f] shadow-[0_0_14px_rgba(88,166,255,0.28)]"
                          : isInLoop
                            ? "bg-mint-emerald/18 text-mint-emerald ring-1 ring-inset ring-mint-emerald/50"
                            : "bg-white/[0.055] text-white/60 hover:bg-white/[0.1] hover:text-white",
                    ].join(" ")}
                    key={`${note}-${index}`}
                    onClick={() => onSelectEvent(index)}
                    type="button"
                  >
                    {note}
                  </button>
                );
              })}
            </div>
            <div aria-label="Manual note correction" className="flex items-center gap-1 rounded-md bg-white/[0.045] p-1" role="group">
              <button aria-label="Lower active note by one semitone" className="rounded px-2 py-1.5 text-xs font-black text-white/60 transition hover:bg-white/10 hover:text-white" onClick={() => onAdjustActiveNote(-1)} type="button">−</button>
              <span className="px-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/35">Correct</span>
              <button aria-label="Raise active note by one semitone" className="rounded px-2 py-1.5 text-xs font-black text-white/60 transition hover:bg-white/10 hover:text-white" onClick={() => onAdjustActiveNote(1)} type="button">+</button>
              {hasManualEdits ? <button aria-label="Reset manual note edits" className="rounded bg-white/[0.08] px-2 py-1.5 text-[9px] font-black text-mint-emerald transition hover:bg-mint-emerald hover:text-white" onClick={onResetNoteEdits} type="button">Reset</button> : null}
            </div>
          </div>
        </section>

        <main className="studio-stage min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-performance-blue">Performance</p>
              <p className="mt-1 text-xs font-medium text-white/45">Follow the note beams. Land every phrase with intention.</p>
            </div>
            <div aria-label="Choose a falling note visualizer" className="flex rounded-md bg-white/[0.05] p-1" role="group">
              {(["Piano", "Bansuri"] as const).map((visualizer) => {
                const isActive = selectedVisualizer === visualizer;
                return (
                  <button
                    aria-pressed={isActive}
                    className={[
                      "rounded px-3 py-2 text-xs font-black transition",
                      isActive
                        ? "bg-performance-blue text-[#07121f] shadow-[0_4px_12px_rgba(88,166,255,0.26)]"
                        : "text-white/45 hover:text-white",
                    ].join(" ")}
                    key={visualizer}
                    onClick={() => onVisualizerChange(visualizer)}
                    type="button"
                  >
                    {visualizer} roll
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">{performanceVisualizer}</div>
          <div className="stage-transport px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                aria-label={isPlaying ? "Pause mock playback" : "Play mock playback"}
                className="grid h-11 w-11 place-items-center rounded-full bg-yellow-soft text-[10px] font-black uppercase tracking-tight text-charcoal shadow-[0_0_20px_rgba(255,240,153,0.27)] transition hover:scale-105 active:scale-95"
                onClick={onTogglePlayback}
                type="button"
              >
                {isPlaying ? "II" : "Play"}
              </button>
              <button aria-label="Previous note" className="rounded px-2 py-1.5 text-xs font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30" disabled={activeEventIndex === 0} onClick={() => onMoveNote(-1)} type="button">Prev</button>
              <button aria-label="Next note" className="rounded px-2 py-1.5 text-xs font-bold text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30" disabled={activeEventIndex === lastEventIndex} onClick={() => onMoveNote(1)} type="button">Next</button>
              <button aria-label={loopAnchorIndex === null ? "Set loop start" : "Set loop end"} className={["rounded px-2.5 py-1.5 text-xs font-black transition", loopAnchorIndex === null ? "bg-white/[0.055] text-white/60 hover:bg-white/[0.1] hover:text-white" : "bg-performance-blue text-[#07121f] shadow-[0_0_12px_rgba(88,166,255,0.25)]"].join(" ")} onClick={onSetLoopPoint} type="button">{loopAnchorIndex === null ? "Set loop A" : "Set loop B"}</button>
              {loopRange !== null ? <button aria-label="Clear phrase loop" className="rounded bg-mint-emerald/15 px-2.5 py-1.5 text-xs font-black text-mint-emerald ring-1 ring-inset ring-mint-emerald/45 transition hover:bg-mint-emerald hover:text-white" onClick={onClearLoop} type="button">Loop {loopRange.startIndex + 1}–{loopRange.endIndex + 1}</button> : null}
              <div aria-label="Practice speed" className="flex rounded bg-white/[0.055] p-0.5" role="group">
                {speedOptions.map((speed) => {
                  const isActive = speed === playbackRate;
                  return <button aria-pressed={isActive} className={["rounded px-1.5 py-1 text-[10px] font-black transition", isActive ? "bg-white/15 text-yellow-soft" : "text-white/40 hover:text-white"].join(" ")} key={speed} onClick={() => onPlaybackRateChange(speed)} type="button">{speed}×</button>;
                })}
              </div>
              <div className="ml-auto min-w-32 flex-1 sm:max-w-xs">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.09]"><div className="h-full rounded-full bg-performance-blue shadow-[0_0_8px_rgba(88,166,255,0.75)] transition-all duration-300" style={{ width: `${playbackProgress}%` }} /></div>
                <p className="mt-1.5 text-right text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Note {activeEventIndex + 1} / {formattedNotes.length}</p>
              </div>
              <button className="rounded-full bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/[0.1] hover:text-white" onClick={onCinemaView} type="button">Cinema</button>
            </div>
          </div>
        </main>

        <section aria-label="Practice layers" className="workspace-controls studio-utility-band mt-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-mint-emerald">Practice layers</p>
              <p className="mt-1 text-xs text-white/45">Rhythm, drone and instrument reference stay available without competing with the performance.</p>
            </div>
            <label className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45" htmlFor="taal-select">
              Taal
              <select className="ml-2 rounded-md border border-white/[0.09] bg-white/[0.055] px-2 py-2 text-xs font-bold normal-case tracking-normal text-white outline-none focus:ring-2 focus:ring-mint-emerald" id="taal-select" onChange={(event) => onTaalChange(event.target.value as TaalId)} value={selectedTaalId}>
                {taalOptions.map((taal) => <option className="text-charcoal" key={taal.id} value={taal.id}>{taal.label} ({taal.matras})</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <TaalCycle activeMatra={displayedMatra} taal={selectedTaal} />
            <TablaPracticeUI activeMatra={displayedMatra} isPlaying={isMetronomePlaying} onTempoChange={onTempoChange} onToggle={onToggleMetronome} taal={selectedTaal} tempoBpm={practiceTempoBpm} />
            {tanpuraControl}
          </div>
          <div className="mt-4 border-t border-white/[0.08] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-white/45">Instrument reference</p>
              <div aria-label="Choose an instrument reference" className="flex flex-wrap gap-1.5" role="group">
                {instrumentOptions.map((instrument) => {
                  const isActive = instrument.id === selectedInstrument;
                  return <button aria-pressed={isActive} className={["rounded-md px-2.5 py-2 text-left transition", isActive ? "bg-mint-emerald text-white shadow-[0_5px_14px_rgba(40,177,130,0.18)]" : "bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white"].join(" ")} key={instrument.id} onClick={() => onInstrumentChange(instrument.id)} type="button"><span className="block text-[10px] font-black">{instrument.label}</span><span className={isActive ? "mt-0.5 block text-[8px] font-bold text-white/65" : "mt-0.5 block text-[8px] font-bold text-white/30"}>{instrument.description}</span></button>;
                })}
              </div>
            </div>
            <details className="mt-3 rounded-lg bg-white/[0.035] open:bg-white/[0.05]">
              <summary className="cursor-pointer px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/60">Open {selectedInstrument} reference</summary>
              <div className="border-t border-white/[0.08] p-2">{instrumentPanel}</div>
            </details>
          </div>
        </section>
      </div>
    </section>
  );
}
