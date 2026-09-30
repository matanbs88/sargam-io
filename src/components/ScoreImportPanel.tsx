"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  importedScoreToPracticeScore,
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
      onImported(practiceScore);
      setState("ready");
      setMessage(
        payload.validation.requiresReview
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
