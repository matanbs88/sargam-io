# Score import and printable Sargam architecture

## What is live now

The practice studio exports a paginated, printable **measure-aware Sargam**
PDF. The selected root is declared as Sa, durations become a starting swara
followed by sustain hyphens, rests remain silent cells, and the grid preserves
the source measure boundaries instead of grouping an arbitrary number of
notes. It supports Latin Sargam and Devanagari Bhatkhande output with an
embedded Noto Sans Devanagari font (SIL OFL 1.1; its license is kept alongside
the font in `src/server/export/fonts/`).

The print renderer has two honest modes:

1. **Meter mode** is the default for imported Western notation. It prints the
   actual source meter, such as 3/4, and explicitly says that no taal or raga
   was inferred.
2. **Bhatkhande grid mode** adds `x` (Sam), `0` (Khali), and vibhag dividers
   only if editorial input supplies vibhag lengths that exactly match the
   printed rhythmic grid. A name such as "Teentaal" alone is never enough to
   fabricate this structure.

## Current import seam

`src/server/score-import/musicXml.ts` now imports single-part MusicXML and MXL
lead sheets into typed measures, events, rests, durations, ties, key metadata,
and time signature. It then maps a selected MIDI Sa to Sargam without changing
the source rhythm. This is portable server code and is the first production
import format.

For local evaluation only, `POST /api/imports/score-pdf` can run a locally
installed Audiveris executable when both `SARGAM_LOCAL_OMR_ENABLED=true` and
`AUDIVERIS_BIN` are set. It does not persist the source upload, returns a
review draft, and is deliberately disabled by default. Do not enable that
route on the public deployment: Audiveris is AGPL, and a public service needs
a reviewed licensing/compliance decision or a replacement provider.

## The correct import pipeline

`staff PDF -> MusicXML -> normalized note events -> Sargam conversion ->
editor review -> searchable score record -> printable PDF`

MusicXML is the interchange format. It preserves pitch, duration, measures,
time signature, ties, and many written annotations in a way an image/PDF does
not. The Sargam engine must receive normalized note events rather than raw OCR
text.

## Intake modes

1. **MusicXML upload (first production import):** deterministic and lowest
   risk. Parse the file, show a review editor, then publish a private draft.
2. **Digital staff PDF:** run an optical-music-recognition job that produces
   MusicXML, retain confidence and source-page references, and require review.
3. **Scanned or handwritten PDF:** accept only as a draft candidate. Require
   manual correction before it can be saved to the public catalog.

No importer should infer a raga, taal, microtonal shruti, stylistic
ornamentation, or a definitive instrument fingering solely from staff notation.

## Catalog record needed before public launch

Each published score needs a stable ID, title, composer/rights metadata,
source type, MusicXML source, normalized event sequence, selected/default Sa,
time signature, tempo, taal only when editorially set, conversion version,
confidence/review status, and a generated PDF location. The public catalog
must only expose records with `review_status = approved` and verified rights.

## First validation exercise

When a user attaches a score PDF, classify it as digital or scanned, extract or
create an intermediate MusicXML draft, map its pitches to the user-selected Sa,
and return a clearly marked review PDF. This validation exercise does not make
the file public and does not establish ownership rights.
