import { PUBLIC_DOMAIN_CATALOG } from "./publicDomainCatalog";
import { PUBLIC_DOMAIN_DEVOTIONAL_CATALOG } from "./publicDomainDevotionalCatalog";
import { SONG_CATALOG, type CatalogSong } from "./songCatalog";
import { VERIFIED_REPERTOIRE } from "./verifiedRepertoire";

/** Single composition point for every title visible in the practice library. */
export const FULL_PRACTICE_CATALOG: readonly CatalogSong[] = [
  ...SONG_CATALOG,
  ...PUBLIC_DOMAIN_CATALOG,
  ...PUBLIC_DOMAIN_DEVOTIONAL_CATALOG,
  ...VERIFIED_REPERTOIRE,
];

export const READY_PRACTICE_CATALOG = FULL_PRACTICE_CATALOG.filter(
  (song) => song.status === "ready" && song.noteEvents !== null,
);

if (new Set(FULL_PRACTICE_CATALOG.map((song) => song.id)).size !== FULL_PRACTICE_CATALOG.length) {
  throw new Error("Full practice catalog contains duplicate IDs.");
}
