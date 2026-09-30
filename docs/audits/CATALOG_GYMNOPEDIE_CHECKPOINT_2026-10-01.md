# Gymnopédie source-to-catalog checkpoint — 2026-10-01

Live verified count remains **4/100**. Do not count this implementation as a
fifth live complete edition until production discovery, runtime and PDF gates pass.

## Completed implementation

- Main agent independently read the official Mutopia LilyPond top expression.
- All 47 written bars match the independent source ledger, including pitch,
  duration and outgoing ties. Full source repeat form produces 78 performed bars.
- Local catalog implementation now contains the explicit upper voice, not an
  approximate melody or the incomplete official 47-bar MIDI. Accompaniment is
  explicitly excluded in the title/edition description.
- 128 scalar events match the independently unfolded performance ledger exactly.
  First attack is at 13 seconds; full endpoint is 234 seconds. All 16 pitches in
  the four written ending chords are retained. Repeated untied attacks remain
  separate; eight tie chains preserve their full duration.
- Corrected PDF layout silently losing all but the first simultaneous pitch.
  Cells retain per-voice onset/continuation states. Compact print brackets mark
  simultaneous notes; conventional grid print stacks voices.
- All 78 bars are present in the hydrated localhost score. No captured browser
  errors. Full instrument playback is not yet certified.
- First two-page PDF visually inspected: every bar and ending chord present,
  no clipping. Spacing refinement now fits 78 bars on one page without changing
  glyph size. Fresh one-page render visually inspected: all 78 bars and all
  bracketed ending chords present, with no overlaps or clipping. The targeted
  13 tests pass after spacing refinement.
- Before spacing refinement: typecheck, lint and 288 tests across 64 files pass.

## Pipeline diagnosis

The catalog has been progressing one manually curated piece at a time, including
source discovery and edition/form review. This is not the product's conversion
throughput. Source MIDI/MusicXML to relative Sargam is deterministic; audio
recognition and raster-score reading are distinct upstream processes. The
YouTube/audio adapter remains a labelled mock without a verified live provider.

Prefer digital source batches, machine-check pitch/time/form/measure completeness,
reuse engine regression gates, and reserve manual review for source ambiguity
and actual rendering/audio anomalies. Never replace missing evidence with an
invented familiar melody or a candidate-title count.

## Next gate

Verify ending chords in the runtime score and
all instrument playback, then deploy the catalog change and repeat public
discovery/export acceptance. Indian source acquisition remains parallel work;
Bande Mataram 1914 has no inspected score pixels and is not eligible for release.
