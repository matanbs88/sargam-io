# Oats and Beans complete melody acceptance

## Source and declared scope

Complete ten-bar singer voice from English County Songs, arranged L. E.
Broadwood, 1893, typeset by Nigel Holmes, Mutopia-2006/12/21-888. All 38
pitch/onset/duration intervals independently match the official MIDI. The main
agent read the complete official LilyPond source and reviewed the inherited
relative pitches and durations. Piano accompaniment is excluded. All three lyric
stanzas share one written musical setting; no extra stanza loops were inferred.

6/8 source meter is preserved. Export eighth=200 equals quarter=100, not
dotted-quarter=100. Ten bars contain 30 quarter beats, lasting 18,000 ms.
Provenance and MIDI checksum are saved in the verified JSON and batch 2 research.

## Local acceptance passed

- 318 tests in 68 files; lint and production build passed.
- Isolated production-build QA server at localhost:3025 preserves existing
  local servers. All ten bars open immediately in Sargam.
- Actual Chrome piano, harmonium and bansuri each reach Replay at 18,000 ms
  after playback from zero at 1x, with empty captured error lists.
- The same practice-download payload passed the complete-note preservation
  test. Its one-page A4 PDF was rendered and visually inspected, including the
  final partner cadence and source credit; no clipping or overlapping glyphs.

## Remaining production gates

The live verified count remains **7/100**. This source-reviewed eighth candidate
does not count until deployment, live Library discovery, complete Sargam,
all-instrument playback and production PDF download are verified. No design or
Sa behavior changes are included.
