# Practice audio candidates — founder decision sheet

**Status:** research ledger, with one founder-approved exception. Salamander's
full Salamander piano manifest is now wired for on-demand browser playback with
attribution; the other candidates remain unapproved and are not served.

This is deliberately not a generic list of “royalty-free” links. For a practice
application, there is a material difference between permission to release a
song made with a sound and permission to deliver that sound interactively to
many app users. Treat the vendor's written answer on that point as the final
gate, not the label “royalty free”.

## The smallest useful starter pack

1. **Tanpura:** a loopable Sa–Pa and Sa–Ma drone in two or three useful tonic
   ranges.
2. **Tabla:** individual dayan/bayan bols plus short, clean theka loops for
   Teentaal, Dadra and Keherwa.
3. **Guide melody:** dry, sustained Bansuri and/or harmonium samples that can
   be pitch-mapped across a constrained range.

The first Harmonium browser prototype now uses the separately mapped
`harmonium` instrument from [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments).
Its repository identifies the samples as CC BY 3.0 and publishes the source
map used by the application. This is a **candidate integration** for testing,
not a final production clearance: the files should be mirrored to controlled
storage and the interactive SaaS use confirmed before launch.

The existing browser synthesis remains the fallback until a founder-selected
recorded pack is approved and integrated. It must not be marketed as a recorded
Tanpura or Tabla performance.

### Harmonium implementation note

The prototype follows the strongest interaction patterns found in the
researched browser harmonium products: keep pitch and notation controls close
to the keyboard, offer single- or double-reed voicing, and distinguish a dry
practice signal from a small room ambience. The reference products also make
clear that a harmonium voice must sustain like a free-reed instrument rather
than inherit piano-style decay:

- [Web Harmonium](https://web-harmonium.app/) documents CC0 Yale/Euterpea
  recordings, nine sampling points, reed layering, Sargam switching, and
  dry/reverb controls.
- [Play Harmonium practice workbench](https://playharmonium.com/keyboard)
  keeps Sa, reed, reverb, volume, notation, and transpose controls next to a
  full-width playable keyboard.

Sargam currently uses the open browser harmonium sample map from
`tonejs-instruments`, with the required CC BY 3.0 attribution recorded in
`docs/ATTRIBUTIONS.md`. The new reed and room controls are implemented in the
browser engine, but the asset remains a candidate until the production CDN,
attribution rendering, and final redistribution review are signed off.

## Candidate ledger

| Candidate | What the publisher says | Product fit | Recommendation |
| --- | --- | --- | --- |
| [Luftrum Wave Pack 02](https://www.luftrum.com/flute-samples/) | 66 Bansuri samples, 24-bit WAV, advertised as “100% royalty free”; the publisher's terms restrict redistribution and soundware/sample-library use. | **Quality benchmark, not a public web asset yet.** One-shots are useful for a guide-note sampler, but the published terms do not grant the required interactive-app rights. | Ask for explicit written permission for browser-served, pitch-mapped playback inside a practice app before purchase or integration. |
| [Polyend Tablas](https://polyend.com/product/tablas/) | 94 one-shots and 53 fills, 24-bit/44.1kHz, master-player recordings. Its page identifies it as a sample pack; the visible product page does not itself establish SaaS redistribution rights. | **Good creative starting material, not yet a cleared in-app instrument.** | Request a written SaaS/interactive-playback clarification before purchase. |
| [Splice — The Lab: Indian Rhythms](https://splice.com/sounds/packs/splice/the-lab-indian-rhythms/samples) | Individual Indian percussion samples; the service advertises commercial use for downloaded sounds under its terms. | Strong for prototyping theka texture and exploring bols; less ideal for a tightly controlled, consistent Tabla instrument. | Treat as an editorial/music-production license until Splice confirms interactive product playback. Do not use raw loops as the core practice metronome. |
| [LANDR Bansuri collection](https://samples.landr.com/collections/royalty-free-bansuri-samples) | A collection of loops, phrases and melodies marked royalty-free. | **Poor fit for an instrument engine.** It is useful for creative backing content, not for every-pitch response to user practice. | Do not choose as the default Bansuri sampler. Consider only for separately labelled practice backing after verifying its exact licence. |
| [Native Instruments Spotlight Collection: India](https://www.native-instruments.com/en/pricing/india/) | A multi-sampled Indian-instrument collection intended for music production. Native Instruments' standard sample licences prohibit using supplied content as another sample library or virtual instrument. | High sound-design benchmark; poor direct basis for a web sampler without a special agreement. | Use as a **quality reference only** unless Native Instruments grants a specific product licence. |
| [Suonopuro Bansuri licence](https://www.suonopuro.net/images/S_BansuriManual_EN.pdf) | Permits use in musical performance but prohibits resale, distribution, transfer, and making a sample-library product. | Clear quality candidate for a musician's own production, not automatically for Sargam's user-facing sampler. | **Do not integrate** without explicit written permission for app playback. |
| [RaagaPay](https://raagapay.in/) | Consent-logged Indian-classical corpus with a commercial development licence. | Potential future source for rights-cleared research/training or curated content, rather than a drop-in low-latency sample pack. | Contact only when the data/AI roadmap is funded; request scope, permitted derivative works, streaming and attribution terms. |
| [Freesound CC0 Tanpura candidate](https://freesound.org/people/marvman/sounds/35396/) | Listed in the project’s existing open-audio protocol as CC0; provenance must be captured at intake. | Development-quality drone candidate; a single file is not a complete premium Tanpura system. | Suitable for a short technical experiment after founder approval, not enough alone for the public premium experience. |

## Western instrument and vocal candidates

| Category | Candidate | What the published terms indicate | Recommendation |
| --- | --- | --- | --- |
| Piano | [Salamander Piano Anywhere](https://piano.usini.eu/) | The project is MIT-licensed and identifies the original piano recordings as CC BY 3.0; it includes 88 keys and 16 velocity layers. | **Founder-approved for the MVP guide subset.** Keep attribution, pin the source revision, and mirror the selected files to controlled object storage before production scale. |
| Piano | [Apple Logic/MainStage Sample Content](https://support.apple.com/en-us/101908) | Apple allows the content in original soundtracks, but prohibits standalone distribution or repackaging of individual assets. | Do not use as Sargam's web instrument. |
| Guitar | [Splice Guitar](https://splice.com/sounds/instruments/guitar/packs?sort=popularity) | Splice advertises commercial use, but its Samples Licence is for sounds incorporated into the user's own Recordings. | Good for producing backing tracks; not approved for raw interactive guitar playback without a separate permission. |
| Guitar | [LANDR Samples](https://www.landr.com/terms-of-service/) | The published licence allows samples to be used as incorporated into Recordings; it does not grant a general right to publish a playable sample bank. | Candidate for authored loops only; not the default guitar engine. |
| Vocal | [Kits.ai artist voices](https://app.kits.ai/tracks) | Commercial releases using licensed artist voices may require submission and artist approval. | Not a core MVP dependency. For Sa/Re/Ga guide syllables, use synthesis or commission a short, explicitly licensed recording rather than a voice-clone workflow. |
| Vocal | [Splice vocal samples](https://splice.com/sounds) | Commercial sample use is advertised, subject to the Samples Terms and incorporation into a Recording. | Suitable for marketing/backing content after review; not automatically suitable for a user-triggered vocal tutor. |

### Practical recommendation by product surface

- **Keyboard and pitch guide:** Salamander is the first approved real piano pack
  for the MVP guide. Keep the generated fallback and mirror the selected files
  to controlled object storage before production scale.
- **Guitar:** use MIDI/visual fretboard first. Add a sound only after finding a
  playable multi-sample pack whose author explicitly approves SaaS playback.
- **Vocal:** do not make an AI singer a dependency. Sargam syllable feedback can
  use a neutral generated tone; a human voice pack can be added later with an
  explicit performer release and app-use grant.
- **Indian instruments:** keep the earlier Bansuri/Tanpura/Tabla research as the
  priority because realistic, reusable material is harder to find than piano.

## Questions to send every supplier

Use this exact short request, before any purchase or integration:

> We are building Sargam.io, a browser-based Indian-music practice application.
> The sounds would be streamed from our controlled servers and triggered by
> users inside the app; users cannot download, export, isolate, or redistribute
> the samples. Does your licence permit this commercial SaaS/interactive
> playback use? May we pitch-map, loop, tempo-adjust, cache and mix the sounds?
> Please confirm the answer in writing and link the governing licence.

## Asset intake record

For any founder-approved asset, add a row to a private asset ledger with:

- vendor/product/file version and original URL;
- date of acquisition, purchase receipt and licence snapshot;
- written supplier answer, if required;
- original sample rate, root note, loop points and loudness;
- allowed operations (loop, pitch-map, tempo map, cache, stream);
- the exact public product surface where it is used.

## Technical integration target

The application should point to logical roles, not vendor file names:

```ts
type PracticeAudioRole =
  | "piano.guide"
  | "tanpura.sa-pa"
  | "tanpura.sa-ma"
  | "tabla.dayan"
  | "tabla.bayan"
  | "bansuri.guide";
```

## Current Bansuri test implementation

The MVP maps the logical `bansuri.guide` role to a browser-native voice in
`src/features/practice/useDigitalAccompaniment.ts`. It combines a sine
fundamental, a quiet triangle harmonic, filtered breath noise and a restrained
register-aware vibrato. This gives the practice timeline a recognizably flute-
like guide without distributing a third-party sample pack. The implementation
is deliberately behind the same logical role boundary as all future recorded
assets, so a cleared multi-sample manifest can replace it without changing the
transport, notation or visualizer code.

That lets us swap an approved pack without changing rhythm logic, transport,
notation, or the visual practice canvas.
