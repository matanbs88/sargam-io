# Sargam.io — Public-Domain Catalog and License Plan

## Decision

The first playable repertoire expansion uses compact melody studies prepared
inside Sargam.io. The app does not download, bundle, or repackage third-party
recordings or score PDFs. Each study points to a provenance page for the
underlying historical work and is marked `public-domain` in the catalog.

This gives the MVP a useful practice library while keeping the data model ready
for future licensed repertoire. It is not a blanket legal clearance for every
country or every edition of a work.

## Initial public-domain practice set

The first set contains 11 playable studies:

- Twinkle Twinkle / Ah, vous dirai-je maman — traditional melody / Mozart theme
- Ode to Joy — Beethoven, Symphony No. 9
- Für Elise — Beethoven, WoO 59
- Brahms Lullaby — Brahms, Op. 49 No. 4
- The Entertainer — Scott Joplin
- Minuet in G — Christian Petzold, formerly attributed to Bach
- Moonlight Sonata — Beethoven, Op. 27 No. 2
- Canon in D — Pachelbel
- Swan Lake — Tchaikovsky, Op. 20
- Jesu, Joy of Man's Desiring — J. S. Bach, BWV 147
- Clair de lune — Debussy, Suite bergamasque

The library also includes 12 devotional/traditional-text practice studies:

- Hanuman Chalisa; Shri Ramachandra Kripalu; Vaishnava Jana To
- Om Jai Jagdish Hare; Bhaja Govindam; Madhurashtakam
- Aigiri Nandini; Gayatri Mantra; Achyutam Keshavam
- Raghupati Raghav Raja Ram; Hare Krishna Mahamantra; Shiva Tandava Stotram

For this devotional set, the text and historical tradition are public-domain or
traditional, while the specific practice melody is an internally authored study.
The canonical melody can vary by region, sampradaya, gharana, or recording.

These are short melodic studies, not complete commercial arrangements. They
are playable on all three current guide instruments: Piano, Harmonium, and
Bansuri. Their note events are relative to Sa, so the existing transposition,
notation, playback, and PDF pipelines can be reused.

## Research references

The source pages used for provenance and score discovery are primarily IMSLP
work pages, which identify composer, publication date, and edition-level
copyright labels. Examples include [Mozart's Ah, vous dirai-je variations](https://imslp.org/wiki/12_Variations_on_%22Ah,_vous_dirai-je_maman%22,_K.265/300e_%28Mozart,_Wolfgang_Amadeus%29), [Beethoven's Für Elise](https://imslp.org/wiki/Fur_elise), [Brahms's Wiegenlied](https://imslp.org/wiki/Wiegenlied_(Brahms%2C_Johannes)), and [Joplin's The Entertainer](https://imslp.org/wiki/The_Entertainer_(Joplin%2C_Scott)).

The underlying composition and the particular modern score edition must be
treated as separate things. We use the historical work as a reference and
create our own compact event data; we do not copy an edition's engraving,
lyrics, scan, or recording.

## Recommended licensing posture

### For this MVP

1. Keep Sargam.io code, UI, catalog curation, and product metadata proprietary
   unless the founders intentionally choose an open-source license.
2. Mark the historical composition as `public-domain` only after recording the
   work, composer, source page, and territory note in the rights ledger.
3. Treat our newly authored event data as Sargam.io-owned product data. If we
   later publish a reusable notation dataset, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
   gives maximum reuse; CC BY 4.0 preserves an attribution requirement. This is
   a business choice, not a license for the underlying composition. CC0 permits
   copying, modification, distribution, performance, and commercial use, but it
   cannot clear rights held by somebody else in the underlying work or source
   edition.
4. Do not use a third-party score PDF, MusicXML file, audio recording, or
   arrangement unless its exact license permits commercial use and derivatives.
   Avoid `NC` (NonCommercial) and `ND` (NoDerivatives) licenses for product
   content.

### For future licensed songs

Ask the rightsholder for a written digital license covering: display, Sargam
conversion, transposition, interactive playback, cloud storage, PDF export,
subscription access, territories, caching, and takedowns. A general
"commercial use" label or a publication-only tariff is not enough to describe
these uses.

### For audio

Public-domain status of a composition does not clear a modern performance or
sound recording. Each piano, harmonium, bansuri, tanpura, tabla, and lehra
asset needs its own source and license record. The safest MVP implementation is
our generated guide voice or a library whose license expressly allows browser
SaaS playback and the planned distribution model.

## Release gate

Before marketing a public catalog as globally cleared, review each row for:

- composition status in the launch territories;
- source-edition and arrangement provenance;
- lyrics and translation status, if added;
- audio master and performer rights, if audio is bundled;
- export and subscription permissions;
- attribution and takedown requirements.

This document is an engineering/content decision record, not legal advice.
