# Sargam.io — Gemini engineering, product, and QA handoff

## Review request

Act as an independent staff-level reviewer. Review the repository as a local,
mock-driven Indian-music practice MVP. Do not assume a live audio
transcription, YouTube ingestion, payment, database, user account, or video
export capability exists.

Please first run:

```powershell
npm.cmd run audit:repo
npm.cmd run verify
```

For the latest session baseline, launch strategy, and precise review questions,
also read `docs/reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-16.md` and run
`npm.cmd run closeout`.

## Current closeout addendum — 2026-08-16

- Current `main` baseline: `7b0e8b2 feat: expand piano performance canvas`.
- The automated gate is now lint, 36 tests, Next.js production build, vault
  audit, and Git whitespace validation via `npm.cmd run closeout`.
- The selected notation system is now used by every visible label in the
  melody line, piano falling notes, Bansuri lanes, Bansuri beams, and active
  Bansuri badge.
- The Piano Canvas now spans C3–C7; this is a DOM/CSS visualizer and not an
  audio keyboard or a copied implementation of any competitor.
- Public launch recommendation: a rights-safe landing/waitlist plus
  interactive demo. Live YouTube/audio transcription is still explicitly
  deferred. See `docs/strategy/LAUNCH_STRATEGY.md`.

Then review code, product claims, musical safety, UI quality, and the proposed
next slice. Report concrete defects by severity, with exact file paths and
minimal safe fixes. Do not implement external integrations without an explicit
product decision and credentials.

## Baseline and environment

- Repository: `matanbs88/sargam-io`
- Branch: `main`
- Pre-audit implementation baseline: `ccfe7d3`
- Current stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4,
  Vitest, Node 24 in CI
- Public deployment: <https://sargam-io.vercel.app>
- Quality baseline after the follow-up transport refactor: lint, production
  build, and 27 tests pass

## Product intent

Sargam.io turns a melody represented as MIDI note events into learner-facing
relative notation for Indian music. Its core audience includes keyboard,
harmonium, Bansuri, guitar, and Sitar learners who need to choose a comfortable
Sa and see a simple physical reference.

The current product convention is an equal-tempered 12-position mapping:

```text
S r R g G m M P d D n N
```

Lowercase `r/g/d/n` are komal and uppercase `M` is tivra Ma. This is an
explicit product convention for MIDI-derived notes, not a claim to full raga
analysis or traditional engraved notation.

## Current user experience

1. Visitor sees a high-end landing panel with a visual-only link/audio entry.
2. **Transcribe melody** consumes one local credit and opens a deterministic
   local mock transcription.
3. User selects Sa (MIDI 60–72), toggles ABC / Latin Sargam / Devanagari, and
   controls a mock event transport.
4. The active note drives Taal/Tabla practice and all selected instrument
   references.
5. The performance deck exposes two timing visualizers:
   - **Piano roll:** onset/duration bars fall onto the exact white or black key.
   - **Bansuri fingering roll:** six time lanes terminate at the six drawn
     finger holes; each cue represents closed, half-open, or open state.
6. **Cinema view** gives a clean, dark, responsive performance frame designed
   for screen capture. It is not an exporter.

No browser request is made when toggling notation, Sa, instrument, visualizer,
or active note. The page currently does not call the API route.

## Architecture map

| Area | Key files | Responsibility |
| --- | --- | --- |
| App shell | `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts` | Metadata, visual system, theme |
| Practice UI | `app/page.tsx` | Client-only composition state, dashboard, Cinema dialog |
| Mock transport | `src/features/practice/useMockTransport.ts`, `src/lib/playback.ts` | Playback lifecycle plus tested, bounded event navigation |
| Notation engine | `src/lib/midiToSargam.ts` | Validated relative pitch math and display formatting |
| Canonical fixture | `src/lib/mockMidiData.ts` | Single mock phrase for UI and provider seam |
| Instrument refs | `src/components/instruments/` | Keyboard, Harmonium, Bansuri, Guitar, Sitar displays |
| Visualizers | `src/components/visualizers/` | Piano roll and six-lane Bansuri finger-cue display |
| Bansuri rules | `src/lib/bansuriFingering.ts`, `src/lib/bansuri.ts` | Generic six-hole map, timeline positions, future profile model |
| Rhythm | `src/lib/taal.ts`, `src/lib/tabla.ts`, related components | Manual Taal structures and basic practice thekas |
| Future API seam | `app/api/transcriptions/`, `src/server/transcription/` | URL validation, mock provider, cache contract, normalized result |
| Future persistence | `db/schema.sql` | Supabase/PostgreSQL draft with RLS and credit ledger |
| Locales | `locales/`, `src/lib/localization.ts` | Typed dictionary scaffold; no locale routing yet |
| Quality | `*.test.ts`, `.github/workflows/ci.yml`, `scripts/repository-audit.mjs` | Unit/API tests, CI, repository-vault existence check |

## Core correctness rules

### Relative MIDI conversion

`src/lib/midiToSargam.ts` uses:

```ts
interval = ((incomingMidi - rootMidi) % 12 + 12) % 12
octaveShift = Math.floor((incomingMidi - rootMidi) / 12)
```

Positive octaves append repeated apostrophes; negative octaves append repeated
periods. Inputs and event timing are validated.

### Devanagari safety

The Devanagari renderer accepts an already-tokenized Sargam value and performs
one dictionary lookup. It never chains string replacements. Please inspect the
Unicode dictionary directly in `src/lib/midiToSargam.ts` and verify it against
the approved Bhatkhande convention.

### Bansuri boundary

The six-lane visual alignment is deliberately exact: both the falling lanes and
the flute holes derive from `getBansuriTimelineXPosition`. The generic
fingering map is still not a universal prescription. Maker, flute key, octave,
embouchure, half-hole technique, and gharana need a user/profile calibration
before the product calls it definitive.

### Taal boundary

The user chooses a Taal. BPM is never treated as enough information to infer
Taal; basic thekas are practice prompts with legitimate variations.

## Recent consistency audit changes

1. Consolidated UI and mock-provider transcription data on
   `mockMidiData.ts`.
2. Changed `POST /api/transcriptions` to return the service result rather than
   an unrelated hard-coded fixture.
3. Added API fixture-parity and invalid-URL tests.
4. Updated the future request schema for Harmonium and Sitar.
5. Added an auditable project-vault workflow and corrected stale status/QA docs.

See `docs/audits/REPOSITORY_AUDIT_2026-08-16.md` for the full record.
See `docs/reviews/GEMINI_REVIEW_RESPONSE_2026-08-16.md` for the review
disposition and the future live-processing UX decision.

## Explicitly deferred capabilities

- Audio upload, download, or YouTube ingestion.
- A real transcription provider, job polling, billing, retries, and confidence
  metadata.
- Authentication, database persistence, subscriptions, payment, rate limiting,
  and persistent credits.
- Song/audio playback, audio pitch shifting, export, watermarking, and creator
  asset uploads.
- Raga, shruti, meend, gamak, or automatic Taal recognition.
- Player-specific Bansuri calibration and phrase-level guitar/sitar fingering.

## Review questions for Gemini

1. Is the MIDI distance/octave behavior correct at all negative boundaries?
2. Does the current Devanagari dictionary exactly match the approved glyphs
   and combining marks?
3. Does the generic six-hole Bansuri reference map need musician validation
   before the chromatic positions remain visible in product UI?
4. Is the current client-page state model sustainable, or should the dashboard
   be split into a stateful feature component before API wiring?
5. Should the API mock seam remain while the page stays intentionally local,
   or should it be feature-flagged until the live slice begins?
6. Is the PostgreSQL cache key sufficient for provider/model-version changes?
7. What test coverage is missing for the Cinema dialog, visualizer geometry,
   and cache route behavior?
8. Does the UI look coherent at creator-quality desktop and vertical capture
   sizes, without making functionality claims it cannot yet meet?

## Recommended next production slice

1. Make a provider/ingestion/legal decision and document it.
2. Implement authentication plus a server-owned credit ledger.
3. Apply a reviewed database migration and replace the in-memory cache.
4. Add a typed client/API result contract and explicit loading, error, retry,
   and cache-hit states.
5. Integrate one approved provider with job polling and cost controls.
6. Add confidence-aware review tools and instrument/player calibration before
   presenting any transcription as ready-to-play fact.

## Required reviewer references

- `README.md` — user-facing capabilities
- `MUSIC_DOMAIN.md` — musical/product claims and research sources
- `INSTRUMENT_STRATEGY.md` — scope by instrument family
- `TESTING_CHECKLIST.md` — manual regression script
- `docs/operations/MAINTENANCE_WORKFLOW.md` — recurring maintenance gate
