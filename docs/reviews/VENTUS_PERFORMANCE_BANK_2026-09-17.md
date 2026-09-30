# Ventus performance bank — verified local checkpoint

## Implemented

- 352 original Close recordings converted from the purchased local NCW library:
  Natural 96, Tongued 96, Vibrato 96, Flutter 64. Source files unchanged.
- Two velocity layers and deterministic round-robin sample selection; content
  hashes and source hashes in `src/lib/ventusPerformanceSamples.json`.
- The default sampled Bansuri in GuideVoiceBank now uses this bank. No silent
  synthetic fallback. Fetch/decode occurs before playback, not while scheduling.
- Living Score exposes four articulations, independent Bansuri volume (85%),
  Meend study and Gamak study. Explicit imported pitch curves take precedence.
- Meend links adjacent notes only, preserving rests; Gamak is a bounded synthetic
  study oscillation. Neither is recorded Kontakt legato nor raga-aware phrasing.
- Gain attenuation corrected. Polyphonic headroom follows maximum concurrent
  score notes. Existing Piano/Harmonium gain is unchanged.
- Seeking into pitch curves integrates playback-rate changes for sample position.

## Evidence

- `npm run verify`: ESLint, 205 tests in 57 files, production build all passed.
- Asset tests check hashes, PCM peaks below clipping and valid loop boundaries.
- Browser: local Living Score selected recorded Bansuri, showed volume 85%,
  started playback, selected Flutter + Meend, and reached 0:10 / 0:10 and Replay
  without a visible error. Restored Natural / As written / start position.
- Chrome automation timed out; UI verification used the in-app browser instead.
- Offline Ode to Joy reconstruction uses the production selector and gain:
  peak -7.45 dBFS, RMS -17.42 dBFS, 15 notes, 10.435 seconds. Output:
  `output/audio-comparison/ode-to-joy-ventus-performance.wav`.
  This is not browser audio capture or a Kontakt render; resampling can differ.

## Remaining scope, not claimed complete

- Perceptual listening comparison and loop/articulation audit with a musician.
- Recorded legato transitions, short ornaments, release triggers, room mic,
  phrases, and Kontakt scripting are not integrated. All vendor features are
  not represented by these four sustained articulation banks.
- Samples outside E4–F#6 use pitch shifting, including lower notes in Ode to Joy.
- Changing articulation pauses playback; volume now changes live without a pause
  (see `BANSURI_LIVE_MIX_2026-09-17.md`).
- Main/Studio use the default bank but advanced controls live in Living Score.
- No production release or commit was performed. Preview remains local.
