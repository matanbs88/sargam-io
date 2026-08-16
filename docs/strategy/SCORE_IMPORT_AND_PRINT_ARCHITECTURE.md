# Score import and printable Sargam architecture

## What is live now

The practice studio can export its current MIDI event sequence as a paginated,
printable **Latin Sargam** PDF. It is deliberately a relative-practice sheet:
the selected root is declared as Sa, notes use the canonical `S r R g G m M P
d D n N` token system, and octave markers are preserved. The export also
states the selected taal, tempo, and time signature.

Devanagari PDF export is deferred until the server bundle carries a reviewed,
licensed Unicode font. Standard built-in PDF fonts cannot accurately typeset
the required Devanagari combining marks.

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

No importer should infer a raga, microtonal shruti, stylistic ornamentation,
or a definitive instrument fingering solely from staff notation.

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
