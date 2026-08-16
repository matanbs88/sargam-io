"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatRelativeMidiEvents,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { mockMidiData } from "@/src/lib/mockMidiData";
import { BansuriChartUI } from "@/src/components/instruments/BansuriChartUI";
import { GuitarTabsUI } from "@/src/components/instruments/GuitarTabsUI";
import { HarmoniumUI } from "@/src/components/instruments/HarmoniumUI";
import { KeyboardUI } from "@/src/components/instruments/KeyboardUI";
import { SitarUI } from "@/src/components/instruments/SitarUI";
import { TaalCycle } from "@/src/components/TaalCycle";
import { matraAtTime, TAALS, type TaalId } from "@/src/lib/taal";

type Instrument = "Harmonium" | "Keyboard" | "Bansuri" | "Guitar" | "Sitar" | "None";

const ROOT_OPTIONS = [
  { midi: 60, label: "C4" },
  { midi: 61, label: "C#4 / Db4" },
  { midi: 62, label: "D4" },
  { midi: 63, label: "D#4 / Eb4" },
  { midi: 64, label: "E4" },
  { midi: 65, label: "F4" },
  { midi: 66, label: "F#4 / Gb4" },
  { midi: 67, label: "G4" },
  { midi: 68, label: "G#4 / Ab4" },
  { midi: 69, label: "A4" },
  { midi: 70, label: "A#4 / Bb4" },
  { midi: 71, label: "B4" },
  { midi: 72, label: "C5" },
] as const;

const NOTATION_OPTIONS: readonly {
  readonly id: NotationSystem;
  readonly label: string;
  readonly detail: string;
}[] = [
  { id: "Sargam_EN", label: "Sa Re Ga", detail: "Sargam" },
  { id: "Sargam_HI", label: "Devanagari", detail: "Hindi" },
  { id: "ABC", label: "C D E", detail: "Pitch names" },
];

const INSTRUMENT_OPTIONS: readonly {
  readonly id: Instrument;
  readonly label: string;
  readonly description: string;
}[] = [
  { id: "None", label: "Score", description: "Note view" },
  { id: "Harmonium", label: "Harmonium", description: "Sargam keys" },
  { id: "Keyboard", label: "Keys", description: "Chromatic keys" },
  { id: "Bansuri", label: "Bansuri", description: "Fingering" },
  { id: "Sitar", label: "Sitar", description: "Relative frets" },
  { id: "Guitar", label: "Guitar", description: "Fretboard" },
];

function StudioMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal text-base font-black text-yellow-soft shadow-[0_8px_20px_rgba(19,96,82,0.22)]">
      S
    </span>
  );
}

function Waveform() {
  const bars = [18, 32, 52, 28, 66, 86, 46, 72, 100, 64, 38, 78, 56, 30, 48, 26];

  return (
    <div aria-hidden="true" className="flex h-24 items-center gap-1.5">
      {bars.map((height, index) => (
        <span
          className={index === 8 ? "w-1.5 rounded-full bg-yellow-soft" : "w-1.5 rounded-full bg-white/35"}
          key={index}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [notationSystem, setNotationSystem] =
    useState<NotationSystem>("Sargam_EN");
  const [selectedRootMidi, setSelectedRootMidi] = useState(
    mockMidiData.detectedKey.rootMidi,
  );
  const [credits, setCredits] = useState(2);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument>("Harmonium");
  const [droneMode, setDroneMode] = useState<"SaPa" | "SaMa">("SaPa");
  const [selectedTaalId, setSelectedTaalId] = useState<TaalId>("teentaal");
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const formattedNotes = useMemo(
    () =>
      formatRelativeMidiEvents(
        mockMidiData.noteEvents,
        selectedRootMidi,
        notationSystem,
      ),
    [notationSystem, selectedRootMidi],
  );

  const selectedRoot =
    ROOT_OPTIONS.find((option) => option.midi === selectedRootMidi) ??
    ROOT_OPTIONS[0];
  const isTransposed =
    selectedRootMidi !== mockMidiData.detectedKey.rootMidi;
  const activeEvent = mockMidiData.noteEvents[activeEventIndex];
  const activeMidi = activeEvent?.midi ?? null;
  const lastEventIndex = mockMidiData.noteEvents.length - 1;
  const selectedTaal = TAALS[selectedTaalId];
  const activeMatra = activeEvent
    ? matraAtTime(activeEvent.startMs, mockMidiData.tempoBpm, selectedTaal)
    : 0;
  const playbackProgress =
    lastEventIndex > 0 ? (activeEventIndex / lastEventIndex) * 100 : 0;

  useEffect(() => {
    if (!isPlaying || !isTranscribed || activeEvent === undefined) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (activeEventIndex >= lastEventIndex) {
        setIsPlaying(false);
        return;
      }
      setActiveEventIndex((currentIndex) => currentIndex + 1);
    }, Math.max(activeEvent.durationMs, 160));

    return () => window.clearTimeout(timer);
  }, [activeEvent, activeEventIndex, isPlaying, isTranscribed, lastEventIndex]);

  function handleTranscribe(): void {
    if (isTranscribed) return;

    if (credits === 0) {
      window.alert("You have no credits left in this Phase 1 preview.");
      return;
    }

    setCredits((currentCredits) => currentCredits - 1);
    setActiveEventIndex(0);
    setIsPlaying(false);
    setIsTranscribed(true);
    window.setTimeout(() => {
      document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function moveActiveNote(direction: -1 | 1): void {
    setIsPlaying(false);
    setActiveEventIndex((currentIndex) =>
      Math.min(Math.max(currentIndex + direction, 0), lastEventIndex),
    );
  }

  function togglePlayback(): void {
    if (lastEventIndex < 0) return;

    if (activeEventIndex >= lastEventIndex) {
      setActiveEventIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((currentValue) => !currentValue);
  }

  function handleStartAnother(): void {
    setIsPlaying(false);
    setActiveEventIndex(0);
    setIsTranscribed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream text-charcoal">
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:py-7">
        <a className="flex items-center gap-3" href="#top">
          <StudioMark />
          <span className="text-lg font-black tracking-[-0.04em] text-teal">
            sargam<span className="text-mint-emerald">.io</span>
          </span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-charcoal/45 sm:inline">
            Practice studio
          </span>
          <span className="rounded-full border border-teal/10 bg-white px-3.5 py-2 text-xs font-extrabold text-teal shadow-sm">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-mint-emerald" />
            {credits} credits
          </span>
        </div>
      </header>

      <section id="top" className="relative mx-auto max-w-7xl px-5 pb-20 pt-7 sm:px-8 sm:pt-12 lg:pb-28">
        <div aria-hidden="true" className="hero-orb left-[6%] top-8 bg-mint-emerald/20" />
        <div aria-hidden="true" className="hero-orb right-[7%] top-36 bg-yellow-soft/80" />

        <div className="relative overflow-hidden rounded-[2.25rem] bg-teal px-6 py-8 shadow-[0_30px_80px_rgba(15,61,54,0.24)] sm:rounded-[3rem] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div aria-hidden="true" className="absolute inset-0 studio-grid opacity-40" />
          <div aria-hidden="true" className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-mint-emerald/15 blur-3xl" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-yellow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-soft" />
                Indian music, made playable
              </div>
              <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                Every song,
                <span className="block text-yellow-soft">in your Sa.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                Turn a melody into relative notes, then see exactly where to
                play it on harmonium, bansuri, sitar, or guitar.
              </p>
              <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-white/75">
                {["Instant transposition", "Sargam + ABC", "Instrument view"].map((feature) => (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2" key={feature}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md rounded-[1.75rem] border border-white/15 bg-[#0d4d42]/80 p-5 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex items-center justify-between text-xs font-bold text-white/55">
                <span>NOW PLAYING</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/75">D is Sa</span>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-yellow-soft text-xl text-charcoal shadow-lg">♪</div>
                <div>
                  <p className="text-lg font-black text-white">Your melody</p>
                  <p className="mt-0.5 text-sm text-white/55">Relative note preview</p>
                </div>
              </div>
              <Waveform />
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex gap-1.5">
                  {["S", "R", "G", "m", "P"].map((note) => (
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-xs font-black text-white" key={note}>{note}</span>
                  ))}
                </div>
                <span className="text-xs font-bold text-yellow-soft">102 BPM</span>
              </div>
            </div>
          </div>

          <div className="relative mt-12 rounded-[1.5rem] bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-teal/10 bg-cream px-4 py-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal">↗</span>
                <input
                  aria-label="YouTube URL"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-charcoal outline-none placeholder:text-charcoal/40"
                  placeholder="Paste a YouTube link or drop an audio file"
                  type="url"
                />
                <span className="hidden rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-charcoal/40 sm:inline">Mock</span>
              </div>
              <button
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-yellow-soft px-6 py-4 text-sm font-black text-charcoal shadow-[0_8px_0_#d8ca70] transition hover:-translate-y-0.5 hover:shadow-[0_10px_0_#d8ca70] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:translate-y-1 active:shadow-none"
                onClick={handleTranscribe}
                type="button"
              >
                Transcribe melody <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </div>
            <p className="mt-3 px-1 text-xs font-medium text-charcoal/45">
              Phase 1 preview — it opens a local example transcription and does not upload anything.
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-7 grid max-w-4xl grid-cols-3 divide-x divide-teal/10 rounded-2xl border border-teal/10 bg-white/65 px-3 py-4 text-center shadow-sm backdrop-blur">
          <div><p className="text-lg font-black text-teal">12</p><p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/45">Swaras</p></div>
          <div><p className="text-lg font-black text-teal">3</p><p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/45">Notation views</p></div>
          <div><p className="text-lg font-black text-teal">0</p><p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/45">Upload cost now</p></div>
        </div>
      </section>

      {isTranscribed ? (
        <section aria-live="polite" className="border-t border-teal/10 bg-[#f3f1ea] px-5 py-16 sm:px-8 sm:py-20" id="studio">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-mint-emerald">Practice session</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-charcoal sm:text-4xl">{mockMidiData.title}</h2>
                <p className="mt-2 text-sm font-medium text-charcoal/55">{mockMidiData.detectedKey.displayName} original key <span className="mx-1.5 text-teal/30">·</span> {mockMidiData.tempoBpm} BPM <span className="mx-1.5 text-teal/30">·</span> {mockMidiData.timeSignature}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isTransposed ? <span className="rounded-full bg-mint-emerald px-3 py-2 text-xs font-black text-white">Transposed</span> : null}
                <button className="rounded-full border border-teal/15 bg-white px-4 py-2 text-xs font-black text-teal transition hover:bg-cream" onClick={handleStartAnother} type="button">New transcription</button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-teal/10 bg-white shadow-[0_20px_55px_rgba(15,47,42,0.1)]">
              <div className="flex flex-col gap-4 border-b border-teal/10 bg-teal px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-soft text-sm font-black text-charcoal">01</span>
                  <div><p className="text-sm font-black">Relative transcription</p><p className="text-xs text-white/55">Click any note to make it active</p></div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white/65"><span className="h-2 w-2 animate-pulse rounded-full bg-mint-emerald" /> Local mock session</div>
              </div>

              <div className="grid lg:grid-cols-[270px_minmax(0,1fr)]">
                <aside className="border-b border-teal/10 bg-cream p-6 lg:border-b-0 lg:border-r">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-charcoal/45">Your reference</p>
                  <label className="mt-5 block text-sm font-black text-teal" htmlFor="root-midi">Choose your Sa</label>
                  <div className="relative mt-2">
                    <select className="w-full appearance-none rounded-xl border border-teal/15 bg-white px-3 py-3 text-sm font-bold text-charcoal outline-none focus:ring-2 focus:ring-mint-emerald" id="root-midi" onChange={(event) => setSelectedRootMidi(Number(event.target.value))} value={selectedRootMidi}>
                      {ROOT_OPTIONS.map((option) => <option key={option.midi} value={option.midi}>{option.label} is Sa</option>)}
                    </select>
                    <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3.5 text-teal">⌄</span>
                  </div>
                  <div className="mt-6 rounded-xl border border-teal/10 bg-white p-4">
                    <p className="text-xs font-bold text-charcoal/50">Current setting</p>
                    <p className="mt-1 text-2xl font-black text-teal">{selectedRoot.label}<span className="ml-1 text-sm font-bold text-mint-emerald">= Sa</span></p>
                    <p className="mt-2 text-xs leading-5 text-charcoal/55">Transpose the whole score instantly to a comfortable singing or playing range.</p>
                  </div>
                </aside>

                <div className="min-w-0 p-6 sm:p-8">
                  <div className="flex flex-col gap-5 border-b border-teal/10 pb-6 xl:flex-row xl:items-center xl:justify-between">
                    <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-charcoal/45">Notation</p><p className="mt-1 text-sm font-medium text-charcoal/55">Switch notation without reprocessing.</p></div>
                    <div aria-label="Notation system" className="flex w-full rounded-xl bg-cream p-1 sm:w-auto" role="group">
                      {NOTATION_OPTIONS.map((option) => {
                        const isActive = option.id === notationSystem;
                        return <button aria-pressed={isActive} className={["flex-1 rounded-lg px-3 py-2 text-center transition sm:flex-none", isActive ? "bg-teal text-white shadow-sm" : "text-charcoal/55 hover:text-teal"].join(" ")} key={option.id} onClick={() => setNotationSystem(option.id)} type="button"><span className="block text-xs font-black">{option.label}</span><span className={["mt-0.5 block text-[9px] font-bold", isActive ? "text-white/55" : "text-charcoal/35"].join(" ")}>{option.detail}</span></button>;
                      })}
                    </div>
                  </div>

                  <div aria-label="Transcription notation" className="relative mt-7 overflow-hidden rounded-2xl border border-teal/10 bg-cream p-4 sm:p-6">
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mint-emerald via-yellow-soft to-teal" />
                    <div className="mb-5 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.16em] text-charcoal/45">Melody line</p><span className="text-xs font-bold text-teal/60">{formattedNotes.length} notes</span></div>
                    <div className="flex max-h-72 flex-wrap gap-2.5 overflow-y-auto pr-1 sm:gap-3">
                      {formattedNotes.map((note, index) => {
                        const isActive = index === activeEventIndex;
                        return <button aria-label={"Set active note " + String(index + 1)} aria-pressed={isActive} className={["group relative min-w-12 rounded-xl px-3 py-3 font-mono text-xl font-black transition sm:min-w-14 sm:text-2xl", isActive ? "bg-yellow-soft text-charcoal shadow-[0_5px_0_#d8ca70]" : "bg-white text-teal shadow-sm ring-1 ring-teal/10 hover:-translate-y-0.5 hover:bg-teal hover:text-white"].join(" ")} key={String(mockMidiData.noteEvents[index]?.startMs) + "-" + note + "-" + String(index)} onClick={() => { setIsPlaying(false); setActiveEventIndex(index); }} type="button"><span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-mint-emerald px-1.5 py-0.5 text-[8px] font-sans font-black text-white opacity-0 transition group-hover:opacity-100">{index + 1}</span>{note}</button>;
                      })}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-charcoal px-4 py-3.5 text-white sm:px-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <button aria-label={isPlaying ? "Pause mock playback" : "Play mock playback"} className="grid h-10 w-10 place-items-center rounded-full bg-yellow-soft text-sm font-black text-charcoal transition hover:scale-105" onClick={togglePlayback} type="button">{isPlaying ? "Ⅱ" : "▶"}</button>
                      <button aria-label="Previous note" className="rounded-lg px-2 py-1 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" disabled={activeEventIndex === 0} onClick={() => moveActiveNote(-1)} type="button">‹ Prev</button>
                      <button aria-label="Next note" className="rounded-lg px-2 py-1 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" disabled={activeEventIndex === lastEventIndex} onClick={() => moveActiveNote(1)} type="button">Next ›</button>
                      <div className="ml-auto min-w-32 flex-1 sm:max-w-xs"><div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-mint-emerald transition-all duration-300" style={{ width: `${playbackProgress}%` }} /></div><p className="mt-1.5 text-right text-[10px] font-bold text-white/45">NOTE {activeEventIndex + 1} / {mockMidiData.noteEvents.length}</p></div>
                    </div>
                  </div>

                  <div className="mt-7 border-t border-teal/10 pt-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-charcoal/45">Rhythm framework</p>
                        <p className="mt-1 text-sm font-medium text-charcoal/55">Use a chosen taal to organize your practice cycle.</p>
                      </div>
                      <label className="text-xs font-black text-teal" htmlFor="taal-select">
                        Practice taal
                        <select className="ml-2 rounded-lg border border-teal/15 bg-white px-2 py-1.5 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-mint-emerald" id="taal-select" onChange={(event) => setSelectedTaalId(event.target.value as TaalId)} value={selectedTaalId}>
                          {Object.values(TAALS).map((taal) => <option key={taal.id} value={taal.id}>{taal.label} ({taal.matras})</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="mt-4"><TaalCycle activeMatra={activeMatra} taal={selectedTaal} /></div>
                  </div>

                  <div className="mt-8 border-t border-teal/10 pt-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-charcoal/45">Play it visually</p><p className="mt-1 text-sm font-medium text-charcoal/55">The highlighted note follows the player.</p></div></div>
                    <div aria-label="Choose an instrument reference" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="group">
                      {INSTRUMENT_OPTIONS.map((instrument) => {
                        const isActive = instrument.id === selectedInstrument;
                        return <button aria-pressed={isActive} className={["rounded-xl border p-3 text-left transition", isActive ? "border-teal bg-teal text-white shadow-lg shadow-teal/15" : "border-teal/10 bg-cream text-charcoal hover:border-teal/30 hover:bg-white"].join(" ")} key={instrument.id} onClick={() => setSelectedInstrument(instrument.id)} type="button"><span className="block text-sm font-black">{instrument.label}</span><span className={["mt-0.5 block text-[10px] font-bold", isActive ? "text-white/55" : "text-charcoal/40"].join(" ")}>{instrument.description}</span></button>;
                      })}
                    </div>

                    {selectedInstrument === "Keyboard" ? <div className="mt-5"><KeyboardUI activeMidi={activeMidi} rootMidi={selectedRootMidi} /></div> : null}
                    {selectedInstrument === "Harmonium" ? <div className="mt-5"><HarmoniumUI activeMidi={activeMidi} droneMode={droneMode} onDroneModeChange={setDroneMode} rootMidi={selectedRootMidi} /></div> : null}
                    {selectedInstrument === "Bansuri" ? <div className="mt-5"><BansuriChartUI activeMidi={activeMidi} rootMidi={selectedRootMidi} /></div> : null}
                    {selectedInstrument === "Guitar" ? <div className="mt-5"><GuitarTabsUI activeMidi={activeMidi} rootMidi={selectedRootMidi} /></div> : null}
                    {selectedInstrument === "Sitar" ? <div className="mt-5"><SitarUI activeMidi={activeMidi} rootMidi={selectedRootMidi} /></div> : null}
                    {selectedInstrument === "None" ? <div className="mt-5 rounded-2xl border border-dashed border-teal/20 bg-cream p-6 text-center text-sm font-medium text-charcoal/50">Choose an instrument to see the current note on a playable reference.</div> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-teal/10 px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs font-medium text-charcoal/45 sm:flex-row sm:items-center sm:justify-between"><span>Sargam.io — relative notation for Indian music.</span><span>Phase 1 local mock experience</span></div></footer>
    </main>
  );
}
