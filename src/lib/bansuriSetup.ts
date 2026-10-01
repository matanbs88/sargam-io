import type { MidiNoteEvent } from './midiToSargam';

export type BansuriSetupMode = 'matching' | 'transpose' | 'original';

export type BansuriSetup = {
  events: readonly MidiNoteEvent[];
  songSa: number;
  fluteSa: number;
  shift: number;
};

/** Caller-supplied, player/maker-confirmed sounding bounds, not a generic flute range. */
export type BansuriPlayableRange = { minMidi: number; maxMidi: number };

export type BansuriSetupFlags = {
  /** In matching mode the requested flute differs from source Sa, including octave. */
  matchingMismatch: boolean;
  /** Invalid source or projected nominal/transition pitches, including curve excursions. */
  midiOutOfRangeEventIndices: readonly number[];
  fluteRangeStatus: 'unverified' | 'within' | 'outside';
  fluteOutOfRangeEventIndices: readonly number[];
};

function validMidi(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 127;
}

function setup(sourceSa: number, fluteSa: number, mode: BansuriSetupMode) {
  if (!validMidi(sourceSa) || !validMidi(fluteSa)) {
    throw new RangeError('Source Sa and flute Sa must be MIDI integers between 0 and 127.');
  }
  if (mode !== 'matching' && mode !== 'transpose' && mode !== 'original') {
    throw new RangeError('Unknown bansuri setup mode.');
  }
  return {
    songSa: mode === 'transpose' ? fluteSa : sourceSa,
    fluteSa: mode === 'matching' ? sourceSa : fluteSa,
    shift: mode === 'transpose' ? fluteSa - sourceSa : 0,
  };
}

/**
 * Evaluate before projection to report overflow without clamping or octave folding.
 * Sa means the actual sounding reference (with octave), not the all-holes-closed
 * pitch or a manufacturer's ambiguous key label. No mode/raga is inferred.
 */
export function evaluateBansuriSetup(
  events: readonly MidiNoteEvent[],
  sourceSa: number,
  fluteSa: number,
  mode: BansuriSetupMode,
  playableRange?: BansuriPlayableRange,
): BansuriSetupFlags {
  const { shift } = setup(sourceSa, fluteSa, mode);
  if (playableRange && (!Number.isFinite(playableRange.minMidi) ||
    !Number.isFinite(playableRange.maxMidi) || playableRange.minMidi < 0 ||
    playableRange.maxMidi > 127 || playableRange.minMidi > playableRange.maxMidi)) {
    throw new RangeError('Invalid caller-supplied flute range.');
  }
  const midiOutOfRangeEventIndices: number[] = [];
  const fluteOutOfRangeEventIndices: number[] = [];
  events.forEach((event, index) => {
    const sourcePitches = [event.midi, ...(event.transition ? [event.transition.targetMidi] : [])];
    const soundingPitches = [
      ...sourcePitches.map(pitch => pitch + shift),
      ...(event.pitchCurve ?? []).map(point => event.midi + shift + point.cents / 100),
    ];
    if (sourcePitches.some(pitch => !validMidi(pitch) || !validMidi(pitch + shift)) ||
      soundingPitches.some(pitch => !Number.isFinite(pitch) || pitch < 0 || pitch > 127)) {
      midiOutOfRangeEventIndices.push(index);
    }
    if (playableRange && soundingPitches.some(pitch => !Number.isFinite(pitch) ||
      pitch < playableRange.minMidi || pitch > playableRange.maxMidi)) {
      fluteOutOfRangeEventIndices.push(index);
    }
  });
  return {
    matchingMismatch: mode === 'matching' && sourceSa !== fluteSa,
    midiOutOfRangeEventIndices,
    fluteRangeStatus: playableRange ? (fluteOutOfRangeEventIndices.length ? 'outside' : 'within') : 'unverified',
    fluteOutOfRangeEventIndices,
  };
}

/**
 * Always pass corrected SOURCE events, never a previously projected result.
 * Transposition preserves intervals, timing, velocity and relative cents curves.
 * Matching chooses a matching flute; original keeps a different flute without
 * changing song Sa. Song labels use songSa; physical fingerings use fluteSa.
 */
export function projectBansuriSetup(
  events: readonly MidiNoteEvent[],
  sourceSa: number,
  fluteSa: number,
  mode: BansuriSetupMode,
): BansuriSetup {
  const projection = setup(sourceSa, fluteSa, mode);
  const flags = evaluateBansuriSetup(events, sourceSa, fluteSa, mode);
  if (flags.midiOutOfRangeEventIndices.length) {
    throw new RangeError(`Bansuri projection exceeds valid MIDI pitches at event indices: ${flags.midiOutOfRangeEventIndices.join(', ')}.`);
  }
  return {
    ...projection,
    events: mode === 'transpose' ? events.map(event => ({
      ...event,
      midi: event.midi + projection.shift,
      ...(event.transition ? { transition: {
        ...event.transition,
        targetMidi: event.transition.targetMidi + projection.shift,
      } } : {}),
    })) : events,
  };
}
