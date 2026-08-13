export type MockSong = {
  title: string;
  artist: string;
  sourceLabel: string;
  detectedKey: string;
  bpm: number;
  duration: string;
  midiNotes: number[];
};

/** Temporary replacement for the future Klang.io transcription adapter. */
export const mockSong: MockSong = {
  title: "Until I Found You",
  artist: "Stephen Sanchez",
  sourceLabel: "YouTube link",
  detectedKey: "D major",
  bpm: 101,
  duration: "2:56",
  midiNotes: [62, 66, 69, 66, 64, 62, 66, 69, 71, 69, 66, 64, 62, 64, 66, 69, 74, 71, 69, 66, 64, 62, 59, 62, 66, 69, 66, 64, 62, 66, 69, 71, 74, 71, 69, 66],
};

export const rootOptions = [
  { label: "C", midi: 60 },
  { label: "C♯ / D♭", midi: 61 },
  { label: "D", midi: 62 },
  { label: "D♯ / E♭", midi: 63 },
  { label: "E", midi: 64 },
  { label: "F", midi: 65 },
  { label: "F♯ / G♭", midi: 66 },
  { label: "G", midi: 67 },
  { label: "A", midi: 69 },
  { label: "B♭", midi: 70 },
];

