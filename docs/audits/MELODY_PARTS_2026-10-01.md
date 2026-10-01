---
title: Melody and harmony separation for instrument practice
type: audit
status: active
owner: engineering
created: 2026-10-01
updated: 2026-10-01
review_by: 2026-10-08
---

The founder identified simultaneous bansuri notes in Au Clair de la Lune.
The stored upper voice included chord support and was passed unchanged to every
instrument. A warning about physical playability did not fix the product.

## Implemented behavior

Bansuri and harmonium use a monophonic melodic timeline. Piano defaults to the
same timeline and can select Melody + harmony. The original arrangement remains
unchanged. Instrument setup and optional bansuri expression operate after part
selection. Audio, notation, timing guides, note correction and PDF receive the
same timeline. Corrections and loop indices are scoped by piece and musical part.

The reviewed Horetzky chord ordering supplies its leading melodic pitch:
45 attacks across the same 16 bars and 32 seconds, with written rests retained.
Satie's ending chords use their leading melodic pitch: 116 attacks across the
same 234 seconds, including introduction silence, tied sustains and both endings.
Full arrangements retain 62 and 128 scalar pitches respectively. These are
melodic reductions of the stored editions, not new full-song reconstructions.

## Unknown source limitations

An imported polyphonic timeline without an authored melody uses an upper-envelope
estimate, not a guaranteed separation of melody and accompaniment. The interface
and PDF credit disclose that distinction. It retains sustained upper notes over
bass attacks, preserves rests and repeated attacks, and clips overlapping spans
and pitch curves without changing the source. Explicit melody metadata takes
precedence even if the melody is not the highest note. A multi-part import UI
with retained track and voice metadata remains follow-up work.

## Verification

TypeScript, lint and production build passed. All 367 tests in 74 files passed.
The additional tests schedule 45 nonoverlapping Au Clair melody notes at
0.5x, 1x and 2x. Every playable catalog entry resolves to a monophonic melody.

Chrome on the local production build at localhost:3030 verified Piano's
62-event arrangement and Harmonium's 45-event melody after switching instruments.
Harmonium reached active playback. Bansuri displayed 45 melodic events and the
existing three-option setup dialog. Recorded bansuri reached Replay at 32,000 ms
without captured browser errors. The focus screenshot shows sequential notes
without the simultaneous lower accompaniment visible in the founder's screenshot:
`tmp/melody-only-bansuri-2026-10-01.png`. These UI observations do not independently
measure acoustic quality or guarantee an unknown import's melodic accuracy.

## Release state

Changes are local on codex/playback-clock-regression. Production is unchanged.
The catalog goal remains paused at 11 complete live-verified pieces. Do not
restart expansion as part of this regression correction.
