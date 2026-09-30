# Overnight Indian music sprint — September 18

Deadline: 08:00 Asia/Jerusalem, 05:00 UTC. Founder explicitly requested autonomous
overnight implementation, three substantial Indian musical variants, better
Bansuri art, correct audible/visual transitions and a one-month launch strategy.
Heartbeat `resume-sargam-practice-upgrade` updated and ACTIVE every 30 minutes
until deadline. Never imply execution while suspended; report actual results.

## Safety and continuity

Existing branch codex/playback-clock-regression, many prior dirty files: preserve.
No production deployment, purchases or external commitments. Reuse Next app,
preview at 127.0.0.1:3010. Keep living-score baseline and add review variants.
Existing goal tool holds an old blocked goal and refuses a replacement; do not
mark that older objective complete without evidence. This document is current.

## Work plan / checkpoint

- [x] Research ornament definitions from primary teaching sources.
- [x] Replace sustained sine-like Gamak with an opt-in phrase-transition model.
- [x] Preserve rests, same-pitch repetitions, authored curves and score timings.
- [x] Represent transitions as connectors from prior note to destination;
      verify scheduling receives matching curves, not merely visual styling.
- [x] Improve Bansuri artwork (image generation + separate accurate live states).
- [x] Three interactive full-app variants: Mehfil, Raag Studio, Riyaz Journal.
      Must differ in composition/nav/hierarchy, not only button colors.
- [x] Compact logo/brand system, Indian typographic character, disciplined color.
- [ ] Tests, build and browser QA on each home/library/practice + narrow viewport.
- [x] Evaluation rubric with candid scores/limitations; one-month launch plan.

## Research

https://www.raag-hindustani.com/Embellishment.html (Sadhana): Meend can traverse
multiple pitches on a shaped path. Gamak is forceful articulation/vibration,
with context-dependent intensity; not universally just a different glide.
https://resources.bcmg.org.uk/composing-for/composing-for-bamboo-flute
(flautist Max Gittings): gradual hole opening/closing for meend; fast finger
gesture in its flute-specific gamak example. Do not claim one universal formula.
https://impactsoundworks.com/product/ventus-winds-bansuri/ documents true legato,
ornaments and multiple articulations. Our 352 Close sustain samples are NOT its
full scripted instrument. Kontakt now loads Bansuri.nki, keyboard trigger shown,
but no acoustic reference capture is available yet.

Implementation direction: explicit connected-pair study gestures, not automatic
raga interpretation. Use end-of-source to target transition windows; both modes
show a legible connector, with different audible trajectories. Do not oscillate
every sustained note. Never bridge a rest or silently alter authored melody.

## Next continuation

02:43 local implementation checkpoint:
- New full app preview routes `/design-lab/indian/{mehfil,raag,riyaz}` plus comparison index.
- IndianDirections.tsx and indian-directions.module.css compose the shared LivingScoreApp; baseline remains unchanged.
- New generated bamboo asset and live six-hole overlay; prompt/provenance in BANSURI_ART_ASSET_2026-09-18.md.
- expressBansuri now applies a tail-of-source transition reaching the next pitch, not a whole-note sine. Both modes skip polyphony/gaps/repetitions/authored gestures. Gamak has two directed articulations only within the transition window. Canvas draws smooth connections for both.
- BansuriControls reports connection count / explains when none apply. Actual Ode to Joy has eligible connections; Aroha has authored gaps and correctly does not.
- Full npm run verify PASSED: lint, 208 tests in 57 files, optimized build including all 3 new routes. Then added 3 additional tests (actual Ode + 2 AudioParam scheduling tests); targeted 22 tests PASSED, git diff --check PASSED. Full verify should run again after remaining overnight edits.
- Desktop browser inspected all 3 home pages at 1440x1000. Fixed invisible Mehfil wordmark, blue conversion button and Raag intro max-width.
- Mobile Riyaz home at 390x844 and library→Aroha practice passed navigation. Mehfil deep-linked Ode→Bansuri→Meend→Focus shows clear connectors, new art and no page scroll; Play reaches Pause then End of score / Replay at 10.435s. UI confirms 9 connected transitions. Acoustic quality NOT listened to/graded. Exited focus, reset viewport and left comparison index on tab 2 (marked handoff).
- `INDIAN_DESIGN_LAUNCH_2026-09-18.md`: provisional category scores (84–90, NOT 95) and four-week launch plan.

Next priorities (independent work):
1. Update 03:00: implemented Natural-only sampled hand-off (up to 18ms linear crossfade, sustain entry), only when destination is actually scheduled, with cancel/seek and loop-end protections. Targeted GuideVoiceBank 16 tests passed. `scripts/render-bansuri-expressions.mjs` generated three RMS-matched −20dBFS WAVs in `output/audio-comparison/expressions`, peaks below −10dBFS, report.json. Do not assert equivalence to recorded Kontakt legato. Next: verify hand-offs in live browser, expand edge-case tests and conduct/render a real OfflineAudioContext comparison if possible (current WAVs are offline reconstruction, not actual browser capture).
2. Complete mobile and focus QA on Mehfil/Raag; check contrast in library, import, settings and score views. Reduce intake/hero vertical bulk on mobile. Add navigable paired-note expression study if appropriate.
3. Re-run verification after final edits, update candid scorecard/evidence. Keep production untouched.
4. At 08:00 Israel stop feature edits, final verification/handoff and pause heartbeat.

02:57 verification: full npm run verify PASSED (lint, 213 tests / 57 files,
optimized build). Then added defensive handoffs.clear() at prepare entry; no
other changes after verification. No deployment. Automation remains active.

Read this file plus current git diff, then continue unchecked items. Image output
must be inspected and saved in public before integration. Update this checkpoint
with exact paths, results, running processes and next action before yielding.

03:26 heartbeat checkpoint:
- Added 3 regression cases: late scheduling, truncated source at a loop boundary,
  explicit tongued articulation. None joins or suppresses destination attack.
  GuideVoiceBank targeted suite now 19/19 PASSED.
- Browser: Raag mobile home + import controls at 390×844 readable and usable;
  Mehfil mobile home + demo practice + Natural Ventus Gamak study + focus tested.
- Read-only DOM measurement confirms document width/scrollWidth=390,
  height/scrollHeight=844, focus workspace exactly 390×844 (no page overflow).
- Gamak playback completed to 10.435s with Replay state, 9 connections and no
  captured browser console errors. This verifies execution, NOT acoustic quality.
- Exited focus, reset viewport and returned tab2 to the comparison index;
  marked handoff. No production change, no running verification process.
- Highest-value next slice: a dedicated preview-only browser-rendered comparison
  using OfflineAudioContext and the actual GuideVoiceBank, generating Play/WAV
  outputs for plain/meend/gamak. This removes reconstruction differences in the
  existing CLI comparison. Keep generated URLs disposable and tests explicit;
  do not pretend OfflineAudioContext output is a Kontakt reference capture.

04:03 heartbeat checkpoint:
- Implemented `/design-lab/indian/expression`: actual browser OfflineAudioContext
  rendering through GuideVoiceBank, not CLI PCM reconstruction. Plain / Meend /
  Gamak clips use Natural Ventus, dry, RMS matched to -20 dBFS. Peaks measured
  -10.0 / -11.5 / -11.5 dBFS respectively; 0 / 9 / 9 connections.
- Added `src/engine/renderBansuriComparison.ts`, `src/lib/pcmWav.ts` and tests,
  ExpressionComparison UI/CSS and route; comparison index links to the room.
  GuideVoiceBank supports offline contexts without resume or wall-clock cleanup.
  Cancel/unmount dispose voices; generated object URLs are revoked on replacement.
- Full `npm run verify` PASSED: lint, 219 tests / 58 files, optimized build.
- Browser rendered all three clips twice. Meend and Gamak pointer playback
  reached ended=true at 10.435011s, no media error; Meend console error list empty.
  This is execution verification, NOT a listening/authenticity judgment.
- Reproducible browser automation caveat: AX-index click on native audio Play
  closed/crashed the in-app tab twice. Ordinary screenshot-grounded pointer click
  completed playback in recovered tabs. Cause not proven; do not claim resolved.
- Download anchor click did NOT produce a tool download event within 3 seconds.
  Blob URLs and PCM encoder tests exist, but saved-file download remains unverified.
- Preview server stays at port 3010; no deployment. Tab4 listening room kept for
  continuation. Next: verify download in a supported browser path, complete the
  remaining cross-variant library/settings/contrast QA, then final scorecard.

04:28 heartbeat QA checkpoint:
- Resolved WAV-download uncertainty with filesystem evidence: browser download
  exists at `C:/Users/matan/Downloads/ode-gamak-study-browser.wav`, created 04:02,
  920412 bytes. Parsed header: RIFF/WAVE, mono PCM16, 44100Hz, data 920368 bytes
  (=10.435011s). The tool download event timed out, but the file was saved.
- Visually inspected desktop libraries for Raag, Mehfil and Riyaz. Compact
  tables, distinct framing/branding and all primary navigation remain available.
- Raag: search Ode reduced 35 results to one, Open entered the correct named
  practice; Focus settings opened/closed with Instrument/Sa/Notation and Done.
- Preliminary computed-style contrast check found no <4.5 text pairs among
  leaf text elements in Raag practice and Mehfil library. This is NOT a full
  WCAG audit: canvas, gradients, transparency and all interaction states omitted.
- Riyaz 390x844: no horizontal page overflow (document scrollWidth375 includes
  scrollbar). Filters disclosure opens, collection Devotional changes results
  35→12 with active-filter indicator and one page. Screenshot verified readable
  controls, compact table and no overlapping inputs.
- No source-code edits this QA slice; last full verify remains 219 passing.
- Next independent slice: add a purpose-written connected swara listening study
  beside Ode, to inspect upward/downward/repeated/rest boundaries directly;
  keep optional gestures and no claim of raga-authentic automatic interpretation.
  Then final review/evidence consolidation before 08:00 deadline.

05:00 heartbeat implementation checkpoint:
- Listening room now has a study selector: Ode or an original 8-note connected
  swara diagnostic, Sa=C4, 60 BPM, total 8.5s. Source lives in
  `src/lib/bansuriComparisonStudy.ts`; two regression tests prove five connected
  pairs, repeated Pa re-attack, 500ms rest, descending resolution, unchanged timing.
- Renderer accepts study ID. Selection clears old clip URLs/results; disabled
  while rendering. UI explains exact phrase/boundaries and names downloads by study.
- Browser rendered all three diagnostic clips: connections 0/5/5, RMS -20dBFS,
  peaks -10.6/-11.9/-11.9dBFS. Downloaded actual Web Audio Meend WAV to
  `C:/Users/matan/Downloads/connections-meend-browser.wav`.
- PCM inspection: 44100Hz, 8.5s; central rest 6.15–6.45s peak EXACTLY ZERO,
  pre-rest peak .208984 and post-rest .203125. Confirms actual silent rest survives
  sampler transitions, not just event metadata. Still no acoustic/style score.
- Lint and 221 tests / 59 files passed. Build first caught readonly catalog type;
  corrected comparisonNotes return to readonly array, subsequent build PASSED.
- Tab4 listening room retained. No production changes. Next: final interaction
  edge cases (cancel/re-render/switch study), compile consolidated morning handoff
  with variant links, evidence and explicit remaining product/quality gates.

05:27 heartbeat interaction checkpoint:
- Listening room now explicitly pauses/clears previous players at re-render and
  study change, revokes prior URLs, and scopes exclusive playback to its own
  player container (not unrelated document audio).
- Browser: Render again→Cancel returns enabled selector, no players and clear
  cancellation status. Switch to connected study→Render succeeds with 0/5/5
  connections. Switch back to Ode clears all players (DOM count0) and prompts
  re-render; no stale study audio/results remain.
- Targeted ESLint and TypeScript noEmit pass after this UI change. Prior complete
  suite remains221/59; rerun full verify at final handoff rather than every QA click.
- Next: address mobile home conversion vertical priority noted in provisional
  rubric (shorter intro/nav spacing without sacrificing identity), verify each
  variant's intake position, then consolidate morning handoff. Preview only.

05:56 heartbeat mobile improvement:
- Tightened only <=720px home typography/nav/intro spacing in
  `indian-directions.module.css`; retained 44px+ action controls, identity,
  visible mock disclosure, desktop composition and all form fields.
- Browser 390x844: Riyaz submit bottom moved 915.81→774.55px (141.26px earlier).
  Mehfil submit bottom706.89px, Raag758.55px; all within first viewport.
  Each document scrollWidth375 at innerWidth390 (scrollbar, no horizontal overflow).
  Visually checked screenshots of all three forms; primary CTA visible.
- This addresses the earlier provisional rubric's mobile conversion priority
  concern. It does not justify increasing scores without independent review.
- CSS-only slice. Next: consolidated handoff draft, final full verify and remaining
  explicit limitations; by08:00 stop features and pause heartbeat as requested.

06:26 verification/handoff draft:
- Full `npm run verify` passed on current source: lint, 221 tests/59 files,
  optimized Next build including all new routes.
- Added `MORNING_HANDOFF_2026-09-18.md` in Hebrew: working links, delivered scope,
  evidence, sound/Mock/content limitations, provisional rubric and four-week plan.
- Automation still ACTIVE, deadline08:00. Do not repeat passing full checks
  without code changes. Remaining useful QA before deadline: narrow-screen
  import/error states and keyboard navigation/focus of variant navigation;
  update handoff with any findings/fixes. Pause heartbeat at final deadline.

06:55 final interaction audit:
- Raag mobile390x844: unsupported HTTPS non-YouTube URL produces explicit alert
  and Retry conversion; no conversion job submitted. Mock disclosure remains visible.
- Import view: MusicXML/PDF actions readable, experiment/session-storage limits
  explicit, no horizontal page overflow (375 scrollWidth /390 viewport).
- Keyboard from focused import heading: Tab→Import MusicXML→Import PDF pilot;
  focused primary button has solid3px outline. Navigation focuses the new heading.
- No code changes or new failures. Existing221 tests/build remain current.
- Morning handoff updated. Next scheduled turn should perform final artifact/link
  availability review and then pause heartbeat; do not manufacture new scope or
  repeat passing suites with unchanged source. Product acoustic approval and live
  transcription are clearly remaining work, not overnight blockers to fake away.

07:23 final overnight handoff:
- All five comparison/design/listening routes returned HTTP200 on local3010.
- Branch remains codex/playback-clock-regression; existing working changes
  preserved. No production release, purchase or external commitment.
- Current source passed221 tests/59files, lint and optimized build at06:23;
  subsequent changes were documentation only.
- Morning deliverable: MORNING_HANDOFF_2026-09-18.md, with links/evidence and
  one-month plan. No95 claim; acoustic musician review and real transcription
  remain explicit launch gates.
- Overnight heartbeat paused after this final review, before08:00 deadline.
  Preview server intentionally retained so founder can inspect. No claim of
  continued background development after pause.
