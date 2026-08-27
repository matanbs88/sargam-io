# Batch 01 — high-confidence score-source intake

This batch contains 18 catalog records whose source pages were identified in
the 2026-08-26 research pass. `manifest.json` stores source metadata only; it
does not contain copied note strings or playable events.

For each item, add one reviewed source artifact using the catalog ID as the
filename, for example:

```text
tum-hi-ho.musicxml
kesariya.mxl
lag-ja-gale.mid
```

Preferred intake order:

1. MusicXML/MXL with an explicit melody part;
2. MIDI with a clearly identified melody track;
3. a clear staff-notation source that can be converted and reviewed;
4. a manually entered, source-documented melody fixture.

Each artifact must be parsed and validated before it is attached through
`attachImportedScoreToCatalog`. A web page that only displays an ordered note
string is not enough to infer exact durations, rests, ties, or measure
boundaries; those fields must be supplied by the artifact or marked for review.

Batch completion means:

- 18/18 artifacts present;
- all titles resolve to an existing catalog ID;
- every artifact produces at least one timed note event;
- selected Sa and notation modes are verified;
- Bansuri hole alignment and PDF rendering pass review;
- only then may the catalog row move from `planned` to `ready`.
