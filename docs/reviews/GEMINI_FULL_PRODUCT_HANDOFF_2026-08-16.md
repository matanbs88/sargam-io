# Sargam.io — full product, engineering, and launch handoff for Gemini

**Prepared:** 2026-08-16  
**Repository:** `matanbs88/sargam-io`  
**Branch / verified baseline:** `main` at `9721df7`  
**Live preview:** <https://sargam-io.vercel.app>  
**Review role requested:** principal product, music-technology, UX, and
engineering reviewer.

## 1. Why this document exists

This is the current source-of-truth handoff for an independent Gemini review.
It consolidates the founder's product direction, the implemented MVP, verified
quality evidence, domain boundaries, research decisions, and the next launch
choices. It supersedes older handoff documents where their commit baseline,
test count, or provider decision differs.

Please review the *actual current repository* rather than assuming that a
prototype claim is a live capability. Return specific findings with severity,
evidence, exact paths, and minimal safe actions. Do not produce generic advice
or suggest a large rewrite without a concrete reason.

## 2. Founder vision and non-negotiable product principles

Sargam.io aims to become the modern, web-first Indian music practice workspace:

> Any musician should be able to bring a melody, a song, or a Western staff
> score into their chosen Sa; see learner-friendly Sargam; practice it through
> an instrument-aware visual surface; and obtain a high-quality printable
> notation sheet.

The long-term ambition is broader than transcription: a complete daily riyaz
and creator-practice product that can eventually compete with legacy Indian
practice apps such as RiyazStudio and SurSadhak. The initial wedge is
**transcription / score conversion -> relative Sargam -> visual practice ->
print**, not a generic course marketplace.

Product principles:

1. **Sa first.** The chosen tonic is explicit. Western pitch names and Sargam
   must stay in parity across every surface.
2. **The performance canvas is the product.** It must feel premium, calm,
   minimal, musically useful, and suitable for lessons, short-form video, and
   screen recording — not like a generic B2B dashboard or an 8-bit game.
3. **Musical honesty.** The app must not claim to infer raga, shruti, taal,
   gharana, exact bansuri fingering, or performer correctness when the data
   cannot support that claim.
4. **Quality over convenient tooling.** We will not use a recognizer simply
   because it is free or easy. A provider must win an evidence-based bake-off
   on relevant musical material before becoming the default user experience.
5. **One canonical score.** A parsed score / MusicXML representation is the
   source of truth for practice, notation switching, instrument visualization,
   print export, cache, and future library. No duplicated transcription logic.
6. **Rights-aware by design.** Do not scrape or republish recordings, PDFs, or
   song transcriptions merely because they are online. A rights-safe private
   beta is the first market step.

## 3. Intended users and product wedge

### Primary initial audience

English/Hinglish-speaking Indian melody learners using keyboard or harmonium
who seek simple relative notes for songs, then want to practice in a Sa that
fits their voice or instrument.

### Secondary design partners

Bansuri learners and teachers. The current visual is useful for a generic
six-playable-finger-hole learning reference, but must not become definitive
technical instruction until player, flute key, octave, half-hole technique,
and maker/profile validation exist.

### Differentiation

Existing apps demonstrate demand for accompaniment, daily riyaz, notation,
and feedback, but Sargam.io's intended bridge is:

```text
recording / score / exercise
-> structured musical representation
-> chosen Sa and Sargam notation
-> instrument-aware visual practice
-> printable sheet and saved library record
```

The design is inspired by the clarity and canvas discipline of products such
as Songscription and the guided practice behavior of modern music-learning
products. No competitor UI, assets, code, or recordings have been copied.

## 4. What has actually been implemented

### Working local and deployed MVP

- Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4 application.
- Premium light/dark practice-studio UI with responsive desktop and narrow
  layouts, cinema/creator mode, and a paper/notation-inspired visual system.
- Deterministic mock phrase with local two-credit demonstration flow; this is
  deliberately not a live transcription service.
- Pure 12-semitone relative MIDI conversion using the selected `rootMidi`.
- Roman/ASCII Sargam, pitch-name (ABC-style), and Devanagari notation toggles.
- Strict 1:1 Devanagari token lookup; no chained replacement operation.
- Repeated octave markers: periods for mandra saptak and apostrophes for taar
  saptak, repeated for the absolute octave distance.
- Sa selection and display parity across melody line, piano visualizer,
  Bansuri visualizer, active-note badges, and printable output.
- Mock transport with bounded previous/next/play states and active note
  highlighting.
- MIDI-timed falling-note piano roll spanning C3-C7, with key-aligned onset
  and duration bars and physical white/black keyboard geometry.
- A vertical Bansuri melody runway aligned to six visible playable finger-hole
  landmarks. Natural swaras use shared anchors; altered swaras are between
  anchors. It is explicitly a generic learning reference, not a universal
  fingering prescription.
- Keyboard, harmonium, guitar, sitar, Bansuri, and rhythm practice surfaces.
- Manual Taal structures for Teentaal, Jhaptal, Rupak, Ektal, Dadra, and
  Keherwa. Taal is user-selected; it is never inferred solely from BPM.
- Browser-native generated Sa-Pa / Sa-Ma reference drone, guide tones, basic
  tabla-shaped cues, and Sam-accented metronome. These are not claimed to be
  sampled tanpura or recorded tabla.
- Server-side Sargam PDF export with a compact Roman-Sargam default and
  embedded Noto Sans Devanagari for Hindi output.
- Measure-aware MusicXML and compressed MXL import that retains measures,
  rests, durations, ties, key metadata, and meter before Sargam conversion.
- Imported-score validation for meter capacity, tie consistency, parser
  warnings, and `ready` versus `review-required` status.
- A guarded, development-only local Audiveris pilot for research. It is off on
  the public deployment and is not the planned product recognizer.
- Typed mock provider/cache seam, draft Supabase/PostgreSQL schema with RLS
  boundaries, typed English/Hindi dictionaries, robots/sitemap/metadata,
  response-security headers, GitHub Actions CI, and repository closeout tools.

### Verified project quality at this handoff

On 2026-08-16, `npm.cmd run closeout` completed successfully:

| Gate | Result |
| --- | --- |
| Repository audit | 63 source files, 17 test files, 24 documentation files, 9/9 required vault files |
| ESLint | Pass |
| Vitest | 17 files / 47 tests pass |
| Next production build | Pass |
| Git whitespace check | Pass |
| Working tree after closeout | Clean |

The production build exposes the expected static pages and dynamic API routes:
`/api/exports/sargam-pdf`, `/api/imports/musicxml`,
`/api/imports/score-pdf`, and `/api/transcriptions`.

## 5. Current musical model and deliberate boundaries

### Relative Sargam engine

The core algorithm in `src/lib/midiToSargam.ts` is:

```ts
interval = ((incomingMidi - rootMidi) % 12 + 12) % 12
octaveShift = Math.floor((incomingMidi - rootMidi) / 12)
```

The approved 12-position convention is:

```text
S r R g G m M P d D n N
```

- `r`, `g`, `d`, `n`: komal.
- `m`: shuddh Ma.
- `M`: tivra Ma.
- `S` and `P`: achal positions in this equal-tempered MIDI framework.

When a user selects C4 as Sa, MIDI 60 / C4 must render as `S` / Sa. If the
source note is D4 with the same selected Sa, it renders as `R` / Re. Changing
Sa changes the *relative label* while preserving the original musical pitch and
timing; it does not silently alter the source score.

### Scope limits

- MIDI-derived pitches are not raga classification.
- Western meter is not a declaration of taal.
- Generic Bansuri geometry is not a flute-key/performer-calibrated fingering.
- Generated browser audio is not authentic recorded accompaniment.
- A PDF visual does not itself contain reliably extractable musical semantics;
  robust processing first produces structured MusicXML.

See `MUSIC_DOMAIN.md` and `INSTRUMENT_STRATEGY.md` for the current claims and
research references.

## 6. Printable notation and score-import progress

### Bhatkhande-style practice PDF

The product already exports a compact, paginated Sargam sheet. Roman Sargam is
the default. Adjacent short notes are compactly placed within the rhythmic
line; sustained notes are represented without a Western calculator-like cell
grid. Devanagari is an explicit user option, not the default.

The print renderer preserves source meter. It adds Sam/Khali/vibhag markings
only when editorial data exactly matches the rhythmic structure; it does not
invent a taal from Western notation.

### Imported staff notation

Current supported production-format intake: MusicXML/MXL lead sheets.

Current PDF capability: a local research route that invokes Audiveris only if
explicit local flags are set. It is disabled in production.

### Demonstrated two-page PDF benchmark

Founder-supplied input: `שושנים עצובות תווים.pdf`, a Sibelius 7.1.3 vector
PDF. It was successfully converted into a Roman-Sargam practice PDF and the
founder confirmed the notes as accurate.

| Engine | Runtime | Result |
| --- | ---: | --- |
| PDFtoMusic Pro trial | 39.25 seconds total, one trial page at a time | 49 measures / 194 events; 0 import errors and 0 duration warnings |
| Audiveris local batch | about 60 seconds for both pages | 49 measures / 194 events; 0 import errors and 0 duration warnings |

After normalized time-unit comparison, both outputs agreed on pitch, relative
onset, duration, and tie state for all 194 events. PDFtoMusic was faster on
this vector PDF, but its personal/desktop command-line terms prohibit using it
as an automated third-party service. It remains a human-operated editorial/QA
reference only.

## 7. OMR/provider decision — updated, quality-first

The founder explicitly rejected a cheap or slow compromise. The project now
has a committed **premium technology quality standard**:

1. Audiveris is not an interactive public user path. Its runtime was too slow
   for the expected upload experience.
2. A cloud OMR provider is needed for user-uploaded PDF/photo conversion.
3. Flat OMR / Opuscan is the first preferred candidate: it documents a job
   API, progress, optional review/correction, and MusicXML/MIDI export.
4. ScoreFlow is an economical asynchronous fallback candidate, not the
   default; its public API describes queued jobs and per-credit pricing.
5. The selected provider must win a benchmark on rights-cleared examples:
   digital notation PDFs, scans, accidental-heavy material, ties, triplets,
   multiple voices, multi-page scores, Indian learning material, and phone
   captures. Record pitch/rhythm/meter accuracy, review burden, median/p95
   completion time, failure rate, cost, retention, and support quality.
6. Provider adapters must remain replaceable. The application owns MusicXML,
   validation, relative notation, practice, PDF export, and library data.

Important framing: a bespoke enterprise SaaS contract is **not** required to
prove this MVP. The practical beta route is a standard provider API account,
a small prepaid credit balance, server-side secret storage, and a controlled
rights-cleared beta. A personal desktop licence may not be used as a hidden
public service. Contract/DPA negotiation becomes relevant only with scale or
specific privacy/SLA requirements.

Relevant primary sources:

- [Flat OMR API](https://flat.io/developers/docs/api/omr/)
- [Opuscan OMR](https://www.opuscan.com/omr/)
- [ScoreFlow API](https://scoreflow.app/api-docs)
- [PDFtoMusic command-line terms](https://www.myriad-online.com/resources/docs/pdftomusicpro/english/command.htm)
- [Audiveris source/licence](https://github.com/Audiveris/audiveris)

## 8. UX and visual-design history

The founder gave repeated design feedback that the early dashboard was too
generic, boxy, flat, and visually amateur relative to Songscription. The
current implementation has been repeatedly refined toward a premium music
practice canvas:

- dark and light modes;
- serif-led headings, clean sans UI type, dedicated Devanagari PDF font;
- fewer generic dashboard cards and softer hierarchy;
- visual instrument treatments for piano, harmonium, Bansuri, guitar, and
  sitar;
- physical piano key depth and falling bars whose widths and durations are
  tied to the same note data;
- an intentionally vertical Bansuri runway for vocal/Yousician-style phrase
  following, where visual lane positions share the same geometry as the six
  displayed finger holes;
- a performance/cinema view intended for video capture;
- responsive C3-C7 keyboard with narrow-view active-key recentering.

Design debt remains. The founder explicitly considers the piano and Bansuri
visual surfaces not yet fully polished. Future design work must prioritize
clarity, proportion, instrument realism, and professional restraint over
decorative skeuomorphism or additional visual clutter.

## 9. Research incorporated into the roadmap

Competitive/product research has been documented for RiyazStudio, SurSadhak,
SwarShala, Bandish, Riyaz, Songscription, and modern guided-practice patterns.
The strategic conclusion:

- Existing Indian music apps validate demand for tanpura, tabla, lehra,
  notation, daily-practice persistence, and feedback.
- Sargam's opportunity is one connected, creator-quality workflow from song
  or score to relative notation and instrument-aware practice.
- Future phases include saved sessions, phrase looping, calibrated practice
  feedback, a rights-cleared accompaniment engine, curated raga/taal profiles,
  teacher workflows, and creator export.
- Tanpura must ultimately sound like tanpura, not harmonium. The current
  browser-generated tonic is an honest bridge; licensed samples or commissioned
  recordings are a later asset decision.

The project will not scrape free recordings from search results or reuse
YouTube/competitor content. It can build most product infrastructure without
recording musicians. Authentic public accompaniment later requires either a
commercial library with explicit SaaS/streaming/looping/export permission or a
narrow commissioned starter library plus music-advisor validation.

## 10. Deployment and repository status

- GitHub remote: `https://github.com/matanbs88/sargam-io.git`
- Vercel is connected to `main` and deploys the current project.
- Public preview: <https://sargam-io.vercel.app>
- `.env` and `.env.local` are ignored. There are no production provider,
  payment, or database credentials committed to the repository.
- Current working tree was clean after the verified closeout.

## 11. What is explicitly **not** implemented or must not be claimed

1. Live audio upload, arbitrary YouTube-link ingestion, YouTube downloading,
   live audio-to-MIDI, or live audio playback/transposition.
2. A commercial OMR provider integration, durable job queue, cloud file
   storage, job polling, or user-facing provider progress.
3. Authentication, persistent user accounts, subscriptions, payments, real
   credit balances, persistent library, rate limits, or production database
   migrations.
4. Public catalogue of third-party songs or scores.
5. Raga/shruti/ornament/taal inference, automatic grading, or authoritative
   bansuri, sitar, or guitar fingering.
6. Licensed recorded tanpura, tabla, lehra, or video export.
7. A true original-PDF staff overlay with Sargam text. The reliable first
   version must re-engrave staff from canonical MusicXML, then annotate each
   note. An original-PDF overlay is only defensible if the OMR provider returns
   reliable original-note coordinates.

## 12. Recommended launch sequence

### Stage A — now: landing and proof

Launch a focused landing page / waitlist with the real interactive mock
practice canvas. Be clear that it is a practice demo, not a claim of arbitrary
YouTube transcription. Collect only the minimum consented information needed:
email, instrument, learning level, style, and requested practice problem.

Seed **12-20 rights-cleared showcase sessions**, not copyrighted Bollywood or
Western-song transcriptions used only for SEO. A small catalogue can be
original exercises, public-domain material after a jurisdiction review,
teacher-authorized content, or participant-provided material with permission.

### Stage B — closed alpha

Invite around 20 learners to use 5-10 rights-cleared practice sessions. Measure
whether a learner completes a five-minute loop, understands Sa/notation,
returns to the session, and submits useful correction feedback. This is more
valuable than superficial waitlist volume.

### Stage C — first real conversion

1. First make MusicXML/MXL import a polished review-to-practice flow.
2. Open a small self-service Flat/Opuscan evaluation account and benchmark it
   before exposing PDF/photo intake.
3. Add provider-neutral durable jobs, storage, review status, rate/cost limits,
   and error/refund behavior.
4. Introduce user-uploaded, rights-authorized PDF/photo conversion only after
   the quality bar passes.
5. Add audio transcription later, starting with authorized file upload rather
   than public arbitrary YouTube URLs.

## 13. Technical architecture map

| Area | Key paths | Current role |
| --- | --- | --- |
| Application shell and studio | `app/layout.tsx`, `app/globals.css`, `app/page.tsx` | Client-composed practice experience and visual system |
| Core relative notation | `src/lib/midiToSargam.ts` | Pure, tested MIDI-to-Sargam formatting |
| Mock source and transport | `src/lib/mockMidiData.ts`, `src/features/practice/useMockTransport.ts`, `src/lib/playback.ts` | Deterministic phrase and bounded mock playback |
| Instrument references | `src/components/instruments/` | Keyboard, harmonium, Bansuri, guitar, sitar surfaces |
| Performance visualizers | `src/components/visualizers/` | Falling piano and Bansuri phrase visualizers |
| Rhythm/audio bridge | `src/lib/taal.ts`, `src/lib/tabla.ts`, `src/features/practice/useDigitalAccompaniment.ts` | Manual taal/theka data and generated practice audio |
| MusicXML intake | `src/server/score-import/musicXml.ts` | Typed MusicXML/MXL parse and normalization |
| Score validation | `src/server/score-import/scoreValidation.ts` | Meter/tie/parser-warning review gate |
| PDF research adapter | `src/server/score-import/localAudiveris.ts` | Explicitly local-only benchmark adapter |
| Printable output | `src/server/export/sargamPdf.ts` | Measure-aware compact Sargam PDF composition |
| Provider seam | `src/server/transcription/`, `app/api/transcriptions/` | Mock/cache contracts ready for future live provider |
| Future persistence | `db/schema.sql` | Draft PostgreSQL/Supabase tables, RLS, credit ledger |
| Quality | `*.test.ts`, `.github/workflows/ci.yml`, `scripts/repository-audit.mjs` | Unit/API tests, CI, vault audit, closeout |

## 14. Decisions that only the founder / external specialists must make

Engineering can continue autonomously on product infrastructure. These require
external authority, not more code speculation:

1. Open a small provider account and supply server-only test credentials once
   Flat/Opuscan has been chosen for a benchmark.
2. Decide the beta budget, per-user conversion allowance, and failure-credit
   policy.
3. Provide privacy/consent wording and choose Supabase before storing waitlist
   or user uploads.
4. Confirm rights policy for source PDFs, public catalogue entries, audio, and
   future creator export.
5. Engage a practitioner for named Bansuri profile validation before marketing
   fingering as definitive; later engage a music editor for raga/taal content
   and a rights reviewer for real accompaniment assets.

## 15. Exact review request to Gemini

Please respond in the following structure.

### A. Reality check

Identify any mismatch between README/product copy and real code. Flag false or
risky claims about transcription, PDF conversion, music theory, audio, rights,
or fingering.

### B. Product and launch judgement

Is the staged launch sequence appropriately narrow? What is the smallest
highest-learning private-alpha scope? Identify one proposed feature to cut or
delay if it distracts from the conversion-to-practice wedge.

### C. OMR and quality decision

Challenge or validate the Flat/Opuscan-first, ScoreFlow-fallback strategy.
Propose a concrete benchmark protocol: score corpus categories, pass/fail
metrics, review workflow, and a hard stop condition. Do not recommend
Audiveris as the public interactive default unless you can show a practical
path that meets the stated quality and speed standard.

### D. Engineering review

Review the import, validation, PDF export, provider seam, job model, data
schema, security boundaries, test coverage, and App Router structure. Return
findings as P0-P3 with exact paths and minimal safe changes.

### E. UX/music-practice review

Review whether the canvas makes Sa, note labels, timing, piano alignment,
Bansuri alignment, and the current generic-fingering disclaimer understandable.
Identify the three highest-impact visual refinements needed to make the
experience feel credible in a lesson or a social video.

### F. Ranked next sprint

Rank the next five tasks by user value, dependency, risk, and estimated
implementation size. Separate tasks that can proceed now from tasks blocked by
credentials, privacy wording, rights, or practitioner review.

## 16. Required repository references for review

Read these first:

1. `README.md`
2. `WEEKEND_SUMMARY.md`
3. `MUSIC_DOMAIN.md`
4. `INSTRUMENT_STRATEGY.md`
5. `docs/strategy/QUALITY_STANDARD.md`
6. `docs/strategy/OMR_PROVIDER_STRATEGY.md`
7. `docs/strategy/UNIFIED_SCORE_EXPERIENCE.md`
8. `docs/strategy/SCORE_IMPORT_AND_PRINT_ARCHITECTURE.md`
9. `docs/strategy/LAUNCH_STRATEGY.md`
10. `docs/strategy/RIYAZ_REPLACEMENT_ROADMAP.md`
11. `docs/strategy/COMPETITIVE_PRODUCT_RESEARCH_2026-08-16.md`
12. `docs/reviews/PRINCIPAL_REVIEW_DISPOSITION_2026-08-16.md`
13. `db/schema.sql`

Then run:

```powershell
npm.cmd run closeout
```

When reporting, distinguish clearly among: **implemented and verified**,
**implemented but local/mock-only**, **planned**, and **blocked on external
authority**.
