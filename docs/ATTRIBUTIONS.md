# Sargam.io third-party attributions

## Salamander Grand Piano V3

The keyboard guide sound uses the **Salamander Grand Piano V3** recordings by
**Alexander Holm**. The original piano samples
are published under the **Creative Commons Attribution 3.0 Unported (CC BY
3.0)** licence.

- Original source and licence: <https://piano.usini.eu/>
- Source repository and SFZ mapping: <https://github.com/remisarrailh/SalamanderPianoApp>
- Original sample archive: <https://archive.org/details/SalamanderGrandPianoV3>
- Licence text: <https://creativecommons.org/licenses/by/3.0/>

Sargam.io uses pitch-mapped, browser-triggered playback from the full 30-anchor
by 16-layer manifest. Files are loaded lazily, so the complete sample library
is not bundled in this repository. A production deployment should mirror the
selected files to controlled object storage and retain this attribution
alongside the deployed asset manifest.

This notice is an engineering attribution record, not legal advice. Keep a
copy of the source licence and asset provenance in the private release ledger.

## Typography

The application self-hosts **Poppins** for UI and notation, and **Rozha One**
for brand and display headings. Both font families are distributed under the
SIL Open Font License 1.1. The repository retains the corresponding license
files beside the font assets in `src/assets/fonts/`.

- Poppins source: <https://github.com/google/fonts/tree/main/ofl/poppins>
- Rozha One source: <https://github.com/google/fonts/tree/main/ofl/rozhaone>
- License: <https://scripts.sil.org/OFL>

The Devanagari notation font is the Noto Sans Devanagari file retained under
`src/server/export/fonts/` for both browser rendering and PDF export.

## Bansuri MVP guide voice

The Bansuri guide currently uses Sargam.io's browser-native Web Audio model.
It is generated from oscillators, filtered breath noise, a restrained harmonic
mix and register-aware vibrato; no third-party Bansuri recording is bundled or
served. This is the test-stage voice while we source a recorded multi-sample
library whose licence expressly permits interactive playback in a web product.
