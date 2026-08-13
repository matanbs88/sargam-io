"use client";

import { FormEvent, SVGProps, useMemo, useState } from "react";
import { formatRelativeNotes, type NotationSystem } from "@/src/lib/midiToSargam";
import { mockSong, rootOptions } from "@/src/lib/mockTranscription";

type Instrument = "keyboard" | "bansuri" | "guitar";
type AppStage = "home" | "settings" | "processing" | "results";

const instrumentLabels: Record<Instrument, string> = {
  keyboard: "Keyboard / Harmonium",
  bansuri: "Bansuri",
  guitar: "Guitar",
};

function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: "arrow" | "play" | "spark" | "upload" | "close" | "check" | "music" | "copy" | "download" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths = {
    arrow: <path {...common} d="M5 12h14m-6-6 6 6-6 6" />,
    play: <path {...common} d="m9 7 7 5-7 5V7Z" />,
    spark: <path {...common} d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />,
    upload: <><path {...common} d="M12 16V4m0 0L8 8m4-4 4 4" /><path {...common} d="M5 14v4h14v-4" /></>,
    close: <path {...common} d="m6 6 12 12M18 6 6 18" />,
    check: <path {...common} d="m5 12 4 4L19 6" />,
    music: <><path {...common} d="M9 18V6l10-2v12" /><path {...common} d="M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" /></>,
    copy: <><rect {...common} x="9" y="9" width="10" height="10" rx="1" /><path {...common} d="M15 9V6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" /></>,
    download: <><path {...common} d="M12 4v10m0 0 4-4m-4 4-4-4" /><path {...common} d="M5 18v2h14v-2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function Wordmark() {
  return <a href="#top" className="flex items-center gap-2.5 text-[#136052]" aria-label="Sargam home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#136052] text-[#fff099]"><Icon name="music" className="h-5 w-5" /></span><span className="text-xl font-bold tracking-[-0.06em]">sargam<span className="text-[#28b182]">.io</span></span></a>;
}

export default function Home() {
  const [stage, setStage] = useState<AppStage>("home");
  const [url, setUrl] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("keyboard");
  const [bansuriKey, setBansuriKey] = useState("F");
  const [rootMidi, setRootMidi] = useState(62);
  const [notation, setNotation] = useState<NotationSystem>("sargam");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => formatRelativeNotes(mockSong.midiNotes, rootMidi, notation), [notation, rootMidi]);
  const groupedNotes = useMemo(() => Array.from({ length: Math.ceil(notes.length / 8) }, (_, index) => notes.slice(index * 8, index * 8 + 8)), [notes]);

  function beginTranscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    setStage("settings");
  }

  async function confirmSettings() {
    setStage("processing");
    try {
      const response = await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: url }),
      });

      if (!response.ok) {
        throw new Error("Transcription request failed.");
      }

      await response.json();
      window.setTimeout(() => setStage("results"), 800);
    } catch {
      setStage("home");
    }
  }

  async function copyNotes() {
    await navigator.clipboard?.writeText(groupedNotes.map((line) => line.join(" ")).join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadNotes() {
    const notationLabel = notation === "sargam" ? "Sargam" : "ABC relative notes";
    const content = [
      `${mockSong.title} - ${mockSong.artist}`,
      `${notationLabel} | Root: ${rootOptions.find((option) => option.midi === rootMidi)?.label ?? "D"} as Sa`,
      "",
      ...groupedNotes.map((line) => line.join(" ")),
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${mockSong.title.toLowerCase().replaceAll(" ", "-")}-${notation}.txt`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  if (stage === "results") {
    return <ResultsView notation={notation} setNotation={setNotation} groupedNotes={groupedNotes} rootMidi={rootMidi} setRootMidi={setRootMidi} instrument={instrument} bansuriKey={bansuriKey} copied={copied} onCopy={copyNotes} onDownload={downloadNotes} onStartOver={() => setStage("home")} />;
  }

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#faf9f6] text-[#0f172a]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8"><Wordmark /><nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"><a href="#how-it-works" className="transition hover:text-[#136052]">How it works</a><a href="#instruments" className="transition hover:text-[#136052]">Instruments</a><a href="#faq" className="transition hover:text-[#136052]">FAQ</a></nav><button type="button" className="rounded-full border border-[#136052]/15 px-4 py-2 text-sm font-semibold text-[#136052] transition hover:border-[#136052]">Sign in</button></header>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute left-0 top-4 h-72 w-72 rounded-full bg-[#fff099]/45 blur-3xl" /><div className="pointer-events-none absolute right-[-5rem] top-10 h-80 w-80 rounded-full bg-[#28b182]/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center"><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#28b182]/20 bg-white px-3.5 py-1.5 text-sm font-medium text-[#136052] shadow-sm"><span className="h-2 w-2 rounded-full bg-[#28b182]" />Built for the way India learns music</p><h1 className="text-balance text-5xl font-bold tracking-[-0.065em] text-[#0f172a] sm:text-6xl lg:text-7xl">Hear it. <span className="text-[#136052]">Play it.</span></h1><p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-8 text-slate-600">Turn any song into clean Sargam notes in seconds. Made for keyboard, harmonium, bansuri and guitar.</p></div>

        <div className="relative mx-auto mt-12 max-w-4xl rounded-[2rem] bg-[#136052] p-5 shadow-[0_30px_90px_-28px_rgba(19,96,82,.7)] sm:p-8">
          <div className="floating-note absolute -left-7 top-8 hidden h-14 w-14 place-items-center rounded-2xl bg-white text-xl font-bold text-[#136052] shadow-lg lg:grid">S</div><div className="floating-note-delayed absolute -right-6 bottom-8 hidden h-12 w-12 place-items-center rounded-2xl bg-[#fff099] text-lg font-bold text-[#136052] shadow-lg lg:grid">R</div>
          <div className="rounded-[1.4rem] border border-white/15 bg-white/[.07] p-6 sm:p-9"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff099] text-[#136052]"><Icon name="upload" className="h-6 w-6" /></div><h2 className="mt-5 text-center text-2xl font-semibold tracking-tight text-white">Drop a song. Get the notes.</h2><p className="mt-2 text-center text-sm text-white/65">Paste a YouTube link to begin your transcription</p><form onSubmit={beginTranscription} className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row"><label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-sm"><Icon name="play" className="h-4 w-4 shrink-0 text-[#28b182]" /><input required value={url} onChange={(event) => setUrl(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-slate-400" placeholder="Paste a YouTube link..." aria-label="YouTube link" /></label><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fff099] px-6 py-3.5 text-sm font-bold text-[#1e293b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><Icon name="spark" className="h-4 w-4" />Transcribe <Icon name="arrow" className="h-4 w-4" /></button></form><p className="mt-5 text-center text-xs text-white/45">No upload needed for this demo · Audio files coming soon</p></div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#136052]/10 bg-white/60 py-18"><div className="mx-auto max-w-7xl px-6 lg:px-8"><p className="text-center text-sm font-bold uppercase tracking-[.18em] text-[#28b182]">A simpler way to learn</p><div className="mt-10 grid gap-5 md:grid-cols-3">{[["01", "Paste any song", "Start with a YouTube link. We find the melody for you."], ["02", "Set your instrument", "Choose your Sa, or tell us the bansuri you play."], ["03", "Play with confidence", "Read Sargam or letter notes, exactly how you prefer."]].map(([number, title, description]) => <article key={number} className="rounded-2xl border border-[#136052]/10 bg-[#faf9f6] p-6"><span className="text-sm font-bold text-[#28b182]">{number}</span><h3 className="mt-8 text-xl font-bold tracking-tight">{title}</h3><p className="mt-3 leading-7 text-slate-600">{description}</p></article>)}</div></div></section>

      <section id="instruments" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#28b182]">Made for your instrument</p><h2 className="mt-4 text-4xl font-bold tracking-[-.05em]">Notes that make sense the moment you see them.</h2><p className="mt-5 max-w-md text-lg leading-8 text-slate-600">Not western staff notation. Just the relative notes and fingering context you actually use to play.</p></div><div className="grid gap-4 sm:grid-cols-3">{[["⌨", "Keyboard & Harmonium", "Pick the Sa that suits your voice."], ["◌", "Bansuri", "See relative notes for your flute."], ["⌁", "Guitar", "Follow the melody in your own key."]].map(([symbol, title, copy]) => <article key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#136052]/10"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#136052]/8 text-2xl text-[#136052]">{symbol}</span><h3 className="mt-6 font-bold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></article>)}</div></div></section>

      <footer id="faq" className="border-t border-[#136052]/10 bg-white px-6 py-10"><div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><Wordmark /><p>© {new Date().getFullYear()} Sargam.io. Music is meant to be played.</p></div></footer>

      {stage === "settings" && <SettingsModal instrument={instrument} setInstrument={setInstrument} rootMidi={rootMidi} setRootMidi={setRootMidi} bansuriKey={bansuriKey} setBansuriKey={setBansuriKey} onClose={() => setStage("home")} onConfirm={confirmSettings} />}
      {stage === "processing" && <ProcessingOverlay />}
    </main>
  );
}

function SettingsModal({ instrument, setInstrument, rootMidi, setRootMidi, bansuriKey, setBansuriKey, onClose, onConfirm }: { instrument: Instrument; setInstrument: (instrument: Instrument) => void; rootMidi: number; setRootMidi: (midi: number) => void; bansuriKey: string; setBansuriKey: (key: string) => void; onClose: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Transcription settings"><div className="w-full max-w-lg rounded-3xl bg-[#faf9f6] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#28b182]">One quick setup</p><h2 className="mt-2 text-2xl font-bold tracking-tight">How do you want to play?</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-200" aria-label="Close settings"><Icon name="close" className="h-5 w-5" /></button></div><div className="mt-7"><label className="text-sm font-semibold">Your instrument</label><div className="mt-3 grid gap-2 sm:grid-cols-3">{(Object.keys(instrumentLabels) as Instrument[]).map((item) => <button type="button" key={item} onClick={() => setInstrument(item)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${instrument === item ? "border-[#136052] bg-[#136052] text-white" : "border-[#136052]/15 bg-white text-slate-700 hover:border-[#136052]/40"}`}>{instrumentLabels[item]}</button>)}</div></div>{instrument === "bansuri" ? <div className="mt-6"><label htmlFor="bansuri" className="text-sm font-semibold">Your bansuri key</label><select id="bansuri" value={bansuriKey} onChange={(event) => setBansuriKey(event.target.value)} className="mt-3 w-full rounded-xl border border-[#136052]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#136052]"><option>F</option><option>E</option><option>D</option><option>C</option><option>G</option></select><p className="mt-2 text-xs leading-5 text-slate-500">We&apos;ll keep the notation relative to your {bansuriKey} bansuri.</p></div> : <div className="mt-6"><label htmlFor="root" className="text-sm font-semibold">Choose your Sa (root note)</label><select id="root" value={rootMidi} onChange={(event) => setRootMidi(Number(event.target.value))} className="mt-3 w-full rounded-xl border border-[#136052]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#136052]">{rootOptions.map((option) => <option key={option.midi} value={option.midi}>{option.label} is Sa</option>)}</select><p className="mt-2 text-xs leading-5 text-slate-500">You can change this anytime in the results.</p></div>}<button type="button" onClick={onConfirm} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff099] px-5 py-4 text-sm font-bold text-[#1e293b] transition hover:bg-[#ffe969]"><Icon name="spark" className="h-4 w-4" />Create my notes</button></div></div>;
}

function ProcessingOverlay() {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#136052] p-6 text-center text-white"><div><div className="mx-auto flex h-16 items-end justify-center gap-1.5"><i className="wave-bar h-5 w-1.5 rounded-full bg-[#fff099]" /><i className="wave-bar h-12 w-1.5 rounded-full bg-[#fff099] [animation-delay:120ms]" /><i className="wave-bar h-8 w-1.5 rounded-full bg-[#fff099] [animation-delay:240ms]" /><i className="wave-bar h-14 w-1.5 rounded-full bg-[#fff099] [animation-delay:360ms]" /><i className="wave-bar h-7 w-1.5 rounded-full bg-[#fff099] [animation-delay:480ms]" /></div><h2 className="mt-8 text-2xl font-semibold">Listening for the melody…</h2><p className="mt-3 text-white/65">Finding the notes you need to play.</p></div></div>;
}

function ResultsView({ notation, setNotation, groupedNotes, rootMidi, setRootMidi, instrument, bansuriKey, copied, onCopy, onDownload, onStartOver }: { notation: NotationSystem; setNotation: (notation: NotationSystem) => void; groupedNotes: string[][]; rootMidi: number; setRootMidi: (rootMidi: number) => void; instrument: Instrument; bansuriKey: string; copied: boolean; onCopy: () => void; onDownload: () => void; onStartOver: () => void }) {
  return <main className="min-h-screen bg-[#faf9f6] text-[#0f172a]"><header className="sticky top-0 z-20 border-b border-[#136052]/10 bg-[#faf9f6]/90 px-6 py-4 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between"><Wordmark /><button type="button" onClick={onStartOver} className="text-sm font-semibold text-[#136052] hover:underline">Transcribe another song</button></div></header><div className="mx-auto max-w-6xl px-6 py-10 lg:py-14"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#28b182]">Your transcription is ready</p><h1 className="mt-2 text-4xl font-bold tracking-[-.05em]">{mockSong.title}</h1><p className="mt-2 text-slate-600">{mockSong.artist} · {mockSong.detectedKey} · {mockSong.bpm} BPM</p></div><div className="flex items-center gap-2 rounded-2xl border border-[#136052]/10 bg-white p-1.5 shadow-sm"><button type="button" onClick={() => setNotation("sargam")} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${notation === "sargam" ? "bg-[#136052] text-white" : "text-slate-500 hover:text-[#136052]"}`}>Sa Re Ga</button><button type="button" onClick={() => setNotation("abc")} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${notation === "abc" ? "bg-[#136052] text-white" : "text-slate-500 hover:text-[#136052]"}`}>C D E F</button></div></div><div className="mt-9 grid gap-6 lg:grid-cols-[1fr_290px]"><section className="rounded-3xl border border-[#136052]/10 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between border-b border-[#136052]/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Lead melody</p><p className="mt-1 text-sm text-slate-600">Relative to {rootOptions.find((option) => option.midi === rootMidi)?.label ?? "D"} as Sa</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff099] text-[#136052]"><Icon name="music" className="h-5 w-5" /></span></div><div className="mt-8 space-y-6">{groupedNotes.map((line, lineIndex) => <div key={lineIndex} className="flex flex-wrap items-baseline gap-x-4 gap-y-2"><span className="w-8 text-xs font-bold text-[#28b182]">{String(lineIndex + 1).padStart(2, "0")}</span>{line.map((note, noteIndex) => <span key={`${note}-${noteIndex}`} className={`font-mono text-2xl font-bold tracking-tight sm:text-3xl ${note === "S" || note === "C" ? "text-[#136052]" : "text-[#0f172a]"}`}>{note}</span>)}</div>)}</div><div className="mt-9 flex flex-wrap gap-3 border-t border-[#136052]/10 pt-6"><button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl border border-[#136052]/15 px-4 py-2.5 text-sm font-semibold text-[#136052] transition hover:bg-[#136052]/5"><Icon name={copied ? "check" : "copy"} className="h-4 w-4" />{copied ? "Copied notes" : "Copy notes"}</button><button type="button" onClick={onDownload} className="inline-flex items-center gap-2 rounded-xl border border-[#136052]/15 px-4 py-2.5 text-sm font-semibold text-[#136052] transition hover:bg-[#136052]/5"><Icon name="download" className="h-4 w-4" />Download TXT</button></div></section><aside className="space-y-4"><section className="rounded-3xl bg-[#136052] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#fff099]">Playing setup</p><h2 className="mt-4 text-xl font-bold">{instrumentLabels[instrument]}</h2><p className="mt-2 text-sm leading-6 text-white/70">{instrument === "bansuri" ? `Your ${bansuriKey} bansuri is set. Notes are displayed in the correct relative positions.` : "Choose another Sa to instantly transpose every note."}</p>{instrument !== "bansuri" && <select value={rootMidi} onChange={(event) => setRootMidi(Number(event.target.value))} className="mt-5 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white outline-none"><option className="text-slate-900" value="60">C is Sa</option>{rootOptions.filter((option) => option.midi !== 60).map((option) => <option className="text-slate-900" key={option.midi} value={option.midi}>{option.label} is Sa</option>)}</select>}</section><section className="rounded-3xl border border-[#136052]/10 bg-[#fff099]/45 p-6"><p className="text-sm font-bold text-[#136052]">Tip</p><p className="mt-2 text-sm leading-6 text-slate-700">Use lowercase notes for komal swaras. A dot marks mandra saptak; an apostrophe marks taar saptak.</p></section></aside></div></div></main>;
}
