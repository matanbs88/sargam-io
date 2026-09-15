---
title: Visual timing stabilization, first V1 slice
type: audit
status: active
owner: engineering
created: 2026-09-08
updated: 2026-09-08
review_by: 2026-09-15
---

# Evidence and scope

Branch: `codex/playback-clock-regression`. Local changes only, no production
promotion. Existing dirty Vault/audio intake files preserved.

Root cause: usePlaybackClock reset lastFrameMs to zero on a base-time change,
without restarting its animation effect. The next frame added page uptime to
song time. The phrase-overflow fallback then hid the failure by returning the
event start, producing stepped visual movement. Browser cache was not a verified
explanation for that failure.

## Implemented

- VisualTimeline uses absolute anchors, bounded by the authored phrase end.
- All three rolls use the same hook; notation changes no longer reset piano time.
- Bansuri active notes move through the playhead instead of being pinned.
- Removed positional CSS interpolation and duration cap on the Bansuri blocks.
- Piano/harmonium no longer inflate short notes to 42 pixels.
- Active note/keyboard highlights use start/end intervals, releasing during rests.
- Ten new regression tests cover page uptime, frames, end bound, seek/loop,
  speed change, legacy pause/resume, repeated setup, geometry and rests.

## Automated verification

`npm.cmd run closeout` passed: repository audit, ESLint, 94 tests in 31 files,
TypeScript/Next production build and git diff check. This does not measure
physical output latency or prove audible synchronization.

## Browser smoke check

Started the production build on http://127.0.0.1:3000, loopback only.
Opened the mock phrase at half speed with guide sound OFF. Browser screenshots
confirmed visible moving notes in Bansuri, Harmonium and Piano. Bansuri active
note extended to the left of the playhead (not pinned). The demo returned to
Play at note 13 with a 0:06 timestamp, rather than runaway minutes. Piano replay
returned to note 1 with visible notes. These are visual smoke checks, not an
audio synchronization measurement or a full device/browser acceptance suite.

## Remaining work

Audio still uses the legacy event-based transport. Single-event loops,
continuous pause offsets, preloaded scheduled voices, background behavior,
and source replacement at equal timestamps require the next engine slice.
Visual React state still updates each frame. Flat design, validated register
profiles and microtonal curves are not implemented by this patch.

Roadmap: [V1 upgrade](../strategy/V1_UPGRADE_ROADMAP_2026-09-08.md).
