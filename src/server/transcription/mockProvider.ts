import "server-only";

import { mockSong } from "@/src/lib/mockTranscription";
import type { TranscriptionStatus } from "@/src/lib/transcription";

export type TranscriptionResult = {
  status: TranscriptionStatus;
  sourceUrl: string;
  song: typeof mockSong;
};

/**
 * The seam to replace with cache lookup + external audio-to-MIDI provider.
 * Keep credentials and provider responses on the server, and return only this
 * safe client DTO.
 */
export async function transcribeWithMock(sourceUrl: string): Promise<TranscriptionResult> {
  return {
    status: "mock",
    sourceUrl,
    song: mockSong,
  };
}
