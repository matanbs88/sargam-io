# Sargam.io

Sargam.io turns songs into learner-friendly relative note notation for the way India learns music: Sargam ASCII and ABC-style letter notes for keyboard, harmonium, bansuri, and guitar.

## Current prototype

The first interactive vertical slice is complete:

- Landing page and transcription entry flow
- Instrument setup for keyboard/harmonium, bansuri, and guitar
- Relative MIDI-to-Sargam conversion with komal/shuddh and octave markers
- Instant Sargam / ABC notation toggle
- Mock transcription flow, export to clipboard, and TXT download
- A validated server-side transcription endpoint with a mock provider seam
- Automated conversion, timing, URL-normalization, and tāla-structure tests
- Production-safe metadata, sitemap, and robots file

The external audio-to-MIDI provider and persistent cache are intentionally mocked for now; see [WEEKEND_SUMMARY.md](./WEEKEND_SUMMARY.md).

## Local development

```bash
npm.cmd run dev
```

Then open `http://localhost:3000`.

## Checks

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Environment

Copy `.env.example` to `.env.local` and add values only when the live API/database integrations are being built. `.env.local` is ignored by Git.

## Core conversion logic

`src/lib/midiToSargam.ts` converts absolute MIDI values to relative notes against the selected `rootMidi`:

```ts
interval = ((incomingMidi - rootMidi) % 12 + 12) % 12
octaveShift = Math.floor((incomingMidi - rootMidi) / 12)
```

The 12 swaras map to `S r R g G m M P d D n N`; lowercase values are komal, `m` is shuddh Ma, and `M` is tivra Ma. A period marks mandra saptak and an apostrophe marks taar saptak.

For the researched product-domain boundary (including why MIDI cannot itself identify a raga or an exact bansuri fingering), see [MUSIC_DOMAIN.md](./MUSIC_DOMAIN.md).
