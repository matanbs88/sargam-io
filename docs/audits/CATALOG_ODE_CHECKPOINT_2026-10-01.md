# Complete Ode to Joy hymn melody — acceptance checkpoint

## Source

Mutopia-2009/08/05-528, Peter Chubb. Complete explicitly named soprano voice,
16 measures in 4/4 at 100 BPM, 62 attacks, 38,400 ms. Written source and all
MIDI pitch/onset/duration matches recorded in `content/catalog/research/ode-to-joy-reviewed.json`.
The literal D4 in bar 12 remains intact. Accompaniment is excluded. This is the
complete hymn tune setting, not the full symphony.

## Local acceptance passed

- Full suite: 313 tests in 67 files; lint and production build passed.
- Shared audio-clock scheduling tests cover all events at 0.5x, 1x and 2x.
- Actual Chrome score opens to complete 16-bar Sargam, 62 notes.
- Piano, harmonium, bansuri each played from zero at 1x to Replay at 38,400 ms;
  all captured error lists empty. Runtime proof does not establish expert sample
  listening quality.
- Same practice PDF payload preserves all note attacks. Compact A4 PDF generated
  and full page visually inspected: 16 bars, credit, no clipped/overlapping glyphs.

## Historical predeployment gate

Count remains **6/100** until release success, public Library discovery, immediate
full Sargam, actual all-instrument playback and production PDF/download are verified.
Local catalog now contains 42 ready entries (35 older studies plus seven source
reviewed complete pieces), 88 planned; 130 total entries. No design changes.

## Production acceptance passed

Release `0d3315f` is public. Fresh Chrome checks on 2026-10-01 found the complete
hymn setting through public Library search, separately from the older theme study.
Opening it displays 16 bars and 62 notes with G4 as the source reference.

- Piano, harmonium and bansuri each ran from zero at 1x to Replay at 38,400 ms.
  All three captured browser error lists were empty.
- Production Download score completed and displayed the generated-score link.
- Live export returned HTTP 200 application/pdf, 67,793 bytes. The rendered
  single-page A4 PDF shows every bar, source credit and the literal lower Pa
  in bar 12, without clipping or overlapping glyphs.
- Screenshot: `tmp/catalog-proof/ode-to-joy-live.jpg`.
- Export proof: `output/pdf/catalog-qa/ode-to-joy-live.pdf`.

The live verified total is now **7/100**. Public ready entries: 42; older studies
remain excluded from the verified-complete count. This is the complete source
hymn soprano, not the complete Beethoven symphony. Runtime acceptance does not
claim expert listening quality or universal physical-flute fingering calibration.
