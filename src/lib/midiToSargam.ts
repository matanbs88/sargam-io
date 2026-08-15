export const SARGAM_EN_TOKENS = [
  "S",
  "r",
  "R",
  "g",
  "G",
  "m",
  "M",
  "P",
  "d",
  "D",
  "n",
  "N",
] as const;

export type SargamEnToken = (typeof SARGAM_EN_TOKENS)[number];

export type NotationSystem = "ABC" | "Sargam_EN" | "Sargam_HI";

export type MidiNoteEvent = {
  readonly midi: number;
  readonly startMs: number;
  readonly durationMs: number;
  readonly velocity?: number;
};

export type RelativeMidiNote = {
  readonly midi: number;
  readonly interval: number;
  readonly octaveShift: number;
  readonly octaveMarker: string;
  readonly sargamToken: SargamEnToken;
  readonly abcToken: string;
};

export type RelativeMidiNoteEvent = RelativeMidiNote &
  Omit<MidiNoteEvent, "midi">;

/**
 * Strict 1:1 token dictionary. Devanagari rendering always looks up one
 * already-tokenized Sargam value; it never runs chained string replacements.
 */
export const DEVANAGARI_SARGAM: Readonly<Record<SargamEnToken, string>> = {
  S: "सा",
  r: "रे॒",
  R: "रे",
  g: "ग॒",
  G: "ग",
  m: "म",
  M: "म॑",
  P: "प",
  d: "ध॒",
  D: "ध",
  n: "नि॒",
  N: "नि",
};

const RELATIVE_ABC_TOKENS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

function assertMidiValue(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 127) {
    throw new RangeError(
      label + " must be an integer MIDI value between 0 and 127.",
    );
  }
}

function assertNoteEvent(event: MidiNoteEvent): void {
  assertMidiValue(event.midi, "event.midi");

  if (!Number.isFinite(event.startMs) || event.startMs < 0) {
    throw new RangeError("event.startMs must be a non-negative number.");
  }

  if (!Number.isFinite(event.durationMs) || event.durationMs <= 0) {
    throw new RangeError("event.durationMs must be greater than zero.");
  }

  if (
    event.velocity !== undefined &&
    (!Number.isInteger(event.velocity) ||
      event.velocity < 0 ||
      event.velocity > 127)
  ) {
    throw new RangeError(
      "event.velocity must be an integer MIDI velocity between 0 and 127.",
    );
  }
}

function getOctaveMarker(octaveShift: number): string {
  if (octaveShift === 0) {
    return "";
  }

  return octaveShift > 0
    ? "'".repeat(octaveShift)
    : ".".repeat(Math.abs(octaveShift));
}

/** Converts an absolute MIDI pitch to an interval relative to the Sa root. */
export function midiToRelativeNote(
  midi: number,
  rootMidi: number,
): RelativeMidiNote {
  assertMidiValue(midi, "midi");
  assertMidiValue(rootMidi, "rootMidi");

  const distance = midi - rootMidi;
  const interval = ((distance % 12) + 12) % 12;
  const octaveShift = Math.floor(distance / 12);
  const sargamToken = SARGAM_EN_TOKENS[interval];
  const abcToken = RELATIVE_ABC_TOKENS[interval];

  if (sargamToken === undefined || abcToken === undefined) {
    throw new Error("Unable to map MIDI interval " + interval + ".");
  }

  return {
    midi,
    interval,
    octaveShift,
    octaveMarker: getOctaveMarker(octaveShift),
    sargamToken,
    abcToken,
  };
}

export function midiToRelativeNotes(
  midiNotes: readonly number[],
  rootMidi: number,
): RelativeMidiNote[] {
  assertMidiValue(rootMidi, "rootMidi");
  return midiNotes.map((midi) => midiToRelativeNote(midi, rootMidi));
}

export function midiEventsToRelativeNotes(
  events: readonly MidiNoteEvent[],
  rootMidi: number,
): RelativeMidiNoteEvent[] {
  assertMidiValue(rootMidi, "rootMidi");

  return events.map((event) => {
    assertNoteEvent(event);

    return {
      ...midiToRelativeNote(event.midi, rootMidi),
      startMs: event.startMs,
      durationMs: event.durationMs,
      velocity: event.velocity,
    };
  });
}

/** Renders a previously-tokenized relative note in the selected notation. */
export function formatRelativeNote(
  note: RelativeMidiNote,
  notation: NotationSystem,
): string {
  switch (notation) {
    case "ABC":
      return note.abcToken + note.octaveMarker;
    case "Sargam_EN":
      return note.sargamToken + note.octaveMarker;
    case "Sargam_HI":
      return DEVANAGARI_SARGAM[note.sargamToken] + note.octaveMarker;
  }
}

export function formatRelativeNotes(
  midiNotes: readonly number[],
  rootMidi: number,
  notation: NotationSystem,
): string[] {
  return midiToRelativeNotes(midiNotes, rootMidi).map((note) =>
    formatRelativeNote(note, notation),
  );
}

export function formatRelativeMidiEvents(
  events: readonly MidiNoteEvent[],
  rootMidi: number,
  notation: NotationSystem,
): string[] {
  return midiEventsToRelativeNotes(events, rootMidi).map((note) =>
    formatRelativeNote(note, notation),
  );
}
