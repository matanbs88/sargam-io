"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { importedScoreToPracticeScore, type ImportedPracticeScore, type ImportedScorePayload, type ImportedScoreValidation } from "@/src/lib/importedScoreTimeline";
import { BATCH_01_MANIFEST } from "@/src/lib/scoreCorpusManifest";
import { SONG_CATALOG, type CatalogSong } from "@/src/lib/songCatalog";

type CatalogBatchImportPanelProps = {
  readonly onImported: (song: CatalogSong, score: ImportedPracticeScore) => void;
};

type ImportResponse = {
  readonly error?: string;
  readonly score?: ImportedScorePayload;
  readonly validation?: ImportedScoreValidation;
};

type ImportState = "idle" | "reading" | "ready" | "error";

const BATCH_SONGS = BATCH_01_MANIFEST.items
  .map((item) => SONG_CATALOG.find((song) => song.id === item.catalogSongId))
  .filter((song): song is CatalogSong => song !== undefined);

export function CatalogBatchImportPanel({ onImported }: CatalogBatchImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSongId, setSelectedSongId] = useState(BATCH_SONGS[0]?.id ?? "");
  const [state, setState] = useState<ImportState>("idle");
  const [message, setMessage] = useState(
    "Choose one Batch 01 title, then attach its MusicXML/MXL score to make it playable in this session.",
  );

  async function importScore(file: File): Promise<void> {
    const selectedSong = BATCH_SONGS.find((song) => song.id === selectedSongId);
    if (selectedSong === undefined) {
      setState("error");
      setMessage("Choose a Batch 01 song before importing a score.");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const endpoint = isPdf ? "/api/imports/score-pdf" : "/api/imports/musicxml";
    setState("reading");
    setMessage(`Reading ${file.name} for ${selectedSong.title}…`);

    const formData = new FormData();
    formData.set("score", file);

    try {
      const response = await fetch(endpoint, { body: formData, method: "POST" });
      const payload = (await response.json()) as ImportResponse;
      if (!response.ok || payload.score === undefined || payload.validation === undefined) {
        throw new Error(payload.error ?? "The score could not be imported.");
      }
      if (payload.score.timeSignature === null) {
        throw new Error("The score needs a readable time signature before it can become playable.");
      }

      const practiceScore = importedScoreToPracticeScore(payload.score, payload.validation);
      onImported(selectedSong, practiceScore);
      setState("ready");
      setMessage(
        payload.validation.requiresReview
          ? `${selectedSong.title} opened as a review draft. Check its rhythm and melody before publishing.`
          : `${selectedSong.title} is now playable in the current practice session.`,
      );
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The score could not be imported.");
    } finally {
      if (fileInputRef.current !== null) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const [file] = Array.from(event.target.files ?? []);
    if (file !== undefined) void importScore(file);
  }

  return (
    <section className="mt-5 rounded-xl border border-teal/10 bg-cream p-4 sm:p-5" aria-labelledby="batch-01-import-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-teal">Batch 01 intake</p>
          <h3 id="batch-01-import-title" className="mt-1 font-heading text-2xl text-charcoal">Make a queued song playable.</h3>
          <p aria-live="polite" className={["mt-2 max-w-2xl text-xs leading-5", state === "error" ? "text-red-700" : "text-charcoal/55"].join(" ")}>{message}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="batch-01-song">Batch 01 title</label>
          <select
            className="min-w-52 rounded-lg border border-teal/15 bg-white px-3 py-2 text-xs font-bold text-charcoal outline-none focus:border-mint-emerald focus:ring-2 focus:ring-mint-emerald/20"
            disabled={state === "reading"}
            id="batch-01-song"
            onChange={(event) => setSelectedSongId(event.target.value)}
            value={selectedSongId}
          >
            {BATCH_SONGS.map((song) => (
              <option key={song.id} value={song.id}>{song.title}</option>
            ))}
          </select>
          <input
            accept=".musicxml,.xml,.mxl,.pdf,application/vnd.recordare.musicxml+xml,application/xml,application/pdf,text/xml"
            className="sr-only"
            disabled={state === "reading"}
            id="batch-01-score-upload"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="rounded-lg bg-yellow-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-charcoal shadow-yellow-glow transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-wait disabled:opacity-50"
            disabled={state === "reading" || selectedSongId.length === 0}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {state === "reading" ? "Reading…" : "Attach score"}
          </button>
        </div>
      </div>
      <p className="mt-3 text-[10px] font-semibold text-charcoal/40">MusicXML/MXL is the preferred input. PDF uses the local OMR pilot and may require review.</p>
    </section>
  );
}
