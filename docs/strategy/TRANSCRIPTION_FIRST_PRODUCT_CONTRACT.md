---
title: Transcription-first product and scalable library
type: strategy
status: active
owner: shared
created: 2026-09-16
updated: 2026-09-16
review_by: 2026-09-23
---

# Product contract: a song becomes playable Sargam

## Founder clarification

The primary product is YouTube/song-to-Sargam with synchronized practice and
printable notation. A growing searchable score library is the second major
entry point and a durable product asset. Living Score is the selected visual
language and practice workspace, not permission to turn the product into a
course catalog or a library-first homepage.

## Information architecture

1. **Home / Transcribe:** a prominent YouTube input and conversion CTA above
   the fold; score import and an explicitly labelled demo are secondary.
2. **Library:** dense searchable rows, title/composer, collection, level, tempo,
   and direct access to the same practice workspace. Twenty results per page.
3. **Practice:** title, source/review status, Sa, notation, instrument, BPM,
   synchronized score/roll, repeat and PDF. Back/resume must preserve context.
4. **Import:** existing MusicXML/MXL/PDF route, converging on canonical events.
5. **My scores:** future saved conversions/history, not an empty fake dashboard.

The target conversion journey is URL → processing status → reviewable notes →
practice/print → save. "Live" means a real source-specific conversion followed
by synchronized playback; it does not promise zero-latency streaming recognition.
Public-library publication is a separate deliberate step, not automatic exposure
of every private upload. Reuse reviewed canonical scores across requests.

## Current engineering truth

`app/api/transcriptions/route.ts` instantiates `MockTranscriptionProvider`.
It returns a fixed fixture, even for different URLs. There is no production
YouTube audio acquisition, provider job, durable score cache or persistence.
The preview home validates a URL and explains this boundary. It never calls a
fixed fixture a transcription of that URL. Its separate demo opens Ode to Joy.

Keep the URL-led layout while completing the real backend. Do not solve the
missing adapter by hiding transcription, or by disguising a mock as success.

## Workspace reference clarification

The founder's Songscription screenshot (2026-09-16) establishes a score-first
workbench: notation above the full-width instrument timeline, with persistent
transport below. Living Score's combined view now follows that spatial order,
instead of placing the score beside a narrow visualizer. The notation region
is bounded and keyboard-scrollable; score-only and instrument-only remain
available. Do not copy subscription overlays or imply unimplemented editing,
original-audio playback, accounts or live recognition. This layout has now been
inspected in Chrome at desktop, laptop, portrait and short landscape sizes;
see the [three-hour sprint evidence](../reviews/LIVING_SCORE_THREE_HOUR_SPRINT_2026-09-16.md).

Indian adaptation is musical, not merely translated labels: movable Sa,
Latin/Devanagari Sargam, octave/alteration marks, faithful timing, optional
explicit tala, and instrument-specific guidance share one canonical score.
Do not infer a tala or raga from Western meter or a key signature.

### Compact full-score reader (founder screenshot follow-up)

The `/living-score` reader renders the whole piece as wrapping measure groups,
not a four-bar paginated strip. Notes sharing a metrical beat are adjacent;
held beats display a continuation mark and empty beats a rest dot. Large
per-note duration captions and absolute-positioned percentage-width buttons are
removed. Exact onset/duration remains in the unchanged playback/visualizer data.
This is a compact reading view, not a claim of a full Bhatkhande engraving engine.

The score pane alone scrolls vertically when needed. Following advances only
when the playing bar leaves the pane; wheel/touch reading disables follow until
re-enabled. Reduced-motion uses immediate scrolling. The instrument and page
are not scrolled by score-follow. Dense paired notes and Hindi have been inspected
in Chrome. Reading groups use the same 96-tick beat rounding as PDF export, without
quantizing audio events. Long-score follow and physical-device testing remain
separate acceptance checks, not assumptions from the short studies.

## Focus viewport correction

Focus now requests browser fullscreen on the user's click and falls back to a
fixed edge-to-edge viewport when unsupported. It locks background scrolling and
makes background siblings inert; Exit focus/Escape restores the page. The active
workspace uses a bounded flex/grid layout, not a tall document. Combined mode
starts with 24% of the stage for compact notation. A keyboard/pointer-operated
divider adjusts the score share between 15% and 60%;
instrument-only gives it the whole stage. Transport remains outside the stage.
Only the score pane scrolls for long notation.

Responsive keyboard/harmonium cabinet space is reduced; the travel area scales
with available height. Responsive piano/harmonium and bansuri calculate spatial
scale from a five-real-second preview window, compensating for playback rate.
Authored event times/durations and the audio clock are unchanged. Unit tests
cover lookahead for varied dimensions and rates. CSS viewport Focus, exit,
settings, portrait and landscape layout have been verified in Chrome. Native
browser fullscreen was not confirmed; do not equate the tested fallback with it.
Short landscape Bansuri uses a numbered six-hole diagram instead of compressing
the full flute into an illegible thumbnail.

Reference follow-up: Songscription's official home describes synchronized score,
piano roll, speed and transposition; the supplied screenshot is the spatial
reference. A fresh request to `https://yousician.com/piano` returned HTTP 403;
do not claim a new interactive Yousician inspection or its exact preview duration.

## Library scale requirements

- Compact semantic table/list, not 225px cards for every result.
- Search title, native title and composer; collection and level filters;
  stable title/tempo sort; result count, no-results recovery, bounded pagination.
- Preserve browse state when a score opens and the user returns.
- Distinguish full arrangements from excerpts/studies in their titles.
- Show only records with playable events in the playable collection; planned
  titles remain content-pipeline tasks, not dead-end playback actions.
- Current implementation bounds DOM rendering to 20 rows, tested with 1,000
  synthetic metadata records. This is NOT a claim of 1,000 available songs.
- Before a large live catalog, serve paginated metadata from an indexed database
  and load note events by score ID. Client-side pagination alone does not solve
  downloading thousands of complete timelines. Do not invent popularity metrics.

## Research, accessed 2026-09-16

- [Songscription home](https://www.songscription.ai/): audio upload and URL input
  precede examples. Adopt the action-first hierarchy, not its assets or wording.
- [Songscription library](https://www.songscription.ai/library): separate discovery
  surface with search and composer/difficulty/genre navigation. Adopt clear facets.
- [IMSLP library portal](https://imslp.org/wiki/IMSLP:Library_Portal): composer,
  period and instrumentation/genre indexes. Adopt structured discovery, not its
  visual style. These are observations from retrieved page content.
- [MuseScore sheet music](https://musescore.com/sheetmusic): fetch yielded mostly
  navigation/footer, so no visual-layout or detailed filtering claim is based on it.

The compact table and 20-result pages are our design decisions, not a claim that
all reference sites use that exact presentation. The earlier browser rejection
applied to the prior checkpoint; the later authorized sprint inspected the
Songscription reference and local preview in Chrome. File-upload interaction
remains blocked by the extension's file access permission, and was not bypassed.

## Documentation reconciliation

Reviewed vault index, source of truth, unified experience, catalog plan, launch
strategy/execution, practice specification, root README, music-domain boundary,
and governance/closeout instructions. Searched the full docs tree for conflicting
home/library/YouTube/mock claims. This is a cross-document product audit, not a
claim that every historical vendor/review document was re-read line by line.

Conflicts fixed: library-first home; waitlist as sole primary CTA; ambiguous
practice-first scope; stale fixed catalog counts. Code review also found the
preview omitted 12 devotional studies: it now consumes `READY_PRACTICE_CATALOG`
(35 playable entries) instead of composing an incomplete 23-entry subset.
Historical dated reviews stay
unchanged. This contract supersedes their home-navigation recommendations only.

## Next delivery gates

Final sprint gate: repository audit, lint, 178 tests across 51 files and optimized production build passed.
The production build is checked separately from browser interaction; passing
these gates does not establish visual quality or live transcription readiness.

1. Browser regression evidence is recorded in the September 16 sprint review:
   home, compact library, mobile filters, empty results, score-ID refresh/back,
   Focus layouts, playback follow and invalid-ID recovery passed. Browser import
   E2E remains permission-blocked; native fullscreen and physical-device audio
   are unverified. Keep preview branch, no production replacement.
2. Implement source-specific acquisition/provider jobs with cancellation,
   retry, errors and confidence; benchmark note/timing quality before live claims.
3. Persist source, score versions and private history; shared library promotion
   and deduplicated retrieval are explicit workflows.
4. Re-test notation, audio-clock timing and print against the same score.
