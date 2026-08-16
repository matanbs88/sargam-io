# Disposition: Gemini full-product review

**Review evaluated:** 2026-08-16  
**Implementation baseline before this disposition:** `313e465`  
**Resulting implementation commit:** recorded after final QA.

## Executive decision

The Gemini review is directionally strong. Its most useful contribution is to
protect the user journey from three common trust failures: presenting a mock as
live transcription, presenting generic Bansuri geometry as a prescription, and
allowing unbounded score imports into an interactive beta.

The review also assessed an older repository snapshot and therefore repeats
three items that were already solved: the data model already supports
asynchronous provider jobs, the mobile piano roll already has active-key
recentering, and a full React Context refactor would add indirection before a
real multi-consumer job/result model exists.

## Implemented now

### MusicXML/MXL intake is a real practice entry point

Accepted. `ScoreImportPanel` now lets a visitor upload a MusicXML/XML/MXL file
from the landing surface. It calls the existing server-side import route,
validates the resulting structured score, creates a temporary practice
timeline, and opens the existing visual studio. This does not deduct a mock AI
credit, does not claim OMR, and does not persist the score.

The intake reports truthful states only: reading, ready, review draft, and
error. It does not fabricate a 10-second delay or a fake percentage while no
provider job exists.

### Import circuit breaker

Accepted. The existing 6 MB route limit remains in place. The parser now also
rejects files over 200 measures, the beta lead-sheet limit. Each imported
measure retains its own divisions-per-quarter and time signature so the timing
adapter and meter validator do not incorrectly assume one global value after a
notation change.

### Bansuri wording

Accepted. The Bansuri runway now visibly states that it is a generic six-hole
reference and must be adjusted for flute key, maker, embouchure, and half-hole
technique. The shared geometry still guarantees that drawn natural-swara
landmarks align to their illustrated holes; that visual alignment is not
marketed as a universal physical prescription.

## Already satisfied before this review

### Public demo clarity

The landing CTA already says **Open practice demo**. The URL field is labelled
as future/private-alpha scope, the entry is marked Mock, and the helper text
states that the Phase 1 example does not upload anything. The new MusicXML
control is intentionally separate from the visual-only URL field.

### Async provider storage model

`db/schema.sql` already holds `queued`, `processing`, `completed`, and
`failed` states, plus `provider_job_id`, provider versioning, and server-owned
credit-ledger boundaries. What remains is not a synchronous-schema defect: it
is the live provider slice, requiring durable storage, authenticated ownership,
provider credentials, polling or webhook behavior, and a published credit
failure policy.

### Mobile piano usability

`FallingNotesPianoRoll.tsx` already uses an overflow-x snap viewport on narrow
screens and programmatically centres the active key on mount/playback. It
preserves the full C3-C7 canvas on desktop. This is covered by manual browser
QA and should be retained.

### Transposition visibility

The studio control rail continuously displays the selected `Sa`; the Cinema
view also retains `{root} = Sa`. A dedicated semitone-delta badge is optional
polish, not a correctness blocker. It should only be added after a product
decision about whether a changed Sa means re-labelling, playback transposition,
or both for an imported source.

## Accepted but deliberately deferred

### Real asynchronous OMR job polling

Implement only after a provider account and benchmark decision. The current
MusicXML import is short-lived and can honestly show a local reading state.
When Flat/Opuscan or another provider is selected, add a durable job API,
provider-neutral status endpoint, authenticated ownership, retry/cancel,
server-side secret storage, and a transparent failure-credit rule. Do not ship
a simulated provider delay as a substitute for this work.

### Supabase waitlist and authentication

The UI/database work can proceed after the founder supplies a Supabase project
and approved privacy/marketing-consent wording. It is not an external-free
task because persisting contact information creates a data-policy obligation.
Authentication is not needed for the earliest waitlist form.

### Commercial OMR benchmark

Use a rights-cleared 30-item initial corpus: 10 digital Sibelius/MuseScore
PDFs, 10 clean scanned notation pages, and 10 phone photographs with varied
lighting. Add material containing ties, triplets, key/meter changes, and
multi-voice sections. For the beta, a phone-capture failure rate above 30% is
a hard reason to remove photo intake rather than ship an unreliable feature.
The desired P95 target is under 15 seconds, but it is a benchmark threshold,
not an unverified provider promise.

### Accompaniment scope

Do not cut the browser-native practice audio from the architecture. It is a
useful optional practice layer and the founder explicitly wants a future
authentic Tanpura experience. Keep it collapsed below the performance canvas,
do not market it as recorded Tanpura or Tabla, and do not let it delay the
notation-to-practice wedge. Licensed/commissioned accompaniment remains a
later quality gate.

### React Context

Deferred. `app/page.tsx` is a large composition component, but transport is
already isolated in `useMockTransport`. Introduce a provider only when durable
job/result/session data has multiple genuine consumers. Until then, a Context
would make server/client boundaries less clear without reducing risk.

## Updated next sprint order

1. **Run five live usability sessions** with prepared, validated MusicXML
   exercises and observe five minutes of practice per learner.
2. **Create a minimal waitlist path** after Supabase and consent wording are
   supplied.
3. **Add imported-score review details** (title, meter, warnings, source
   provenance) and permit an imported score to generate the canonical
   score-based printable PDF.
4. **Run the Flat/Opuscan OMR bake-off** with a small self-service credit pack
   after the founder opens the account.
5. **Implement durable provider jobs and review workflow** only for the chosen
   provider and after benchmark acceptance.

## Verification required after the implementation

Run `npm.cmd run closeout`, then manually verify:

1. A valid MusicXML/MXL lead sheet opens the studio and preserves rests as
   silent timing gaps.
2. A score with warnings opens only as a review draft.
3. A PDF or an over-limit score cannot reach the practice workspace.
4. The Bansuri caveat is visible in the runway.
5. The existing mock demo, PDF export, mobile piano recentering, notation
   parity, and Cinema view remain intact.
