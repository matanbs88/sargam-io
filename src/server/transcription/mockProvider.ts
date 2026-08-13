import "server-only";

import { mockSong } from "@/src/lib/mockTranscription";
import type { CompletedTranscription, ProviderJob, TranscriptionProvider } from "./contracts";

export const mockCompletedTranscription: CompletedTranscription = {
  provider: "klangio",
  providerJobId: "mock-job-1",
  providerVersion: "mock-v1",
  title: mockSong.title,
  artist: mockSong.artist,
  bpm: mockSong.bpm,
  detectedKey: mockSong.detectedKey,
  midiEvents: mockSong.midiNotes.map((midi, index) => ({
    midi,
    startMs: index * 500,
    durationMs: 420,
  })),
};

/** Development-only provider that behaves like an already-completed async job. */
export class MockTranscriptionProvider implements TranscriptionProvider {
  async submitSource(): Promise<ProviderJob> {
    return { provider: "klangio", providerJobId: mockCompletedTranscription.providerJobId, status: "completed" };
  }

  async getJob(): Promise<ProviderJob> {
    return { provider: "klangio", providerJobId: mockCompletedTranscription.providerJobId, status: "completed" };
  }

  async getCompletedTranscription(): Promise<CompletedTranscription> {
    return mockCompletedTranscription;
  }
}
