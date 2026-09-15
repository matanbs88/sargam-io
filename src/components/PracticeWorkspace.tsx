"use client";
import { useState, type ReactNode } from "react";
import { PracticeRangePicker } from "./PracticeRangePicker";
import { practiceTime } from "@/src/lib/practiceNavigation";
import { TaalCycle } from "@/src/components/TaalCycle";
import { TablaPracticeUI } from "@/src/components/TablaPracticeUI";
import type { NotationSystem } from "@/src/lib/midiToSargam";
import type { ImportedScoreValidation } from "@/src/lib/importedScoreTimeline";
import type { EventLoopRange } from "@/src/lib/playback";
import type { TaalDefinition, TaalId } from "@/src/lib/taal";

type Visualizer = "Piano" | "Harmonium" | "Bansuri";

type RootOption = { readonly label: string; readonly midi: number };
type NotationOption = {
  readonly detail: string;
  readonly id: NotationSystem;
  readonly label: string;
};
type PracticeWorkspaceProps = {
  readonly isLoading: boolean;
  readonly positionMs: number;
  readonly durationMs: number;
  readonly onSeek: (ms: number) => void;
  readonly onRestart: () => void;
  readonly onApplyRange: (range: EventLoopRange) => void;
  readonly activeEventIndex: number;
  readonly displayedMatra: number;
  readonly formattedNotes: readonly string[];
  readonly guideSoundEnabled: boolean;
  readonly hasManualEdits: boolean;
  readonly importValidation: ImportedScoreValidation | null;
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
  readonly onDownloadSargamPdf: () => void;
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
  readonly onToggleGuideSound: () => void;
  readonly onVisualizerChange: (visualizer: Visualizer) => void;
  readonly performanceVisualizer: ReactNode;
  readonly tunerControl?: ReactNode;
  readonly playbackProgress: number;
  readonly playbackRate: number;
  readonly practiceTempoBpm: number;
  readonly rootOptions: readonly RootOption[];
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

function isAlteredNoteLabel(note: string, notationSystem: NotationSystem): boolean {
  if (notationSystem === "ABC") return note.includes("#") || note.includes("b");
  if (notationSystem === "Sargam_EN") return /^[rgdnM]/.test(note);
  return note.includes("॒") || note.includes("॑");
}

/** The studio deliberately privileges one performance surface over dashboard cards. */
export function PracticeWorkspace({
  isLoading, positionMs, durationMs, onSeek, onRestart, onApplyRange,
  activeEventIndex,
  displayedMatra,
  formattedNotes,
  guideSoundEnabled,
  hasManualEdits,
  importValidation,
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
  onDownloadSargamPdf,
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
  onToggleGuideSound,
  onVisualizerChange,
  performanceVisualizer,
  tunerControl,
  playbackProgress,
  playbackRate,
  practiceTempoBpm,
  rootOptions,
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
  const [focus, setFocus] = useState(true);
  return (
    <section
      className={`studio-workspace practice-experience ${focus ? "practice-focus" : "practice-tools"} bg-[#07121f] px-3 py-3 text-white sm:px-5 sm:py-4`}
      id="studio"
    >
      <div className="mx-auto max-w-[1580px]">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:px-2">
          <button
            aria-label="Return to song library"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/55 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-soft"
            onClick={onStartAnother}
            type="button"
          >
            <span aria-hidden="true" className="text-base leading-none">←</span>
            Back to library
          </button>
          <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-white/30 sm:block">
            {songTitle}
          </span>
        </div>

        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[0.9rem] bg-white/[0.035] px-4 py-3 ring-1 ring-inset ring-white/[0.07] sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-mint-emerald">
              Practice session
            </p>
            <h2 className="mt-1 truncate font-heading text-2xl leading-none text-white sm:text-3xl">
              {songTitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
            <button type="button" aria-expanded={!focus} aria-controls="practice-editing-tools" onClick={() => setFocus(!focus)} className="min-h-11 rounded-md border border-white/20 px-4 text-xs text-white">{focus ? "Setup & notes" : "Focus on playing"}</button>
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
              className="rounded-md bg-white/[0.06] px-3 py-1.5 text-white/70 transition hover:bg-white/[0.12] hover:text-white"
              onClick={onStartAnother}
              type="button"
            >
              + New melody
            </button>
          </div>
        </header>

        <div id="practice-editing-tools" hidden={focus}>
        <section
          aria-label="Practice controls"
          className="studio-control-rail mb-0 flex flex-col gap-4 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
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
            <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
              Notation
            </span>
            <div aria-label="Notation system" className="flex rounded-md bg-white/[0.045] p-1" role="group">
              {notationOptions.map((option) => {
                const isActive = option.id === notationSystem;
                return (
                  <button
                    aria-pressed={isActive}
                    className={[
                      "rounded-md px-3 py-2 text-left transition sm:px-4",
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
                    {option.detail ? <span className={isActive ? "mt-0.5 block text-[8px] font-bold text-white/65" : "mt-0.5 block text-[8px] font-bold text-white/30"}>{option.detail}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="Melody line" className="studio-melody-strip mb-2 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-x-4">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-mint-emerald">Melody</p>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[9px] font-black text-white/45">{formattedNotes.length} notes</span>
            </div>
            <div className="flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-1 pr-1 sm:flex-1 sm:pb-0">
              {formattedNotes.map((note, index) => {
                const isActive = index === activeEventIndex;
                const isInLoop = loopRange !== null && index >= loopRange.startIndex && index <= loopRange.endIndex;
                const isLoopAnchor = index === loopAnchorIndex;
                const isAltered = isAlteredNoteLabel(note, notationSystem);

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
                            : isAltered
                              ? "h-8 min-w-8 bg-white/[0.025] text-white/45 ring-1 ring-inset ring-white/[0.09] hover:bg-white/[0.08] hover:text-white"
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
              <span className="px-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/45" title="Adjust the active note by one semitone">Pitch ±</span>
              <button aria-label="Raise active note by one semitone" className="rounded px-2 py-1.5 text-xs font-black text-white/60 transition hover:bg-white/10 hover:text-white" onClick={() => onAdjustActiveNote(1)} type="button">+</button>
              {hasManualEdits ? <button aria-label="Reset manual note edits" className="rounded bg-white/[0.08] px-2 py-1.5 text-[9px] font-black text-mint-emerald transition hover:bg-mint-emerald hover:text-white" onClick={onResetNoteEdits} type="button">Reset</button> : null}
            </div>
          </div>
        </section>

        </div>
        <section aria-label="Practice stage" className="studio-stage min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Follow the melody</h3>
              <p className="mt-1 text-xs font-medium text-white/65">Listen, slow it down, then repeat a section. Playback is not scored.</p>
              {importValidation !== null ? (
                <details className="relative mt-2 w-fit">
                  <summary className={[
                    "cursor-pointer list-none rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] transition hover:bg-white/[0.08]",
                    importValidation.requiresReview
                      ? "border-yellow-soft/35 bg-yellow-soft/10 text-yellow-soft"
                      : "border-mint-emerald/35 bg-mint-emerald/10 text-mint-emerald",
                  ].join(" ")}>
                    MusicXML {importValidation.requiresReview ? `review: ${importValidation.issues.length} issue${importValidation.issues.length === 1 ? "" : "s"}` : "ready"}
                  </summary>
                  {importValidation.issues.length > 0 ? (
                    <ul className="absolute z-30 mt-2 max-w-sm space-y-1 rounded-md border border-white/[0.1] bg-[#0b1626] p-3 text-[10px] font-semibold leading-4 text-white/65 shadow-[0_16px_36px_rgba(0,0,0,0.36)]">
                      {importValidation.issues.map((issue, index) => (
                        <li key={`${issue.message}-${index}`}>{issue.message}</li>
                      ))}
                    </ul>
                  ) : null}
                </details>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
            <div aria-label="Choose instrument roll" className="flex rounded-md bg-white/[0.05] p-1" role="group">
              {(["Piano", "Harmonium", "Bansuri"] as const).map((visualizer) => {
                const isActive = selectedVisualizer === visualizer;
                return (
                  <button
                    aria-pressed={isActive}
                    className={[
                      "rounded-md px-3 py-2 text-xs font-black transition",
                      isActive
                        ? "bg-performance-blue text-[#07121f] shadow-[0_4px_12px_rgba(88,166,255,0.26)]"
                        : "text-white/45 hover:text-white",
                    ].join(" ")}
                    key={visualizer}
                    onClick={() => onVisualizerChange(visualizer)}
                    type="button"
                  >
                    {visualizer}
                  </button>
                );
              })}
            </div>
            <button
              aria-pressed={guideSoundEnabled}
              className={["rounded-md px-3 py-2 text-xs font-black transition", guideSoundEnabled ? "bg-mint-emerald text-[#07121f] shadow-[0_4px_12px_rgba(40,177,130,0.24)]" : "bg-white/[0.05] text-white/45 hover:text-white"].join(" ")}
              onClick={onToggleGuideSound}
              title="Toggle the selected instrument's guide sound"
              type="button"
            >
              {guideSoundEnabled ? "Sound on" : "Sound off"}
            </button>
            </div>
          </div>
          <div className="stage-transport practice-transport px-4 py-3 sm:px-5">
            <label className="mb-3 flex items-center gap-3 text-xs tabular-nums text-[#b7c5d0]">
              <span>{practiceTime(positionMs)}</span>
              <input aria-label="Playback position" aria-valuetext={`${practiceTime(positionMs)} of ${practiceTime(durationMs)}`} title="Seeking pauses playback and clears repeat" className="h-6 min-w-0 flex-1 accent-[#80cfff]" type="range" min="0" max={Math.max(1, durationMs)} step="10" value={Math.min(positionMs, durationMs)} disabled={durationMs === 0} onChange={e => onSeek(Number(e.target.value))}/>
              <span>{practiceTime(durationMs)}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                aria-label={isLoading ? "Cancel loading" : isPlaying ? "Pause playback" : "Play playback"}
                className="grid h-11 w-11 place-items-center rounded-full bg-yellow-soft text-[10px] font-black uppercase tracking-tight text-charcoal shadow-[0_0_20px_rgba(255,240,153,0.27)] transition hover:scale-105 active:scale-95"
                onClick={onTogglePlayback}
                type="button"
              >
                {isLoading ? "Cancel" : isPlaying ? "II" : "Play"}
              </button>
              <button type="button" onClick={onRestart} className="min-h-11 rounded-md px-3 text-sm text-white hover:bg-white/10">Restart</button>
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
              <div className="ml-auto min-w-32 flex-1 sm:max-w-xs" hidden={focus}>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.09]"><div className="h-full rounded-full bg-performance-blue shadow-[0_0_8px_rgba(88,166,255,0.75)] transition-all duration-300" style={{ width: `${playbackProgress}%` }} /></div>
                <p className="mt-1.5 text-right text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Note {activeEventIndex + 1} / {formattedNotes.length}</p>
              </div>
              <button className="rounded-full bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/[0.1] hover:text-white" onClick={onCinemaView} type="button">Cinema</button>
              <button aria-label="Download Sargam PDF" className="rounded-full border border-mint-emerald/45 bg-mint-emerald/12 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-mint-emerald transition hover:bg-mint-emerald hover:text-white" onClick={onDownloadSargamPdf} type="button">PDF</button>
            </div>
            <p className="mt-2 text-xs text-[#b7c5d0]">{durationMs > 0 && positionMs >= durationMs && !isPlaying ? "End of piece. Replay or repeat a passage — no performance score was measured." : "Seeking pauses playback and returns to the whole piece."}</p>
            <div className="mt-3"><PracticeRangePicker key={songTitle} notes={formattedNotes} range={loopRange} onApply={onApplyRange} onClear={onClearLoop}/></div>
          </div>
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">{performanceVisualizer}</div>
        </section>

        {tunerControl}
        <details aria-label="Practice layers" className="workspace-controls studio-utility-band group mt-3">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <span>
              <span className="block text-[10px] font-black uppercase tracking-[0.19em] text-mint-emerald">Practice layers</span>
              <span className="mt-1 block text-[10px] font-medium text-white/62">Taal, tabla, tanpura and instrument sound</span>
            </span>
            <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white/60 transition group-open:bg-mint-emerald group-open:text-white">Open</span>
          </summary>
          <div className="border-t border-white/[0.08] px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-mint-emerald">Rhythm and reference</p>
              <p className="mt-1 text-xs text-white/45">Rhythm and drone stay available without competing with the performance.</p>
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
          </div>
        </details>
      </div>
    </section>
  );
}
