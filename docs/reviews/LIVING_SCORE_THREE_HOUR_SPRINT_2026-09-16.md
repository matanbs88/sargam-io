---
status: in-progress
owner: engineering
updated: 2026-09-16
---

# Living Score: autonomous quality sprint

Founder authorized up to three hours starting 09:51 UTC (12:51 Jerusalem).
Target: evidence-backed 95/100 for the preview experience, not commercial readiness.
Production remains untouched. Existing uncommitted preview work is preserved.

## Scoring rubric, established before scoring

| Category | Points | Evidence required |
| --- | ---: | --- |
| Practice clarity and anticipation | 25 | All three instruments; readable complete score; five real seconds of upcoming events across speeds; accurate durations/rests |
| Navigation and task completion | 20 | Home → library/import → practice → return; no dead ends; clear title, tempo, notation and export |
| Responsive composition | 20 | Desktop and narrow/mobile checks; Focus fills viewport without page scrolling; no clipped controls |
| Accessibility and control | 15 | Keyboard use, focus visibility, explicit labels, errors visible in Focus, reduced-motion handling |
| Visual hierarchy and consistency | 10 | Actual screenshots, compact score/library, restrained instrument treatment |
| Reliability | 10 | Regression tests, lint/build; first play/pause/restart/seek/speed/instrument checks |

Missing visual evidence cannot receive full points. Self-review is not an external
usability study. A 95 interface score would not establish accurate transcription,
commercial readiness, physical-device audio latency, or validated sound quality.

## Initial verified observations

- Chrome connection recovered during this sprint; previous capacity/permission
  failure is no longer assumed to block all inspection.
- Home prominently offers YouTube input and explicitly labels unavailable live
  conversion. Demo is clearly separate.
- Ode demo opens with all 15 onsets in four compact bars, not a horizontal slide.
- Focus fallback occupies the measured 1920×911 viewport; canvas is 1888×519.
  Browser Fullscreen API did not activate in this automated click; fixed viewport
  fallback did. These are distinct outcomes, not a claimed native fullscreen pass.
- These initial observations are superseded by the checkpoint below.

## Implementation checkpoint, 11:05 UTC (sprint still running)

Preview: `http://localhost:3010/living-score`. Branch:
`codex/playback-clock-regression`. No production deployment or push.

Implemented and inspected:

- Full-viewport Focus fallback; compact title/control row; keyboard Escape and
  Space; background inert/scroll locking; visible playback failures in Focus.
- Resizable score/instrument divider, pointer and keyboard accessible (15–60%).
- Mobile transport uses two compact rows. Short landscape uses one transport
  row and enough notation height for a complete reading line.
- Piano/harmonium share geometry and five-real-second lookahead. Bansuri labels
  remain visible on narrow screens; held-note labels stay near the strike line.
- Binary-searched visible-note windows avoid scanning/drawing an entire long
  score each frame; held notes and polyphony have regression coverage.
- Compact full-song reading groups now use print-aligned 96-tick quantization
  for presentation only. Browser Alankar review found accumulated millisecond
  rounding shifted beat groups; fixed and regression-tested. Audio is unchanged.
- Roving note focus; arrows/Home/End navigate; follow works when paused too.
- Manual A–B loops; selecting an outside note exits the loop without resetting
  BPM. Loop range remains identified in the score, including Focus.
- Browser Back/Forward, heading focus, browse-filter preservation. Fixed a
  Next.js integration bug: passing `history.state` reintroduced `__NA` and
  bypassed the router's canonical-URL update. Use supported `pushState(null)`.
- Catalog IDs now live in `?score=...#practice` for refreshable/bookmarkable
  library scores; imports remain private session drafts. This newest addition
  still needs browser refresh/back/invalid-ID verification.
- Import buttons keyboard-accessible; empty/oversize rejection; cancellation,
  stale-response suppression and same-file reselection. Original MusicXML fixture
  validated through parser, validation, canonical events and reading-score code.
- PDF creation exposes a persistent explicit download fallback, revoked on
  replacement/unmount. Browser generated and saved Alankar PDF (66,026 bytes,
  one A4 page), rendered with Poppler and visually inspected. Third bar is the
  source's intentionally extended final note, not an invented onset.

### Browser evidence

- 1920×911 desktop Focus; 390×844 portrait all three instruments; 1366×768
  laptop Focus verified. At laptop, canvas 1334×420 and transport bottom760.
- 844×390 landscape: first pass exposed wrapped transport and clipped notation;
  corrected. Latest canvas812×132, score viewport60px shows a complete line,
  controls remain within viewport. Instrument-only provides more height.
- Alankar beat pairs corrected in actual screenshot; Hindi notation on Für Elise
  verified; native Back returned to Ode library search with filter retained.
- Manual loop notes3–6 played at46BPM, still within range after multiple cycles;
  selecting note9 removed loop and preserved46BPM.
- Browser PDF download event timed out, but explicit-link download was verified
  independently by newly saved file and PDF rendering. Do not claim event API
  itself passed.
- Native Fullscreen API was not confirmed (fullscreenElement false); fixed
  viewport fallback is verified. Screenshot immediately after click may show a
  pre-paint frame; later screenshot and DOM measurements agree.
- Viewport capability applies to the selected agent tab. Dedicated responsive
  QA tab80278466 solved earlier un-applied resize attempts. Reset before handoff.

### Gates and limits

- Full suite169 tests/49 files passed before latest bookmark additions; new
  navigation subset4 tests passed. Lint/typecheck passed at that checkpoint.
- Production build passed after PDF fallback; final build must include subsequent
  reading, label, short-landscape and bookmark changes. `git diff --check` passed.
- Browser file upload blocked by Chrome extension file-URL permission. Do not
  retry through another surface or claim import browser E2E passed. Parser fixture
  passed; user need not interrupt holiday for independent remaining work.
- Actual YouTube conversion is still not connected. No cloud persistence,
  microphone accuracy scoring, or physical-device latency certification claimed.

### Provisional score: 89/100, not the target

Practice23/25; navigation18/20; responsive18/20; accessibility13/15;
visual hierarchy8/10; reliability9/10. Self-review based on observed journeys,
not an external usability study. Missing import E2E and browser recovery checks
prevent calling the complete experience finished. Continue improvements.

### Next concrete queue

1. Verify catalog bookmark refresh, Back/Forward across pieces, root and loop
   isolation, invalid-ID recovery, and resume after navigating to library.
2. Recheck mobile home/library and landscape bansuri/harmonium plus long-score
   follow. Confirm short-note label readability after adaptive font change.
3. Final full tests/lint/build, documentation reconciliation and honest scoring.
4. At 12:51 UTC stop new features, finish verification and handoff; pause heartbeat.

Existing heartbeat `resume-sargam-practice-upgrade` was updated via automation
tool to ACTIVE, every30 minutes until12:51 UTC, with this bounded sprint scope.
This is a real continuation mechanism, not a claim of work while no process runs.

## 11:37 UTC checkpoint — recovery, responsiveness and regression gates

- Catalog bookmark reload and browser Back across different scores verified;
  the correct score title/events return. Invalid score ID shows recovery copy
  and the playable library, not the demo. Unknown private imports remain drafts.
- Sa selection and loop range are keyed to the selected piece; no stale loop
  indexes carried into another score. Opening a fresh library piece resets speed.
- Focus has an accessible Settings disclosure for instrument, notation and Sa.
  Escape closes that panel first and returns focus to Settings. The viewport
  remains in Focus; Exit focus restores the ordinary navigation.
- Bansuri's short-landscape illustration becomes a clear numbered fingering
  diagram. Pitch-axis labels use a height-dependent stride to prevent collisions.
  ResizeObserver redraw supplements RAF so an inactive/resized tab is not left
  with stretched stale artwork.
- Canvas bitmap dimensions are rounded once for fractional device pixel ratios.
  This prevents reallocating the bitmap every frame at e.g. 125% scaling; two
  pure regression tests cover the integer backing store and capped DPR.
- Mobile library keeps search visible and puts Collection/Level/Sort behind a
  disclosure. Devotional + Beginner produced seven results. A no-result query
  displayed recovery actions; Clear filters restored all 35 playable pieces.
- Portrait Hindi Bansuri tested with two-bar exercise; notation density tightened
  without reducing the instrument's five-real-second preview window. Touch note
  targets remain at least 24px wide and 36px high in compact Focus.
- `npm run closeout` passed: inventory, lint, **172 tests / 50 files**, production
  build, diff whitespace check. This gate preceded the final small typography,
  pagination-focus and documentation edits; rerun at final handoff.
- No release, merge, purchase, or production design replacement performed.

Remaining immediate checks: five-bar follow during real playback, pagination
focus/scroll after the new recovery improvement, final browser console review,
and final gate. Native fullscreen, real-device audio perception and browser file
upload are still unverified and must not be described as passing.

## Final interface review — 2026-09-16, 12:12 UTC

Scope: the local Living Score preview interface, not overall product launch
readiness. The assessment is an engineering/design self-review against the rubric
above, not an external musician usability study or a claim of parity with every
Songscription feature. The full product cannot be called finished while actual
YouTube transcription is disconnected.

### Additional implementation and observed evidence

- Five-bar Hindi playback followed the final bar inside the score pane while
  document scroll remained zero. The reading model now quantizes presentation
  to 96 ticks/quarter and uses the same grid for `barAt`; a regression checks
  every catalog onset against its printed bar. Original audio events are unchanged.
- End of score offers Replay and an accessible completion message; Replay was
  observed starting again at zero. Source position/total duration uses stable
  mm:ss formatting and the seek slider has a stable accessible name.
- Focus browser Back restored the library search and focused heading, released
  the body scroll lock, and removed the focus workspace. Settings Escape closes
  only Settings before the next Escape exits Focus.
- Pointer resizing moved the score allocation from 24% to 37%; Home set 15%,
  and two ArrowDown presses set 25%. No page scrolling was required. The final
  Chrome handoff retains 25%, with temporary viewport emulation reset.
- Final laptop view at 1366x768 displayed all four Ode to Joy bars, a large roll,
  complete keyboard and fixed transport together. All three instruments were
  also checked in portrait and short landscape. A 667x375 long-title test
  retains an ellipsized title and usable controls; landscape keyboard geometry
  now considers aspect ratio rather than width alone, avoiding oversized tiles.
- Mobile import controls measured approximately 145x44px with no horizontal
  document overflow. Formats, size limits, cancellation and temporary-draft
  expectations are explicit. Browser file-selection E2E remains unverified:
  the extension denied file access, and that boundary was not bypassed.
- URL validation rejects playlists, credential-bearing URLs and malformed video
  paths. A valid-format link explicitly reports that conversion is not connected;
  no fixture is presented as that video's transcription.
- Representative contrast measurements: muted text on white 6.39:1; control
  border on off-white 3.61:1; blue accent on paper 9.43:1; canvas labels 10.15:1;
  dark note labels on blue 10.47:1. Placeholder opacity was removed. These are
  sample checks, not a full WCAG certification. Text criterion reference:
  https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Exported Alankar PDF was downloaded and inspected using Poppler: one A4 page,
  Latin Sargam and correct grouped notes. File: `Alankar 1  paired ascent-sargam.pdf`
  in the user's Downloads folder; local rendered QA image in `tmp/pdfs/`.
- The final browser error/warning log was empty. An ESLint hook-name false
  classification caught the pure geometry helper name; it was renamed to
  `isCompactPracticeKeyboard`, without changing its behavior.

### Final interface self-assessment: 95/100

| Category | Score | Evidence / remaining deduction |
| --- | ---: | --- |
| Practice clarity and anticipation | 24/25 | Complete compact score, five-real-second roll window, loops and follow; no preparatory count-in yet. |
| Navigation and task completion | 19/20 | Home, filters, recovery, bookmark/Back, practice and PDF checked; browser import E2E not verified. |
| Responsive composition | 20/20 | All acceptance sizes passed for three instruments, whole-viewport Focus, pointer/keyboard split and short-landscape geometry. This score covers the tested matrix, not every device. |
| Accessibility and control | 14/15 | Keyboard navigation, focus restoration, status/errors, contrast samples and reduced-motion handling; no external screen-reader audit. |
| Visual hierarchy and consistency | 9/10 | Editorial transcription-first home, dense library, restrained score/instrument hierarchy; musician aesthetic validation still outstanding. |
| Reliability | 9/10 | Regression suite, production build gate and browser transport/recovery checks; physical-device audio latency and native fullscreen unverified. |

### Handoff and next work

- Preview: http://localhost:3010/living-score
- Direct practice: http://localhost:3010/living-score?score=pd-ode-to-joy-theme#practice
- Keep preview branch `codex/playback-clock-regression`. No push, merge or deploy.
- Next substantive product milestone is a real source-to-score provider job,
  with cancellation, failure/retry states and benchmarked transcription quality;
  do not replace this with another cosmetic sprint or fake demo conversion.
- Revisit file-upload browser E2E only when the browser permission is available.
- No purchase, license commitment, account change or source-audio acquisition.
- Final `npm run closeout` passed (exit 0): repository inventory, ESLint,
  **178 tests across 51 files**, TypeScript, optimized production build (15
  routes), and `git diff --check`. Only existing line-ending/user-ignore access
  warnings remained. No release was performed.
- The bounded sprint finished within the authorized three-hour window. The
  continuation heartbeat was successfully changed to **PAUSED** through the
  automation tool after verification. No continuing background work is claimed.
