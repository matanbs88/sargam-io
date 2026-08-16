# Score recognition provider strategy

## Product decision

Sargam conversion begins **after** notation has become structured data. The
relative-pitch conversion and Sargam layout are deterministic and fast. The
slow, uncertain work is optical music recognition (OMR): identifying staff
lines, clefs, key signatures, note heads, accidentals, beams, rests, ties,
voices, and measure boundaries from a rendered page.

The product therefore uses a three-lane intake model.

| Input | Provider lane | Expected behavior | Production status |
| --- | --- | --- | --- |
| MusicXML/MXL | Native parser | Immediate, measure-preserving import | Implemented at `POST /api/imports/musicxml` |
| Digital vector PDF from notation software | Licensed vector-PDF converter | Fast worker job, export MusicXML, run validation | Candidate: PDFtoMusic Pro; license and CLI evaluation required |
| Scanned/photo PDF | OMR provider plus review | Asynchronous job, never auto-publish | Local Audiveris evaluation only |

## Why not infer the answer from the PDF directly?

The time signature does define the expected capacity of a measure, but it does
not reveal which visual mark is a note, how many flags it has, whether an
accidental applies, which voice owns a note, or whether a horizontal line is a
tie, slur, beam, lyric underline, or staff artifact. Key signatures describe
the Western source context; they do not choose a performer’s Sa or identify a
raga or taal.

Once MusicXML exists, Sargam.io does exactly the simple deterministic work:

`MusicXML pitch + selected Sa -> relative interval -> Sargam token`

`MusicXML start + duration + meter -> measure grid + sustain cells`

## Candidate providers and license boundary

- **PDFtoMusic Pro** is the first evaluation candidate for digital-native PDFs.
  Its vendor documents analysis of PDF graphic objects and batch/MusicXML
  export. It cannot help an image-only scanned PDF.
- **Soundslice, PhotoScore Ultimate, ScanScore, and SmartScore** are strong
  end-user scanning products with MusicXML export and correction tools. No
  public server API/redistributable worker license has been approved for this
  product, so they are benchmark and editorial-tool candidates, not embedded
  SaaS dependencies.
- **Audiveris** and **homr** are useful local benchmarks but AGPL-licensed.
  Do not deploy either as a public Sargam.io service without legal review of
  the complete network-service obligations.

## Quality gate

`validateImportedScore()` runs after every structured import. It verifies
measure duration against the declared meter, malformed ties, and parser
warnings such as multiple voices. It returns `ready` or `review-required`.
The gate never guesses a raga, taal, Sa, ornament, or fingering.

## Evaluation needed before choosing a paid provider

Build a rights-cleared benchmark of at least 100 scores across clean digital
PDFs, scans, multi-page melodies, accidentals, ties, triplets, and multiple
voices. Compare exact note onset/duration accuracy, key/meter accuracy,
runtime, cost per page, export rights, data retention, and API/worker terms.
Only then choose the production PDF provider.
