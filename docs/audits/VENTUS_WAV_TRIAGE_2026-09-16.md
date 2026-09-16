# Ventus WAV triage — measured, not yet integrated

## New evidence

Analyzed the first 20 sorted Close WAVs in `Phrases WAV/5 UniqueNotesPhrases`
from the founder-provided library. These are mono 44.1kHz, 24-bit PCM WAVs.
No `smpl` root-note metadata was found in these files. Originals were read only;
no vendor audio was copied into Git or public assets.

`scripts/inspect-ventus-wav.mjs` now provides repeatable PCM decode, bounded
autocorrelation pitch estimation and contiguous stable-span triage. It examines
100ms windows, rejects low-energy/unpitched windows and reports pitch variation.
Two Node tests passed (six known pitches with harmonics, silence/bad container).
This does not validate real breath/noise robustness or remove octave ambiguity.

## Promising path without Kontakt

`Phrases_Close_212.wav` contains a candidate sustained segment at 0.3–4.0s:
median MIDI 65.993 (approximately F#4), -0.7 cents from equal temperament,
20.4 cents measured range. Its whole-file range is 89.7 cents: using the entire
file as a fixed-pitch sample would be misleading. The segment is not yet approved
for playback. Other measured segments suggest possible A4 and B4 anchors.
Exact shortlist: `content/audio/bansuri/ventus-analysis-candidates.json`.

## Limits and next work

- No Kontakt installation was found in the standard Program Files/Native
  Instruments folder; this is not proof none exists elsewhere. ffmpeg/ffprobe
  were not found on PATH.
- Whole-file pitch estimates are not enough. Most inspected files have ornamented
  attacks or multi-note spans. Candidate extraction must omit those transitions.
- Independently verify pitch, audition trimmed/faded segments, assess timbre under
  transposition, and find/test seamless loop points before enabling the sampler.
- A phrase-derived sustain lacks the original note attack and legato transitions.
  Do not claim this matches the full Kontakt instrument.
- The application still uses the procedural Bansuri fallback. This analysis makes
  a technically feasible prototype path more concrete; it is not an integration.

## Independent verification and prepared candidate

`prepare-ventus-candidate.mjs` now cross-checks the autocorrelation result using
a Hann-windowed frequency-domain peak search (100–1600 Hz followed by 0.05 Hz
refinement). Four source windows at 0.6/1.5/2.5/3.5 seconds produced MIDI
66.010 / 65.956 / 66.105 / 65.937. This corroborates F#4 for this candidate;
it does not establish a general-purpose polyphonic pitch detector.

The script extracted source 0.3–4.0 seconds, applied 25ms squared-sine fades at
both ends, and encoded mono 44.1kHz PCM16. The reproducible experimental output is
`output/ventus-candidates/ventus-fsharp4-sustain.wav` (ignored by Git), alongside
a JSON provenance/measurement report. It is 3.7 seconds long; all 37 analysis
windows are voiced, median MIDI 65.993, 5–95% spread 16.61 cents. Source SHA256:
`ad3066145223932ed49d2feb915cac7a58ec6cf3aff761ec39c39ebf8809eee4`.
Output SHA256: `49fa0dea225ba69a9a496832296ed7cf9d5356bf1d07ebf351901a983606ab7a`.

Two additional Node tests passed for independent spectral estimation and
trim/fade/PCM duration and amplitude invariants. No originals were modified.
Still pending: audition, transposition quality, loop validation, optional sampler
integration and browser A/B testing. Keep procedural playback as default until
these checks pass; this sustain has a constructed fade, not an authentic attack.

## Opt-in integration checkpoint

- Staged the hash-verified 326,384-byte candidate in public/audio/preview using
  a reproducible script. No other files from the source library were copied.
- Added `bansuriVoice: ventus-study` to GuideVoiceBank and the shared transport.
  All four design alternatives expose an explicit experimental voice selector.
  Production screens and the default procedural voice are unchanged.
- Sample fetch/decode completes before playback starts. Scheduling uses the
  measured 65.993 MIDI anchor; timing and score events are unchanged. No unverified
  loop is applied. Out-of-range pitches, slides and overly long notes produce a
  clear error rather than substituting another instrument or silently truncating.
- Four focused mocked-audio tests passed: preload reuse/scheduling, range/slide
  rejection, long-note guard and default-voice preservation. These are NOT audible
  quality checks. Browser connection still returns Transport closed; acoustic
  quality, pause/seek listening and real-browser A/B verification remain pending.
