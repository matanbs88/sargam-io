# Sargam.io project vault

This folder is the maintained navigation point for project decisions, audits,
and engineering handoffs. Product-domain documents remain at the repository
root because they are linked directly from the public README.

## Start here

- [Project source of truth](./PROJECT_SOURCE_OF_TRUTH.md)
- [90-day launch execution plan](./strategy/LAUNCH_EXECUTION_PLAN.md)
- [Gemini engineering handoff](../GEMINI_REVIEW_REPORT.md)
- [Current full Gemini product and launch handoff](./reviews/GEMINI_FULL_PRODUCT_HANDOFF_2026-08-16.md)
- [Disposition of the current Gemini full-product review](./reviews/GEMINI_FULL_HANDOFF_DISPOSITION_2026-08-16.md)
- [Current build status](../WEEKEND_SUMMARY.md)
- [Manual QA checklist](../TESTING_CHECKLIST.md)
- [Maintenance workflow](./operations/MAINTENANCE_WORKFLOW.md)
- [Session closeout workflow](./operations/SESSION_CLOSEOUT_WORKFLOW.md)
- [Repository consistency audit](./audits/REPOSITORY_AUDIT_2026-08-16.md)
- [Indian music practice-platform roadmap](./strategy/RIYAZ_REPLACEMENT_ROADMAP.md)
- [Waitlist-first launch strategy](./strategy/LAUNCH_STRATEGY.md)
- [Current Gemini launch review request](./reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-23.md)
- [Historical Gemini launch review request (2026-08-16)](./reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-16.md)
- [Principal review disposition](./reviews/PRINCIPAL_REVIEW_DISPOSITION_2026-08-16.md)
- [Music content and rights plan](./strategy/MUSIC_CONTENT_AND_RIGHTS_PLAN.md)
- [Open audio sourcing protocol](./strategy/OPEN_AUDIO_SOURCING.md)
- [Founder audio-asset decision sheet](./strategy/AUDIO_ASSET_CANDIDATES_2026-08-23.md)
- [Third-party audio attributions](./ATTRIBUTIONS.md)
- [Indian music practice competitor research](./strategy/COMPETITIVE_PRODUCT_RESEARCH_2026-08-16.md)
- [Score import and printable notation architecture](./strategy/SCORE_IMPORT_AND_PRINT_ARCHITECTURE.md)
- [OMR provider strategy and benchmark](./strategy/OMR_PROVIDER_STRATEGY.md)
- [Premium recognition and technology quality standard](./strategy/QUALITY_STANDARD.md)
- [Unified song-to-score product experience](./strategy/UNIFIED_SCORE_EXPERIENCE.md)

## Project map

```text
app/                         Next.js App Router entry points and API route
  api/transcriptions/        Mock, cache-first server integration seam
  api/exports/               Printable Sargam PDF route
  page.tsx                   Interactive practice studio
src/
  components/instruments/    Keyboard, Harmonium, Bansuri, Guitar, Sitar views
  components/visualizers/    Piano roll and physical Bansuri fingering roll
  lib/                       Pure music, mock-data, rhythm, and UI helpers
  server/transcription/      Provider contracts, cache boundary, mock adapter
  server/export/             Server-side Sargam PDF composition
  server/score-import/       MusicXML parser and local-only OMR adapter
  test/                      Test-only server module shim
db/                          Future Supabase/PostgreSQL baseline schema
locales/                     Typed English and Hindi UI dictionaries
docs/                        Audit records and operating procedures
.github/workflows/           CI for lint, test, and production build
```

## Source-of-truth rules

1. `src/lib/midiToSargam.ts` owns relative MIDI/Sargam conversion.
2. `src/lib/mockMidiData.ts` is the canonical local transcription fixture for
   both the UI and mock API.
3. `MUSIC_DOMAIN.md` defines what the product may and may not claim about
   raga, taal, intonation, and fingering.
4. `INSTRUMENT_STRATEGY.md` determines whether an instrument gets an exact
   positional guide or only a relative learning reference.
5. `docs/PROJECT_SOURCE_OF_TRUTH.md` owns the current cross-functional status.
   `GEMINI_REVIEW_REPORT.md` and dated review packets remain external-review
   records; create a new dated packet when a materially new capability is
   delivered.
6. `src/server/score-import/musicXml.ts` is the source of truth for parsed
   MusicXML/MXL score events. PDF recognition must pass through it rather than
   inventing notes directly from a page image.
