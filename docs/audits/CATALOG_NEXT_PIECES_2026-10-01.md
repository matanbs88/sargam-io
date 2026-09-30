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
