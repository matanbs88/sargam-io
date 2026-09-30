# Sargam.io catalog and content plan

**Status (2026-09-16):** 123 catalog records, 35 playable studies/exercises and
88 planned titles. `src/lib/practiceCatalog.ts` is the single catalog composition
point; the Living Score preview must use it rather than selecting partial sets.

## What is in the product now

The library now includes a separate 11-title public-domain practice set in
`src/lib/publicDomainCatalog.ts`. These are compact, internally authored melody
studies with provenance links, playable on Piano, Harmonium, and Bansuri. The
original 100-entry demand queue remains unchanged so its batch-import contract
and corpus tracking stay stable.

`src/lib/songCatalog.ts` contains exactly 100 unique entries:

- 12 original Riyaz exercises are playable immediately and can flow through
  the existing practice timeline and Sargam PDF export.
- 88 popular repertoire entries are searchable and categorized across Hindi
  Bollywood, devotional, Indian pop, regional music, evergreen Hindi songs,
  and The Beatles.
- Repertoire titles are marked `planned` and do not ship a guessed
  transcription. This includes Beatles titles, current Bollywood releases,
  and any traditional arrangement whose jurisdictional status has not been
  verified.
- The additional 11 classical studies and 12 devotional/traditional-text studies
  live outside that 100-entry queue and join through `practiceCatalog.ts`.
- Records carry provenance and launch metadata; playable status requires actual
  note data. A listed title alone is not a completed transcription.

## Why the catalog carries launch metadata

Current market signals support prioritizing harmonium and Sargam learners:

- [Spotify India](https://open.spotify.com/popular/in) exposes current India
  charts and popular albums as a live demand signal.
- [Web Harmonium song notes](https://harmoniumweb.org/songs) and its related
  catalog show that learners actively search for Bollywood, devotional, and
  Sargam-formatted melodies.
- [The Beatles official song catalog](https://www.thebeatles.com/songs) and
  [Official Charts' Beatles streaming list](https://www.officialcharts.com/chart-news/the-official-top-40-most-streamed-the-beatles-songs-in-the-uk-revealed/)
  justify Beatles as a global demand segment, not as a free transcription
  source.

Popularity is a prioritization signal for the MVP content queue. A title
becomes `ready` in the product when valid note events are available through
the content pipeline. The separate launch review will later decide which
records are selected for public/commercial publication:

1. The score or transcription is valid and reviewed for musical quality.
2. The source and arrangement metadata are recorded.
3. Before public/commercial release, the founder selects the final content
   set and completes the required launch review.

## Next content tranche

Before public alpha, convert 12–20 entries into polished showcase sessions.
Prefer teacher-authored alankars, original short melodies, and explicitly
licensed arrangements. Each session needs source provenance, attribution,
MusicXML/events, Sa, tempo, taal, instrument profile, review status, and a
vertical-capture QA pass.

The local preview already promotes five original sessions through the
showcase registry in
[`SHOWCASE_RIGHTS_LEDGER.md`](./SHOWCASE_RIGHTS_LEDGER.md). The remaining
showcase tranche should be added only after the same provenance and attribution
fields are completed.

## Product behavior

The transcription-first home and the library are separate entry points under
the [current product contract](./TRANSCRIPTION_FIRST_PRODUCT_CONTRACT.md).
The preview library uses compact rows with search, collection/level filters,
title/tempo sorting and 20 results per page. All 35 ready records open the shared
practice/PDF workspace. The 88 planned titles remain content-pipeline work,
not nonfunctional playback buttons. Future converted scores enter the growing
library through explicit review/save and publication workflows. At scale, move
metadata queries to the server and fetch note timelines on demand.
