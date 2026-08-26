# Score-source discovery report — 2026-08-26

## Executive summary

This report records an internet search for usable note sources for the 100-title
Sargam.io MVP catalog. It is a source-discovery ledger, not a transcription
dump. A title becomes `ready` only after a source is imported, normalized into
timed `MidiNoteEvent[]`, and reviewed against pitch, Sa, meter, tempo, and the
three notation modes.

The search found genuine coverage for a meaningful first batch:

- Web Harmonium has six directly identified interactive Sargam lessons:
  Kesariya, Tum Hi Ho, Chaleya, Pasoori, Afreen Afreen, and Tu Jhoom.
- Songbook/Song Notations advertises 225+ Sargam entries and exposes many
  titles already in our 100-title queue.
- Sargam Sikho advertises a large discovery library with Sargam, raga and
  instrument context; it is useful for finding candidates, not as an automatic
  machine-readable import.
- Multiple Indian notation sites provide direct Sargam or Western-note pages
  for high-demand titles such as Apna Bana Le, Agar Tum Saath Ho, Raabta,
  Kal Ho Naa Ho, Lag Ja Gale, Ek Pyar Ka Nagma Hai, Pehla Nasha, Om Jai
  Jagdish Hare, Achyutam Keshavam, and Hanuman Chalisa.
- The Beatles titles have a reliable commercial score path through Musicnotes;
  several titles have piano or piano/vocal arrangements with key, tempo and
  downloadable/printable score metadata.

This is enough to start a real batch-import program. It is not evidence that all
100 songs currently have one complete, structured, quality-checked source.

## Source tiers

| Tier | Meaning | Pipeline action |
| --- | --- | --- |
| `direct-web-lesson` | A page explicitly presents Sargam or instrument notes for the title | Capture URL, manually normalize notation and timing, then review |
| `catalog-discovery` | A site index/catalog identifies the title, but the exact page or full phrase coverage is not yet validated | Locate the exact page and compare against a second source |
| `commercial-score` | A paid digital score is available with identifiable arrangement metadata | Acquire only when approved, then import from the licensed score |
| `structured-score-needed` | No verified MusicXML/MXL/MIDI source was found in this pass | Search for a structured score or create an approved manual import |
| `ready-internal` | Existing original Riyaz exercise already has canonical timed events | Keep in the app; no external score is required |

## Highest-confidence first batch

These are the best candidates for the first real ingestion batch. Their sources
visibly provide note information or a playable lesson, but the pages still need
normalization: web notation commonly omits exact durations, pickup bars, rests,
ties, or phrase-level timing.

| Catalog ID | Title | Primary discovery source | Tier | Next action |
| --- | --- | --- | --- | --- |
| `tum-hi-ho` | Tum Hi Ho | [Web Harmonium catalog](https://web-harmonium.me/songs/) / [lesson](https://web-harmonium.me/songs/tum-hi-ho/) | `direct-web-lesson` | Normalize phrase timing and verify Sa |
| `kesariya` | Kesariya | [Web Harmonium](https://web-harmonium.me/songs/kesariya/) / [Sargam Notes](https://www.sargamnotes.in/kesariya-brahmastra-hindi-piano-song-notes-in-harmonium-sargam.html) | `direct-web-lesson` | Compare sources and verify Sa |
| `apna-bana-le` | Apna Bana Le | [NotationIQ](https://www.notationiq.com/apna-bana-le-bhediya-piano-notes-harmonium-sargam/) | `direct-web-lesson` | Normalize Western/Sargam spelling and rhythm |
| `channa-mereya` | Channa Mereya | [HarmoniumWeb](https://harmoniumweb.org/songs/channa-mereya) | `direct-web-lesson` | Check tivra Ma and phrase boundaries |
| `agar-tum-saath-ho` | Agar Tum Saath Ho | [Svara Collective](https://svaracollective.com/songs/agar_tum_saath_ho.html) / [Sargam reference](https://www.sangeetbook.com/agar-tum-sath-ho-song-sargam-notes/) | `direct-web-lesson` | Resolve scale variants and choose one arrangement |
| `raabta` | Raabta | [NotationIQ](https://www.notationiq.com/raabta-agent-vinod-piano-notes-harmonium-sargam/) / [Online Sangeet](https://onlinesangeet.com/raabta-sargam-notes/) | `direct-web-lesson` | Normalize octave markers and grouping |
| `kal-ho-naa-ho` | Kal Ho Naa Ho | [PianoBajao](https://pianobajao.com/kal-ho-na-ho-har-ghadi-badal-rahi-full-piano-notes/) / [Free Song Notations](https://www.freesongnotations.in/kal-ho-na-ho-song-notation-full-free/) | `direct-web-lesson` | Reconstruct measure timing |
| `lag-ja-gale` | Lag Ja Gale | [SargamKeys](https://sargamkeys.in/notes/lag-ja-gale) / [Notes & Sargam](https://notesandsargam.com/lag-ja-gale/) | `direct-web-lesson` | Preserve or explicitly simplify murki |
| `ek-pyar-ka-nagma` | Ek Pyar Ka Nagma Hai | [Free Song Notations](https://www.freesongnotations.in/ek-pyar-ka-nagma-hai-song-notations-full-free/) / [Harmonium Guru](https://harmoniumguru.in/ek-pyar-ka-nagma-hai-harmonium-notes/) | `direct-web-lesson` | Choose one Sa convention and encode bars |
| `pehla-nasha` | Pehla Nasha | [PianoBajao](https://pianobajao.com/pehla-nasha-full-piano-notes-for-hindi-song/) / [NotationHub](https://www.notationhub.com/notation/pehla-nasha-sargam-harmonium-and-flute-notes-udit-narayan-flute-harmonium-piano-notes) | `direct-web-lesson` | Verify complete melody coverage |
| `om-jai-jagdish` | Om Jai Jagdish Hare | [HarmoniumWeb](https://harmoniumweb.org/songs/om-jai-jagdish) / [Indian Raag](https://harmonium.indianraag.com/om-jai-jagdish-hare-harmonium-notes/) | `direct-web-lesson` | Compare regional variants |
| `achyutam-keshavam` | Achyutam Keshavam | [Harmonium Guru](https://harmoniumguru.in/achyutam-keshavam-harmonium-notes/) / [Notes & Sargam](https://notesandsargam.in/achyutam-keshavam/) | `direct-web-lesson` | Choose one bhajan arrangement |
| `hanuman-chalisa` | Hanuman Chalisa | [Synthesizer Notes](https://www.synthesizernotes.com/hanuman-chalisa-1-harmonium.html) / [Saras Bhajan](https://sarasbhajan.com/hanuman-chalisa-sargam-notes/) | `direct-web-lesson` | Split into phrases and validate version |
| `hare-krishna` | Hare Krishna Mahamantra | [Songbook/Song Notations](https://songnotations.vercel.app/) | `catalog-discovery` | Locate exact entry and validate timing |
| `afreen-afreen` | Afreen Afreen | [Web Harmonium](https://web-harmonium.me/songs/afreen-afreen/) | `direct-web-lesson` | Preserve 6/8 phrase accents |
| `pasoori` | Pasoori | [Web Harmonium](https://web-harmonium.me/songs/pasoori/) | `direct-web-lesson` | Preserve 6/8 hook timing |
| `tu-jhoom` | Tu Jhoom | [Web Harmonium](https://web-harmonium.me/songs/tu-jhoom/) | `direct-web-lesson` | Validate slow expressive timing |
| `chaleya` | Chaleya | [Web Harmonium](https://web-harmonium.me/songs/chaleya/) | `direct-web-lesson` | Normalize pop syncopation |

## Catalog-wide discovery matrix

The matrix below covers every planned title in the current catalog. `discovered`
means a plausible note page or practice lesson was found; it does not mean the
complete song is already an import-ready score in the repository.

### Bollywood and Indian pop

| ID | Status |
| --- | --- |
| `tum-hi-ho` | discovered |
| `kesariya` | discovered |
| `apna-bana-le` | discovered |
| `channa-mereya` | discovered |
| `agar-tum-saath-ho` | discovered |
| `kabira` | discovered |
| `kal-ho-naa-ho` | discovered |
| `ae-dil-hai-mushkil` | catalog-hit |
| `raabta` | discovered |
| `shayad` | discovered |
| `tujhe-kitna-chahne-lage` | catalog-hit |
| `hamari-adhuri-kahani` | catalog-hit |
| `muskurane` | structured-score-needed |
| `phir-bhi-tumko-chaahunga` | structured-score-needed |
| `gerua` | structured-score-needed |
| `manwa-laage` | structured-score-needed |
| `samjhawan` | catalog-hit |
| `jeena-jeena` | catalog-hit |
| `main-phir-bhi-tumko` | structured-score-needed |
| `sajni` | catalog-hit |
| `o-maahi` | structured-score-needed |
| `satranga` | structured-score-needed |
| `ranjhan` | structured-score-needed |
| `saiyaara` | structured-score-needed |
| `ishq` | structured-score-needed |
| `jo-tum-mere-ho` | structured-score-needed |
| `baarishein` | structured-score-needed |
| `gul` | structured-score-needed |
| `heeriye` | structured-score-needed |
| `sahiba` | structured-score-needed |
| `pasoori` | discovered |
| `afreen-afreen` | discovered |
| `tu-jhoom` | discovered |
| `chaleya` | discovered |
| `what-jhumka` | structured-score-needed |
| `tauba-tauba` | structured-score-needed |
| `naina` | structured-score-needed |
| `tere-vaaste` | structured-score-needed |
| `ve-kamleya` | structured-score-needed |
| `deewani-mastani` | structured-score-needed |
| `kun-faya-kun` | structured-score-needed |

### Devotional

| ID | Status |
| --- | --- |
| `om-jai-jagdish` | discovered |
| `achyutam-keshavam` | discovered |
| `raghupati-raghav` | catalog-hit |
| `vaishnav-jan-to` | catalog-hit |
| `hanuman-chalisa` | discovered |
| `shree-ram-jai-ram` | structured-score-needed |
| `hare-krishna` | catalog-hit |
| `ganesh-vandana` | structured-score-needed |
| `guru-brahma` | structured-score-needed |
| `jai-ganesh-deva` | structured-score-needed |
| `aarti-kunj-bihari` | structured-score-needed |
| `ambe-tu-hai` | structured-score-needed |
| `shri-ram-janki` | structured-score-needed |
| `sukhkarta-dukhharta` | structured-score-needed |

### Regional

| ID | Status |
| --- | --- |
| `natu-natu` | catalog-hit |
| `butta-bomma` | structured-score-needed |
| `vachinde` | structured-score-needed |
| `rowdy-baby` | structured-score-needed |
| `arabic-kuthu` | structured-score-needed |
| `vaathi-coming` | structured-score-needed |
| `munbe-vaa` | structured-score-needed |
| `apna-bana-le-bengali` | structured-score-needed |
| `malare` | structured-score-needed |
| `kadalalle` | structured-score-needed |

### Evergreen Hindi

| ID | Status |
| --- | --- |
| `lag-ja-gale` | discovered |
| `ajeeb-dastan` | catalog-hit |
| `pal-pal-dil-ke-paas` | structured-score-needed |
| `mere-sapno-ki-rani` | structured-score-needed |
| `yeh-shaam-mastani` | catalog-hit |
| `ek-pyar-ka-nagma` | discovered |
| `chura-liya-hai` | structured-score-needed |
| `kya-mujhe-pyar` | structured-score-needed |
| `zara-zara` | structured-score-needed |
| `pehla-nasha` | discovered |

### The Beatles

| ID | Status | Candidate source |
| --- | --- | --- |
| `let-it-be` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/let-it-be/MN0053244_D2) |
| `hey-jude` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/hey-jude/MN0053749) |
| `here-comes-the-sun` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/here-comes-the-sun/MN0104430) |
| `yesterday` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/yesterday/MN0061883) |
| `penny-lane` | structured-score-needed |
| `while-my-guitar-gently-weeps` | structured-score-needed |
| `drive-my-car` | structured-score-needed |
| `blackbird` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/blackbird/MN0129867) |
| `something` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/something/MN0104538) |
| `come-together` | structured-score-needed |
| `all-you-need-is-love` | structured-score-needed |
| `twist-and-shout` | structured-score-needed |
| `in-my-life` | commercial-score | [Musicnotes](https://www.musicnotes.com/sheetmusic/the-beatles/in-my-life/MN0105669) |

## Import rule

The first 18 candidates should be ingested through the existing
`attachImportedScoreToCatalog` seam. A web page must first become a normalized
score fixture with explicit pitch, duration, onset, meter, tempo, and source
metadata. If timing is not recoverable, the row stays `needs-review`; we do not
invent durations from the order of displayed syllables.

The `structured-score-needed` rows are queued for MusicXML/MXL, MIDI, an
approved score artifact, or an explicitly reviewed manual melody fixture. The
next coding step is to add source files under `content/catalog/inbox/` and run
the validator, not to paste unverified note strings into `songCatalog.ts`.

## Research-source index

- [Web Harmonium song catalog](https://web-harmonium.me/songs/) — six direct
  interactive Sargam practice lessons.
- [Songbook / Song Notations](https://songnotations.vercel.app/) — broad
  Sargam catalog with multiple notation modes and instrument context.
- [Sargam Sikho](https://www.sargamsikho.in/) — large discovery library with
  songs, ragas, instruments and practice context.
- [HarmoniumWeb songs](https://harmoniumweb.org/songs) — harmonium-oriented
  lessons and simplified practice guidance.
- [Musicnotes Beatles catalog](https://www.musicnotes.com/artists/the-beatles)
  — commercial score discovery for the Beatles set.

## Operational decision

We will report coverage in three separate numbers:

1. **Cataloged:** title record exists (100/100).
2. **Source discovered:** a plausible source page or commercial score is
   identified (the research status in this document).
3. **Playable:** canonical timed events are imported and reviewed in the app.

Only number 3 changes a song to `ready`. This keeps the library honest while
allowing research to proceed in parallel with the product build.
