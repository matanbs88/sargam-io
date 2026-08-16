import type { ReactNode } from "react";
import { TaalCycle } from "@/src/components/TaalCycle";
import { TablaPracticeUI } from "@/src/components/TablaPracticeUI";
import type { NotationSystem } from "@/src/lib/midiToSargam";
import type { TaalDefinition, TaalId } from "@/src/lib/taal";

type Instrument = "Harmonium" | "Keyboard" | "Bansuri" | "Guitar" | "Sitar" | "None";
type Visualizer = "Piano" | "Bansuri";

type RootOption = {
  readonly label: string;
  readonly midi: number;
};

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
  readonly instrumentOptions: readonly InstrumentOption[];
  readonly instrumentPanel: ReactNode;
  readonly isMetronomePlaying: boolean;
  readonly isPlaying: boolean;
  readonly isTransposed: boolean;
  readonly lastEventIndex: number;
  readonly notationOptions: readonly NotationOption[];
  readonly notationSystem: NotationSystem;
  readonly onCinemaView: () => void;
  readonly onInstrumentChange: (instrument: Instrument) => void;
  readonly onMoveNote: (direction: -1 | 1) => void;
  readonly onNotationChange: (notation: NotationSystem) => void;
  readonly onRootChange: (midi: number) => void;
  readonly onSelectEvent: (index: number) => void;
  readonly onStartAnother: () => void;
  readonly onTaalChange: (taal: TaalId) => void;
  readonly onTempoChange: (tempo: number) => void;
  readonly onToggleMetronome: () => void;
  readonly onTogglePlayback: () => void;
  readonly onVisualizerChange: (visualizer: Visualizer) => void;
  readonly performanceVisualizer: ReactNode;
  readonly playbackProgress: number;
  readonly practiceTempoBpm: number;
  readonly rootOptions: readonly RootOption[];
  readonly selectedInstrument: Instrument;
  readonly selectedRootLabel: string;
  readonly selectedRootMidi: number;
  readonly selectedTaal: TaalDefinition;
  readonly selectedTaalId: TaalId;
  readonly selectedVisualizer: Visualizer;
  readonly songTitle: string;
  readonly taalOptions: readonly TaalDefinition[];
  readonly tanpuraControl: ReactNode;
  readonly tempoBpm: number;
};

/** Full-screen practice surface: controls frame the performance canvas. */
export function PracticeWorkspace({
  activeEventIndex,
  displayedMatra,
  formattedNotes,
  instrumentOptions,
  instrumentPanel,
  isMetronomePlaying,
  isPlaying,
  isTransposed,
  lastEventIndex,
  notationOptions,
  notationSystem,
  onCinemaView,
  onInstrumentChange,
  onMoveNote,
  onNotationChange,
  onRootChange,
  onSelectEvent,
  onStartAnother,
  onTaalChange,
  onTempoChange,
  onToggleMetronome,
  onTogglePlayback,
  onVisualizerChange,
  performanceVisualizer,
  playbackProgress,
  practiceTempoBpm,
  rootOptions,
  selectedInstrument,
  selectedRootLabel,
  selectedRootMidi,
  selectedTaal,
  selectedTaalId,
  selectedVisualizer,
  songTitle,
  taalOptions,
  tanpuraControl,
  tempoBpm,
}: PracticeWorkspaceProps) {
  return (
    <section aria-live="polite" className="studio-workspace bg-[#07121f] px-3 py-3 text-white sm:px-5 sm:py-5" id="studio">
      <div className="mx-auto max-w-[1600px] xl:h-[calc(100svh-2.5rem)] xl:min-h-[720px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mint-emerald">Live practice workspace</p>
            <h2 className="mt-1 truncate font-display text-3xl leading-none text-white sm:text-4xl">{songTitle}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/55">{selectedRootLabel} = Sa</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/55">{tempoBpm} BPM</span>
            {isTransposed ? <span className="rounded-full bg-mint-emerald px-3 py-1.5 text-white">Transposed</span> : null}
            <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/75 transition hover:bg-white/10" onClick={onStartAnother} type="button">New</button>
          </div>
        </div>

        <div className="grid gap-3 xl:h-[calc(100svh-7rem)] xl:grid-cols-[220px_minmax(0,1fr)_300px] xl:overflow-hidden">
          <aside className="rounded-[1.1rem] border border-white/10 bg-[#0b1727] p-4 xl:overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-mint-emerald">Reference</p>
            <label className="mt-4 block text-xs font-black text-white/80" htmlFor="root-midi">Choose your Sa</label>
            <select className="mt-2 w-full appearance-none rounded-lg border border-white/10 bg-white/[0.06] px-3 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-mint-emerald" id="root-midi" onChange={(event) => onRootChange(Number(event.target.value))} value={selectedRootMidi}>
              {rootOptions.map((option) => <option className="text-charcoal" key={option.midi} value={option.midi}>{option.label} is Sa</option>)}
            </select>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-white/45">Notation</p>
              <div aria-label="Notation system" className="mt-3 grid gap-1.5" role="group">
                {notationOptions.map((option) => {
                  const isActive = option.id === notationSystem;
                  return <button aria-pressed={isActive} className={["rounded-lg px-3 py-2.5 text-left transition", isActive ? "bg-mint-emerald text-white shadow-[0_8px_16px_rgba(40,177,130,0.22)]" : "bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white"].join(" ")} key={option.id} onClick={() => onNotationChange(option.id)} type="button"><span className="block text-xs font-black">{option.label}</span><span className={isActive ? "mt-0.5 block text-[9px] font-bold text-white/65" : "mt-0.5 block text-[9px] font-bold text-white/35"}>{option.detail}</span></button>;
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[0.17em] text-white/45">Melody</p><span className="text-[10px] font-bold text-mint-emerald">{formattedNotes.length}</span></div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {formattedNotes.map((note, index) => {
                  const isActive = index === activeEventIndex;
                  return <button aria-label={`Set active note ${index + 1}`} aria-pressed={isActive} className={["grid h-9 min-w-9 place-items-center rounded-md px-1 text-sm font-black transition", notationSystem === "Sargam_HI" ? "font-devanagari" : "font-mono", isActive ? "bg-yellow-soft text-charcoal shadow-[0_0_14px_rgba(255,240,153,0.36)]" : "bg-white/[0.06] text-white/65 hover:bg-white/[0.12]"].join(" ")} key={`${note}-${index}`} onClick={() => onSelectEvent(index)} type="button">{note}</button>;
                })}
              </div>
            </div>
          </aside>

          <main className="flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#09111d] shadow-[0_28px_70px_rgba(0,0,0,0.32)] xl:min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-performance-blue">Performance canvas</p><p className="mt-1 text-xs font-medium text-white/45">Follow the note beams to the physical instrument below.</p></div>
              <div aria-label="Choose a falling note visualizer" className="flex rounded-lg bg-white/[0.06] p-1" role="group">
                {(["Piano", "Bansuri"] as const).map((visualizer) => {
                  const isActive = selectedVisualizer === visualizer;
                  return <button aria-pressed={isActive} className={["rounded-md px-3 py-2 text-xs font-black transition", isActive ? "bg-performance-blue text-[#07121f] shadow-[0_4px_12px_rgba(88,166,255,0.26)]" : "text-white/50 hover:text-white"].join(" ")} key={visualizer} onClick={() => onVisualizerChange(visualizer)} type="button">{visualizer} roll</button>;
                })}
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3 sm:p-4">{performanceVisualizer}</div>
            <div className="border-t border-white/10 bg-[#0b1727] px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-3">
                <button aria-label={isPlaying ? "Pause mock playback" : "Play mock playback"} className="grid h-11 w-11 place-items-center rounded-full bg-yellow-soft text-sm font-black text-charcoal shadow-[0_0_20px_rgba(255,240,153,0.28)] transition hover:scale-105 active:scale-95" onClick={onTogglePlayback} type="button">{isPlaying ? "II" : "Play"}</button>
                <button aria-label="Previous note" className="rounded-md px-2 py-1.5 text-xs font-bold text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" disabled={activeEventIndex === 0} onClick={() => onMoveNote(-1)} type="button">Prev</button>
                <button aria-label="Next note" className="rounded-md px-2 py-1.5 text-xs font-bold text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" disabled={activeEventIndex === lastEventIndex} onClick={() => onMoveNote(1)} type="button">Next</button>
                <div className="ml-auto min-w-36 flex-1 sm:max-w-xs"><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-performance-blue shadow-[0_0_8px_rgba(88,166,255,0.8)] transition-all duration-300" style={{ width: `${playbackProgress}%` }} /></div><p className="mt-1.5 text-right text-[9px] font-black uppercase tracking-[0.12em] text-white/40">Note {activeEventIndex + 1} / {formattedNotes.length}</p></div>
                <button className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/75 transition hover:bg-white/10" onClick={onCinemaView} type="button">Cinema</button>
              </div>
            </div>
          </main>

          <aside className="workspace-controls space-y-3 rounded-[1.1rem] border border-white/10 bg-[#0b1727] p-3 xl:overflow-hidden">
            <div className="px-1 pt-1"><p className="text-[10px] font-black uppercase tracking-[0.17em] text-mint-emerald">Rhythm</p><label className="mt-2 block text-[10px] font-black uppercase tracking-[0.12em] text-white/50" htmlFor="taal-select">Practice taal<select className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.06] px-2 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-mint-emerald" id="taal-select" onChange={(event) => onTaalChange(event.target.value as TaalId)} value={selectedTaalId}>{taalOptions.map((taal) => <option className="text-charcoal" key={taal.id} value={taal.id}>{taal.label} ({taal.matras})</option>)}</select></label></div>
            <TaalCycle activeMatra={displayedMatra} taal={selectedTaal} />
            <TablaPracticeUI activeMatra={displayedMatra} isPlaying={isMetronomePlaying} onTempoChange={onTempoChange} onToggle={onToggleMetronome} taal={selectedTaal} tempoBpm={practiceTempoBpm} />
            {tanpuraControl}
            <div className="border-t border-white/10 pt-4"><p className="px-1 text-[10px] font-black uppercase tracking-[0.17em] text-mint-emerald">Instrument</p><div aria-label="Choose an instrument reference" className="mt-3 grid grid-cols-3 gap-1.5" role="group">{instrumentOptions.map((instrument) => { const isActive = instrument.id === selectedInstrument; return <button aria-pressed={isActive} className={["rounded-md px-2 py-2 text-left transition", isActive ? "bg-mint-emerald text-white" : "bg-white/[0.05] text-white/55 hover:bg-white/[0.1] hover:text-white"].join(" ")} key={instrument.id} onClick={() => onInstrumentChange(instrument.id)} type="button"><span className="block text-[10px] font-black">{instrument.label}</span><span className={isActive ? "mt-0.5 block text-[8px] font-bold text-white/65" : "mt-0.5 block text-[8px] font-bold text-white/30"}>{instrument.description}</span></button>; })}</div><details className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] open:bg-white/[0.06]"><summary className="cursor-pointer px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/65">Open {selectedInstrument} reference</summary><div className="border-t border-white/10 p-2">{instrumentPanel}</div></details></div>
          </aside>
        </div>
      </div>
    </section>
  );
}
