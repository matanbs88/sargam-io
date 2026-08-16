# Weekend build summary

## Completed

- Local Phase 1 MVP: visual upload and YouTube-link entry, deterministic mock MIDI, relative root selection, local credits, and tri-state notation
- Local Phase 2: synchronized mock-note player plus Keyboard, Bansuri, and Guitar visual references
- Dedicated Harmonium mode with relative Sargam key labels and visual Sa/Pa or Sa/Ma drone selection
- Manual Taal practice layer with active-matra progress for Teentaal, Jhaptal, Rupak, Ektal, Dadra, and Keherwa
- Strict token-by-token Devanagari rendering; no chained replacement operations
- Local English/Hindi JSON dictionaries and a handoff testing checklist
- Next.js 16 App Router project initialized and pushed to GitHub
- Secure Git exclusions for local environment variables and build output
- Phase 1: responsive Sargam.io landing page, link entry flow, and instrument configuration modal
- Phase 2: `src/lib/midiToSargam.ts` implements the specified 12-semitone relative Sargam conversion and octave notation
- Phase 3: mock song data and a working end-to-end client-side transcription experience
- Result dashboard supports Sargam/ABC switching, root-note transposition, copy, and TXT export
- Metadata, `robots.txt`, and `sitemap.xml` are generated via Next.js file conventions
- Server-side `POST /api/transcriptions` validates and canonicalizes YouTube URLs before using the mock adapter
- Automated test coverage for the conversion core, timing retention, source validation, and initial tāla structures
- [MUSIC_DOMAIN.md](./MUSIC_DOMAIN.md) records research-backed notation/rhythm decisions and product constraints
- Cache-first server-side orchestration contract with an in-memory test cache and provider interface
- Reviewed PostgreSQL/Supabase baseline schema in `db/schema.sql`, including RLS and an immutable credit ledger
- GitHub Actions CI runs lint, test, and production build for `main` pushes and pull requests
- Mock API now demonstrates the production cache contract (`provider` then `cache_hit` for the same normalized source)
- URL validation is enforced in both the accessible client UI and the server route; baseline response-security headers are configured

## Validation completed

- `npm.cmd run lint` passes
- `npm.cmd run test` passes (19 tests)
- `npm.cmd run build` passes
- API smoke tests confirmed a cache hit on repeated input and a `400` response for a non-YouTube URL
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

1. Configure Supabase auth and apply the reviewed `db/schema.sql` migration.
2. Implement the PostgreSQL `SongCache` adapter keyed by normalized URL and provider/version metadata.
3. Replace `src/server/transcription/mockProvider.ts` with a cache-first live provider adapter. Klangio's current official OpenAPI exposes asynchronous transcription jobs and MIDI endpoints; verify its current auth and upload/link request requirements with supplied credentials before coding against it.
4. Parse returned MIDI, preserve timing/duration, and pass note events to the existing conversion layer.
5. Add a player-calibrated Bansuri fingering profile; do not claim universal fingerings from flute key alone.

## Scope deliberately deferred

- Real YouTube/audio ingestion
- External transcription API billing and retries
- Database cache, subscriptions, and user accounts
- Copyright/licensing policy and upload/link terms
