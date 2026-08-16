# Repository consistency audit — 2026-08-16

## Scope

Reviewed all tracked application, library, test, API, database, localization,
configuration, CI, and Markdown files. Also checked Git history and the live
deployment workflow.

## Confirmed

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and Vitest are
  configured consistently.
- CI on `main` and pull requests runs lint, tests, and the production build.
- `.env`, `.env.local`, build output, dependencies, and `.vercel` are ignored.
- The page remains mock-only: the YouTube input is visual and does not call the
  API route or an external provider.
- The API route is a separate, tested cache-first mock seam for future wiring.
- Piano bars use MIDI onset/duration; Bansuri cues use six lanes aligned to the
  physical holes drawn below them.

## Corrected in this audit

1. Replaced two divergent mock transcription fixtures with one canonical
   `src/lib/mockMidiData.ts` fixture for the UI and mock provider.
2. Made the mock API return the transcription-service result instead of a
   separate hard-coded response.
3. Added route tests for URL rejection and fixture parity.
4. Updated the future schema instrument constraint to include Harmonium and
   Sitar, which already exist in the product UI.
5. Removed a duplicate `.vercel` ignore line.
6. Added the vault index, repeatable repository audit command, maintenance
   workflow, updated QA checklist, status summary, and Gemini handoff.

## Intentional boundaries

- No external audio, YouTube download, provider credentials, database, user
  accounts, payments, or persistent credits are active.
- The API provider name is a typed future contract, not evidence of an active
  Klangio integration.
- Bansuri fingering is a generic six-hole reference map. The UI alignment is
  exact; its musical prescription still requires a player/instrument profile.
- Cinema view is a clean visual presentation mode, not a video exporter.

## Follow-up audit triggers

- Any provider, authentication, database, billing, or upload integration.
- Any change to Sargam/Devanagari notation mapping.
- Any new instrument that claims physical fingering or tuning.
- Any release that introduces video export, audio playback, or user data.
