---
title: V1 engine implementation and browser review
type: audit
status: local-review
owner: engineering
created: 2026-09-08
updated: 2026-09-08
review_by: 2026-09-15
---

# V1 engine review

## Delivered locally

- `EngineStore` owns score time using the shared AudioContext clock, not React
  note-index changes. A 25 ms control tick schedules a 120 ms lookahead queue.
  Start is anchored after sample preparation with a 60 ms scheduling lead.
- Pause preserves offset; seek cancels voices; rate changes preserve position;
  loops can contain one note. Background scheduling stalls resume the remaining
  sustain, rather than enqueueing missed notes. Preparation can be cancelled.
- `GuideVoiceBank` prepares samples before starting, fetches at most four in
  parallel, bounds decoded cache to 256 MB and releases it on instrument change.
  Network failure produces an explicit retry/sound-off message.
- Piano and harmonium share `KeyboardRoll`: the same C3–C7 geometry, fixed
  coordinate space, duration-derived note extent, flat keys and strike line.
- Bansuri uses a horizontal canvas with a continuous pitch axis (octaves are
  not collapsed), a separate flat six-hole SVG reference, and shape-based
  open/half-covered/closed indicators. rAF reads time without publishing each
  frame into React. Ordinary authored gaps are neither padded nor removed.
- Optional pitch curves use cents from the event's nominal MIDI pitch. Curves
  transpose with the note, render as a continuous white trace, and drive the
  procedural flute's detune automation. They do NOT encode a universal raga
  tuning or infer ornamentation from a score.
- Opt-in local monophonic tuner: AudioWorklet captures frames; a Web Worker
  estimates pitch; Hz and cents relative to Sa are displayed. No recording or
  upload. No accuracy grade is fabricated from listening to playback.

## Verification evidence

- Full closeout: 116 tests / 34 files, lint, TypeScript/production build and
  repository audit passed. Repository audit checks all nine required Vault files.
- Transport regressions include preparation cancellation/error, pause offset,
  last-note seek, short single-note loops, end handling, half speed, polyphony,
  and recovery after a scheduling stall.
- Pitch detector: synthetic 110–880 Hz signals at 48 kHz within five cents;
  silence/invalid input rejected. These are NOT real-instrument accuracy claims.
- Browser at `http://127.0.0.1:3001`: opened demo, ran piano, switched instruments,
  ran harmonium at half speed, inspected its visible notes/key alignment, and
  inspected Bansuri with Hindi labels and half-hole geometry after note selection.
- Browser exposed an upstream missing `Fs4.mp3` harmonium anchor. Corrected the
  manifest against the public repository listing, added the existing B/C5/D5
  anchors, and verified harmonium progressed through the score without the 404.
  Source: https://github.com/nbrosowsky/tonejs-instruments/tree/master/samples/harmonium
- A successful browser playback state is not a listening evaluation. Neither
  physical speaker latency nor real microphone accuracy was measured here.

## Release gaps (not silently marked complete)

1. Ventus is not yet a decoded browser sample bank. Bansuri explicitly remains
   a procedural flute fallback; authorization is not the same as integration.
2. Device output latency / Bluetooth compensation requires measured calibration.
   Rendering reads AudioContext time, not a calibrated speaker-presentation time.
3. Tabla/drone accompaniment retains its existing separate scheduler. It has not
   been migrated into the new melody lookahead queue in this change.
4. Pitch curves are an internal optional event capability. Import persistence,
   curve authoring, real musical fixtures and expressive sample transitions remain.
5. The tuner needs real instrument, noisy-room, low-register and permission-denial
   testing. Do not sell it as an evaluated singing tutor or award accuracy points.
6. Mobile active-note auto-follow, reduced-motion practice mode, full keyboard/
   screen-reader and contrast audit remain release gates. Canvas has descriptions
   and note-selection controls, not a complete nonvisual practice experience.
7. Large catalogs, PDF import/export, account/backend integration and content QA
   were not re-certified by this engine change.

## Promotion

Branch: `codex/playback-clock-regression`. Working files are local, not committed
or deployed by this session. Preserve pre-existing Vault changes. Review the
feature branch before dev/main promotion; do not mistake the public preview for
this local build. Prior timing-only audit is historical and superseded here for
current implementation status.
