# Complete Minuet catalog checkpoint

Petzold's Minuet in G, BWV Anh. 114, now has a complete source-verified
unornamented upper melody. The 32 written bars are unfolded as A–A–B–B:
252 notes, 64 played bars, 192 quarter beats, 82.286 seconds at 140 BPM.
Grace notes, mordents/prall, bass and final lower chord voices are omitted
intentionally and disclosed in the edition label.

## Evidence

- Source: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=75
- LilyPond upper voice retrieved and reviewed against archived MIDI.
- Automated tests compare all 126 principal source pitches and durations,
  correcting only the grace note's borrowing from the preceding eighth note.
- Local Chrome opened `/living-score?score=verified-minuet-g-complete#practice`:
  correct title, edition, Sa G4, all 64 bars and 252 notes appeared in the DOM.
- Download score displayed a PDF-ready link. A browser helper download timed
  out; direct export through the same local API returned HTTP 200 PDF.
  Poppler rendered the complete one-page A4 score and visual inspection
  confirmed bars 1 through 64 with no clipping or omitted final section.
- Production Chrome library search finds the complete edition separately from
  the old study. Opening displays 64 bars and 252 notes, Sa G4.
- Piano, harmonium and recorded Ventus bansuri each reached Replay at 82,286 ms,
  final-note navigation disabled. No reported browser errors. This verifies
  runtime loading/transport, not a subjective sound-quality rating.
- Production Download score displays a PDF-ready link; direct production export
  returns HTTP 200 application/pdf. Poppler visual inspection confirms all 64
  bars on one A4 page, including final tonic with no clipping.
- All 267 tests across 62 files passed, as did lint, repository audit and build.
- Catalog release `0e3552d` pushed to main/dev/preview and verified live.
  No Mehfil design or audio engine replacement.

## Remaining acceptance gates

Minuet acceptance gates passed October 1:
https://sargam-io.vercel.app/?score=verified-minuet-g-complete#practice
Silent Night is now locally source-reviewed: all 22 explicit melody measures
plus upper tonic in the 23rd closing chord, 69 seconds. Every melodic onset,
pitch and duration matches archived source MIDI. No highest-note heuristic.
Credit and CC BY-SA 2.0 license retained. Release `c0f1792` is deployed (Vercel
commit status success). Production Chrome library search finds this complete
edition. Piano, harmonium and recorded Ventus bansuri each reached Replay at
69,000 ms, with no reported browser errors. Download score produced the ready
link; direct production API returned HTTP 200 application/pdf. Poppler visual
inspection confirms all 23 bars and closing tonic on one A4 page, with readable
edition attribution and no clipping. **Silent Night live acceptance passed.**
https://sargam-io.vercel.app/?score=verified-silent-night-complete#practice

The catalog now has 37 locally ready items including two complete source editions;
the older 35 studies/exercises are not newly verified complete pieces.
New live-complete count is **2/100**, not 37/100. The full goal stays active.

## Next continuation

- Jana Gana Mana full score found at
  https://www.gmajormusictheory.org/Freebies/Level1/1India/1India.pdf.
  Downloaded source page rendered and inspected; no MIDI link on detail page.
  It is not converted or counted yet. Preserve written durations and tied notes.
- Sangeet research agent completed: XML contains pitches/grid but lacks explicit
  rhythm, lyrics and reliable matched scan. See Indian intake report. Do not
  count its 116 files as 116 complete songs or assign guessed dash semantics.
- Amazing Grace source review recorded separately: 9/8, pickup/end partial bars
  and grace groups. Do not force it into the 3/4 adapter.
- 269 tests, lint, repository audit and production build passed for `c0f1792`.
- Existing 30-minute catalog heartbeat is configured ACTIVE and its prompt matches
  this goal. Configuration does not establish that a subsequent run occurred.
