import type { MidiNoteEvent } from './midiToSargam';

export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
export type TranscriptionResult = {
  title: string;
  tempoBpm: number;
  timeSignature: string;
  rootMidi: number;
  noteEvents: MidiNoteEvent[];
  isDemo: boolean;
};
export type TranscriptionJob = {
  id: string;
  mode: 'mock' | 'klangio';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number | null;
  cached: boolean;
  message: string;
  result?: TranscriptionResult;
};
