import batch01 from "../../content/catalog/inbox/batch-01/manifest.json";

export type ScoreCorpusSourceKind = "web-sargam" | "catalog-index" | "commercial-score";
export type ScoreCorpusSourceStatus = "discovered" | "catalog-hit" | "artifact-ready";
export type ScoreCorpusTargetFormat = "musicxml" | "mxl" | "midi" | "manual-reviewed";

export type ScoreCorpusManifestItem = {
  readonly artifactPath: string | null;
  readonly catalogSongId: string;
  readonly sourceKind: ScoreCorpusSourceKind;
  readonly sourceStatus: ScoreCorpusSourceStatus;
  readonly sourceUrls: readonly string[];
  readonly targetFormats: readonly ScoreCorpusTargetFormat[];
  readonly title: string;
};

export type ScoreCorpusManifest = {
  readonly batchId: string;
  readonly description: string;
  readonly items: readonly ScoreCorpusManifestItem[];
  readonly sourcePolicy: "metadata-only-until-import";
};

export const BATCH_01_MANIFEST = batch01 as ScoreCorpusManifest;

export function validateScoreCorpusManifest(
  manifest: ScoreCorpusManifest,
  catalogSongIds: readonly string[],
): readonly string[] {
  const issues: string[] = [];
  const catalogIds = new Set(catalogSongIds);
  const seenIds = new Set<string>();

  for (const item of manifest.items) {
    if (seenIds.has(item.catalogSongId)) {
      issues.push(`Duplicate batch item: ${item.catalogSongId}`);
    }
    seenIds.add(item.catalogSongId);

    if (!catalogIds.has(item.catalogSongId)) {
      issues.push(`Unknown catalog song: ${item.catalogSongId}`);
    }
    if (item.sourceUrls.length === 0) {
      issues.push(`Missing source URL: ${item.catalogSongId}`);
    }
    if (item.artifactPath !== null && item.artifactPath.trim().length === 0) {
      issues.push(`Empty artifact path: ${item.catalogSongId}`);
    }
  }

  return issues;
}

export function getBatch01Item(songId: string): ScoreCorpusManifestItem | undefined {
  return BATCH_01_MANIFEST.items.find((item) => item.catalogSongId === songId);
}
