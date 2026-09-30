# Audio / YouTube intake delivery — 2026-09-17

## Current implementation

- `/living-score` home now submits YouTube links or audio to
  `/api/transcription-jobs`. Queued/processing, cancel, retry, errors, completion,
  Sargam preview, practice handoff and a downloadable valid MIDI are connected.
- Default without credentials: explicit Mock, 3.2-second simulated workflow,
  fixed Ode to Joy fixture. Never claims source recognition. Mock labels persist
  into the practice title and notice.
- One integration boundary:
  `src/server/transcription/jobs/provider.ts:createAudioTranscriptionProvider`.
- `KLANGIO_API_KEY` selects live mode if `TRANSCRIPTION_PROVIDER` is unset.
  `TRANSCRIPTION_PROVIDER=mock` explicitly forces mock even if a key exists.
- Live adapter implements the documented multipart audio submission, status
  polling, and MIDI retrieval. It is contract-tested with mocked HTTP, **not
  credential-tested against a paid account**. No paid job was submitted.
- YouTube works through the Mock pipeline. Live YouTube acquisition is **not
  implemented**: the public API docs examined document multipart audio, not the
  consumer website's YouTube field. A key alone does not add YouTube fetching.
- Live provider percentages are indeterminate; only Mock displays simulated
  percentages. C4 is an editable initial reference, not an inferred tonic.
- All non-percussion tracks feed the preview. Original MIDI is preserved;
  practice projects notes to semitones, not pitch bends. The score grid uses the
  first tempo/meter; expressive or changing-meter scores need later editing.

## Cache / operational boundaries

- SHA-256 of canonical URL or audio bytes + session + provider version.
- In-flight submission deduplication; polling is coalesced/throttled.
- HttpOnly SameSite session isolates lookups and downloads. Source/audio bytes
  are not retained after submission. MIDI/results expire after 30 minutes.
- Bounded 128-entry process store; five recent jobs/minute/session. This is a
  **single-instance pilot cache**, not distributed persistence, authentication
  or a global abuse-prevention system. Restart loses jobs; client gives recovery.
- Before public paid deployment: persistent shared job/cache store, authenticated
  user/tenant quota, distributed submission lock, durable provider job ids and
  webhook/reconciliation worker. Do not equate this Mock milestone with those.
- Cancel stops local observation and ignores late completion. The vendor may
  continue processing; no unsupported remote cancellation endpoint is invented.
- Audio limit 4 MB with a streaming request-body limit, suitable for short pilot
  clips. Larger audio requires direct object-storage upload, not Vercel proxying.

## Provider recommendation evidence

- https://api-docs.klang.io/docs/jobs/transcription-requests
- https://api-docs.klang.io/docs/getting-started/basic-job-workflow
- https://api-docs.klang.io/
- https://basicpitch.spotify.com/about

Klangio is the selected commercial integration candidate because its documented
API returns music-specific MIDI/MusicXML and supports instrument-specific work.
This is not evidence that it is universally the most accurate, particularly for
bansuri/meend. Compare a fixed Indian-music benchmark with Basic Pitch before
making quality claims. Klang.ai speech transcription is a different service.

## Verification / known environment issues

- Final `npm run closeout` passed on Next 16.3.5: repository inventory, ESLint,
  **190 tests / 53 files**, TypeScript, optimized build (16 routes), and diff
  whitespace check. Tests include the full Mock URL submission → poll → valid
  MIDI download contract and multipart audio input. No new browser pass claimed.
- Browser automation connection returned `Transport closed` this turn. No new
  visual or upload-browser E2E pass is claimed. Route tests exercise multipart
  upload, session privacy, cancellation, malformed requests and body limits.
- Installation audit reported pre-existing Next 16.3.0 critical advisories,
  plus sharp/js-yaml/vitest findings. Next and eslint-config-next were updated to
  16.3.5, followed by compatible `npm audit fix` (no force). The resulting audit
  reported **zero known vulnerabilities**. The final gate runs against that
  updated lockfile. This is not a guarantee against undiscovered vulnerabilities.
- No deployment, production replacement, purchase or new external account.
