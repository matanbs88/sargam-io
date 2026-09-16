# Design lab — first browser verification

Local production build, September 16, 2026. This is an incremental evidence log,
not a final design approval or a claim of audible quality.

## Observed in the browser

- All four entries open the canonical Ode to Joy study and expose a way back.
- Studio: piano first-play entered loading, then finished at 10.435 seconds.
  Restart followed by Play started the clock again. Harmonium loaded and also
  completed at 10.435 seconds. No error alert appeared in these runs.
- Studio Bansuri: selecting the experimental Ventus voice and pressing Play
  entered the playing state; note beams, fingering and position were visible.
- Living score: selecting Devanagari changed every visible note label. Changing
  Sa from C4 to D4 changed the opening E from G to Re without moving the score.
  Selecting note 14 sought to 8.804 seconds. Four bars and 15 onsets were visible.
- Coach: step two selected 0.75x and the first-half loop. Ventus remained playing
  across multiple loop durations; a later observation was inside the first half
  at 2.072 seconds. Pause changed the button back to Play at 2.568 seconds.
  Captured browser error log was empty.
- At 390px viewport width the score and riyaz documents measured 375px content
  width (remaining width was scrollbar), without page-level horizontal overflow.
- Desktop screenshots inspected: studio piano, studio Bansuri, living score,
  riyaz. Structural differences are real, but shared instruments still need
  further visual refinement. Do not infer final design quality from these checks.

## Findings and changes

1. Narrow score columns crowded short notes on phones: added one-bar-per-row
   layout below 600px. This needs a post-change browser check.
2. Transport was below the initial viewport in large instrument views: added a
   sticky bottom transport, keeping the playback controls accessible. Needs
   post-change screenshot and keyboard-focus verification.
3. Bansuri footer falsely described every voice as procedural even when Ventus
   was selected: removed that stale claim; experimental voice is labelled at
   the selector.
4. Score caption promised immediate sound on note click, but click only seeks:
   corrected instructions to select a note and press Play.

## Open gates

Real listening assessment (not inferred from a moving clock); timing measurement;
PDF download through the browser; all-direction phone screenshots; sustained
pause/resume and speed-change matrix; accessibility/contrast measurement; preview
deployment and remote smoke test. No final numerical design rating yet.

Build after the changes passed. Source/PDF tests previously passed 135/135.

Post-build desktop coach screenshot confirms the sticky transport is visible
at the viewport bottom while the instrument extends below the fold. Mobile
one-bar layout still needs its post-change verification. Targeted lint passed.

## Follow-up verification

- Post-change phone screenshot at 390×844 confirmed one bar per row, readable
  quarter-note labels, and visible sticky Play/Restart/Speed/Position controls.
- Commit b677fd1 was pushed to codex/playback-clock-regression. GitHub's Vercel
  status reported success. Remote browser verification was denied during a Vercel
  access redirect; no authentication bypass or production promotion was attempted.
- Chrome UI export produced `C:/Users/matan/Downloads/ode-to-joy-sargam.pdf`,
  65,742 bytes, timestamp September 16 2026 06:31:37 local. The in-app browser's
  download event was inconclusive; Chrome provided actual on-disk confirmation.
- Chrome Bansuri with Ventus at 0.5x entered playback, paused at 5.781s score time,
  and resumed from that position. This verifies controls/state, not listening
  quality or physical audio-device latency.
- Half-speed Ventus subsequently reached the end at 10.435s score time with no
  console errors. Measured target audit found a 16px slider and 21px return link;
  CSS now provides 44px minimum heights. Post-build measurement remains to do.

## Audio scheduling follow-up

Code inspection found that non-looping samples resumed from `offset * pitchRate`
even though transport offset is in score seconds and the source consumes real
seconds. Corrected to `(offset / tempoRate) * pitchRate`. This applies to Piano
and the experimental Ventus voice; Harmonium's existing looping behavior is
unchanged. Tests cover 0.5x, 1x and 1.25x offsets, unchanged pitch, scheduled end,
and slow-tempo sample-exhaustion detection. Focused engine suites passed 19/19.
This is scheduling evidence, not an audible continuity certification. Browser
connection returned Transport closed during this follow-up, so the changed
behavior still requires a live browser regression check.

## Source-token contrast calculation

Calculated sRGB relative luminance ratios from the current CSS literals (not
computed browser styles). These eight principal text/background combinations
exceed 4.5:1; translucent, disabled, focus and canvas states are not certified.

| Pair | Ratio |
| --- | ---: |
| Studio muted `#aab3b8` / `#14171a` | 8.44 |
| Studio primary `#171c13` / `#e3ef98` | 14.08 |
| Score muted `#586068` / `#faf9f5` | 6.06 |
| Score active white / `#243e87` | 9.93 |
| Riyaz muted `#b8c9bf` / `#172e2c` | 8.30 |
| Riyaz active `#172e2c` / `#f0d298` | 9.82 |
| Coach muted `#4c607c` / `#f1f4fa` | 5.83 |
| Coach active white / `#204bc4` | 7.33 |

Production build after the sampled-resume correction passed. Full suite passed
139 tests before the additional canonical timeline integration tests.

The canonical timeline integration test initially found 16 scheduled events for
15 authored notes at 0.5x. Inconsistent floating-point tolerance across adjacent
queue windows admitted a boundary onset twice. Applying the same tolerance to
both ends preserves a half-open scheduling interval. Regression coverage checks
all 15 pitches, onset times, duration, zero resume offset (within numeric
precision), and automatic end at 0.5x, 0.75x, 1x and 1.25x. This measures the
scheduler with a simulated clock; it is not a real-device latency measurement.
