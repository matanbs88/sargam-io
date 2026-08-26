# Sargam.io project source of truth

**Status date:** 2026-08-26
**Last deployed commit:** `e059a27` (`Merge pull request #5: persist imported practice sessions`)
**Public preview:** <https://sargam-io.vercel.app/>  
**Current working-tree verification:** 70 tests across 25 test files; changes are not pushed yet.

This document is the current product, engineering, and launch truth for
Sargam.io. It supersedes stale status snapshots while preserving historical
reviews for auditability. If another document disagrees with this one, update
that document or record an explicit decision before implementation.

## Product north star

Sargam.io is an Indian-music practice studio that turns a melody or score into
a clear, playable, relative Sargam experience. The product promise is:

> Bring a melody into your Sa. See it, play it, and practice it your way.

The long-term ambition is to give Indian musicians the complete workflow that
western musicians expect from a serious music-learning product: source a song,
review its notes, transpose it into a chosen Sa, practice with timing and
instrument guidance, and export a clean printable score.

The initial wedge is English/Hinglish-speaking keyboard and harmonium learners.
Bansuri players and teachers are the first high-value design-partner segment,
not a reason to make unverified fingering claims publicly.

## Canonical experience

```text
audio or score source
        -> verified canonical score (MusicXML/events + timing + confidence)
        -> choose Sa / notation / instrument profile
        -> relative Sargam practice canvas
        -> live transport + visual roll + optional drone/taal
        -> printable Sargam PDF or staff+Sargam export
        -> saved personal/library session
```

The two future entry points are:

1. Audio or permitted video URL, processed through a replaceable provider
   adapter and a cache-first job pipeline.
2. MusicXML/MXL or score/PDF upload, processed through the score import and
   musician-review workflow.

The practice result should converge on the same canonical note-event model,
regardless of the source.

## Current capability matrix

| Capability | Status | Product truth |
| --- | --- | --- |
| Relative MIDI to Sargam | Implemented | Pure, tested conversion with octave markers. |
| Sa transposition | Implemented | Sa is a selected relative reference; source pitches remain available. |
| ABC / Latin Sargam / Devanagari | Implemented | Instant client-side display switching, including roll labels. |
| Mock practice transport | Implemented | Local preview with bounded navigation, progress, taal, and practice cues. |
| Piano, Harmonium and Bansuri roll selection | Implemented | The roll selector is the current instrument mode and controls the matching visual surface and guide voice. Harmonium also exposes real reed-layer and room-mode controls. |
| Salamander piano guide voice | Implemented | Browser sampler using the cleared MVP asset set and attribution. |
| Recorded Bansuri library | Not implemented | Current guide is a browser-native procedural Bansuri model. A recorded pack needs explicit Web/SaaS rights. |
| Six-hole Bansuri reference | Prototype | Geometry is a learning visualization; definitive fingering requires profile and practitioner validation. |
| MusicXML/MXL import | Implemented review draft | Validated score events open a temporary practice session. |
| Imported session restore | Implemented local MVP | Imported timelines and manual MIDI corrections survive refresh through validated local storage. |
| Latin Sargam PDF export | Implemented | Server-side paginated printable practice sheet. |
| Staff-PDF/photo recognition | Research only | Local Audiveris pilot exists; no public SaaS OMR integration is approved. |
| YouTube/audio transcription | Mock seam only | No live provider, arbitrary URL ingestion, or production billing is connected. |
| Song catalog/library | Implemented MVP queue | 100 searchable entries are present; 12 original Riyaz exercises are playable now, five are promoted through the showcase registry, and 88 repertoire entries are visible content-pipeline tasks awaiting note data. Rights metadata is not a development or UX gate. Durable server catalog persistence is still future work. |
| Waitlist and analytics | Preview capture | Landing page captures email, instrument, requested song, and explicit early-access consent locally or through an explicitly configured endpoint. A linked preview privacy notice and provider-neutral, non-PII analytics seam are implemented; durable storage, final legal terms, and production analytics remain future work. |
| Auth, credits, payments, database | Not implemented | Future private-alpha foundation. |
| Video export / creator assets | Not implemented | Future creator workflow after core practice quality is proven. |

## Non-negotiable domain rules

- **Sa is relative.** If the interface says `D = Sa`, it means the user chose
  MIDI D as the reference tonic. It does not claim that the song's Western key
  is D, and it does not rewrite the source MIDI.
- **Western key is not raga.** A key signature or detected tonic cannot by
  itself identify raga, shruti, meend, gamak, or a definitive performance
  interpretation.
- **Bansuri guidance needs a profile.** A six-hole model must specify flute
  tuning, pitch convention, octave/register, and half-hole policy. Until a
  musician validates the mapping, label it as guidance rather than authority.
- **Timing is first-class.** Note onset and duration must survive import,
  transposition, practice playback, visual roll, and export.
- **MVP content is not rights-gated.** During MVP development, rights metadata
  must not stop implementation, hide catalogue entries, or block practice/PDF
  capabilities. Final publication, attribution, and commercial/Web/SaaS
  review happens at launch preparation; see
  [`MVP_CONTENT_DECISION.md`](./strategy/MVP_CONTENT_DECISION.md).
- **Review is part of the workflow.** Low-confidence OMR or audio output must
  be editable before it becomes a printable or library-canonical result.

## Strategic decisions already made

### Launch shape

Start with a focused waitlist and a working interactive practice demo. During
MVP development, build the complete song-to-practice and score-to-Sargam flows
without hardcoding legal blocks. Before public/commercial launch, review the
chosen content, ingestion path, provider reliability, cost, confidence, and
failure handling.

### Seed content

Prepare 12–20 polished showcase sessions that demonstrate the experience
across keyboard/harmonium and Bansuri. Content selection and any public
promotion review belong to launch preparation, not to the MVP implementation
loop.

### Audio direction

- Keep Salamander Piano for the MVP browser guide with attribution.
- Keep the current procedural Bansuri voice as a functional fallback.
- Treat Ventus or any premium Bansuri asset as a licensing/vendor discussion,
  not as an asset that may be shipped merely because it sounds good.
- Prefer a small, coherent, license-cleared multisample pack over a large
  library with ambiguous redistribution rights.

### Architecture direction

Use replaceable provider adapters. The UI and canonical score model must not
depend directly on Klangio, Flat/Opuscan, ScoreFlow, or any other vendor. A
provider bake-off must be run on a rights-cleared benchmark before selection.

## Highest-priority launch blockers (not MVP blockers)

The following items are deliberately deferred to public/commercial launch
preparation. They must not be used to stop local MVP implementation, catalog
UX, practice playback, score conversion, or PDF engineering.

### P0 — required before public live transcription

1. Written provider/input-source permission and cost model.
2. Canonical job pipeline with cache, retries, status, confidence, and failure
   states.
3. Rights ledger for every external sample and published showcase.
4. Musician review and correction path for imperfect audio/OMR output.

### P1 — required before private alpha

1. Authentication and server-side credit ledger.
2. Persistent sessions/library with delete/export controls.
3. Abuse/rate limits, privacy notice, retention policy, and observability.
4. Validated instrument profiles, especially the six-hole Bansuri mapping.
5. Mobile and vertical-capture QA for the practice canvas.

## Operating cadence

Each work session follows this order:

1. Read this document and the linked launch plan.
2. Select the highest-priority unblocked task and state its acceptance criteria.
3. Implement the smallest vertical slice that can be tested in the real UI.
4. Run lint, tests, build, repository audit, and targeted manual QA.
5. Update the owning source-of-truth document, not only a chat message.
6. Run the closeout workflow, commit, push, and verify the deployment.
7. Record open risks and the next three actions for the next session.

The detailed 90-day sequence is in
[`LAUNCH_EXECUTION_PLAN.md`](./strategy/LAUNCH_EXECUTION_PLAN.md). The repeatable
session procedure is in
[`SESSION_CLOSEOUT_WORKFLOW.md`](./operations/SESSION_CLOSEOUT_WORKFLOW.md).

## Documents that own specific decisions

- Domain correctness: [`MUSIC_DOMAIN.md`](../MUSIC_DOMAIN.md)
- Instrument claims: [`INSTRUMENT_STRATEGY.md`](../INSTRUMENT_STRATEGY.md)
- Rights and content: [`MUSIC_CONTENT_AND_RIGHTS_PLAN.md`](./strategy/MUSIC_CONTENT_AND_RIGHTS_PLAN.md)
- Provider and OMR decisions: [`OMR_PROVIDER_STRATEGY.md`](./strategy/OMR_PROVIDER_STRATEGY.md)
- Unified product experience: [`UNIFIED_SCORE_EXPERIENCE.md`](./strategy/UNIFIED_SCORE_EXPERIENCE.md)
- Launch and demand validation: [`LAUNCH_STRATEGY.md`](./strategy/LAUNCH_STRATEGY.md)
- Catalog and content plan: [`CATALOG_AND_CONTENT_PLAN.md`](./strategy/CATALOG_AND_CONTENT_PLAN.md)
- QA and release bar: [`QUALITY_STANDARD.md`](./strategy/QUALITY_STANDARD.md)
- Gemini review packet: [`GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-23.md`](./reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-23.md)

