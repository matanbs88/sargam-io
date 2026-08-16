import "server-only";

import { mockMidiData } from "@/src/lib/mockMidiData";
import type { CompletedTranscription, ProviderJob, TranscriptionProvider } from "./contracts";

export const mockCompletedTranscription: CompletedTranscription = {
  provider: "klangio",
  providerJobId: "mock-job-1",
  providerVersion: "mock-v1",
  title: mockMidiData.title,
  bpm: mockMidiData.tempoBpm,
  detectedKey: mockMidiData.detectedKey.displayName,
  midiEvents: mockMidiData.noteEvents.map((event) => ({ ...event })),
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
