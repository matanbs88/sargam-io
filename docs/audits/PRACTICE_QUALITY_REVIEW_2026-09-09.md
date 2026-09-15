# Practice quality review — 2026-09-09

## Scope and conclusion

Research-led local UX implementation and engineering review. This is not a
declaration that the complete V1 roadmap, 100-song catalog, Ventus preparation,
live transcription, input grading, or commercial infrastructure are finished.
The reviewer is also the implementer: scores below are transparent engineering
judgments, not an independent panel, user study or scientific benchmark.

Sources: [research](../research/PRACTICE_BENCHMARK_2026-09-08.md),
[target specification](../strategy/PRACTICE_EXPERIENCE_SPEC_2026-09-08.md),
[initial browser checkpoint](./PRACTICE_UX_CHECKPOINT_2026-09-09.md),
[engine review](./V1_ENGINE_REVIEW_2026-09-08.md).

## Implemented

- Focus/tools separation while retaining Back, title, Sa and instrument identity.
- Transport before the canvas and sticky at the top of its stage: basic actions
  no longer require finding the bottom of a long visualizer. This deliberately
  revises the earlier bottom-toolbar plan after measuring the actual layout.
- Labelled score-time seek; it pauses playback and clears a repeat range.
- Explicit start/end note range, including a single note; restart and whole-piece.
- Native Cinema modal with title, reference context, play/pause, restart, Escape
  and explicit focus restoration after unmount.
- Bansuri intrinsic-height overflow repaired; explanation no longer intersects
  the diagram. Harmonium Cinema cabinet no longer cropped at the tested size.
- Optional tuner after transport. No duplicate microphone inside Cinema.
- Speed targets at least 44×44 px. Whole-workspace live-region removed.
- Playable-first catalog; planned records remain opt-in rather than deleted.

## Verification evidence

Local Chromium in-app browser, approximately 910×698 at final checks; mock
13-note phrase, D4, half speed. Earlier screenshots at other desktop panel sizes
are exploratory, not a certified responsive-device matrix.

Passed browser checks: opening Cinema for all three instruments; moving Bansuri
notes visible; Restart at opening Sa; Exit and Escape; focus restored to Cinema
button after the explicit fix; default notes 1–4 apply/clear; notes 1–1 continued
playing across multiple cycles; seek End during that loop produced 6800 ms,
paused state, cleared loop and truthful end-of-piece copy; setup restores note
editor; Back returns library and Resume practice reopens session.

Automated closeout: repository audit, lint, 119 tests in 35 files, production
build and whitespace check. Transport tests include preparation cancellation,
failure, one-note loops, pause offset, late scheduling, chords and half speed.
These do not measure actual loudspeaker latency or subjective acoustic fidelity.

Additional reproducible browser test: `scripts/practice-viewport-audit.cjs`, run
with bundled Playwright and installed Chrome in an isolated headless session.
Passed at 390×844, 844×390, 1366×768 and 1920×1080 for all three instruments:
no page-wide horizontal overflow, Cinema playback controls within the viewport,
Escape and focus restoration, no page errors. A controlled stalled sample
request confirmed Cancel loading leaves the transport paused at zero.
These are emulated viewports, not physical phone or audible latency tests.

## Acceptance disposition

| IDs | Status | Remaining evidence |
|---|---|---|
| UX01,03,04,06,08,12 | Implemented; local interaction/code evidence | Wider user/device coverage |
| UX02 | Transport placement repaired | Narrow screens and 200% zoom |
| UX05 | Controlled browser sample stall/cancellation passed; engine regression | Real network/device interruptions |
| UX07 | Modal, Escape, focus-return and playback verified | Full keyboard traversal/screen-reader run |
| UX09,10 | Partial | Mobile, reduced-motion/static reading and accessibility matrix |
| UX11,13 | Beta / unmeasured | Real input and loopback latency measurements |
| UX14 | Existing import/export tests | Fresh visual PDF comparison across languages |
| UX15,16,17 | Future / validation pending | Curriculum, calibrated wait mode, player study |

## Category scores (0–100)

Rubric: 90+ means polished and repeatedly verified for intended use; 75–89 is
credible prototype with bounded gaps; 50–74 is partial; below 50 is not ready for
the complete product promise. Unknown device behavior reduces confidence and
readiness; passing unit tests alone does not earn 100.

| Category | Score | Basis / principal deduction |
|---|---:|---|
| Visual design | 78 | Coherent vector instruments and readable notes; limited art direction/mobile proof |
| Practice usability | 82 | Range, seek, exit, resume; ordinary layout still scrolls and needs novice testing |
| Relative notation and event math | 88 | Pure conversion/timeline tests; real raga/fingering validation incomplete |
| Playback architecture and sync | 80 | Audio-authoritative scheduling; physical output latency unmeasured |
| Instrument sound completeness | 65 | Sampled piano/harmonium; Bansuri still procedural rather than Ventus |
| Responsive/mobile readiness | 65 | Four emulated viewports pass; touch, physical devices and 200% zoom unverified |
| Accessibility | 72 | Native controls, modal focus, non-colour hole states; full audit missing |
| Performance and engineering | 75 | Build/tests pass, shared renderer; no long-session memory/low-end-device benchmark |
| Content and learning depth | 55 | 35 playable studies/exercises, 88 planned; not 100 complete songs or validated curriculum |
| Commercial V1 readiness | 35 | No complete real transcription, durable accounts/billing/catalog, security/load release validation |

Equal-weight mean: **69.5/100**, rounded **70/100** for the whole promised system.
This is intentionally lower than the practice UX score: a polished screen is
not equivalent to a complete product. No claim of parity with the researched apps.

## Next release gates in order

1. Extend passing viewport/cancellation checks to physical devices, screen readers,
   browser zoom and long sessions.
2. Prepare the approved Ventus prototype samples, then compare instrument sound.
3. Independently validate notation/PDF/fingering on a small fixed reference set.
4. Small supervised player test; use observed failures rather than aesthetic scores.
5. Implement missing commercial/input/content capabilities as separate scoped slices.

Latest code is local on codex/playback-clock-regression; public deployment is
unchanged and not reverified. Preserve all unrelated worktree changes.
