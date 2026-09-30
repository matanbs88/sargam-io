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
- Fresh Chrome on the Mehfil root displayed the same complete score. Piano
  and harmonium passed sample loading and advanced playback to 50 and 35
  seconds respectively. Bansuri runtime verification is in progress.
- All 267 tests across 62 files passed, as did lint, repository audit and build.
- No Mehfil design or audio engine edits; no deployment in this checkpoint.

## Remaining acceptance gates

Recover browser inventory, inspect the PDF including its final bar, and
exercise piano, harmonium and bansuri playback. Then promote the catalog-only
change through the release workflow and verify discovery, complete score,
playback and PDF on production. Live verification flags remain false.

The catalog now has 36 locally ready items including this complete edition;
the older 35 studies/exercises are not newly verified complete pieces.
New live-complete count remains zero. The full 100-piece goal stays active.
