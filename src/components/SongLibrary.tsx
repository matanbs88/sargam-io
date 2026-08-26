"use client";

import { useMemo, useState } from "react";
import { trackProductEvent } from "@/src/lib/productAnalytics";
import { RIGHTS_SAFE_SHOWCASES } from "@/src/lib/showcaseRegistry";
import {
  CATALOG_CATEGORY_OPTIONS,
  filterCatalogSongs,
  SONG_CATALOG,
  type CatalogCategory,
  type CatalogSong,
} from "@/src/lib/songCatalog";

type SongLibraryProps = {
  readonly catalogOverrides?: Readonly<Record<string, CatalogSong>>;
  readonly onOpenSong: (song: CatalogSong) => void;
};

const FILTER_OPTIONS: readonly { readonly label: string; readonly value: "all" | CatalogCategory }[] = [
  { label: "All", value: "all" },
  ...CATALOG_CATEGORY_OPTIONS.map((category) => ({ label: category, value: category })),
];

function statusLabel(song: CatalogSong): string {
  if (song.status === "ready") return "Ready to practice";
  if (song.status === "review") return "Review draft";
  return "In MVP queue";
}

function statusClass(song: CatalogSong): string {
  if (song.status === "ready") {
    return "border-mint-emerald/25 bg-mint-emerald/10 text-mint-emerald";
  }
  return song.status === "review"
    ? "border-teal/20 bg-teal/8 text-teal"
    : "border-yellow-soft/25 bg-yellow-soft/10 text-[#907b1f]";
}

export function SongLibrary({ catalogOverrides = {}, onOpenSong }: SongLibraryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CatalogCategory>("all");
  const [showPlanned, setShowPlanned] = useState(true);
  const catalogSongs = useMemo(
    () => SONG_CATALOG.map((song) => catalogOverrides[song.id] ?? song),
    [catalogOverrides],
  );
  const readySongs = catalogSongs.filter((song) => song.status === "ready");

  const filteredSongs = useMemo(() => {
    return filterCatalogSongs(catalogSongs, query, category, showPlanned);
  }, [catalogSongs, category, query, showPlanned]);

  const showcaseSongs = RIGHTS_SAFE_SHOWCASES.map((showcase) => {
    const song = catalogSongs.find((candidate) => candidate.id === showcase.catalogSongId);
    return song === undefined ? null : { showcase, song };
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <section
      aria-labelledby="song-library-title"
      className="mx-auto mt-10 max-w-7xl rounded-[1.6rem] border border-teal/10 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,61,54,0.1)] backdrop-blur sm:p-8"
      id="library"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal">
            Sargam repertoire
          </p>
          <h2 id="song-library-title" className="mt-2 font-heading text-4xl leading-none text-charcoal sm:text-5xl">
            Start with a song.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal/55">
            A 100-title MVP content queue of Indian and global melodies, plus
            original Riyaz exercises ready to play on piano, harmonium, and Bansuri.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-charcoal/45">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-teal text-yellow-soft">100</span>
          <span>{readySongs.length} ready · {catalogSongs.length - readySongs.length} planned</span>
        </div>
      </div>

      <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex items-center gap-3 rounded-xl border border-teal/10 bg-cream px-4 py-3 focus-within:border-mint-emerald">
          <span aria-hidden="true" className="text-teal">⌕</span>
          <span className="sr-only">Search songs</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-charcoal outline-none placeholder:text-charcoal/35"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a song, artist, language, or style"
            type="search"
            value={query}
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Song category">
          {FILTER_OPTIONS.map((option) => (
            <button
              aria-pressed={category === option.value}
              className={[
                "rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition",
                category === option.value
                  ? "border-teal bg-teal text-white shadow-[0_6px_16px_rgba(19,96,82,0.18)]"
                  : "border-teal/10 bg-white text-charcoal/45 hover:border-mint-emerald/50 hover:text-teal",
              ].join(" ")}
              key={option.value}
              onClick={() => setCategory(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 rounded-[1.15rem] bg-teal px-4 py-4 text-white shadow-[0_14px_34px_rgba(19,96,82,0.16)] sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-soft">Cleared preview set</p>
            <h3 className="mt-1 font-heading text-2xl leading-none">Practice something real today.</h3>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/55">5 original sessions · PDF ready</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {showcaseSongs.map(({ showcase, song }) => (
            <button
              className="group rounded-lg border border-white/15 bg-white/8 p-3 text-left transition hover:-translate-y-0.5 hover:border-yellow-soft/60 hover:bg-white/13 active:scale-[0.98]"
              key={showcase.id}
              onClick={() => {
                trackProductEvent("catalog_song_opened", { category: song.category, status: song.status, showcase: true });
                onOpenSong(song);
              }}
              type="button"
            >
              <span className="block truncate text-xs font-black text-white">{song.title}</span>
              <span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-white/55">{showcase.subtitle}</span>
              <span className="mt-2 block text-[9px] font-black uppercase tracking-[0.1em] text-yellow-soft">Open practice →</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-b border-teal/10 pb-4 text-xs font-semibold text-charcoal/45">
        <span>{filteredSongs.length} {filteredSongs.length === 1 ? "result" : "results"}</span>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            checked={showPlanned}
            className="h-4 w-4 accent-teal"
            onChange={(event) => setShowPlanned(event.target.checked)}
            type="checkbox"
          />
          Include MVP queue
        </label>
      </div>

      {filteredSongs.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSongs.map((song) => (
            <article
              className="group flex min-h-[170px] flex-col justify-between rounded-xl border border-teal/10 bg-white p-4 shadow-[0_8px_24px_rgba(15,61,54,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,61,54,0.11)]"
              key={song.id}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md bg-teal/8 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-teal">
                    {song.category}
                  </span>
                  <span className={["rounded-full border px-2 py-1 text-[9px] font-black", statusClass(song)].join(" ")}>
                    {statusLabel(song)}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black tracking-[-0.02em] text-charcoal">{song.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-charcoal/50">{song.artistOrSource}</p>
              </div>
              <div className="mt-5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-charcoal/35">
                  {song.language} · {song.difficulty}
                </span>
                <button
                  className={[
                    "rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition",
                    song.status === "ready"
                      ? "bg-yellow-soft text-charcoal shadow-yellow-glow hover:-translate-y-0.5 active:scale-95"
                      : "cursor-not-allowed bg-charcoal/5 text-charcoal/35",
                  ].join(" ")}
                  disabled={song.status !== "ready"}
                  onClick={() => {
                    trackProductEvent("catalog_song_opened", { category: song.category, status: song.status });
                    onOpenSong(song);
                  }}
                  type="button"
                >
                  {song.status === "ready" ? "Practice" : "Planned"}
                </button>
              </div>
              <details className="mt-3 border-t border-teal/8 pt-3">
                <summary className="cursor-pointer list-none text-[9px] font-black uppercase tracking-[0.11em] text-charcoal/38 transition hover:text-teal">
                  {song.noteEvents === null ? "Content pipeline note" : "PDF export available"}
                </summary>
                <p className="mt-2 text-[10px] leading-4 text-charcoal/50">{song.rightsNote}</p>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-teal/20 bg-cream px-5 py-10 text-center">
          <p className="font-heading text-2xl text-charcoal">No matching repertoire yet.</p>
          <p className="mt-2 text-sm text-charcoal/50">Try another title, language, or category.</p>
        </div>
      )}

      <p className="mt-5 text-[10px] leading-5 text-charcoal/40">
        Every title is part of the MVP content queue. Entries without note data are
        waiting for transcription work; the product build is not blocked by that queue.
      </p>
    </section>
  );
}
