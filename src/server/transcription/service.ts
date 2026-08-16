import "server-only";

import { createHash } from "node:crypto";
import type { TranscriptionStatus } from "@/src/lib/transcription";
import type { CompletedTranscription, TranscriptionProvider } from "./contracts";
import type { CachedSong, SongCache } from "./songCache";

export type TranscriptionServiceResult = {
  status: TranscriptionStatus;
  transcription: CompletedTranscription;
};

function fingerprint(sourceUrl: string): string {
  return createHash("sha256").update(sourceUrl).digest("hex");
}

/**
 * Cache-first orchestration shared by the local mock route and the future live
 * provider adapter. A live provider must add queue polling before it returns a
 * completed job to this service.
 */
export async function requestTranscription(
  sourceUrl: string,
  cache: SongCache,
  provider: TranscriptionProvider,
): Promise<TranscriptionServiceResult> {
  const cached = await cache.findBySourceUrl(sourceUrl);
  if (cached) {
    return { status: "cache_hit", transcription: cached };
  }

  const job = await provider.submitSource(sourceUrl);
  if (job.status !== "completed") {
    throw new Error("The transcription job is not complete. Queue/poll this job before requesting its output.");
  }

  const transcription = await provider.getCompletedTranscription(job.providerJobId);
  const cacheEntry: CachedSong = {
    ...transcription,
    sourceUrl,
    sourceFingerprint: fingerprint(sourceUrl),
    createdAt: new Date(),
  };
  await cache.save(cacheEntry);

  return { status: "provider", transcription };
}
