# Score recognition provider strategy

## Product decision

Sargam conversion begins **after** notation has become structured data. The
relative-pitch conversion and Sargam layout are deterministic and fast. The
slow, uncertain work is optical music recognition (OMR): identifying staff
lines, clefs, key signatures, note heads, accidentals, beams, rests, ties,
voices, and measure boundaries from a rendered page.

The product therefore uses a three-lane intake model.

| Input | Provider lane | Expected behavior | Production status |
| --- | --- | --- | --- |
| MusicXML/MXL | Native parser | Immediate, measure-preserving import | Implemented at `POST /api/imports/musicxml` |
| Digital vector PDF from notation software | Commercial OMR job API | Fast worker job, export MusicXML, run validation | Preferred candidate: Flat OMR / Opuscan; self-service evaluation first |
| Scanned/photo PDF | Commercial OMR job API plus review | Asynchronous job, never auto-publish | Preferred candidate: Flat OMR / Opuscan; benchmark required |

## Why not infer the answer from the PDF directly?

The time signature does define the expected capacity of a measure, but it does
not reveal which visual mark is a note, how many flags it has, whether an
accidental applies, which voice owns a note, or whether a horizontal line is a
tie, slur, beam, lyric underline, or staff artifact. Key signatures describe
the Western source context; they do not choose a performer’s Sa or identify a
raga or taal.

Once MusicXML exists, Sargam.io does exactly the simple deterministic work:

`MusicXML pitch + selected Sa -> relative interval -> Sargam token`

`MusicXML start + duration + meter -> measure grid + sustain cells`

## Candidate providers and license boundary

### Preferred production candidate: Flat OMR / Opuscan (Tutteo)

Flat's documented OMR Jobs API accepts a PDF or photo, supports an optional
review/correction step, exposes progress, and exports MusicXML or MIDI. It is
the strongest current fit for a Sargam.io user-facing workflow because it
matches our review-first quality gate rather than pretending score recognition
is instantaneous or infallible. The API is still marked Beta, bills per page,
and keeps files/results for 30 days by default. Start through its standard
self-service account and credits; a bespoke enterprise agreement is not a
prerequisite for the closed beta. Production adoption still requires an
India-specific benchmark, a provider fallback, and an explicit check that the
selected retention/settings fit the beta promise.

### Secondary commercial candidate: ScoreFlow

ScoreFlow documents an asynchronous PDF-to-MusicXML API with status polling,
downloadable output, and public credit pricing. It is a useful lower-cost
fallback candidate, but it has not yet passed our source-score benchmark or
commercial/security review.

- **PDFtoMusic Pro** is the first evaluation candidate for digital-native PDFs.
  Its vendor documents analysis of PDF graphic objects and batch/MusicXML
  export. It cannot help an image-only scanned PDF.
- **Soundslice, PhotoScore Ultimate, ScanScore, and SmartScore** are strong
  end-user scanning products with MusicXML export and correction tools. No
  public server API/redistributable worker license has been approved for this
  product, so they are benchmark and editorial-tool candidates, not embedded
  SaaS dependencies.
- **Audiveris** and **homr** are useful local benchmarks but AGPL-licensed.
  Audiveris is too slow for the interactive user path measured below. It is a
  development and recovery tool, not the public primary provider. Any future
  network deployment must include the required source offer and notices.

## Local benchmark: `Shoshanim Atsuvot` (2026-08-16)

The supplied two-page PDF identifies itself as a **Sibelius 7.1.3** export,
so it is a digital vector score, not a scan. This is the ideal case for a
vector-PDF reader and a deliberately unfair workload for image OMR.

| Engine | Runtime | Structured output | Import validation | Notes |
| --- | ---: | --- | --- | --- |
| PDFtoMusic Pro trial | 23.04 s (page 1) + 16.21 s (page 2) | 49 measures, 194 events | 0 errors, 0 duration warnings | Trial exports one page per operation; page 2 restarts bar numbers and omits repeated meter metadata. |
| Audiveris local batch | about 60 s (both pages) | 49 measures, 194 events | 0 errors, 0 duration warnings | Image OMR; slower because it rasterizes and recognises notation from pixels. |

The two outputs were compared after normalising their different MusicXML
division units. Pitch, relative onset, relative duration, and tie state agreed
for **all 194 events**. PDFtoMusic reported seven multiple-voice review hints;
Audiveris reported none. Neither engine should auto-publish a score without
the existing review gate.

### Decision from this benchmark

1. **Fastest lawful product path today:** ask for MusicXML/MXL first. It is
   already accepted natively and avoids recognition entirely.
2. **Best local tool for a vector PDF:** PDFtoMusic Pro was faster on this
   score and produced musically equivalent data. Keep it as an internal,
   human-operated research/editorial tool only.
3. **Not a SaaS dependency yet:** the vendor's command-line documentation
   says automated use for the benefit of a third party is prohibited. A
   commercial redistribution/worker agreement from Myriad is required before
   it can process customer uploads. Do not treat a personal licence as such an
   agreement.
4. **Scan/photo fallback:** keep it asynchronous and review-required. It
   needs a separate commercial provider decision; local AGPL tools remain
   benchmarks only.

## Non-negotiable quality standard

Sargam.io will not select a recognition engine because it is free, locally
convenient, or merely produces *some* MusicXML. The selected engine must be
the best performer on our rights-cleared score corpus for the user journey it
serves.

1. **No interactive Audiveris path.** A local OMR result taking about a minute
   for two clean pages is unacceptable for the product's main upload flow.
2. **Commercial cloud OMR is the primary path.** Flat OMR / Opuscan is the
   first candidate because of its structured-job API, MusicXML output, progress
   states, and in-context recognition model. ScoreFlow is retained only as an
   economical fallback candidate; it must not become the default merely on
   price.
3. **Ship only after an evidence-based bake-off.** For each supplier, run the
   same benchmark and record accuracy, correction burden, median and p95 job
   time, failure rate, cost, retention, and support quality. A provider that
   materially damages pitch or rhythm cannot ship, even if it is cheaper.
4. **Honest quality gates.** Clean vector scores must meet the launch accuracy
   target set from the benchmark; scans, dense polyphony, and low-confidence
   output must enter the Review Studio rather than be silently published.
5. **Provider-neutral architecture.** The application owns the canonical
   MusicXML, validation, Sargam conversion, practice canvas, and printable
   notation. A provider can be changed without rewriting the product.

Sources: [PDFtoMusic Pro product page](https://myriad-online.com/en/products/pdftomusicpro.htm),
[PDFtoMusic Pro command-line terms](https://www.myriad-online.com/resources/docs/pdftomusicpro/english/command.htm),
and [Audiveris documentation](https://audiveris.github.io/audiveris/),
[Flat OMR API](https://flat.io/developers/docs/api/omr/), and
[ScoreFlow API](https://scoreflow.app/api-docs).

## Quality gate

`validateImportedScore()` runs after every structured import. It verifies
measure duration against the declared meter, malformed ties, and parser
warnings such as multiple voices. It returns `ready` or `review-required`.
The gate never guesses a raga, taal, Sa, ornament, or fingering.

## Evaluation needed before choosing a paid provider

Build a rights-cleared benchmark of at least 100 scores across clean digital
PDFs, scans, multi-page melodies, accidentals, ties, triplets, and multiple
voices. Compare exact note onset/duration accuracy, key/meter accuracy,
runtime, cost per page, export rights, data retention, and API/worker terms.
Only then choose the production PDF provider.
