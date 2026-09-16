---
title: Pilot browser QA after connection recovery
type: audit
status: active
owner: engineering
created: 2026-09-16
updated: 2026-09-16
review_by: 2026-09-23
---

# Browser recovery and coach regression

User restarted Codex; browser inventory, navigation and interactions then worked.
Local production server was restarted on port 3010 from build containing
`12422cb`. This supersedes the connection blocker, not the outstanding QA gates.

## Observed in the actual browser

- Coach study opens with title, Library return, instrument/notation/Sa controls.
- Native note disclosure exposes all 15 notes and durations across four bars.
- Tab from the expanded summary focuses the first note; Enter selects it.
  Screenshot confirms a visible focus outline and selected note styling.
- DOM measurements: return link, playback range and disclosure summary each
  44px high. Desktop document client/scroll width both 895px.
- Harmonium at 0.5x transitions from loading to playing, displays falling notes,
  highlighted keys and cabinet, and stops at 10,435ms. No console errors captured.
  A later Pause click found no button because playback had already ended; the
  refreshed UI confirmed the expected end state, not a transport failure.
- Ventus experimental Bansuri at 0.5x starts, pauses at 7,119ms score time, resumes
  from that position and reaches 10,435ms with no captured console errors.
- Devanagari selection updates all 15 accessible score labels correctly.
- At 390×844, client/scroll width both 375px: no page-level horizontal overflow.
  Playback range remains 44px high; screenshot shows Play/Pause, Restart, Speed
  and Position together. The instrument timeline has its own horizontal scroll.

## Limits / findings

These checks verify visible playback state, not subjective audio fidelity or
measured device-output latency. No assertion of listening verification is made.
The mobile Bansuri illustration and pitch labels are small; instrument-level
horizontal scrolling is contained, but still warrants UX refinement. Other
directions' remaining responsive and notation matrix checks are not covered by
this coach-specific audit. No final design score or production promotion.
