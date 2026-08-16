# Sargam.io engineering review report

## Purpose

This report is a handoff for an independent Gemini code and architecture review.
The repository currently contains a complete local, mock-driven MVP. It is not
connected to a real transcription provider, YouTube, a database, authentication,
payments, or a hosted GPU model.

## Review baseline

- Repository: matanbs88/sargam-io
- Branch: main
- Current implementation commit: 5574e0d
- Framework: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Test runner: Vitest
- Validation completed: ESLint, 17 unit tests, Next production build, manual
  local browser QA

## Product goal

Sargam.io is intended to turn audio-derived MIDI note events into learner-facing
relative notation for Indian music:

- Latin Sargam: S r R g G m M P d D n N
- Devanagari Sargam
- Relative ABC display
- Visual references for keyboard, bansuri, and guitar

The current MVP uses deterministic local MIDI events. The app deliberately does
not claim raga detection, accurate ornament recognition, an exact bansuri
fingering for every instrument, or live audio transcription.

## Current user flow

1. The visitor sees a visual-only audio drop zone and YouTube URL field.
2. Clicking Transcribe consumes one local credit and reveals a mock result.
3. The user chooses Sa from MIDI 60 through 72.
4. The Transposed badge appears when selected Sa differs from mock detected Sa.
5. The user switches instantly among ABC, Latin Sargam, and Devanagari.
6. Mock playback moves the active MIDI event through the phrase.
7. Keyboard, Bansuri, and Guitar references react to that active note.
8. Transcribe another returns the user to the hero. Two local credits can be
   consumed, then the zero-credit alert can be tested.

No request is made when changing notation, root, active note, or instrument.

## File map

### App UI

- app/page.tsx
  - Client Component.
  - Owns local UI state: isTranscribed, notationSystem, selectedRootMidi,
    credits, selectedInstrument, activeEventIndex, and isPlaying.
  - Formats note events with useMemo.
  - Uses a timer only for local mock playback.
  - Contains no fetch call or external API invocation.

- app/globals.css and tailwind.config.ts
  - Declare the prescribed palette:
    - cream: #FAF9F6
    - teal: #136052
    - yellow-soft: #FFF099
    - mint-emerald: #28B182
    - charcoal: #0F172A
  - The CSS theme tokens are present because Tailwind 4 requires CSS-first
    registration for utility generation.

### Notation engine

- src/lib/midiToSargam.ts
  - Validates MIDI values and event timings.
  - Uses relative interval:
    interval = ((midi - rootMidi) % 12 + 12) % 12
  - Uses octave shift:
    octaveShift = floor((midi - rootMidi) / 12)
  - Repeats apostrophes for upper octaves and periods for lower octaves.
  - Exposes ABC, Sargam_EN, and Sargam_HI render modes.

- src/lib/mockMidiData.ts
  - Contains the full local Phase 1 data fixture.
  - D4, MIDI 62, is the mock detected Sa.
  - The phrase intentionally covers all twelve semitone positions.

### Devanagari safety rule

The Devanagari renderer is a direct lookup table from already-tokenized Latin
Sargam values. It does not perform chained replacements on strings.

Approved dictionary:

- S: सा
- r: रे॒
- R: रे
- g: ग॒
- G: ग
- m: म
- M: म॑
- P: प
- d: ध॒
- D: ध
- n: नि॒
- N: नि

This prevents a translated token from being reprocessed by a later rule.

### Instrument components

- src/components/instruments/KeyboardUI.tsx
  - Static two-octave C4 through C6 visual.
  - Active MIDI note uses yellow-soft.
  - Selected Sa uses a mint dot.

- src/components/instruments/BansuriChartUI.tsx
  - Six-finger-hole vertical visual (the mouthpiece is excluded).
  - Renders closed, open, and half-open states.
  - Exposes getBansuriReferenceFingering for unit testing.
  - Uses a generic Hindustani reference map, not a player-calibrated claim.

- src/components/instruments/GuitarTabsUI.tsx
  - Standard-tuning fretboard view through fret 12.
  - Active MIDI note uses yellow-soft.
  - Selected Sa uses a mint dot.

- src/lib/guitar.ts
  - Standard tuning: E4, B3, G3, D3, A2, E2.
  - midiToGuitarString chooses a legal string/fret candidate nearest a preferred
    hand position.
  - It is deterministic and suitable for UI reference, but not yet a
    full phrase-level fingering optimizer.

### Localization scaffold

- locales/en.json
- locales/hi.json
- src/lib/localization.ts

The JSON dictionaries are typed and tested. Locale routing, persistence, and
browser-language detection are intentionally not implemented yet.

## Automated quality gates

Run from the repository root:

1. npm.cmd run lint
2. npm.cmd run test
3. npm.cmd run build

At the handoff baseline:

- 7 test files passed
- 17 tests passed
- Production build passed

Unit coverage includes:

- all twelve Sargam mappings
- upper and lower repeated octave markers
- Devanagari dictionary rendering
- MIDI event timing preservation
- invalid MIDI rejection
- Bansuri relative-note normalization
- guitar string/fret position selection
- local dictionary resolution
- existing URL normalization and server mock contracts

## Manual QA script

Use TESTING_CHECKLIST.md in the repository. It covers:

- local credits and zero-credit alert
- root note and Transposed state
- all three notation modes
- note selection and mock playback
- all three visual instrument references

## Explicitly deferred boundaries

These are not defects in the local MVP. They require a product decision,
credentials, or a commercial/legal integration agreement:

1. Audio upload and YouTube ingestion.
2. External audio-to-MIDI provider selection and job polling.
3. Persistent song cache and database migration.
4. Authentication, persistent credit ledger, and payments.
5. Geo-IP purchasing-power pricing.
6. Actual audio playback and synchronized YouTube playback.
7. User-specific bansuri calibration.
8. Raga, taal, shruti, meend, and gamak inference.
9. Model hosting, training data collection, or fine-tuning.

There is an older local mock API route in app/api/transcriptions from an earlier
prototype. The current page does not call it. Gemini should confirm whether to
retain it as a future integration seam or remove it to make the mock-only
boundary stricter.

## Important domain caveats

### Relative notation is not raga classification

The engine maps equal-tempered MIDI pitch classes to the agreed 12-token
product convention. It cannot derive raga grammar, shruti, melodic direction,
or ornamentation from MIDI alone.

### Selected Sa changes notation, not audio

Changing selectedRootMidi recomputes relative labels and visual references. It
does not pitch-shift audio, because the MVP has no audio pipeline.

### Bansuri fingering is reference-only

The map is intentionally labeled as a reference. Bansuri designs may have six
or seven holes; precise fingerings also depend on construction, flute key,
octave, breath, partial-hole technique, and player style. External references:

- https://oneworldflutes.com/PDF/FlutesFingeringChart.pdf
- https://www.sundaris.eu/blog/2026/06/04/bansuri-the-indian-bamboo-flute-with-a-thousand-year-tradition/

### Guitar mapping is note-local

The algorithm chooses a position for one note. A later phrase optimizer should
minimize total hand movement across an event sequence and incorporate a
player's preferred register.

## Suggested Gemini review questions

1. Is the relative MIDI and octave calculation correct for negative distances?
2. Does the Devanagari dictionary match the intended Bhatkhande display
   convention, including the selected combining marks?
3. Should the current generic Bansuri reference map be reduced to diatonic
   notes until a musician validates all chromatic fingerings?
4. Does a CSS-based Tailwind 4 theme plus tailwind.config.ts provide the
   cleanest configuration approach for this repository?
5. Should the obsolete local mock API route remain while the UI is intentionally
   mock-only?
6. Is the mock player state effect robust under React Strict Mode and rapid
   control changes?
7. Does the Guitar position function need a configurable maximum fret or a
   multi-note optimization API before it is exposed to real users?
8. Which of the deferred items should become the next vertical production slice?

## Recommended next production slice

Do not begin a live provider implementation until a vendor contract and
credentials exist. The next safe engineering slice is:

1. Decide whether the active mock API route is retained or removed.
2. Add Supabase authentication and a persistent credit ledger.
3. Add a real SongCache adapter with provider/version cache keys.
4. Integrate one approved transcription provider through the existing provider
   contract.
5. Preserve returned MIDI timing and confidence metadata.
6. Run musician-led validation before presenting Bansuri fingerings as
   instrument-specific guidance.
