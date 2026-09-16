---
title: Living Score selection and synthesis
type: design-review
status: review-ready
owner: Codex
created: 2026-09-16
updated: 2026-09-16
review_by: founder
---

# Living Score — selected direction

Founder selected Living Score and authorized integration of the other alternatives' strengths. This is preview implementation authorization, not production promotion.

## Comparative baseline

Expert heuristic scores, not measured user satisfaction, musical accuracy, or release readiness. Same Ode to Joy fixture, same shared audio engine; these scores assess presentation and practice interaction. Desktop inspection plus recorded prior mobile/keyboard observations. Differences of 1–2 points are not statistically meaningful.

| Direction | Reading /25 | Practice flow /25 | Hierarchy /20 | Instrument integration /15 | Responsive & access /15 | Total /100 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Living Score (before synthesis) | 23 | 17 | 18 | 9 | 12 | 79 |
| Studio | 18 | 22 | 15 | 12 | 10 | 77 |
| Coach | 18 | 23 | 14 | 11 | 10 | 76 |
| Riyaz | 18 | 20 | 16 | 11 | 10 | 75 |

Living Score wins as a readable, distinct product foundation, not because it already has the best practice screen. Its hidden instrument and duplicated title waste attention. Studio makes playback direct but consumes the viewport with library/navigation and an oversized roll. Coach provides meaningful steps but adds excessive framing; its score needs disclosure. Riyaz gives Sa a clear identity but dedicates a sidebar to a small amount of information, with an oversized roll pushing the keyboard below the fold.

## Synthesis rules

| Source | Keep | Do not import |
| --- | --- | --- |
| Living Score | Light editorial score, musical spacing, PDF, note navigation | Duplicate title, controls sidebar, hidden instrument default |
| Studio | Visible instrument and immediate transport | Permanent library sidebar, dark app-wide dashboard |
| Riyaz | Sa and selected/playing note anchor | Oversized tonic column, implying a drone when none is playing |
| Coach | Optional listen / first-eight repeat / full phrase | Mandatory step funnel, invented scores or completion claims |

Default desktop workspace shows instrument and score together. Controls run across the top; one sticky transport uses the existing session. Smaller screens stack content without changing coordinates or playback. Focus controls can isolate either surface without resetting the audio clock. Guided practice is optional; leaving its first-eight loop by selecting a later note clears the loop explicitly. No microphone assessment is represented as implemented.

## Verification checkpoint

Chrome inspection completed on the local production build at `http://localhost:3010/design-lab/score`. Existing engine suite: 143 tests in 41 files passed after implementation; lint, production build, repository audit and whitespace check passed. Shared MIDI math, scheduling and voice engine were not edited.

- Desktop: instrument, entire keyboard and all four score bars visible together. Reduced navigation/title height after first screenshot showed cabinet clipping behind sticky transport.
- Guided repeat: speed changed to 0.75, playback entered the first-eight loop; selecting bar 3 note 9 cleared the loop, paused and selected 5217 ms. The selected Sa label became S.
- Harmonium: selected after piano, played from 5217 ms to 10435 ms; instrument cabinet and score remained visible.
- Bansuri: selected Ventus study, restarted and observed active playback, moving timeline and highlighted score. This is playback/UI evidence, not a subjective sound-quality or end-to-end latency assessment.
- 390×844 viewport: document client width and scroll width both 375 px (no page-wide overflow). Score-only mode rendered the four bars as a readable single column, with transport retained. Instrument timelines retain internal horizontal scrolling; this remains weaker than the desktop experience.
- Browser error log read after the loop interaction returned no errors. Not an exhaustive runtime/performance audit.

## Post-synthesis heuristic rating: 86/100

Reading 23/25, practice flow 23/25, hierarchy 18/20, instrument integration 12/15, responsive/access 10/15. The gain is visible instrument + readable score + optional guided practice in one session, without importing three full layouts. Remaining deductions: mobile canvas navigation, dense short-note targets, illustration refinement, and absence of real musician usability evidence. Do not round this up to a claimed 90 or describe it as a production certification.

Remaining release gates: physical-device latency/listening tests, musician fingering validation, wider catalog journey and production promotion approval. A design score does not waive these.
