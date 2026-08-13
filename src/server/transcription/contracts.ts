import "server-only";

import type { MidiNoteEvent } from "@/src/lib/midiToSargam";

export type ProviderJobStatus = "queued" | "processing" | "completed" | "failed";

export type ProviderJob = {
  provider: "klangio";
  providerJobId: string;
  status: ProviderJobStatus;
};

export type CompletedTranscription = {
  provider: "klangio";
  providerJobId: string;
  title?: string;
  artist?: string;
  bpm?: number;
  detectedKey?: string;
  midiEvents: MidiNoteEvent[];
  providerVersion: string;
};

/**
 * All cost-incurring providers implement this interface. The adapter layer
 * owns credentials and provider-specific HTTP details; callers receive a
 * normalized, minimal transcription shape.
 */
export interface TranscriptionProvider {
  submitSource(sourceUrl: string): Promise<ProviderJob>;
  getJob(providerJobId: string): Promise<ProviderJob>;
  getCompletedTranscription(providerJobId: string): Promise<CompletedTranscription>;
}

