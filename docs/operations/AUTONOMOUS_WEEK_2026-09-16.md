# Autonomous pilot sprint — 16–23 September 2026

Status: active. Owner: engineering agent; product decisions: Matan.

## Founder authorization

On 16 September the founder authorized autonomous development during a week
away, with occasional feedback. The current design is explicitly not a binding
constraint: palette, typography, navigation, composition and interaction design
may be reconsidered. Four alternatives must differ materially, not merely in
button colors. Access to the supplied Ventus folder is approved for integration
research and prototype development. Existing prototype vendor permission stands.

## Target and release boundary

Deliver a review-ready pilot, not an unsupported claim of commercial readiness.
Work on the preview branch; preserve production. Do not select a final design
or promote it to production before founder review. No purchases, account/security
changes or external commitments. Never commit credentials or the full vendor
library. Inspect changes before committing; preserve unrelated work.

## Work queue and acceptance

1. Four interactive alternatives: professional studio, living score, contemporary
   riyaz room, focused practice coach. Each includes entry, piece selection and
   practice using the same Ode to Joy study. Reuse canonical engine/score logic.
   Compare information hierarchy, navigation, instrument geometry and mobile
   usability. Provide preview links and screenshots; distinguish design opinion
   from measured results. Do not claim these are complete until operable.
2. Regression coverage: first play, pause/resume, restart, seeking, speed changes,
   looping and instrument switches across piano/harmonium/bansuri. Verify note
   visibility, duration/rest fidelity, label switching and audio/visual timing.
3. Complete the pilot journey through printable Latin Sargam PDF; confirm PDF
   events and beat grouping match the canonical score and selected Sa.
4. Ventus: inspect documentation and mapping, inventory available tools, assess
   a small multisample export or stable isolated notes from available WAVs.
   Measure anchor pitch/onset/sustain; never label a phrase as a single note.
   Preserve originals and the procedural fallback. Record exact technical
   blockers and continue independent work if Kontakt/export is unavailable.
5. Verify responsive layouts and accessibility; run lint/tests/build/repo audit.
   Record browser evidence, untested physical-device latency and remaining gaps.

## Execution loop

At each scheduled continuation read this file, PROJECT_SOURCE_OF_TRUTH and the
latest audit; inspect the actual branch/worktree. Select the highest-impact
unblocked slice, define acceptance, implement, verify and record results. Read
applicable skills and bundled Next.js guidance before code work. Avoid concurrent
writers and unnecessary refactoring. Continue other slices when one needs input.

Notify only on a meaningful milestone, completion, failure or a decision needed;
do not repeatedly report unchanged blockers. No arbitrary self-awarded score is
a substitute for verification. Score readability, interaction, visual identity,
musical correctness, accessibility and performance separately with evidence.

## Stop / handoff

Finish when all achievable queue items are verified and a review packet is ready;
clearly list items dependent on founder selection or unavailable external tools.
On 23 September produce a week-end report and pause recurring work rather than
silently continuing indefinitely. Do not mark the overall goal complete if
required deliverables are unfinished. Scheduled runs depend on the computer/app,
network, permissions and available usage; they are not guaranteed continuous work.

## Initial checkpoint

- Confirmed the original Ventus folder exists at the supplied OneDrive location.
- Existing intake documents describe NCW/Kontakt playable samples and WAV phrases;
  a trustworthy browser note mapping is still pending.
- Four design alternatives have been authorized but are not implemented yet.
- Next: inspect current practice components and define shared alternative routing,
  then build the first complete interactive variant without replacing production.

## Implementation checkpoint — first studio slice

- Added `/design-lab/studio` with isolated CSS module; production home unchanged.
- Entry/library/practice flow uses the canonical Ode study and useEngineTransport,
  existing three instrument visualizers and existing PDF endpoint. Controls cover
  play/pause, restart, seek, speed, tonic reference and all notation systems.
- TypeScript `tsc --noEmit` passed. Browser, sound and PDF validation remain open;
  this is a first implementation, not a reviewed alternative or final deliverable.
- Remaining: three distinct directions, comparative navigation, browser QA and
  deployment. Current studio keeps baseline reed settings; expose existing
  harmonium reed/space controls before claiming feature parity.

## Implementation checkpoint — four interactive structures

- Added `/design-lab` comparison index and `/design-lab/score`, `/riyaz`, `/coach`.
  All three use a shared pilot hook backed by the existing EngineStore and PDF
  endpoint, with the same canonical Ode events. Home route remains untouched.
- Living score: beat-proportional clickable notation, optional instrument guide,
  editorial margin settings. Riyaz: persistent tonic/current-note anchor alongside
  the instrument and phrase. Coach: listen / loop first eight notes at 0.75x /
  full-phrase stages; no simulated accuracy scoring. Reed/room options exposed.
- TypeScript and targeted lint passed. Comparison index returned HTTP 200 on
  localhost:3001. Dev server is session 3577 for this run.
- Browser tool failed with Transport closed; no visual scores or screenshot
  validation claimed. Route smoke checks and full unit suite started separately.
- Remaining: visual/mobile/audio QA, full PDF verification, studio feature parity,
  preview deployment, Ventus investigation. These are prototypes, not final designs.

### Runtime regression found and corrected

The first HTTP smoke run returned 500 for all four practice routes: the fixture
was incorrectly looked up in SONG_CATALOG, which excludes public-domain studies.
Moved the canonical lookup to pilotData.ts using PUBLIC_DOMAIN_CATALOG and added
an explicit fixture test. Subsequent HTTP checks returned 200 for studio, score,
riyaz and coach. The existing full suite passed 120/120 before this extra test.
HTTP rendering is not evidence of correct browser interaction or audio quality.

## Ventus triage progress

Read-only analysis of 20 UniqueNotes Close WAVs found usable-looking sustained
segments rather than a blanket Kontakt blocker. The strongest measured candidate
is file 212 at 0.3–4.0s near MIDI 66 with 20.4 cents pitch range. See
`../audits/VENTUS_WAV_TRIAGE_2026-09-16.md`. Script and synthetic pitch tests added;
two tests passed. No audio integration or listening QA is claimed yet. Next:
independent pitch verification and a trimmed/faded experimental sample path.

Candidate 212 now has independent spectral verification at four timepoints and
a reproducibly extracted 3.7-second faded WAV under ignored output/. Two new
extraction/spectral tests passed. See Ventus audit for hashes and measurements.
No audible quality or integration success is claimed. Remaining technical step:
audition and transposition/loop QA before a bounded opt-in sampler integration.

## PDF verification and regression correction

- Rendered the canonical pilot in Roman Sargam, Devanagari and western pitch
  names. Visual inspection exposed missing note onsets and a spurious fifth bar:
  rounded millisecond timestamps were being treated as exact rhythmic units.
- The print-only timeline adapter now quantizes to 96 ticks per quarter and
  clips tied events at measure boundaries. Playback events are unchanged.
- All three regenerated PDFs were inspected individually as page images. They
  now show all 15 onsets in four bars on one page, with readable Hindi glyphs.
  The layout is functional, but the small four-bar study leaves substantial white
  space; this is not evidence of final print-design quality for complete songs.
- Added endpoint tests for all three formats, exact pilot measure/onset counts
  and cross-bar sustain handling. The focused PDF suite passed 10 tests.
- A full run passed 127 application tests but failed discovery of two Node-test
  files. Migrated the four audio checks to Vitest so the standard test command
  covers them. The subsequent full run passed all 131 tests in 39 files.
- Studio now exposes harmonium reed and room controls, matching the other three
  directions. Browser interaction and listening QA remain unverified.

## Experimental Ventus comparison integrated

The four design-lab routes now offer an opt-in `Ventus sustain · experimental`
voice for Bansuri. The measured anchor is staged with a SHA256 gate; no library
bulk copy and no source modification. See the Ventus audit for provenance,
limitations and safety guards. The application default is still procedural.

Verification after integration: all 135 tests passed in 40 files; TypeScript
passed; git diff whitespace checks passed. Browser automation again returned
Transport closed, so real audio/visual QA and design scores remain outstanding.
The preceding turn was concrete progress (four designs, PDF regression fix);
this continuation adds a working opt-in sample path and regression coverage.

## Browser connection recovered

The in-app browser is operational again. First real interaction/visual checks
and corrections are recorded in `../audits/DESIGN_LAB_BROWSER_QA_2026-09-16.md`.
Local production server is on port 3010 (session 39403 at this checkpoint).
Latest build passed after sticky transport, mobile score and caption fixes.
This is progress, not final design acceptance; listening and further mobile QA
remain open. Prepare branch backup/preview without modifying main.
