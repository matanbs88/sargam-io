# Practice UX verification checkpoint — 2026-09-09

Historical checkpoint: superseded by the [completed local review](./PRACTICE_QUALITY_REVIEW_2026-09-09.md), including later loop, seek, focus and viewport checks.

Scope: implementation of the research-led practice specification, local only.
Research: [benchmark](../research/PRACTICE_BENCHMARK_2026-09-08.md).
Target: [acceptance register](../strategy/PRACTICE_EXPERIENCE_SPEC_2026-09-08.md).

## Changes this continuation

- Bounded the Bansuri grid children and flexible SVG height. Previously intrinsic
  sizing allowed the flute/canvas to overflow into the explanatory legend.
- Moved the opt-in tuner after transport, keeping reference playback controls
  ahead of secondary microphone tools. No audio or event mathematics changed.
- Gave speed buttons a minimum 44 px width as well as height.

## Browser evidence

Tested local port 3001, mock phrase, D4 tonic, Bansuri, 0.5x.
Observed notes and all six finger states inside their panel without legend overlap.
Cinema showed title, instrument, tonic, visible moving notes, Pause and Restart.
Restart returned to the opening Sa; Exit returned to the workspace.
Applied the default notes 1–4 repeat range: active loop and summary updated.
Whole piece cleared it. Setup & notes exposed tonic, notation and note editing;
the focus control changed accordingly. This is UI-state verification, not a
measurement of audio output latency or a complete repeat-duration test.

## Still required

- One-note repeat playback, seek during playback/loop, loading cancellation in UI.
- Keyboard focus return/Escape, actual mobile and 200% zoom checks.
- Piano/harmonium viewport regression and always-reachable transport checks.
- Final acceptance matrix and source-of-truth synchronization after these checks.
- Physical microphone, audio-latency and Indian-player validation remain separate
  gates; do not claim competitor parity or production readiness.

No push or deployment was performed. The scheduled continuation remains active.
