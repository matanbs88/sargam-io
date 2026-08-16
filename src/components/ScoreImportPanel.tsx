"use client";

import { useRef, useState, type ChangeEvent } from "react";
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
  const [state, setState] = useState<ImportState>("idle");
  const [message, setMessage] = useState(
    "MusicXML and MXL open directly into your private review draft.",
  );

  async function importScore(file: File): Promise<void> {
    setState("reading");
    setMessage(`Reading ${file.name} — no AI credit is used.`);

    const formData = new FormData();
    formData.set("score", file);

    try {
      const response = await fetch("/api/imports/musicxml", {
        body: formData,
        method: "POST",
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
      onImported(practiceScore);
      setState("ready");
      setMessage(
        payload.validation.requiresReview
          ? "Opened as a review draft. Check the marked rhythm or voice warnings before sharing."
          : "Score ready. Review the Sa, notation, tempo, and practice view.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "The score could not be imported.",
      );
    } finally {
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const [file] = Array.from(event.target.files ?? []);
    if (file !== undefined) void importScore(file);
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-teal/20 bg-teal/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal">
          Have staff notation?
        </p>
        <p
          aria-live="polite"
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
          className="sr-only"
          disabled={state === "reading"}
          id="musicxml-upload"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <label
          className={[
            "cursor-pointer rounded-md border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition focus-within:outline-none focus-within:ring-2 focus-within:ring-teal",
            state === "reading"
              ? "cursor-wait border-teal/10 bg-teal/5 text-teal/40"
              : "border-teal/15 bg-white text-teal hover:border-mint-emerald hover:bg-mint-emerald/10",
          ].join(" ")}
          htmlFor="musicxml-upload"
        >
          {state === "reading" ? "Reading score…" : "Import MusicXML"}
        </label>
        <span className="hidden rounded-md bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-charcoal/35 sm:inline">
          MXL ready
        </span>
      </div>
    </div>
  );
}
