# Practice audio candidates — founder decision sheet

**Status:** research only. Nothing in this document is bundled, purchased, or
served by Sargam.io. The founder decides whether an asset enters the product.

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

The existing browser synthesis remains the fallback until a founder-selected
recorded pack is approved and integrated. It must not be marketed as a recorded
Tanpura or Tabla performance.

## Candidate ledger

| Candidate | What the publisher says | Product fit | Recommendation |
| --- | --- | --- | --- |
| [Luftrum Wave Pack 02](https://www.luftrum.com/flute-samples/) | 66 Bansuri samples, 24-bit WAV, advertised as “100% royalty free”. | **Promising Bansuri prototype source.** One-shots are more useful than song loops for a guide-note sampler. | Ask whether browser-served, pitch-mapped playback inside a subscription practice app is allowed; buy only after their answer is recorded. |
| [Polyend Tablas](https://polyend.com/product/tablas/) | 94 one-shots and 53 fills, 24-bit/44.1kHz, master-player recordings. Its page identifies it as a sample pack; the visible product page does not itself establish SaaS redistribution rights. | **Good creative starting material, not yet a cleared in-app instrument.** | Request a written SaaS/interactive-playback clarification before purchase. |
| [Splice — The Lab: Indian Rhythms](https://splice.com/sounds/packs/splice/the-lab-indian-rhythms/samples) | Individual Indian percussion samples; the service advertises commercial use for downloaded sounds under its terms. | Strong for prototyping theka texture and exploring bols; less ideal for a tightly controlled, consistent Tabla instrument. | Treat as an editorial/music-production license until Splice confirms interactive product playback. Do not use raw loops as the core practice metronome. |
| [LANDR Bansuri collection](https://samples.landr.com/collections/royalty-free-bansuri-samples) | A collection of loops, phrases and melodies marked royalty-free. | **Poor fit for an instrument engine.** It is useful for creative backing content, not for every-pitch response to user practice. | Do not choose as the default Bansuri sampler. Consider only for separately labelled practice backing after verifying its exact licence. |
| [Native Instruments Spotlight Collection: India](https://www.native-instruments.com/en/pricing/india/) | A multi-sampled Indian-instrument collection intended for music production. Native Instruments' standard sample licences prohibit using supplied content as another sample library or virtual instrument. | High sound-design benchmark; poor direct basis for a web sampler without a special agreement. | Use as a **quality reference only** unless Native Instruments grants a specific product licence. |
| [Suonopuro Bansuri licence](https://www.suonopuro.net/images/S_BansuriManual_EN.pdf) | Permits use in musical performance but prohibits resale, distribution, transfer, and making a sample-library product. | Clear quality candidate for a musician's own production, not automatically for Sargam's user-facing sampler. | **Do not integrate** without explicit written permission for app playback. |
| [RaagaPay](https://raagapay.in/) | Consent-logged Indian-classical corpus with a commercial development licence. | Potential future source for rights-cleared research/training or curated content, rather than a drop-in low-latency sample pack. | Contact only when the data/AI roadmap is funded; request scope, permitted derivative works, streaming and attribution terms. |
| [Freesound CC0 Tanpura candidate](https://freesound.org/people/marvman/sounds/35396/) | Listed in the project’s existing open-audio protocol as CC0; provenance must be captured at intake. | Development-quality drone candidate; a single file is not a complete premium Tanpura system. | Suitable for a short technical experiment after founder approval, not enough alone for the public premium experience. |

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
  | "tanpura.sa-pa"
  | "tanpura.sa-ma"
  | "tabla.dayan"
  | "tabla.bayan"
  | "bansuri.guide";
```

That lets us swap an approved pack without changing rhythm logic, transport,
notation, or the visual practice canvas.
