"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  importedScoreToPracticeScore,
  selectImportedMelody,
  type ImportedPracticeScore,
  type ImportedScorePayload,
  type ImportedScoreValidation,
} from "@/src/lib/importedScoreTimeline";

type ScoreImportPanelProps = {
  readonly onImported: (score: ImportedPracticeScore) => void;
};

type ImportState = "idle" | "reading" | "ready" | "error";

type ImportResponse = {
  readonly error?: string;
  readonly score?: ImportedScorePayload;
  readonly validation?: ImportedScoreValidation;
};

export function ScoreImportPanel({ onImported }: ScoreImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const importController = useRef<AbortController | null>(null);
  useEffect(() => () => importController.current?.abort(), []);
  const [state, setState] = useState<ImportState>("idle");
  const [pendingScore, setPendingScore] = useState<ImportedPracticeScore | null>(null);
  const [voiceId, setVoiceId] = useState("");
  const [message, setMessage] = useState(
    "MusicXML and MXL open directly into your private review draft.",
  );

  async function importScore(file: File): Promise<void> {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const limit = (isPdf ? 12 : 6) * 1024 * 1024;
    if (!file.size || file.size > limit) {
      setState('error');
      setMessage(`Choose a non-empty ${isPdf ? 'PDF up to 12 MB' : 'MusicXML or MXL file up to 6 MB'}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }
    importController.current?.abort();
    const controller = new AbortController();
    importController.current = controller;
    const endpoint = isPdf ? "/api/imports/score-pdf" : "/api/imports/musicxml";
    setState("reading");
    setPendingScore(null);
    setMessage(
      isPdf
        ? `Reading ${file.name} through the local OMR pilot — no AI credit is used.`
        : `Reading ${file.name} — no AI credit is used.`,
    );

    const formData = new FormData();
    formData.set("score", file);

    try {
      const response = await fetch(endpoint, {
        body: formData,
        method: "POST",
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(isPdf ? 150_000 : 30_000)]),
      });
      const payload = (await response.json()) as ImportResponse;

      if (!response.ok || payload.score === undefined || payload.validation === undefined) {
        throw new Error(payload.error ?? "The score could not be imported.");
      }
      if (payload.score.timeSignature === null) {
        throw new Error(
          "This beta needs a readable time signature before it can open a practice timeline.",
        );
      }

      const practiceScore = importedScoreToPracticeScore(
        payload.score,
        payload.validation,
      );
      if (!practiceScore.noteEvents.length) {
        throw new Error('No playable notes were found in this score. Try a score containing pitched notes.');
      }
      if (controller.signal.aborted) return;
      if (practiceScore.voices.length > 1 || practiceScore.voices.some(voice => voice.estimated)) {
        setPendingScore(practiceScore);
        setVoiceId(practiceScore.voices[0].id);
        setState("ready");
        setMessage("Choose the written melody voice. The full arrangement is retained for piano; flute and harmonium use only your selected melody.");
        return;
      }
      onImported(selectImportedMelody(practiceScore, practiceScore.voices[0].id));
      setState("ready");
      setMessage(
        practiceScore.validation.requiresReview
          ? "Opened as a review draft. Check the marked rhythm or voice warnings before sharing."
          : isPdf
            ? "PDF converted in the local pilot. Review the Sa, notation, tempo, and practice view."
            : "Score ready. Review the Sa, notation, tempo, and practice view.",
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "The score could not be imported.",
      );
    } finally {
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
      if (pdfInputRef.current !== null) pdfInputRef.current.value = "";
      if (importController.current === controller) importController.current = null;
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const [file] = Array.from(event.target.files ?? []);
    if (file !== undefined) void importScore(file);
  }

  return (
    <div data-score-import data-import-state={state} className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-teal/20 bg-teal/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal">
          Have staff notation?
        </p>
        <p
          aria-live="polite"
          data-import-message
          className={[
            "mt-1 text-xs font-medium",
            state === "error" ? "text-red-700" : "text-charcoal/55",
          ].join(" ")}
        >
          {message}
        </p>
      </div>
      {pendingScore && <fieldset className="min-w-0 rounded-md border border-teal/20 bg-white p-3">
        <legend className="px-1 text-xs font-semibold text-teal">Select melody voice</legend>
        <label className="flex flex-col gap-1 text-xs">
          Written staff and voice
          <select value={voiceId} onChange={event => setVoiceId(event.target.value)} className="rounded border p-2">
            {pendingScore.voices.map(voice => <option key={voice.id} value={voice.id}>
              {voice.label} · {voice.events.length} notes{voice.estimated ? " · upper-note estimate (review)" : " · single-note line"}
            </option>)}
          </select>
        </label>
        <p className="my-2 text-xs text-charcoal/70">A voice number does not establish which line is the melody. Check the original score. Chordal voices are reduced to an explicitly marked estimate.</p>
        <div className="flex gap-3">
          <button type="button" className="rounded bg-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => {
            const selected = selectImportedMelody(pendingScore, voiceId);
            setPendingScore(null);
            onImported(selected);
          }}>Open selected melody</button>
          <button type="button" className="text-xs" onClick={() => { setPendingScore(null); setState("idle"); setMessage("Selection cancelled. Choose another score."); }}>Cancel selection</button>
        </div>
      </fieldset>}
      <div className="flex shrink-0 items-center gap-2">
        <input
          accept=".musicxml,.xml,.mxl,application/vnd.recordare.musicxml+xml,application/xml,text/xml"
          hidden
          disabled={state === "reading"}
          id="musicxml-upload"
          aria-label="Choose a MusicXML or MXL score"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <input
          accept=".pdf,application/pdf"
          hidden
          disabled={state === "reading"}
          id="score-pdf-upload"
          aria-label="Choose a PDF score"
          onChange={handleFileChange}
          ref={pdfInputRef}
          type="file"
        />
        <button
          className={[
            "cursor-pointer rounded-md border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition focus-within:outline-none focus-within:ring-2 focus-within:ring-teal",
            state === "reading"
              ? "cursor-wait border-teal/10 bg-teal/5 text-teal/40"
              : "border-teal/15 bg-white text-teal hover:border-mint-emerald hover:bg-mint-emerald/10",
          ].join(" ")}
          type="button"
          disabled={state === 'reading'}
          onClick={() => fileInputRef.current?.click()}
        >
          {state === "reading" ? "Reading score…" : "Import MusicXML"}
        </button>
        <button
          className={[
            "rounded-md border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-teal",
            state === "reading"
              ? "cursor-wait border-teal/10 bg-teal/5 text-teal/40"
              : "border-teal/15 bg-white text-teal hover:border-mint-emerald hover:bg-mint-emerald/10",
          ].join(" ")}
          disabled={state === "reading"}
          onClick={() => pdfInputRef.current?.click()}
          type="button"
        >
          Import PDF pilot
        </button>
        {state === 'reading' && <button type="button" onClick={() => {
          importController.current?.abort();
          setState('idle');
          setMessage('Import cancelled. You can choose another file.');
        }}>Cancel import</button>}
      </div>
    </div>
  );
}
