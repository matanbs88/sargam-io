# Complete repertoire continuation

Verified live count is now **3/100**, after the checks below.

## Jana Gana Mana

The full Gilbert DeBenedetti Level One score was read independently twice.
Both readings agree on all 27 measures, local F-sharps, bar 5 tie and literal
final F4. C4 is a chosen practice reference, not a proved tonic. This simplified
edition must not be advertised as the official anthem performance edition.
Ledger: `content/catalog/research/jana-gana-mana-reviewed.json`.

An automated safety review rejected registering this arrangement for release
before reuse review and runtime/PDF checks. It is not imported by the catalog,
not published and not counted. Publication needs that review resolved; other
source intake and catalog work continue independently.

## Good King Wenceslas

Source: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=905
The source explicitly declares Public Domain. Complete 17-bar soprano line,
53 notes, 68 quarter beats, 34 seconds at the printed 120 BPM, Sa reference A4.
All source MIDI onsets, pitches and durations matched in automated tests.
The source slur across different closing pitches is not treated as a tie.
All text verses reuse the full melody; accompaniment is excluded.

Local export endpoint returned HTTP 200 application/pdf. Poppler rendered one
A4 page containing all 17 bars, final tonic and wrapped credit, with no clipping.
Local Chrome shows correct title, 17 bars, 53 notes and Sa A4. Piano and harmonium
each reached Replay at 34,000 ms with final Next disabled and no reported errors.
Bansuri also reached Replay at 34,000 ms with final Next disabled and no
reported browser errors. Download score produced the PDF-ready link.
Release `61ef5f8` deployed successfully (Vercel commit status success).
Live public Library search finds the complete edition. Direct URL opens to
all 17 bars and 53 notes in readable Sargam, reference A4. Piano, harmonium
and recorded Ventus bansuri each reached Replay at 34,000 ms; final Next
disabled and no reported browser errors. This checks runtime transport and
sample loading, not subjective sound quality or expert fingering calibration.
Production Download score produced a PDF-ready link. Live export endpoint
returned HTTP 200 application/pdf; rendered one-page A4 PDF visually confirms
all 17 bars, final tonic and readable source credit without clipping.
https://sargam-io.vercel.app/?score=verified-good-king-wenceslas-complete#practice

Shared source adapter now validates declared meter rather than assuming 3/4.
New tests cover 4/4, incomplete measures, invalid durations and invalid tempo.
All 272 tests, lint and production build passed. The new candidate is locally
playable and its live acceptance gates passed. Total ready entries are 38,
including 35 old studies/exercises; only three complete source editions count.
Mehfil design and audio engine unchanged.

## Next Indian source conversion

Independent research located Sibley's explicitly public-domain 1877 second
edition of Tagore's Six Principal Ragas, appendix Songs of Jayadeva.
Exact scan, edition metadata and page routing are saved in
`content/catalog/research/jayadeva-source-intake-2026-10-01.json`.
Next candidate is Nindati-chandana / Sa virahe tava dina, printed Sohini and
Madhyamana: PDF pages 115-117. Staff includes real durations, rests, triplets
and repeats. Transcribe the full printed refrain/verse with its repeats,
explicitly label the historical strophic edition, and do not invent lyric
underlay for later stanzas or alter source pitches to fit a modern raga scale.
No new Indian source is counted complete yet.

### Source timing review and rest importer checkpoint

The independent rhythm audit found literal division lengths of
2, 4, 4, 2, 2.5, 4, 5, 5, 2.5 quarter beats in Sohini's printed refrain/verse.
Main-agent high-resolution inspection independently confirms the two-quarter
opening (dotted eighth, two thirty-seconds, four sixteenths). PDF49-50 describe
tala divisions and eight matras to a Madhyamana bar, but do not establish a
mapping that makes every printed division a full Western common-time measure.
Evidence is saved in `content/catalog/research/sohini-1877-rhythm-review.json`.
Do not pad, double all note values, or discard source boundaries to pass a
four-beat validator. The independent research-only full pitch ledger is saved
in `content/catalog/research/sohini-1877-literal-ledger.json`: 105 notes and
seven rests. No runtime or live completeness is claimed for this edition.

`verifiedMelodyEvents` now advances its cumulative clock through explicit
nullable rests without phantom pitches, including silent bars and repeats.
It validates note pair shape, rest duration and section references, and rounds
cumulative triplet time rather than accumulating rounded note lengths.
Existing three complete sources remain unchanged. The full suite passed:
62 files / 277 tests after adding 2/4 meter preservation and import tests.
TypeScript and production build passed before the final 2/4 additions; final
build validation is still required before promotion.
This is importer groundwork, not a fourth complete live song. Ending silence
is not claimed as a verified UI/export feature by this note-only adapter.

Parallel source discovery found Hymnary's traditional RAM tune for Raghupati
Raghav, declared public domain, with a complete scan in Singing the Living
Tradition (1993), p.226. The scan subsequently loaded in Chrome. The independent
research ledger is saved in `content/catalog/research/raghupati-hymnary-reviewed.json`:
20 written bars in 2/4, opening eight repeated, 28 performed bars and 33.6 seconds
at 100 BPM. Main-agent pitch cross-check, registration, export, runtime and live
acceptance gates remain unfinished. It is not counted complete. This is
independent work while the historical Sohini meter discrepancy remains under review.
https://hymnary.org/tune/ram_hindu
https://hymnary.org/hymn/SLT1993/page/226

### Raghupati registered locally - not live complete

`content/catalog/verified/raghupati-raghav.json` now declares the full upper
melody with form opening-opening-verse/refrain: 28 performed 2/4 bars, 80 onsets,
33.6 seconds at 100 BPM, reference C4. It preserves the printed final F4, local
Bb/Eb/Ab, dotted rhythm, two triplet groups and stanza-1 optional E4 ties.
No accompaniment or source image is redistributed. Registered as Devotional;
local ready count 39. Live verified count remains 3/100.

Main provisional reading and independent complete scan ledger match. Main's
fresh third-system pixel recheck could not be completed: Chrome browser 3
became unavailable; authorized direct public fetch returned a browser security
challenge. Independent reviewer reconfirmed recorded bar 13 D4-F4-F4 and
bar 14 G4-Ab4-G4 from original full-resolution observation, not a new fetch.
No browser challenge was bypassed.

New reusable catalog PDF acceptance tests compare every exported onset with
the complete played melody for all four registered verified sources. Raghupati
actual PDF handler returned 200 application/pdf; rendered local one-page output
shows all 28 bars, source/edition credit, Roman Sargam, no clipping. This is a
local artifact, not evidence of production download. Source-ledger and meter
tests pass; instrument runtime, public Library and live PDF gates remain.

Previous continuation classification: progress (rest/2/4 adapter validation and
independent source ledgers), not a completed fourth song. Current continuation
adds a full local candidate and reusable export acceptance, not placeholders.

Final local checks for this continuation: 63 test files / 283 tests passed;
TypeScript and optimized production build passed. The catalog regression test
now asserts 127 total entries, 39 locally ready and 88 planned, including the
Devotional 2/4 candidate. These inventory totals are not a completed-song count.
Next acceptance action: open `?score=verified-raghupati-raghav-complete#practice`
in available Chrome, verify full 28-bar reading and each instrument to Replay
at 33,600 ms, then promote the scoped catalog release and verify public library
discovery plus the actual production PDF. Preserve Mehfil; do not claim a
fourth live-complete piece until these gates pass.
