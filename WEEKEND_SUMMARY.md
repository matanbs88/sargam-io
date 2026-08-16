# Sargam.io current build status

## Delivered local MVP

- Next.js 16 App Router application with a responsive Sargam practice studio.
- Deterministic mock MIDI phrase with a local two-credit preview flow.
- Relative 12-semitone MIDI-to-Sargam conversion, repeated octave markers,
  and strict token-by-token Devanagari dictionary lookup.
- Instant ABC, Latin Sargam, and Devanagari switching plus selected-Sa
  transposition.
- Mock note transport, Taal cycles, basic Tabla practice prompts, a synthesized
  Sa/Pa or Sa/Ma drone, and Keyboard/Harmonium/Bansuri/Guitar/Sitar references.
- MIDI-timed piano roll and physically aligned six-hole Bansuri fingering roll.
- Isolated, testable mock transport state for bounded note navigation and
  playback progress.
- Cinema performance view designed for clean screen capture and vertical use.
- A mock cache-first API route that validates/canonicalizes YouTube URLs;
  it uses the same fixture as the UI but is not connected from the page.
- Future Supabase schema, provider/cache contracts, typed local dictionaries,
  metadata, robots, sitemap, response-security headers, and GitHub Actions CI.

## Validation at the current baseline

- `npm.cmd run audit:repo` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run test` passes (27 tests).
- `npm.cmd run build` passes.
- Manual browser QA passed for desktop and 390×844 vertical layouts, Bansuri
  cue alignment, Cinema view, transport sync, and no console errors.
- Production is deployed at <https://sargam-io.vercel.app>.

## Required before live transcription

No production secrets exist in the repository. Copy `.env.example` to
`.env.local` only when a provider/database integration has been approved:

```bash
KLANG_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://sargam.io
```

Credentials alone are insufficient. The provider's allowed input sources,
YouTube policy, job polling, cost model, and returned confidence/timing data
must be verified against the selected account contract before implementation.

## Next safe production slice

1. Choose the live transcription provider and document permitted ingestion.
2. Add Supabase authentication, server-side authorization, and a persistent
   credit ledger.
3. Implement a PostgreSQL cache adapter keyed by normalized source, provider,
   and provider version.
4. Wire the page to the existing API seam with loading/error/retry states.
5. Preserve MIDI timing and confidence metadata in the client result model.
6. Validate Bansuri profiles with players before offering instrument-specific
   guidance as definitive.

## Latest visual and launch closeout

- The performance Piano Canvas spans C3–C7 with larger physical key geometry.
- ABC, Latin Sargam, and Devanagari labels stay in parity across the melody
  line and both falling-note visualizers.
- The repository has a repeatable closeout command (`npm.cmd run closeout`)
  plus a documented manual/product release gate.
- Launch should begin with a rights-safe landing page and founding waitlist,
  not an unready promise of arbitrary YouTube transcription. See
  `docs/strategy/LAUNCH_STRATEGY.md`.

## Deliberately deferred

- Real YouTube/audio ingestion and external-provider billing.
- Audio playback, video export, and creator assets/watermarks.
- Accounts, subscriptions, payments, database persistence, and rate limits.
- Raga, taal, shruti, meend, and gamak inference.
