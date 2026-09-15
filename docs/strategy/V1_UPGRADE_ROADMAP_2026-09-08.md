---
title: V1 upgrade roadmap and timing stabilization
type: strategy
status: active
owner: engineering
created: 2026-09-08
updated: 2026-09-08
review_by: 2026-09-15
---

# V1 upgrade roadmap

Approved direction from the September 7 review and September 8 go-ahead.
This is a staged implementation, not a declaration of production readiness.

## Ordered work

1. Stabilize visual timing and add regressions (first slice implemented locally).
2. Replace event-index timers with one audio-authoritative transport. Decode
   first, schedule ahead, cancel pending voices on seek, preserve pause offsets,
   handle rate changes, one-note loops and AudioContext interruption explicitly.
3. Share flat keyboard rendering between piano/harmonium; implement a flat
   six-hole Bansuri reference separately from the continuous pitch axis.
4. Model pitch curves in cents relative to Sa, with explicit articulation and
   register. Keep notation independent of performed pitch. Do not pretend that
   sample pitch shifting reproduces all Kontakt transitions.
5. Complete reliable library/import/practice/PDF paths, accessibility and asset
   loading/cache lifecycle. No planned title is equivalent to a verified score.
6. Add measured learner feedback: MIDI where supported, monophonic mic beta,
   confidence filtering and calibration. Listening alone must not earn accuracy.

## Design decisions

- Flat vector, no heavy metallic gradients. Practice stage is the main product.
- Top: back, title, instrument, Sa, notation. Bottom: transport, speed, loop.
- Poppins UI, restrained Rozha headings, dedicated Devanagari font.
- Dark stage #101820; panel #192630; ink #F4F7FA; muted #B7C5D0;
  cue #80CFFF; active #FFE08A. Validate contrast rather than assume compliance.
- Half holes use geometry, not just color. One note is a complete fingering,
  not one hole. No universal claim that every komal uses a half hole.
- Sa branding retained; SaFlow and SaSetu remain unvalidated naming concepts.

## Current implementation status

Stages 2–3 now have local implementations; stage 4 has optional pitch-curve
primitives, and stage 6 has an opt-in local monophonic tuner beta. See the
[engine review](../audits/V1_ENGINE_REVIEW_2026-09-08.md) for evidence and open
release gates. These do not constitute complete acceptance of every stage.

## Historical first-slice scope and limitations

See [timing audit](../audits/TIMING_STABILIZATION_2026-09-08.md).
The shared visual clock is a compatibility bridge: current legacy transport
restarts the selected note on pause/resume. It is NOT the future AudioContext
clock. React still publishes frame state; renderer optimization remains open.
Source timing, transposition, sound libraries and fingering math were not changed.

## Acceptance gates for subsequent stages

- Cold start, ten-minute idle, background return, seek, pause/resume, rate change,
  one-note loop, instrument switch during loading, and end-of-song handling.
- Authored rests and short/long notes retain exact geometry and duration.
- All three notation systems work across all instruments and PDF.
- Browser/device audio-visual latency measured, not inferred from unit tests.
- Memory, accessibility and mobile QA before production promotion.

## Technical references consulted September 7

- https://web.dev/articles/audio-scheduling
- https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp
- https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API
- https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
