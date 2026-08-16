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

## Partner API candidate: Epidemic Sound

[Epidemic Sound's Partner API](https://developers.epidemicsound.com/) is a
potential future provider for creator-facing music features. Its public Scale
plan describes commercial application use and sublicensing for end users; its
free API tier is evaluation-only and is not permitted to go live. Their ordinary
single-track license specifically forbids a standalone music-listening
experience, so a normal creator subscription must never be used as Sargam's
Tanpura or Tabla source.

Epidemic is therefore a possible provider for a future catalog, background
soundtrack and user-created video workflow — not an automatic replacement for a
purpose-built Indian accompaniment library. Before any integration, get written
answers to all of these questions:

1. Can a user trigger a selected track, stem or loop inside a practice session
   where audio is a central product feature?
2. May Sargam loop, tempo-adjust, trim, mix and cache the supplied audio?
3. Does the contract cover the entire intended user base, streaming geography,
   offline caching and creator-video export?
4. Does the catalog include separately licensable Tanpura/Tabla assets with the
   needed tonal/tempo metadata, rather than only complete Indian-classical
   tracks?
5. Can Sargam persist asset IDs and user selections while fetching playable
   content only through the permitted API flow?

## Rejected for interactive instrument playback: LANDR Samples

[LANDR's Bansuri collection](https://samples.landr.com/collections/royalty-free-bansuri-samples)
may be useful to produce a finished promotional video or an exported soundtrack.
It cannot be used as the playable Bansuri voice inside Sargam. LANDR's Samples
License restricts samples to incorporation in a finished recording and expressly
prohibits standalone use, loops and use in a synthesizer, virtual instrument,
sample library, sample-based product or other musical instrument.

Status: **do not ingest for interactive playback**. Re-evaluate only if LANDR
offers a separate written platform/OEM license for this use case.

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
