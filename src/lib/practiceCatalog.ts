import { PUBLIC_DOMAIN_CATALOG } from "./publicDomainCatalog";
import { PUBLIC_DOMAIN_DEVOTIONAL_CATALOG } from "./publicDomainDevotionalCatalog";
import { SONG_CATALOG, type CatalogSong } from "./songCatalog";

/** Single composition point for every title visible in the practice library. */
export const FULL_PRACTICE_CATALOG: readonly CatalogSong[] = [
  ...SONG_CATALOG,
  ...PUBLIC_DOMAIN_CATALOG,
  ...PUBLIC_DOMAIN_DEVOTIONAL_CATALOG,
];

export const READY_PRACTICE_CATALOG = FULL_PRACTICE_CATALOG.filter(
  (song) => song.status === "ready" && song.noteEvents !== null,
);

if (FULL_PRACTICE_CATALOG.length !== 123) {
  throw new Error(
    `Full practice catalog must contain exactly 123 entries; found ${FULL_PRACTICE_CATALOG.length}.`,
  );
}

if (new Set(FULL_PRACTICE_CATALOG.map((song) => song.id)).size !== FULL_PRACTICE_CATALOG.length) {
  throw new Error("Full practice catalog contains duplicate IDs.");
}
