# Complete Hark! The Herald Angels Sing — local acceptance

## Count and scope

Live verified count remains **4/100**. This piece is source-reviewed and locally
accepted, not yet production-verified. Gymnopedie also awaits production gates.
Local catalog now has 129 entries, 41 ready (35 older studies plus six new
source-reviewed pieces), and 88 planned. No production design changes.

## Source and independent confirmation

Official Mutopia edition 1261, Steve Dunlop, 2008/01/13. Full named Soprano voice
read directly from the official LilyPond file. F major, 4/4, 20 complete measures,
76 attacks, 80 quarter beats. All 76 source pitch/onset/duration tuples independently
matched to official MIDI bytes, SHA256:
`0e8cbffa0a338e1df93110256d8968b2fd807355151c5130733aa15b1365cc61`.
This is the complete written hymn melody, not the complete orchestral composition.
Accompaniment is explicitly excluded; no stanza repetition is invented.
Source specifies quarter=115; old MIDI exports quarter=60. Practice retains
written 115 BPM and ends at 41,739 ms. F4 is an editable practice Sa.

## Passed checks

- Full suite: 308 tests, 66 files; lint and TypeScript passed.
- Production build passed.
- Actual localhost Chrome score opens directly to all 20 Sargam bars, 76 notes.
- At 1x, piano, harmonium and bansuri each reached Replay at 41,739 ms;
  captured browser error lists were empty. This is runtime acceptance, not a
  claim of expert acoustic assessment.
- PDF route tests preserve all attack pitches; generated compact A4 PDF rendered
  as one page and visually inspected: complete 20 bars, attribution, no clipping.
- Screenshot: `tmp/catalog-proof/hark-local.jpg`.
- PDF: `output/pdf/catalog-qa/verified-hark-herald-complete.pdf`.

## Next concrete release gates

Commit reviewed catalog changes, then verify the new release deployment, live
Library discovery, immediate complete Sargam, all three playback paths and the
actual production PDF. Only then increment live-complete count. Previous
Gymnopedie playback tabs were no longer present after turn cleanup; their missing
handles do not establish full-play completion. Re-run its pending runtime gate.

## Next intake batch

Research-only five-piece world ledger now contains exact named-voice source events
and independent MIDI checks. Indian batch contains several promising Tagore
sources, but unresolved form/provenance details remain explicitly recorded.
Neither research candidates nor local-ready entries count as live-complete.
