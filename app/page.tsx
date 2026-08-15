"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatRelativeMidiEvents,
  type NotationSystem,
} from "@/src/lib/midiToSargam";
import { mockMidiData } from "@/src/lib/mockMidiData";
import { BansuriChartUI } from "@/src/components/instruments/BansuriChartUI";
import { GuitarTabsUI } from "@/src/components/instruments/GuitarTabsUI";
import { KeyboardUI } from "@/src/components/instruments/KeyboardUI";

type Instrument = "Keyboard" | "Bansuri" | "Guitar" | "None";

const ROOT_OPTIONS = [
  { midi: 60, label: "C4" },
  { midi: 61, label: "C♯4 / D♭4" },
  { midi: 62, label: "D4" },
  { midi: 63, label: "D♯4 / E♭4" },
  { midi: 64, label: "E4" },
  { midi: 65, label: "F4" },
  { midi: 66, label: "F♯4 / G♭4" },
  { midi: 67, label: "G4" },
  { midi: 68, label: "G♯4 / A♭4" },
  { midi: 69, label: "A4" },
  { midi: 70, label: "A♯4 / B♭4" },
  { midi: 71, label: "B4" },
  { midi: 72, label: "C5" },
] as const;

const NOTATION_OPTIONS: readonly {
  readonly id: NotationSystem;
  readonly label: string;
}[] = [
  { id: "ABC", label: "ABC" },
  { id: "Sargam_EN", label: "Sa Re Ga" },
  { id: "Sargam_HI", label: "सा रे ग" },
];

const INSTRUMENT_OPTIONS: readonly Instrument[] = [
  "None",
  "Keyboard",
  "Bansuri",
  "Guitar",
];

export default function Home() {
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [notationSystem, setNotationSystem] =
    useState<NotationSystem>("Sargam_EN");
  const [selectedRootMidi, setSelectedRootMidi] = useState(
    mockMidiData.detectedKey.rootMidi,
  );
  const [credits, setCredits] = useState(2);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument>("None");
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
    if (isTranscribed) {
      return;
    }

    if (credits === 0) {
      window.alert("You have no credits left in this Phase 1 preview.");
      return;
    }

    setCredits((currentCredits) => currentCredits - 1);
    setActiveEventIndex(0);
    setIsPlaying(false);
    setIsTranscribed(true);
  }

  function moveActiveNote(direction: -1 | 1): void {
    setIsPlaying(false);
    setActiveEventIndex((currentIndex) =>
      Math.min(Math.max(currentIndex + direction, 0), lastEventIndex),
    );
  }

  function togglePlayback(): void {
    if (lastEventIndex < 0) {
      return;
    }

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
  }

  return (
    <main className="min-h-screen bg-cream text-charcoal">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a className="text-xl font-black tracking-tight text-teal" href="#top">
          sargam<span className="text-mint-emerald">.io</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-mint-emerald px-3 py-1.5 text-xs font-bold text-white">
            Credits: {credits}
          </span>
          <span className="hidden rounded-full border border-teal/15 bg-white px-3 py-1.5 text-xs font-semibold text-teal sm:inline">
            Phase 1 · Mock MVP
          </span>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint-emerald">
            Relative notation for Indian music
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-charcoal sm:text-6xl">
            Hear it. Play it in <span className="text-teal">Sargam.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-charcoal/70">
            Turn a song into learner-friendly relative notes for keyboard,
            harmonium, bansuri, and guitar.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-[2rem] bg-teal p-5 shadow-2xl shadow-teal/20 sm:p-8">
          <div className="rounded-[1.5rem] border border-white/15 bg-white/5 p-6 sm:p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yellow-soft text-2xl text-charcoal">
              ♫
            </div>
            <h2 className="mt-5 text-center text-2xl font-bold text-white">
              Drop a song. Get the notes.
            </h2>
            <p className="mt-2 text-center text-sm text-white/70">
              This Phase 1 preview uses local mock MIDI data only.
            </p>

            <div className="mt-8 rounded-2xl border border-dashed border-white/35 px-5 py-8 text-center text-sm text-white/75">
              Drag and drop an audio file here
              <span className="mt-1 block text-xs text-white/50">
                Visual placeholder — uploads are not active yet
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="YouTube URL"
                className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3.5 text-sm text-charcoal outline-none ring-2 ring-transparent placeholder:text-charcoal/45 focus:ring-yellow-soft"
                placeholder="Paste a YouTube link (visual preview)"
                type="url"
              />
              <button
                className="rounded-xl bg-yellow-soft px-6 py-3.5 text-sm font-extrabold text-charcoal transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal"
                onClick={handleTranscribe}
                type="button"
              >
                Transcribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {isTranscribed ? (
        <section
          aria-live="polite"
          className="border-t border-teal/10 bg-white/65 px-6 py-14"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint-emerald">
                  Mock transcription ready
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-charcoal">
                  {mockMidiData.title}
                </h2>
                <p className="mt-2 text-sm text-charcoal/65">
                  Original key: {mockMidiData.detectedKey.displayName} ·{" "}
                  {mockMidiData.tempoBpm} BPM · {mockMidiData.timeSignature}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isTransposed ? (
                  <span className="w-fit rounded-full bg-mint-emerald px-3 py-1.5 text-sm font-bold text-white">
                    Transposed
                  </span>
                ) : null}
                <button
                  className="rounded-full border border-teal/20 bg-white px-3 py-1.5 text-sm font-bold text-teal transition hover:bg-cream"
                  onClick={handleStartAnother}
                  type="button"
                >
                  Transcribe another
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
              <aside className="rounded-3xl bg-teal p-6 text-white">
                <label
                  className="text-sm font-bold text-yellow-soft"
                  htmlFor="root-midi"
                >
                  Choose your Sa
                </label>
                <select
                  className="mt-3 w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-semibold text-charcoal outline-none focus:ring-2 focus:ring-yellow-soft"
                  id="root-midi"
                  onChange={(event) =>
                    setSelectedRootMidi(Number(event.target.value))
                  }
                  value={selectedRootMidi}
                >
                  {ROOT_OPTIONS.map((option) => (
                    <option key={option.midi} value={option.midi}>
                      {option.label} is Sa
                    </option>
                  ))}
                </select>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  Notes update immediately relative to {selectedRoot.label}.
                </p>
              </aside>

              <section className="rounded-3xl border border-teal/10 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 border-b border-teal/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-charcoal/50">
                      Notation system
                    </p>
                    <p className="mt-1 text-sm text-charcoal/65">
                      Switch views without a new transcription.
                    </p>
                  </div>
                  <div
                    aria-label="Notation system"
                    className="inline-flex w-fit rounded-xl bg-cream p-1"
                    role="group"
                  >
                    {NOTATION_OPTIONS.map((option) => {
                      const isActive = option.id === notationSystem;

                      return (
                        <button
                          aria-pressed={isActive}
                          className={[
                            "rounded-lg px-3 py-2 text-sm font-bold transition",
                            isActive
                              ? "bg-mint-emerald text-white shadow-sm"
                              : "text-charcoal/65 hover:text-teal",
                          ].join(" ")}
                          key={option.id}
                          onClick={() => setNotationSystem(option.id)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  aria-label="Transcription notation"
                  className="mt-6 max-h-80 overflow-y-auto rounded-2xl bg-cream p-5"
                >
                  <div className="flex flex-wrap gap-x-5 gap-y-4 font-mono text-2xl font-bold leading-relaxed text-charcoal sm:text-3xl">
                    {formattedNotes.map((note, index) => (
                      <button
                        aria-label={"Set active note " + String(index + 1)}
                        aria-pressed={index === activeEventIndex}
                        className={[
                          "rounded-lg px-2 py-1 shadow-sm ring-1 transition",
                          index === activeEventIndex
                            ? "bg-yellow-soft ring-teal/40"
                            : "bg-white ring-teal/10 hover:bg-yellow-soft/55",
                        ].join(" ")}
                        key={
                          String(mockMidiData.noteEvents[index]?.startMs) +
                          "-" +
                          note +
                          "-" +
                          String(index)
                        }
                        onClick={() => {
                          setIsPlaying(false);
                          setActiveEventIndex(index);
                        }}
                        type="button"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-lg border border-teal/20 px-3 py-2 text-sm font-bold text-teal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={activeEventIndex === 0}
                    onClick={() => moveActiveNote(-1)}
                    type="button"
                  >
                    Previous
                  </button>
                  <button
                    aria-label={isPlaying ? "Pause mock playback" : "Play mock playback"}
                    className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:brightness-95"
                    onClick={togglePlayback}
                    type="button"
                  >
                    {isPlaying ? "Pause" : "Play mock"}
                  </button>
                  <button
                    className="rounded-lg border border-teal/20 px-3 py-2 text-sm font-bold text-teal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={activeEventIndex === lastEventIndex}
                    onClick={() => moveActiveNote(1)}
                    type="button"
                  >
                    Next
                  </button>
                  <span className="ml-1 text-xs font-semibold text-charcoal/55">
                    Note {activeEventIndex + 1} of {mockMidiData.noteEvents.length}
                  </span>
                </div>

                <div className="mt-6 border-t border-teal/10 pt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-charcoal/50">
                    Instrument reference
                  </p>
                  <div
                    aria-label="Choose an instrument reference"
                    className="mt-3 inline-flex rounded-xl bg-cream p-1"
                    role="group"
                  >
                    {INSTRUMENT_OPTIONS.map((instrument) => {
                      const isActive = instrument === selectedInstrument;

                      return (
                        <button
                          aria-pressed={isActive}
                          className={[
                            "rounded-lg px-3 py-2 text-sm font-bold transition",
                            isActive
                              ? "bg-teal text-white shadow-sm"
                              : "text-charcoal/65 hover:text-teal",
                          ].join(" ")}
                          key={instrument}
                          onClick={() => setSelectedInstrument(instrument)}
                          type="button"
                        >
                          {instrument}
                        </button>
                      );
                    })}
                  </div>

                  {selectedInstrument === "Keyboard" ? (
                    <div className="mt-5">
                      <KeyboardUI
                        activeMidi={activeMidi}
                        rootMidi={selectedRootMidi}
                      />
                    </div>
                  ) : null}

                  {selectedInstrument === "Bansuri" ? (
                    <div className="mt-5">
                      <BansuriChartUI
                        activeMidi={activeMidi}
                        rootMidi={selectedRootMidi}
                      />
                    </div>
                  ) : null}

                  {selectedInstrument === "Guitar" ? (
                    <div className="mt-5">
                      <GuitarTabsUI
                        activeMidi={activeMidi}
                        rootMidi={selectedRootMidi}
                      />
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
