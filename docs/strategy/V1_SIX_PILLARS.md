---
title: Six-pillar implementation architecture and remaining product decisions
type: strategy
status: active
owner: engineering
created: 2026-09-08
updated: 2026-09-08
review_by: 2026-09-15
---

# Six pillars: engineering and product design

## 1. Flat-vector standard

Use #101820 stage, #192630 panel, #F4F7FA text, #B7C5D0 secondary text,
#80CFFF upcoming notes and #FFE08A active notes. Use dark text inside notes.
Poppins for UI, Rozha sparingly for titles, Noto Sans Devanagari for Hindi.
Spacing scale 4/8/12/16/24/32 px; controls at least 44 px tall where feasible;
panels 8 px radius, no metallic gradients or decorative waveform noise.

The instrument occupies the primary workspace, not a card inside many cards.
Keep title/back navigation visible; group Sa and notation above the stage;
keep play/seek/speed/loop below. Bansuri's fingering is a six-hole combination,
not one pitch per hole. Half coverage is geometric, with closed marks and labels
for users unable to distinguish cue colors. The flute is a reference diagram,
not a photograph or a universal teacher-approved fingering chart.

Implemented: shared KeyboardRoll and BansuriFallingNotes. Full mobile and
assistive-technology review is still an explicit acceptance gate.

## 2. Synchronization and expressive pitch

Audio clock is authoritative; React renders controls and semantic state; canvas
reads the clock on rAF. A short recurring scheduler queues AudioNodes ahead.
No fetch or decode in the scheduling path. Preparing/playing/error are distinct.
Cannot promise zero latency: hardware, browser output buffers and Bluetooth
exist. Future presentation-clock correction must be measured per device.

`pitchCurve: [{ offsetMs: 0, cents: 0 }, { offsetMs: 500, cents: 180 }]`
describes a continuous performed-pitch offset from a nominal MIDI note. Nominal
notation remains readable while the curve carries the gesture. Frequency is
`440 * 2 ** ((midi - 69) / 12 + cents / 1200)`. Inference of meend and raga-specific
intonation is a separate content/analysis problem, not a fixed 22-value table.
Procedural flute automation and visual trace exist; Kontakt-quality legato does
not follow automatically from sample transposition.

## 3. Architecture and performance

```text
src/engine/EngineStore.ts             pure transport with injected audio backend
src/engine/GuideVoiceBank.ts          prepared voices, cancellation, cache lifecycle
src/features/practice/useEngineTransport.ts   React subscription adapter
src/components/visualizers/KeyboardRoll.tsx   shared geometry/rendering
src/components/visualizers/BansuriFallingNotes.tsx   pitch timeline + reference
src/lib/expressivePitch.ts           validated curve/interpolation primitives
src/lib/pitchDetection.ts            pure monophonic detector
src/workers/pitch.worker.ts          off-main-thread estimation
public/audio/pitch-capture.js        AudioWorklet frame collection
src/components/LivePitchCoach.tsx    opt-in mic and local guidance
```

An external immutable snapshot with useSyncExternalStore avoids another global
state dependency. The transport uses composition via AudioBackend rather than
making visual components own audio. React state is published about ten times
per second and on transitions; animation does not publish frame state.
Cache is bounded, fetches cancellable, source nodes disconnected on cleanup.
Next optimization: time-indexed visible-event queries for large scores; the
current renderer scans the score and is not benchmarked for enormous files.

## 4. Branding concepts — not an automatic rebrand

1. **Sargam / The Root Note:** refined `Sa` serif wordmark; the a's terminal
   extends into one restrained string curve. SVG concept: wordmark converted
   to paths plus one 1.5 px cubic stroke, no glow. Strong connection to the
   existing name and movable tonic; recommended direction for founder review.
2. **SaFlow:** two rounded horizontal note capsules connected by a single
   rising curve, suggesting a sustained meend. A monoline `Sa` beside it;
   works in one color and as a 24 px app mark.
3. **SaSetu:** a grounded dot beneath two linked arches; the root bridges
   traditional notation and digital practice. Build from circles and two cubic
   paths; keep an open counter so it remains legible at small size.

Names/trademarks are not validated. Retain current branding until selection.
Avoid peacock/temple clipart and an excessive collection of heritage symbols.

## 5. Accessible learning loop and restrained gamification

Distinguish selected notes with outlines as well as color, show textual pitch
and hole states, preserve keyboard focus, and provide a static notation route.
Do not equate animation visibility with screen-reader accessibility.

Proposed loop: choose a short phrase → listen → repeat slowly → receive measured
feedback → repeat one weak transition → optional faster attempt. Reward a
completed deliberate practice session with a calm summary, not confetti.
Separate `listening minutes`, `practice attempts`, and `measured accuracy`.
Streaks should be optional, local-calendar based, tolerant of rest days and not
punitive. Accuracy must only use confidence-qualified input matched to expected
notes after latency calibration; rests/low confidence count as unknown, not
automatically wrong. No leaderboards for uncalibrated devices.

The local tuner is implemented; scoring, durable streaks and progression are
proposals, deliberately not fake counters in the UI.

## 6. Wildcard and biggest blind spot

The missing feedback loop matters more than another GPU renderer. A learner
needs to know whether their performed pitch and timing match the phrase.
Implement microphone guidance cautiously (now a beta) and use Web MIDI as a
future optional keyboard input, with permission and unsupported-browser paths.
Do not require MIDI for harmonium or microphone for browsing/listening.

Biggest blind spot: musical content validity and calibrated input/output timing
cannot be proved by attractive animation. Validate against reference phrases
with known durations, rests, octaves and slides; compare captured input against
these before assigning grades. Real-device checks and musical evaluation remain
necessary even when most implementation is autonomous.

See the current engine audit for delivered functionality versus release gaps.
