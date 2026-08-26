# Sargam.io 90-day launch execution plan

**Baseline:** 2026-08-23  
**North star:** Bring a melody into your Sa. See it, play it, and practice it your way.  
**Launch posture:** waitlist-first, practice-quality-led; launch review is
separate from MVP implementation

This is the working plan for finishing the product. Per the founder's
2026-08-26 directive, engineering must continue through the full MVP without
turning legal review into a development or UX gate. Final publication and
commercial launch review remains a founder-owned release step. See
[`MVP_CONTENT_DECISION.md`](./MVP_CONTENT_DECISION.md).

## Definition of a successful first launch

Sargam.io is ready for a gated beta when a user can legally bring in an allowed
source, receive a reviewable result, choose Sa and notation, practice with
timing and an appropriate guide voice, export a clean PDF, and return to the
saved session. The product must explain uncertainty instead of presenting an
uncertain transcription as truth.

Public launch does **not** require a huge song catalogue or thousands of
recorded musicians. It does require a small rights-safe catalogue, a reliable
workflow, clear positioning, and evidence that the target user returns to
practice.

## Ownership model

| Owner | Responsibility |
| --- | --- |
| Matan / founder | Product decisions, user interviews, vendor approvals, budget, rights sign-off, launch messaging. |
| Codex / engineering | UI, data model, adapters, tests, documentation, deployment, technical QA. |
| Music advisor / design partners | Bansuri profiles, notation conventions, practice quality, correction review. |
| Provider/vendor | Written input rights, processing terms, reliability, pricing, support, data handling. |
| Legal/accounting advisor | Terms, privacy, copyright/licensing review, entity and payment readiness. |

## Timeline and exit gates

### Gate 0 — baseline and instrumentation (Week 0–1)

**Goal:** turn the current preview into a truthful demand-validation surface.

**Deliverables**

- Landing/waitlist route with a clear “preview” label and no false live-
  transcription promise.
- Email capture, consent text, confirmation state, and a simple exportable
  lead record.
- Analytics events: landing view, demo start, notation change, roll change,
  practice start, PDF export, waitlist submit, error.
- One-page provenance/launch-review ledger template and a registry for showcase
  sessions.
- Current production status and known limitations linked from the app.

**Exit criteria**

- A visitor can join the waitlist successfully on desktop and mobile.
- Every lead has consent and a source attribution field.
- The demo can be explained in one sentence without implying live YouTube
  support.
- Provenance is recorded when available; missing final launch metadata does not
  stop MVP feature work.

### Phase 1 — demand validation and positioning (Weeks 1–2)

**Goal:** prove who values the workflow before paying for infrastructure.

**Founder actions**

- Conduct 20 short interviews: 10 keyboard/harmonium learners, 5 Bansuri
  players, and 5 teachers/creators.
- Publish three short, rights-safe demo clips showing the same melody in
  notation, practice roll, and printable output.
- Test three messages: “learn any melody in your Sa,” “practice with a visual
  roll,” and “print Indian notation from a score.”

**Success signals**

- At least 100 qualified waitlist signups or a clearly evidenced high-intent
  niche with fewer but stronger conversations.
- At least 10 people willing to test a private alpha.
- At least 25% of demo starters return or request another session.

**Exit gate:** choose the primary persona and message using observed behavior,
not preference.

### Phase 2 — score workflow and seed catalogue (Weeks 2–4)

**Goal:** make the score-to-practice promise excellent with complete MVP
content and reviewable score data.

**Engineering deliverables**

- Persistent canonical score/session types around MusicXML and timed events.
- Review screen for MusicXML/MXL import with correction and selected-Sa state.
- Print presets: compact Roman/Latin Sargam first; staff plus Sargam second.
- Catalogue registry with title, source, note-data status, attribution fields,
  and editable launch-review metadata.

**Content deliverables**

- 12–20 polished showcase sessions across the initial instruments.
- Each showcase has a source file, canonical score, preview image, provenance
  fields, and an explicit MVP/publication status.

**Exit gate:** a tester can discover, practice, and print a cleared session in
  under five minutes.

### Phase 3 — provider bake-off and OMR/audio research (Weeks 4–6)

**Goal:** select technology based on evidence, not marketing claims.

**Actions**

- Build a rights-cleared benchmark of representative mono/polyphonic audio and
  staff pages.
- Test replaceable adapters for candidate audio and OMR providers.
- Measure note accuracy, onset/duration accuracy, confidence quality, latency,
  failure rate, source permissions, data retention, price per job, and export
  compatibility.
- Obtain written Web/SaaS/commercial terms before adding any vendor asset or
  endpoint to production.

**Exit gate:** one selected provider or a documented decision to remain score-
first until quality or licensing improves. No provider gets embedded solely on
  a free trial or personal-use permission.

### Phase 4 — private-alpha foundation (Weeks 6–8)

**Goal:** convert the local preview into a safe, durable product slice.

**Engineering deliverables**

- Auth and server-side user authorization.
- Database-backed session, source, score, job, and credit-ledger records.
- Cache key: normalized source + provider + provider version + settings.
- Job states: queued, processing, review-needed, ready, failed, expired.
- Retry/backoff, rate limit, structured errors, delete flow, and retention
  policy.
- Basic observability for processing latency, cost, failures, and exports.

**Exit gate:** a user can refresh or return later without losing their session,
and one user cannot access another user's source or credits.

### Phase 5 — musician alpha and quality loop (Weeks 8–10)

**Goal:** measure practice usefulness and correct domain errors early.

- Invite 25–50 users, weighted toward the chosen primary persona.
- Add correction UI and capture corrections as structured feedback.
- Validate the six-hole Bansuri mapping with at least two qualified players;
  support profile/tuning selection before making claims.
- Measure time to first useful practice, repeat practice, export completion,
  correction rate, and top failure reasons.

**Exit gate:** repeated use is visible, the dominant failure modes are known,
and no high-severity notation or fingering error remains unexplained.

### Phase 6 — gated beta readiness (Weeks 10–12)

**Goal:** prepare a credible, measurable first market release.

- Finalize provider/sample rights, attribution, privacy, terms, refund and
  credit policy, and takedown process.
- Define pricing only after processing cost and failure/refund behavior are
  known.
- Complete desktop, mobile, vertical-capture, accessibility, and no-audio
  fallback QA.
- Add support/feedback channel, status messaging, and basic incident response.
- Launch the waitlist to a gated beta rather than opening arbitrary ingestion.

**Launch gate:** no unresolved P0 rights, privacy, isolation, or data-loss
issue; all published content has a rights record; core metrics are observable.

## Ordered next 10 work items

The first three preview-surface items are now implemented locally:

- Done: waitlist landing route and consented lead capture.
- Done: analytics event seam with non-PII product events.
- Done: compact limitations/privacy notice at `/privacy`.

The next execution order is:

1. Expand the showcase registry and load the next 3–5 MVP sessions.
2. Add persistent score/session schema and migration baseline.
3. Run the provider/OMR bake-off on the benchmark set.
4. Implement authentication and a server-side credit ledger.
5. Connect one approved live job adapter with loading/error/retry/review states.
6. Finish the score library, review flow, and printable export presets.
7. Run the 25–50-user private alpha and feed corrections into the benchmark.

## Founder-owned dependencies

These cannot be solved by code alone:

- Approve a provider/sample budget and contact vendors for written terms,
  including the Ventus Bansuri request if that remains the preferred sound.
- Recruit the first 20 interviewees and two qualified Bansuri reviewers.
- Provide or approve rights-cleared showcase material and its attribution.
- Decide the initial public brand/domain and the legal entity/payment path when
  charging begins.
- Choose the primary launch persona after the interview and waitlist evidence.

## Weekly operating rhythm

- **Monday:** choose one outcome and write its acceptance criteria.
- **Build days:** implement a vertical slice and keep the source-of-truth docs
  current.
- **QA day:** run automated checks plus desktop/mobile/manual product gates.
- **Closeout:** update status, risks, metrics, Gemini review packet, commit,
  push, and record the next three actions.

## Definition of done for every slice

- The feature works in the real browser path, not only in an isolated helper.
- Loading, empty, error, and retry states are deliberate.
- Domain claims and labels are accurate in English and Devanagari modes.
- Audio, score, and content rights are documented when relevant.
- Tests cover the mathematical/data boundary and the UI has been checked at
  desktop and 390x844 widths.
- `npm.cmd run closeout` passes, the deployed commit is known, and the next
  risk is recorded.

