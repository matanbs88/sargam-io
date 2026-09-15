# Practice experience specification

Companion evidence: [competitive research](../research/PRACTICE_BENCHMARK_2026-09-08.md).
This is the target specification, not a claim that every requirement ships today.

## Product contract

A learner can open a playable piece, understand its tonic, hear a reference,
practice a bounded passage at an appropriate speed and obtain the same notation
as a printable artifact. Piano, harmonium and bansuri remain equal instrument
choices. Default notation is Latin Sargam. Do not add a paywall, external audio
provider or account requirement as part of this UX implementation.

## User journeys

### First session

Library → playable piece → title/Sa/instrument visible → listen → select a short
range → repeat slowly → stop → return to library. No compulsory microphone
permission or misleading accuracy number. A missing sample must show a useful
error with an explicit sound-off alternative; time does not run during loading.

### Returning learner

Resume a saved piece and position. Retain chosen instrument and notation where
possible, while clearly resetting a loop if a different score replaces it.
Expose restart without requiring repeated Previous clicks. Returning to the
library must not feel like destroying the catalog or logging out.

### Score editor / teacher

Open notation and editing tools deliberately. Select a note, inspect its label,
adjust pitch, reset edits, export. Editing is not the main visual mode for a
learner. Imported-score review warnings stay visible even in Focus mode.

### Playing with input

Choose microphone deliberately, run a confidence/setup check, wear headphones
when guide audio might leak into input. Distinguish unknown/low confidence from
wrong. A future wait-for-note mode requires input validation; a button called
Wait must not merely pause playback and pretend to recognize the learner.

## Screen architecture

1. Compact identity row: Back to library, full piece title, current instrument.
2. Study toolbar: Sa and notation in expandable setup; Focus/Tools always clear.
3. Main stage: one instrument renderer and one score timeline.
4. Persistent transport: load/cancel or play/pause, restart, seek, speed, repeat.
5. Secondary tools: note selection/editing, rhythm/drone, optional tuner, export.
6. End state: replay or practice a range. Playback completion is not mastery.

Focus is a layout mode, not an input-grading mode. It hides setup/editor clutter,
not navigation or transport. Tools restores the full editor. Cinema is optional;
it must have play/pause and restart, Escape, focus containment and a visible exit.
Do not mount a second live microphone coach inside Cinema.

## Rendering and musical invariants

- Fixed coordinate geometry for keys and note lanes; decorative cabinet is
  outside the strike area. White/black note widths come from the same key map.
- Bansuri time is horizontal and pitch is continuous vertically. Fingering is
  a separate complete combination with octave/breath caveats. No forced mapping
  of every semitone to a physical hole, and no collapsing high Sa onto low Sa.
- Source start/duration survives transposition, speed changes and visual zoom.
- A rest is empty time. Adjacent notes meet temporally; pill caps may create a
  contour but do not shorten the authored event.
- Stage size should fit a landscape laptop without scrolling away from Stop.
  Compact portrait layouts may stack controls; never crop required controls to
  claim that the screen fits. Readability takes precedence over showing 49 tiny
  keys on a phone; horizontal key navigation/auto-follow needs separate QA.
- Use local Poppins and Devanagari fonts. Artwork is custom; no competitor
  graphics, lesson content, videos or trademarks are copied into the application.

## Interaction details

Seek is a labelled native range with current/duration text. Seeking stops pending
voices and leaves playback paused, announced in its help text; it never silently
changes pitch. The displayed slider is a control, not a separately eased clock.

Repeat setup: show start and end note selectors with readable notation labels;
allow one note; disallow reversed or absent ranges; Apply selects the start and
sets the existing engine loop. Clear returns to the whole score. Until musical
phrase metadata exists, call these note ranges, not verses or inferred ragas.

Restart seeks score zero. When a repeat range is active, restart must either
restart that range or explicitly clear it. No seek outside a loop should leave
an invisible loop that jumps the next time Play is pressed.

Audio-loading button reads Cancel loading; first click starts preparation, second
cancels. Visible errors do not vanish behind collapsed setup. Sound and input are
separate: Sound means reference output, not microphone activation.

## States and recovery

| State | Stage | Primary action | Recovery |
|---|---|---|---|
| No score | Empty, no fake note stream | Browse/import | Explain accepted input |
| Ready | Authored notes visible | Play | Setup optional |
| Preparing | Notes fixed, status text | Cancel loading | Retry or sound off |
| Playing | Audio-clock motion | Pause | Stop reachable |
| Paused | Exact offset retained | Continue | Seek/restart/range |
| Ended | End position, no infinite timer | Replay | Choose range |
| Sample failure | Error, no hidden fallback claim | Retry | Sound-off explicit |
| Audio interrupted | Paused and explained | Resume | Recreate/resume context |
| Microphone denied | Practice remains usable | Continue without mic | Settings guidance |
| Low-confidence input | Unknown, not failed | Retry a sustained note | Reduce noise |

## Accessibility and device policy

Use a single main landmark and avoid aria-live on an entire animated workspace.
Only explicit state/error summaries announce themselves. Buttons have clear
names, pressed state, keyboard focus and an internal 44 px touch target goal.
Colour is not the sole signal for holes, notes or input feedback. Dialogs trap
focus, Escape exits and focus returns to the invoker. Reduced-motion users need
a static notation route; disabling timing is not an acceptable silent substitute.

Test 390×844 portrait, 844×390 landscape, 1366×768 laptop and 1920×1080 desktop;
browser zoom 200%; Hindi combining marks; touch and keyboard. These are target
test environments, not a declaration that all are verified on real hardware.

## Data and architecture

Keep canonical events in score time (milliseconds). UI chooses intent/range;
EngineStore owns playback and cancellation; GuideVoiceBank owns prepared voices;
canvas owns drawing only. Add no second musical clock. Use controlled props for
seek/loading/duration and repeat callbacks; range-validation math is pure/tested.
Persisted view preferences must be versioned and optional; unavailable storage
does not prevent practice. Input microphone samples stay local.

## Content and learning progression

Recommended first learning sequence: find Sa; Sa/Re alternation; three-note
phrase; deliberate rest; octave comparison; slow phrase with a komal; repeat a
tricky transition. Instrument guidance differs: key position for keyboard,
reed/bellows sustain for harmonium, full fingering and register for bansuri.
These are curriculum proposals requiring musical review, not generated claims
of a validated teaching program.

Catalog entries need title, source, arrangement/version, root, duration, level,
instrument suitability, notation readiness and review status. Default browsing
prioritizes playable entries. Requests/planned titles belong in a separate view.
PDF must use the same canonical score, root and notation as the practice view.

## Acceptance register

| ID | Requirement | Evidence needed | Priority |
|---|---|---|---|
| UX01 | Focus removes setup/edit clutter without losing Back/title | Browser screenshot and navigation | P0 |
| UX02 | Stop/restart/seek always accessible during ordinary practice | Keyboard and viewport tests | P0 |
| UX03 | Seek uses authored score milliseconds | Unit tests + browser | P0 |
| UX04 | One-note and multi-note range selection works | Validation tests + browser loop | P0 |
| UX05 | Loading has a real cancellation action | Engine regression + UI state | P0 |
| UX06 | Setup and note editor remain available | Browser toggles/edit reset | P0 |
| UX07 | Cinema is an operable modal, not just a screenshot frame | Focus/Escape/play/restart | P0 |
| UX08 | Main workspace is not an aria-live flood | DOM inspection | P0 |
| UX09 | Mobile stage remains legible and navigable | Physical device + viewport | P1 |
| UX10 | Static notation alternative / reduced motion | Keyboard and screen reader | P1 |
| UX11 | Output/input setup and confidence are distinct | Real microphone sessions | P1 |
| UX12 | No fabricated accuracy, streak or mastery | Product copy audit | P0 |
| UX13 | Measured presentation/audio latency | Loopback/device measurement | P1 |
| UX14 | Validated source-to-PDF consistency | Import/export fixtures | P1 |
| UX15 | Phrase metadata, graded learning path | Musician-reviewed content | P2 |
| UX16 | Wait-for-note and meaningful performance feedback | Calibrated input evaluation | P2 |
| UX17 | First-session usability and return behavior | Indian player usability sessions | P1 |

## Delivery policy

Implement P0 workflow first, preserve current sound/notation math, then audit the
actual browser screens and test failures. Record implementation status separately
from this target spec. Do not claim competitor parity or production readiness
from a self-assigned aesthetic score. Keep work local until promotion is requested.
