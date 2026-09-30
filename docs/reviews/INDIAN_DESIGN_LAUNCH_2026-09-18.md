# Indian musical identity / launch plan

## Three working directions

- `/design-lab/indian/mehfil`: plum and brass side navigation, arched listening-room panel, Rozha display, warm paper workspace.
- `/design-lab/indian/raag`: indigo/saffron studio workbench, geometric Poppins headings, two working panels, mint collection rail.
- `/design-lab/indian/riyaz`: vermilion journal masthead, Sa wordmark, editorial columns, horizontally grouped notation study instead of an instrument card.

All keep the YouTube/audio intake first and share the real library/import/practice engine. No autoplay ambience, religious stock decoration, or ornamental motion over readable notation. Latin Sargam stays default; Devanagari is selectable. These are preview alternatives, not a production replacement.

## Honest provisional assessment

Desktop visual inspection at 1440×1000 completed for all three. Mobile Riyaz at 390×844 and real library-to-practice navigation checked. These are internal design judgments, not independent user validation:

| Direction | Identity /100 | Hierarchy /100 | Musical readability /100 | Remaining concern |
|---|---:|---:|---:|---|
| Mehfil | 89 | 85 | 86 | Tall study panel; side navigation reduces practice width outside focus |
| Raag Studio | 84 | 88 | 88 | Most direct workflow, but less distinctive Indian identity |
| Riyaz Journal | 90 | 87 | 90 | Strong notation emphasis; mobile conversion starts below large intro |

No claim of 95, production readiness or acoustic equivalence to Kontakt. Next iteration: complete mobile/focus audit for every direction, reduce excess vertical intake spacing, compare blind A/B audio at matched loudness, add an expression comparison lesson.

## Expression research and implementation

Teaching references:
- https://www.raag-hindustani.com/Embellishment.html
- https://resources.bcmg.org.uk/composing-for/composing-for-bamboo-flute
- https://impactsoundworks.com/product/ventus-winds-bansuri/

Meend is continuous pitch travel, often context-shaped. Gamak denotes forceful/articulated movement with multiple traditions and instrument techniques; not one universal sine wave and not universally only a transition. Our optional **transition study** is deliberately narrower: steady note body, then a shaped connection to the following pitch. Meend smooths that travel; Gamak study makes two directional articulations within that window. Both display a clean connector. Preserve score timing, rests, repetitions, authored curves and polyphonic material. Do not imply full Kontakt scripted legato or automatic raga grammar.

Update 03:00: Natural Ventus now has a maximum 18ms complementary linear crossfade at eligible boundaries. The destination starts in its sustain rather than replaying its attack. Source tails extend ONLY when the destination is actually scheduled in lookahead; cancellation, seeks, late scheduling, truncated loops and other articulations do not implicitly join. This is a sampled hand-off, NOT recorded Kontakt legato. Tests prove scheduling, not perceptual authenticity. Exercises with intentional gaps correctly receive zero connections, with an explicit UI explanation.

Offline listening comparison: `output/audio-comparison/expressions/ode-plain.wav`, `ode-meend.wav`, `ode-gamak-study.wav`. Reconstructed from the production event curves/selector/gain, linear sample interpolation; not a browser or Kontakt recording. All RMS-matched to −20dBFS, peaks below −10dBFS; report.json records exact gains. No listening-quality score assigned.

Actual engine comparison now available at `/design-lab/indian/expression`.
It uses OfflineAudioContext plus GuideVoiceBank, renders locally, and offers
three RMS-matched Play/WAV outputs. Meend/Gamak pointer playback completed to
10.435011s with no media error. Downloaded Gamak WAV header and length verified
on disk. In-app browser AX-based native-player clicks crashed twice; pointer
playback succeeded. This is a recorded QA limitation, not acoustic approval.

Web Audio scheduling reference: https://webaudio.github.io/web-audio-api/#dom-audioscheduledsourcenode-stop — the last scheduled stop replaces an earlier stop while the source has not yet stopped. The hand-off is restricted to lookahead before the existing release.

## Launch in one month — target October 18, 2026

### Week 1 / September 18–24: trust the core
- Choose one direction after side-by-side founder review; preserve shared engine.
- Finish keyboard, touch, focus and responsive QA for all three instruments.
- Matched-loudness Plain/Meend/Gamak comparison on Ode to Joy and a purpose-written connected swara study; have one bansuri player review gestures.
- Audio gate: no dropped first note, no fallback voice, seeks and loops do not click or drift. Track failed sample loads rather than claiming perfect sound.

### Week 2 / September 25–October 1: real transcription vertical slice
- Configure and evaluate the existing provider adapter against 20 fixed clips: solo bansuri, harmonium, piano and singing, plus mixed recordings.
- Keep mock clearly labelled and unavailable as a paid real-transcription result.
- Measure latency, note onset/pitch errors, cost per minute and failure rate. Scope beta to the material that passes; offer correction/review for the rest.
- Durable jobs, hashed request cache, retry/cancel, persisted scores and exports; server-only secrets.

### Week 3 / October 2–8: private musician beta
- Ten invited musicians across all instruments. Tasks: bring a song, choose Sa, practice a loop, change BPM, download notation, reopen a saved piece.
- Instrument task success and completion time; log confusing moments. No vanity self-score replaces this.
- Curate 25 complete, reviewed playable pieces, with accurate metadata and consistent PDFs. Fewer complete pieces beat 100 empty titles.
- Auth/save/recovery, deletion, provider limits and cost controls tested before wider access.

### Week 4 / October 9–18: release candidate
- Freeze core features. Fix P0/P1 bugs; regression test desktop Chrome/Edge and real mobile Safari/Chrome.
- Verify infrastructure, audio asset delivery, error tracking, accessibility, account recovery, export, backup/restore and operational launch checklist.
- Founder selects branding and confirms public release. Begin narrow rollout, observe conversion→first practice→return practice. Expand only after reliability holds.

## Working method

One small verified vertical slice at a time. Every slice records acceptance criteria, tests, screenshot evidence where relevant, known limitations and exact next action. Preview branch first; production only on authorization. Product metric: a musician successfully practices their own melody, not how many screens or ornaments exist.
