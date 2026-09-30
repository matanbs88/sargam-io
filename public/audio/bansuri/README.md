# Default recorded Bansuri bank — 2026-09-17

## Performance bank (current)

`performance/` contains 352 original Close recordings: Natural sustain (96),
Tongued sustain (96), recorded Vibrato (96), and Flutter (64). Two velocity
layers and round-robin variations are selected deterministically per note.
Only the samples needed by a score are fetched/decoded, with four concurrent
requests and a 256 MB decoded-buffer budget. All files are content-hashed.

Rebuild: `node scripts/build-ventus-performance.mjs "<Ventus library root>"`.
Manifest: `src/lib/ventusPerformanceSamples.json`; includes source/output hashes
and per-file loop boundaries. Source recordings remain unchanged.

Living Score exposes articulation, volume (85% default), and opt-in algorithmic
Meend / Gamak-study curves. These curves are not recorded Kontakt transitions
or raga-aware ornaments. Recorded legato, phrase keyswitches, release triggers,
room microphone blending and Kontakt scripting are not implemented.

## Original diagnostic bank (retained)

16 original SustainNormal_Close_<pitch>_V1_RR1 recordings from the purchased
Ventus library, decoded from NCW. Previous phrase excerpts are no longer used.
Source originals remain unchanged. Source/output hashes, pitch checks at 1/2/3
seconds and loop points are in `src/lib/ventusSamples.json`.

Rebuild: `node scripts/build-ventus-sustains.mjs "<Ventus library root>"`.
Mono PCM16, 44.1kHz, first seven seconds retained; 150ms loop crossfade,
loop 2.15–6.85 seconds. Content-hashed URLs prevent reuse of old cached cuts.
Native coverage E4–F#6 (MIDI64–90), at most one semitone interpolation within it.
Outside it, endpoint samples are pitch-shifted: equal naturalism is not claimed.
One velocity and round robin; not Kontakt's full articulation/legato engine.

GuideVoiceBank defaults to this bank for the main application and Living Score.
No missing-asset fallback to synthesis: loading errors are surfaced. The previous
single-anchor opt-in experiment remains in `../preview` for old comparisons.
Acoustic audition in a live browser is still pending; automated tests verify
assets, tuning selection, loops, long-note scheduling, curves and cancellation.

The local NCW decoder accepts recognized mono integer PCM signatures only,
checks block bounds and rejects unknown encodings. Format references:
https://github.com/monomadic/ncw and https://github.com/manzing/conNCW-NG.
Browser connection returned `Transport closed`; no listening verification or
deployment claimed. Automated verification is recorded in the task checkpoint.
