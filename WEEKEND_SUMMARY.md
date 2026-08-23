# Sargam.io weekend handoff and current build status

**Status date:** 2026-08-23
**Baseline commit:** `26b137b`
**Production preview:** <https://sargam-io.vercel.app/>

## What is working now

- Next.js 16 App Router application with a responsive Sargam practice studio.
- Deterministic mock MIDI phrase with a local two-credit preview flow.
- Relative 12-semitone MIDI-to-Sargam conversion, repeated octave markers,
  and strict token-by-token Devanagari dictionary lookup.
- Instant ABC, Latin Sargam, and Devanagari switching plus selected-Sa
  transposition.
- Mock note transport, Taal cycles, Tabla practice prompts, a synthesized
  Sa/Pa or Sa/Ma drone, and instrument-oriented practice modes.
- MIDI-timed piano roll and physically aligned six-hole Bansuri fingering roll.
- The roll selector is also the current guide-voice selector:
  - Piano roll: Salamander Piano browser sampler with attribution.
  - Bansuri roll: browser-native procedural Bansuri guide voice.
- Isolated, testable mock transport state for bounded note navigation and
  playback progress.
- Cinema performance view designed for clean screen capture and vertical use.
- Server-side, paginated Latin-Sargam PDF export route for printable practice
  sheets using the selected Sa, taal, tempo, and meter.
- User-facing MusicXML/MXL lead-sheet upload that validates a score and opens a
  temporary practice-review session.
- Imported MusicXML sessions and manual MIDI corrections survive a browser
  refresh through a validated local-storage contract; malformed saved state is
  discarded safely.
- Guarded local Audiveris PDF pilot for research only; it is disabled on the
  public deployment.
- Mock cache-first API route that validates and canonicalizes YouTube URLs.
  It uses the same fixture as the UI and is not connected to live ingestion.
- Future Supabase schema, provider/cache contracts, typed local dictionaries,
  metadata, robots, sitemap, response-security headers, and GitHub Actions CI.

## Verification at this baseline

- `npm.cmd run audit:repo` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run test` passes: 60 tests across 22 test files.
- `npm.cmd run build` passes.
- Manual QA has covered desktop, 390x844 vertical layouts, Bansuri cue
  alignment, Cinema view, transport sync, and console-error checks.
- The repository is connected to GitHub and Vercel production deploys from
  `main`.

## Important boundaries

- This is still a mock-driven MVP, not a live transcription SaaS.
- No production provider, arbitrary YouTube/audio ingestion, accounts,
  subscriptions, payments, persistent user library, or server credit ledger is
  connected.
- The Bansuri voice is procedural, not a recorded Ventus or commercial sample
  library. A recorded library requires explicit Web/SaaS redistribution terms.
- The Bansuri roll is a practice visualization. Definitive fingering claims
  require validated flute profile, tuning, register, and musician review.
- A Western key signature does not automatically identify raga, taal, shruti,
  meend, gamak, or a culturally definitive interpretation.

## Next production slice

The full sequence is maintained in
[`docs/strategy/LAUNCH_EXECUTION_PLAN.md`](./docs/strategy/LAUNCH_EXECUTION_PLAN.md).
The immediate order is:

1. Build the rights-safe landing page and consented founding waitlist.
2. Add privacy-safe analytics and a showcase rights ledger.
3. Load the first 3–5 cleared demo sessions and measure demand.
4. Run the provider/OMR bake-off before implementing live ingestion.
5. Add auth, persistence, server-side credits, and reviewable job states.

## Founder actions needed

- Approve a provider and sample-library budget before any live integration.
- Contact vendors for written terms, including Ventus if its Bansuri sound is
  still preferred.
- Recruit 20 target-user interviews and at least two qualified Bansuri
  reviewers.
- Provide or approve rights-cleared showcase material and attribution.
- Choose the initial persona and launch message from interview/waitlist data.

## Session closeout

Every future build session should read the source of truth, complete the next
unblocked acceptance-tested slice, run the repository checks, update the
relevant docs, and close with:

```powershell
npm.cmd run closeout
```

See [`docs/operations/SESSION_CLOSEOUT_WORKFLOW.md`](./docs/operations/SESSION_CLOSEOUT_WORKFLOW.md)
for the full procedure and
[`docs/reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-23.md`](./docs/reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-23.md)
for the current external review packet.

## Deliberately deferred

- Real YouTube/audio ingestion and external-provider billing.
- Audio playback beyond the current browser guide voices, video export, and
  creator assets/watermarks.
- Automatic staff-PDF recognition/import. This needs a license-cleared OMR
  provider plus mandatory musician review before public release.
- Accounts, subscriptions, payments, persistent library, rate limits, and
  privacy/retention infrastructure.
- Raga, taal, shruti, meend, and gamak inference.
- Large-scale content acquisition or thousands of musician recordings.
