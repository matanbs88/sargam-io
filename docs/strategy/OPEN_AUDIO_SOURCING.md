# Open Audio Sourcing Protocol

This protocol allows Sargam.io to use genuinely open audio where it improves
the practice experience, without treating a search result as a legal or quality
guarantee.

## License gate

| Status | License / evidence | Product use |
| --- | --- | --- |
| Approved in principle | CC0 / public domain, source page retained | Commercial use, adaptation and distribution subject to provenance review |
| Approved with obligations | CC BY 4.0 or equivalent, source page retained | Commercial use with the exact required attribution in product credits |
| Not approved | CC BY-NC, unclear "free download", YouTube rip, competitor asset | Never ingest into product storage |
| Needs a custom agreement | Standard sample-pack or stock-music terms | Do not use until the licensor confirms interactive SaaS playback and asset delivery rights |

No source is accepted solely because a search page says "royalty free." The
asset page, its license, date of retrieval and source URL must be captured.

## Initial research candidates

### Tanpura

| Candidate | License asserted at source | Use decision |
| --- | --- | --- |
| [tanpura2.wav by marvman on Freesound](https://freesound.org/people/marvman/sounds/35396/) | CC0 | Candidate for a development-quality C-tonic asset. Download requires a Freesound account; capture the original page, license and file checksum at intake. |
| [Play Harmonium Online Tanpura samples](https://playharmoniumonline.com/credits/) | CC BY 4.0 asserted by the publisher | Candidate for broader tonic coverage once the exact source files and required attribution are recorded. |

Both are candidates, not yet bundled product assets. They must pass the
technical and listening checks below before being committed.

### Tabla

No open tabla library has yet passed Sargam's quality and provenance gate.
The current browser-native theka engine remains the safe production fallback.
Search results that contain generic percussion, "Indian-style" tracks or full
compositions are not automatically suitable for a tabla practice instrument.

## Intake checklist

For every adopted open file, create an entry in the future
`accompaniment_assets` registry containing:

1. Asset ID, title, author/uploader, source URL and retrieval date.
2. License URL/version, exact attribution text and evidence snapshot.
3. Original filename, MIME type, duration, sample rate, channel count and SHA-256 checksum.
4. Intended product role: drone loop, one-shot, bol, phrase, UI cue or demo.
5. Technical QA: clean loop point, no clipping, stable pitch, no accidental speech/third-party audio.
6. Musical QA: selected Sa/tempo/taal fit, audible quality on phone and headphones, and correct UI label.
7. Approval state and reviewer/date.

## Rendering rule

The product data model must refer to an abstract voice (for example,
`tanpura.primary` or `tabla.dayan`) rather than a specific file path. The
browser-native engine is the default renderer. A reviewed open or licensed
recording can replace that voice with no change to saved sessions, taal logic or
the user interface.

