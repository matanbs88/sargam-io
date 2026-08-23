"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatRelativeMidiEvents,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { mockMidiData } from "@/src/lib/mockMidiData";
import { PracticeWorkspace } from "@/src/components/PracticeWorkspace";
import { ScoreImportPanel } from "@/src/components/ScoreImportPanel";
import { TanpuraControl } from "@/src/components/TanpuraControl";
import { BansuriFallingNotes } from "@/src/components/visualizers/BansuriFallingNotes";
import { FallingNotesPianoRoll } from "@/src/components/visualizers/FallingNotesPianoRoll";
import { useDigitalAccompaniment } from "@/src/features/practice/useDigitalAccompaniment";
import { useMockTransport } from "@/src/features/practice/useMockTransport";
import type { DroneMode } from "@/src/lib/digitalAccompaniment";
import type {
  ImportedPracticeScore,
} from "@/src/lib/importedScoreTimeline";
import {
  parseSavedPracticeSession,
  type PracticeSource,
  type SavedPracticeSession,
} from "@/src/lib/practiceSession";
import {
  adjustMidiEvent,
  applyMidiOverrides,
  hasValidMidiOverrides,
} from "@/src/lib/editableMidi";
import type { EventLoopRange } from "@/src/lib/playback";
import { matraAtTime, TAALS, type TaalId } from "@/src/lib/taal";

type Visualizer = "Piano" | "Bansuri";
type Theme = "light" | "dark";

const PRACTICE_SESSION_STORAGE_KEY = "sargam-practice-session-v1";
const PRACTICE_SPEEDS = [0.5, 0.75, 1, 1.25] as const;
const DEMO_PRACTICE_SOURCE: PracticeSource = {
  kind: "mock",
  noteEvents: mockMidiData.noteEvents,
  rootMidi: mockMidiData.detectedKey.rootMidi,
  tempoBpm: mockMidiData.tempoBpm,
  timeSignature: mockMidiData.timeSignature,
  title: mockMidiData.title,
  validation: null,
};

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

function StudioMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal text-base font-black text-yellow-soft shadow-[0_8px_20px_rgba(19,96,82,0.22)]">
      S
    </span>
  );
}

export default function Home() {
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [notationSystem, setNotationSystem] =
    useState<NotationSystem>("Sargam_EN");
  const [selectedRootMidi, setSelectedRootMidi] = useState(
    DEMO_PRACTICE_SOURCE.rootMidi,
  );
  const [credits, setCredits] = useState(2);
  const [selectedVisualizer, setSelectedVisualizer] =
    useState<Visualizer>("Piano");
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [droneMode, setDroneMode] = useState<DroneMode>("SaPa");
  const [selectedTaalId, setSelectedTaalId] = useState<TaalId>("teentaal");
  const [practiceTempoBpm, setPracticeTempoBpm] = useState(
    DEMO_PRACTICE_SOURCE.tempoBpm,
  );
  const [practiceSource, setPracticeSource] = useState<PracticeSource>(
    DEMO_PRACTICE_SOURCE,
  );
  const [practiceEvents, setPracticeEvents] = useState(
    DEMO_PRACTICE_SOURCE.noteEvents,
  );
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopRange, setLoopRange] = useState<EventLoopRange | null>(null);
  const [loopAnchorIndex, setLoopAnchorIndex] = useState<number | null>(null);
  const [hasSavedPractice, setHasSavedPractice] = useState(false);
  const [isPracticeSessionReady, setIsPracticeSessionReady] = useState(false);
  const transpositionSemitones =
    selectedRootMidi - practiceSource.rootMidi;
  const performanceEvents = useMemo(
    () =>
      practiceEvents.map((event) => ({
        ...event,
        midi: event.midi + transpositionSemitones,
      })),
    [practiceEvents, transpositionSemitones],
  );
  const transport = useMockTransport({
    events: performanceEvents,
    isEnabled: isTranscribed,
    loopRange,
    playbackRate,
  });

  const formattedNotes = useMemo(
    () =>
      formatRelativeMidiEvents(
        performanceEvents,
        selectedRootMidi,
        notationSystem,
      ),
    [notationSystem, performanceEvents, selectedRootMidi],
  );

  const selectedRoot =
    ROOT_OPTIONS.find((option) => option.midi === selectedRootMidi) ??
    ROOT_OPTIONS[0];
  const isTransposed =
    selectedRootMidi !== practiceSource.rootMidi;
  const { activeEvent, activeEventIndex, isPlaying, lastEventIndex, playbackProgress } =
    transport;
  const selectedTaal = TAALS[selectedTaalId];
  const {
    activeMatra: accompanimentMatra,
    isDronePlaying,
    isTablaPlaying,
    playGuideNote,
    preloadGuideNotes,
    resumeAudio,
    toggleDrone,
    toggleTabla,
  } = useDigitalAccompaniment({
    guideInstrument: selectedVisualizer === "Piano" ? "piano" : "bansuri",
    droneMode,
    rootMidi: selectedRootMidi,
    taal: selectedTaal,
    tempoBpm: practiceTempoBpm,
  });
  const activeMatra = activeEvent
    ? matraAtTime(activeEvent.startMs, practiceTempoBpm, selectedTaal)
    : 0;
  const displayedMatra = isTablaPlaying
    ? accompanimentMatra
    : activeMatra;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem("sargam-theme");
      const resolvedTheme: Theme =
        savedTheme === "dark" ||
        (savedTheme === null &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
          ? "dark"
          : "light";

      setTheme(resolvedTheme);
      setIsThemeReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isThemeReady) return;

    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("sargam-theme", theme);
  }, [isThemeReady, theme]);

  useEffect(() => {
    const storedSession = window.localStorage.getItem(PRACTICE_SESSION_STORAGE_KEY);

    const parsedSession = parseSavedPracticeSession(storedSession);
    if (storedSession !== null && parsedSession === null) {
      window.localStorage.removeItem(PRACTICE_SESSION_STORAGE_KEY);
    }

    const timer = window.setTimeout(() => {
      if (parsedSession !== null) {
        const restoredSource = parsedSession.source ?? DEMO_PRACTICE_SOURCE;
        setPracticeSource(restoredSource);
        if (ROOT_OPTIONS.some((option) => option.midi === parsedSession.rootMidi)) setSelectedRootMidi(parsedSession.rootMidi);
        setSelectedVisualizer(parsedSession.visualizer);
        setNotationSystem(parsedSession.notation);
        setSelectedTaalId(parsedSession.taalId);
        setPracticeTempoBpm(parsedSession.tempoBpm);
        setPlaybackRate(parsedSession.playbackRate);
        if (hasValidMidiOverrides(parsedSession.midiOverrides, restoredSource.noteEvents.length)) {
          setPracticeEvents(applyMidiOverrides(restoredSource.noteEvents, parsedSession.midiOverrides));
        } else {
          setPracticeEvents(restoredSource.noteEvents);
        }
        setHasSavedPractice(true);
      }

      setIsPracticeSessionReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPracticeSessionReady || !isTranscribed || practiceSource.kind !== "mock") return;

    const session: SavedPracticeSession = {
      midiOverrides: practiceEvents.map((event) => event.midi),
      notation: notationSystem,
      playbackRate,
      rootMidi: selectedRootMidi,
      source: practiceSource,
      taalId: selectedTaalId,
      tempoBpm: practiceTempoBpm,
      visualizer: selectedVisualizer,
    };

    window.localStorage.setItem(PRACTICE_SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [
    isPracticeSessionReady,
    isTranscribed,
    notationSystem,
    playbackRate,
    practiceEvents,
    practiceTempoBpm,
    practiceSource,
    selectedRootMidi,
    selectedTaalId,
    selectedVisualizer,
  ]);

  useEffect(() => {
    if (!isPlaying || activeEvent === undefined) return;

    playGuideNote(
      activeEvent.midi,
      activeEvent.durationMs / playbackRate,
      activeEvent.velocity,
    );
  }, [activeEvent, isPlaying, playbackRate, playGuideNote]);

  function handleTranscribe(): void {
    if (isTranscribed) return;

    if (credits === 0) {
      window.alert("You have no credits left in this Phase 1 preview.");
      return;
    }

    setCredits((currentCredits) => currentCredits - 1);
    transport.reset();
    setPracticeSource(DEMO_PRACTICE_SOURCE);
    setPracticeEvents(DEMO_PRACTICE_SOURCE.noteEvents);
    setSelectedRootMidi(DEMO_PRACTICE_SOURCE.rootMidi);
    setPracticeTempoBpm(DEMO_PRACTICE_SOURCE.tempoBpm);
    setHasSavedPractice(true);
    setIsTranscribed(true);
    window.setTimeout(() => {
      document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleImportedScore(importedScore: ImportedPracticeScore): void {
    if (importedScore.timeSignature === null) {
      window.alert(
        "This score needs a readable time signature before it can open a practice timeline.",
      );
      return;
    }

    const importedSource: PracticeSource = {
      kind: "musicxml",
      noteEvents: importedScore.noteEvents,
      rootMidi: selectedRootMidi,
      tempoBpm: 96,
      timeSignature: importedScore.timeSignature,
      title: importedScore.title,
      validation: importedScore.validation,
    };

    transport.reset();
    setLoopAnchorIndex(null);
    setLoopRange(null);
    setPracticeSource(importedSource);
    setPracticeEvents(importedScore.noteEvents);
    setPracticeTempoBpm(importedSource.tempoBpm);
    setHasSavedPractice(false);
    setIsTranscribed(true);
    window.setTimeout(() => {
      document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleResumePractice(): void {
    transport.reset();
    setHasSavedPractice(true);
    setIsTranscribed(true);
    window.setTimeout(() => {
      document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function moveActiveNote(direction: -1 | 1): void {
    transport.step(direction);
  }

  function togglePlayback(): void {
    resumeAudio();
    preloadGuideNotes(performanceEvents.slice(0, 8));
    transport.togglePlayback();
  }

  function handleStartAnother(): void {
    transport.reset();
    setIsTranscribed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSetLoopPoint(): void {
    if (loopAnchorIndex === null) {
      setLoopAnchorIndex(activeEventIndex);
      return;
    }

    const startIndex = Math.min(loopAnchorIndex, activeEventIndex);
    const endIndex = Math.max(loopAnchorIndex, activeEventIndex);
    setLoopRange({ startIndex, endIndex });
    setLoopAnchorIndex(null);
    transport.selectEvent(startIndex);
  }

  function handleClearLoop(): void {
    setLoopRange(null);
    setLoopAnchorIndex(null);
  }

  function handleAdjustActiveNote(semitones: -1 | 1): void {
    setPracticeEvents((currentEvents) =>
      adjustMidiEvent(currentEvents, activeEventIndex, semitones),
    );
  }

  function handleResetNoteEdits(): void {
    setPracticeEvents(practiceSource.noteEvents);
  }

  function handleTaalChange(taalId: TaalId): void {
    setSelectedTaalId(taalId);
  }

  function handleToggleDrone(): void {
    toggleDrone();
  }

  function handleToggleMetronome(): void {
    toggleTabla();
  }

  function toggleTheme(): void {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light",
    );
  }

  async function handleDownloadSargamPdf(): Promise<void> {
    try {
      const response = await fetch("/api/exports/sargam-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compact: true,
          events: performanceEvents,
          notation: notationSystem,
          rootLabel: selectedRoot.label + " is Sa",
          rootMidi: selectedRootMidi,
          taalLabel: selectedTaal.label,
          tempoBpm: practiceTempoBpm,
          timeSignature: practiceSource.timeSignature,
          title: practiceSource.title,
        }),
      });

      if (!response.ok) {
        throw new Error("The Sargam PDF could not be prepared.");
      }

      const file = await response.blob();
      const downloadUrl = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "sargam-practice-sheet.pdf";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "The Sargam PDF could not be prepared.",
      );
    }
  }

  function renderPerformanceVisualizer() {
    return selectedVisualizer === "Piano" ? (
      <FallingNotesPianoRoll
        activeEventIndex={activeEventIndex}
        events={performanceEvents}
        notationSystem={notationSystem}
        rootMidi={selectedRootMidi}
      />
    ) : (
      <BansuriFallingNotes
        activeEventIndex={activeEventIndex}
        events={performanceEvents}
        notationSystem={notationSystem}
        rootMidi={selectedRootMidi}
      />
    );
  }

  return (
    <main className={`min-h-screen overflow-x-hidden text-charcoal transition-colors duration-300 ${isTranscribed ? "bg-[#07121f]" : "bg-cream"}`}>
      <header className={`relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 ${isTranscribed ? "lg:py-4" : "lg:py-7"}`}>
        <a className="flex items-center gap-3" href="#top">
          <StudioMark />
          <span className="font-heading text-2xl leading-none text-teal">
            sargam<span className="text-mint-emerald">.io</span>
          </span>
        </a>
        <div className="flex items-center gap-3">
          <span className={`hidden text-xs font-bold uppercase tracking-[0.16em] sm:inline ${isTranscribed ? "text-white/45" : "text-charcoal/45"}`}>
            Practice studio
          </span>
          <button
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-pressed={theme === "dark"}
            className="grid h-9 w-9 place-items-center rounded-full border border-teal/10 bg-white text-sm font-black text-teal shadow-sm transition hover:-translate-y-0.5 hover:border-mint-emerald focus:outline-none focus:ring-2 focus:ring-mint-emerald"
            onClick={toggleTheme}
            type="button"
          >
            <span aria-hidden="true">{theme === "light" ? "◐" : "☀"}</span>
          </button>
          <span className="rounded-full border border-teal/10 bg-white px-3.5 py-2 text-xs font-extrabold text-teal shadow-sm">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-mint-emerald" />
            {credits} credits
          </span>
        </div>
      </header>

      {!isTranscribed ? (
      <section id="top" className="relative mx-auto max-w-7xl px-5 pb-20 pt-7 sm:px-8 sm:pt-12 lg:pb-28">
        <div aria-hidden="true" className="hero-orb left-[6%] top-8 bg-mint-emerald/20" />
        <div aria-hidden="true" className="hero-orb right-[7%] top-36 bg-yellow-soft/80" />

        <div className="hero-surface relative overflow-hidden rounded-[1.6rem] px-6 py-8 shadow-[0_30px_80px_rgba(15,61,54,0.24)] sm:rounded-[2rem] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div aria-hidden="true" className="absolute inset-0 studio-grid opacity-40" />
          <div aria-hidden="true" className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-mint-emerald/15 blur-3xl" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-yellow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-soft" />
                Indian music, made playable
              </div>
              <h1 className="mt-6 font-heading text-6xl leading-[0.86] tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl">
                Every melody,
                <span className="block text-yellow-soft">in your Sa.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                Explore a relative-note practice canvas, then see where to
                play a prepared melody on your instrument.
              </p>
              <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-white/75">
                {["Choose your Sa", "Sargam + ABC", "Instrument view"].map((feature) => (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2" key={feature}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-melody relative mx-auto w-full max-w-md rounded-[1.15rem] border border-white/20 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                <span>Now playing</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/75">D is Sa</span>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-[0.9rem] border border-yellow-soft/35 bg-yellow-soft/15 font-heading text-3xl text-yellow-soft">S</div>
                <div>
                  <p className="font-heading text-2xl leading-none text-white">Your melody</p>
                  <p className="mt-0.5 text-sm text-white/55">Relative note preview</p>
                </div>
              </div>
              <div className="mt-8 flex items-end justify-between border-t border-white/15 pt-5">
                <div aria-label="Preview notes" className="flex gap-1.5">
                  {["S", "R", "G", "m", "P"].map((note) => (
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-xs font-black text-white" key={note}>{note}</span>
                  ))}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-yellow-soft">102 BPM</span>
              </div>
            </div>
          </div>

          <div className="relative mt-12 rounded-[1.1rem] bg-white/95 p-3 shadow-[0_18px_40px_rgba(3,35,30,0.22)] sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-teal/10 bg-cream px-4 py-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal">↗</span>
                <input
                  aria-label="Future transcription source"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-charcoal outline-none placeholder:text-charcoal/40"
                  placeholder="YouTube and audio upload are coming in private alpha"
                  type="url"
                />
                <span className="hidden rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-charcoal/40 sm:inline">Mock</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="group inline-flex items-center justify-center gap-3 rounded-lg bg-yellow-soft px-6 py-4 text-sm font-black text-charcoal shadow-yellow-glow transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_15px_32px_rgba(255,240,153,0.42)] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-95"
                  onClick={handleTranscribe}
                  type="button"
                >
                  Open practice demo <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
                {hasSavedPractice ? (
                  <button
                    className="rounded-lg border border-teal/15 bg-white px-4 py-3 text-xs font-black text-teal transition hover:-translate-y-0.5 hover:border-mint-emerald hover:bg-mint-emerald/10 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
                    onClick={handleResumePractice}
                    type="button"
                  >
                    Resume practice
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-3 px-1 text-xs font-medium text-charcoal/45">
              Phase 1 preview — it opens a local example transcription and does not upload anything.
            </p>
            <ScoreImportPanel onImported={handleImportedScore} />
          </div>
        </div>

        <div className="relative mx-auto mt-7 grid max-w-4xl grid-cols-3 divide-x divide-teal/10 rounded-xl bg-white/65 px-3 py-4 text-center shadow-teal-soft backdrop-blur">
          <div><p className="text-lg font-black text-teal">12</p><p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/45">Swaras</p></div>
          <div><p className="text-lg font-black text-teal">3</p><p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/45">Notation views</p></div>
          <div><p className="text-lg font-black text-teal">0</p><p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/45">Upload cost now</p></div>
        </div>
      </section>
      ) : null}

      {isTranscribed ? (
        <PracticeWorkspace
          activeEventIndex={activeEventIndex}
          hasManualEdits={practiceEvents.some((event, index) => event.midi !== practiceSource.noteEvents[index]?.midi)}
          importValidation={practiceSource.validation}
          displayedMatra={displayedMatra}
          formattedNotes={formattedNotes}
          isMetronomePlaying={isTablaPlaying}
          isPlaying={isPlaying}
          isTransposed={isTransposed}
          lastEventIndex={lastEventIndex}
          loopAnchorIndex={loopAnchorIndex}
          loopRange={loopRange}
          notationOptions={NOTATION_OPTIONS}
          notationSystem={notationSystem}
          onCinemaView={() => setIsCinemaMode(true)}
          onAdjustActiveNote={handleAdjustActiveNote}
          onDownloadSargamPdf={handleDownloadSargamPdf}
          onMoveNote={moveActiveNote}
          onNotationChange={setNotationSystem}
          onRootChange={setSelectedRootMidi}
          onClearLoop={handleClearLoop}
          onSelectEvent={transport.selectEvent}
          onSetLoopPoint={handleSetLoopPoint}
          onStartAnother={handleStartAnother}
          onTaalChange={handleTaalChange}
          onTempoChange={setPracticeTempoBpm}
          onToggleMetronome={handleToggleMetronome}
          onTogglePlayback={togglePlayback}
          onVisualizerChange={setSelectedVisualizer}
          performanceVisualizer={renderPerformanceVisualizer()}
          playbackProgress={playbackProgress}
          playbackRate={playbackRate}
          practiceTempoBpm={practiceTempoBpm}
          rootOptions={ROOT_OPTIONS}
          selectedRootLabel={selectedRoot.label}
          selectedRootMidi={selectedRootMidi}
          selectedTaal={selectedTaal}
          selectedTaalId={selectedTaalId}
          selectedVisualizer={selectedVisualizer}
          songTitle={practiceSource.title}
          speedOptions={PRACTICE_SPEEDS}
          onPlaybackRateChange={setPlaybackRate}
          onResetNoteEdits={handleResetNoteEdits}
          taalOptions={Object.values(TAALS)}
          tanpuraControl={<TanpuraControl droneMode={droneMode} isPlaying={isDronePlaying} onModeChange={setDroneMode} onToggle={handleToggleDrone} rootLabel={selectedRoot.label} />}
          tempoBpm={practiceTempoBpm}
        />
      ) : null}

      {isCinemaMode ? (
        <div aria-label="Cinema performance view" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/95 p-4 backdrop-blur-md sm:p-8" role="dialog">
          <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-mint-emerald">Sargam.io · performance view</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{practiceSource.title}</h2></div>
              <button aria-label="Exit cinema view" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-soft" onClick={() => setIsCinemaMode(false)} type="button">Exit view</button>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1626] p-3 shadow-[0_28px_100px_rgba(0,0,0,0.48)] sm:p-5">{renderPerformanceVisualizer()}</div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-white/45"><span>{selectedRoot.label} = Sa · {practiceTempoBpm} BPM · {selectedVisualizer} mode</span><span>{practiceSource.kind === "mock" ? "Prepared demo · performance framing" : "Imported MusicXML draft · performance framing"}</span></div>
          </div>
        </div>
      ) : null}

      {!isTranscribed ? <footer className="border-t border-teal/10 px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs font-medium text-charcoal/45 sm:flex-row sm:items-center sm:justify-between"><span>Sargam.io — relative notation for Indian music.</span><span>Phase 1 local mock experience</span></div></footer> : null}
    </main>
  );
}
