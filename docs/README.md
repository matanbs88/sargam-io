# Sargam.io project vault

This folder is the maintained navigation point for project decisions, audits,
and engineering handoffs. Product-domain documents remain at the repository
root because they are linked directly from the public README.

## Start here

- [Gemini engineering handoff](../GEMINI_REVIEW_REPORT.md)
- [Current build status](../WEEKEND_SUMMARY.md)
- [Manual QA checklist](../TESTING_CHECKLIST.md)
- [Maintenance workflow](./operations/MAINTENANCE_WORKFLOW.md)
- [Repository consistency audit](./audits/REPOSITORY_AUDIT_2026-08-16.md)

## Project map

```text
app/                         Next.js App Router entry points and API route
  api/transcriptions/        Mock, cache-first server integration seam
  page.tsx                   Interactive practice studio
src/
  components/instruments/    Keyboard, Harmonium, Bansuri, Guitar, Sitar views
  components/visualizers/    Piano roll and physical Bansuri fingering roll
  lib/                       Pure music, mock-data, rhythm, and UI helpers
  server/transcription/      Provider contracts, cache boundary, mock adapter
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
5. `GEMINI_REVIEW_REPORT.md` is the current external-review handoff; replace
   its baseline details when a materially new capability is delivered.
