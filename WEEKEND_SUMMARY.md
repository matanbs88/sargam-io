# Weekend build summary

## Completed

- Next.js 16 App Router project initialized and pushed to GitHub
- Secure Git exclusions for local environment variables and build output
- Phase 1: responsive Sargam.io landing page, link entry flow, and instrument configuration modal
- Phase 2: `src/lib/midiToSargam.ts` implements the specified 12-semitone relative Sargam conversion and octave notation
- Phase 3: mock song data and a working end-to-end client-side transcription experience
- Result dashboard supports Sargam/ABC switching, root-note transposition, copy, and TXT export
- Metadata, `robots.txt`, and `sitemap.xml` are generated via Next.js file conventions

## Validation completed

- `npm.cmd run lint` passes
- `npm.cmd run build` passes
- Manual local browser QA passed for link entry, settings selection, processing state, results, and notation toggle

## Required for live transcription

No secrets have been created or committed. Create `.env.local` from `.env.example` and provide:

```bash
KLANG_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://sargam.io
```

`KLANG_API_KEY` and the provider adapter must be verified against the selected transcription provider's current API documentation before implementation. `DATABASE_URL` should point to the selected managed PostgreSQL/Supabase database.

## Next implementation slice

1. Add authentication and an account/credit model.
2. Add `Song_Cache` persistence keyed by normalized source URL and provider/version metadata.
3. Implement a server-side transcription adapter that checks the cache first, then calls the external provider only on a cache miss.
4. Parse returned MIDI, preserve timing/duration, and pass note events to the existing conversion layer.
5. Add Bansuri fingering rules per flute key as a separate, tested domain module.

## Scope deliberately deferred

- Real YouTube/audio ingestion
- External transcription API billing and retries
- Database cache, subscriptions, and user accounts
- Copyright/licensing policy and upload/link terms
