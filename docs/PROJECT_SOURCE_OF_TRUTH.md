# Sargam.io project source of truth

## Verified catalog checkpoint — 2026-10-01

**3/100 distinct complete pieces are live verified:** Petzold's Minuet in G,
complete declared unornamented upper melody with A-A-B-B repeats, 64 played
bars, 252 notes. Public library discovery, full Sargam, all three instruments
to Replay at 82,286 ms, and rendered one-page live PDF passed. Release `0e3552d`.
See [acceptance evidence](./audits/CATALOG_MINUET_CHECKPOINT_2026-10-01.md).
Silent Night's full source-edition melody is also live: 23 bars, 47 notes,
69 seconds. Library discovery, all three instruments to Replay, and the rendered
one-page production PDF with edition credit passed. Release `c0f1792`.
Good King Wenceslas is live: complete 17-bar source soprano, 53 notes, 34 seconds.
Live library discovery, full Sargam, all three instruments to Replay and
visually verified one-page production PDF passed. Release `61ef5f8`.
See [new acceptance evidence](./audits/CATALOG_NEXT_PIECES_2026-10-01.md).
The 35 older studies/exercises are not counted as newly verified complete songs.
The full 100-piece goal remains active; Mehfil is preserved.

Local next candidate: Raghupati Raghav / RAM, complete specified hymnal upper
melody, 28 performed bars, 80 onsets, 33.6 seconds, 2/4 at 100 BPM, Sa C4.
Source-ledger comparison and local one-page PDF checks pass. It increases the
local ready count to 39, not the production verified-complete count. Browser
playback and public deployment/download acceptance remain outstanding.

## Current authority and acceptance criteria — 2026-09-30

The founder selected **Mehfil** and authorized independent UI/UX audit,
implementation of its recommendations, Vault reconciliation and production
promotion after verification. This supersedes the historical preview-only
release restrictions below; it does not waive verification or permit invented
musical content. Release `872d7ed` is deployed: the public root serves Mehfil,
the compact library lists 35 existing playable studies/exercises, and opening a
piece immediately displays Sargam. Hotfix `888a67d` fixed the live PDF font-loading
defect: public export returns HTTP 200 PDF and Chrome offers the generated score
for download. Release evidence and remaining UX gates are tracked in the audit.

The active catalog goal is **100 distinct complete source-verified pieces**.
Completion means public Notes Library discovery, immediate full Sargam on open,
working practice playback and a verified downloadable PDF. A title, a short
study, a bare raga scale, or a localhost-only result does not count.
`content/catalog/launch-100-selection.json` contains 100 candidates, not 100
completed songs. The September 30 intake contains four checksum-verified MIDI
sources, not four published verified arrangements. New live-complete count: **0**.

The existing catalog has 35 playable exercises/studies and 88 planned entries;
recognizable-tune accuracy and completeness still require source review.
Research and intake evidence live in
`content/catalog/research/repertoire-discovery-2026-09-30.json` and
`content/catalog/inbox/launch-100/manifest.json`.

An active goal and the `Sargam — complete 100 live scores` local heartbeat
provide continuation. Local scheduled work requires the app and computer running.
Never infer completed work from elapsed time or automation configuration.
See [the current audit and release checkpoint](./audits/RELEASE_READINESS_2026-09-30.md).

## Current delivery — 2026-09-17

**Bansuri audio correction:** GuideVoiceBank, Living Score and Studio now default
to 352 original Ventus Close recordings (natural, tongued, vibrato, flutter), not phrase cuts
or the procedural flute. Native coverage E4–F#6; at most one semitone interpolation
inside that range; wider pitch shifts outside remain a timbral limitation.
Looped sustains support slow/long notes; sample detune supports pitch curves.
Source provenance and limits: `public/audio/bansuri/README.md` and
`src/lib/ventusPerformanceSamples.json`. Living Score adds articulation selection,
85% default Bansuri gain, velocity layers/round robins, and optional algorithmic
Meend / Gamak-study pitch curves. This is not the complete Kontakt articulation bank;
live listening QA and production deployment are not claimed.

Current implementation and verification: [Ventus performance bank checkpoint](./reviews/VENTUS_PERFORMANCE_BANK_2026-09-17.md).

The founder authorized Mock-first development of YouTube/audio-to-MIDI intake,
with complete UI states, caching and one isolated provider boundary. The Living
Score home now connects to `/api/transcription-jobs`, produces a labelled demo
MIDI without credentials, and opens the result in practice. The documented live
Klangio audio adapter is implemented, not credential-tested. Actual YouTube
acquisition is still separate and unavailable in live mode. Current details,
cache/deployment boundaries and evidence are in the
[Mock-to-live delivery record](./operations/TRANSCRIPTION_MOCK_TO_LIVE_2026-09-17.md).
Historical UI scores below do not imply completed source recognition.

## Active directive — 2026-09-16

**Completed autonomous UI sprint:** the founder authorized a three-hour preview
improvement window, 09:51–12:51 UTC on September 16, targeting an evidence-backed
95/100. The [sprint record](./reviews/LIVING_SCORE_THREE_HOUR_SPRINT_2026-09-16.md)
owns current results and remaining gaps; the September 9 metrics below are
historical. Final interface self-review: **95/100**, with 178 tests/51 files,
lint and production build passing. This is not a product launch-readiness score:
YouTube conversion is disconnected and browser import E2E remains unverified.
The time-bounded heartbeat was activated for this sprint and successfully paused
at completion. This does not establish that the earlier week-long automation
ever ran. No production promotion is authorized by this quality target.

**Product hierarchy correction:** YouTube/song-to-Sargam is the primary home
action; the growing searchable library is the second entry point. Living Score
is the design/practice foundation, not a library-first product pivot. The
[transcription-first contract](./strategy/TRANSCRIPTION_FIRST_PRODUCT_CONTRACT.md)
owns this hierarchy, scale requirements, research and backend gaps. The preview
at `/living-score` now follows it; live transcription remains unimplemented.

**Design selection update:** the founder selected Living Score as the base and
authorized synthesis of Studio's visible instrument/transport, Riyaz's Sa anchor,
and Coach's optional progressive practice. See the
[scored decision and implementation record](./reviews/LIVING_SCORE_DECISION_2026-09-16.md).
The alternatives remain available for comparison. Work stays preview-only;
this selection is not authorization to replace production.

Founder operating rule: after answering an interruption/status question, continue
the unfinished authorized work rather than stopping at the answer. The canonical
execution policy is in [AGENTS.md](../AGENTS.md#continuous-execution-default--founder-directive-2026-09-16).
Explicit stops and genuine approval/blocking conditions still apply; never claim
unobserved background work.

The founder authorized a week of autonomous preview-only development and a
substantive design reset. Follow the [autonomous sprint contract](./operations/AUTONOMOUS_WEEK_2026-09-16.md).
Earlier visual choices are not fixed constraints. Build four meaningfully
different interactive alternatives before requesting a final design choice.
Preserve musical correctness and production. Ventus prototype investigation is
authorized at the supplied local folder. In that earlier checkpoint, scheduling
was not verified: automation tool calls failed with a closed transport on setup.
The later bounded sprint result above supersedes only its own scheduling status.
The dated status below is historical and does not describe the September 15
preview deployment; see the [pilot checkpoint](./audits/PILOT_PIECE_2026-09-15.md).

**Status date:** 2026-09-09
**Deployment:** Not reverified this session; previous recorded deployment was `e059a27`. Local timing changes have not been deployed.
**Public preview:** <https://sargam-io.vercel.app/>  
**Current working-tree verification:** 119 tests across 35 test files; lint, repository audit and production build passed. Work is on `codex/playback-clock-regression`.

**Practice UX:** research and local implementation are recorded in the
[quality review](./audits/PRACTICE_QUALITY_REVIEW_2026-09-09.md). Focus/tools,
seek, repeat ranges, restart and operable Cinema are implemented. Browser checks
cover the local desktop journey, not physical mobile or end-to-end latency.
The library now hides planned entries by default. No promotion was performed.

**Current engineering slice:** [Audio engine and flat-vector review](./audits/V1_ENGINE_REVIEW_2026-09-08.md).
The melody transport now uses an audio-authoritative scheduler, shared flat
keyboard rendering and a continuous Bansuri timeline. An opt-in local tuner is
available as an uncalibrated beta. Device audio latency, Ventus integration and
full release acceptance remain open in the
[V1 roadmap](./strategy/V1_UPGRADE_ROADMAP_2026-09-08.md).

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

The two source intake paths are (live audio remains future implementation):

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
| Recorded Bansuri library | Prototype approved | Founder accepted the vendor's written reply as sufficient for the current non-monetized pilot. Ventus can be integrated for prototype testing; commercial-release configuration is deferred. |
| Six-hole Bansuri reference | Prototype | Geometry is a learning visualization; definitive fingering requires profile and practitioner validation. |
| MusicXML/MXL import | Implemented review draft | Validated score events open a temporary practice session. |
| Imported session restore | Implemented local MVP | Imported timelines and manual MIDI corrections survive refresh through validated local storage. |
| Latin Sargam PDF export | Implemented | Server-side paginated printable practice sheet. |
| Staff-PDF/photo recognition | Research only | Local Audiveris pilot exists; no public SaaS OMR integration is approved. |
| YouTube/audio transcription | Mock seam only | No live provider, arbitrary URL ingestion, or production billing is connected. |
| Song catalog/library | Implemented MVP queue | 123 searchable entries are present: 12 original Riyaz exercises, 11 public-domain classical melody studies, 12 devotional/traditional-text studies, and 88 repertoire entries awaiting note data. Rights metadata is not a development or UX gate. Durable server catalog persistence is still future work. |
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
- Ventus Bansuri is approved for the current non-monetized prototype under the
  vendor's written reply. Engineering should proceed; commercial-release
  configuration is a later founder decision and must not block MVP work.
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

