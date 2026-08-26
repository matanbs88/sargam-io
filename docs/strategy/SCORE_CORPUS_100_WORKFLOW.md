# 100-song score corpus workflow

## Purpose

The product has two user-facing ways to create Sargam:

1. audio entered by a user and processed through the transcription path;
2. a prepared score corpus that gives the library depth immediately.

The corpus is a product-data pipeline, not a replacement for audio
transcription. It lets the team prepare many songs in advance from existing
MusicXML, MIDI, PDF, or staff-notation sources.

## Canonical flow

```text
source score
  -> MusicXML/MIDI parser or PDF/OMR adapter
  -> imported score validation
  -> human review of pitch, rhythm, Sa and title
  -> attachImportedScoreToCatalog(...)
  -> canonical noteEvents + metadata
  -> Sargam / ABC / Devanagari views
  -> Piano / Harmonium / Bansuri practice
  -> PDF export
```

## Status model

| Status | Meaning | Practice action |
| --- | --- | --- |
| `planned` | Catalog title exists, source score still needs to be added | Visible in library; queued for corpus work |
| `review` | Score was imported but needs a human check | Opens only after review workflow is connected |
| `ready` | Canonical note events and timing are present | Practice, visualize and export |

The title list is not treated as note data. A song becomes playable when a
real score or transcription is attached. The system must never fabricate a
melody to fill a catalog card.

## Required record for each of the 100 songs

- stable catalog ID and title;
- artist/source label and language;
- source file reference and format;
- detected or selected Western key and `rootMidi`/Sa;
- time signature, tempo and measure boundaries;
- canonical timed note events;
- validation warnings and reviewer status;
- notation output in Latin Sargam, ABC and Devanagari;
- supported practice instruments;
- generated PDF preview.

## Batch order

1. Complete the first 12 highest-demand titles with MusicXML/MIDI or clear
   staff notation.
2. Add the remaining Bollywood and devotional titles.
3. Add regional Indian titles.
4. Add the Beatles set.
5. Run a final batch QA: note count, timing, Sa transposition, all three
   notation modes, three instrument views and PDF rendering.

## Code seam

`src/lib/songCatalog.ts` owns the catalog record and exports
`attachImportedScoreToCatalog`. The function accepts a validated imported
practice score and turns it into canonical catalog data without duplicating
the Sargam conversion engine. The existing MusicXML parser and PDF route feed
this seam.

## Current state

The catalog contains 100 title records. Twelve are playable Riyaz originals.
The remaining 88 are queued records awaiting real score inputs. The next
engineering step is to ingest source files in batches and commit the resulting
canonical score fixtures under the corpus workflow, not to manufacture notes
from titles alone.
