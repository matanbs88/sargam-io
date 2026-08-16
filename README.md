# Sargam.io

Sargam.io turns songs into learner-friendly relative note notation for the way India learns music: Sargam ASCII and ABC-style letter notes for keyboard, harmonium, bansuri, and guitar.

## Current local MVP

The local, mock-driven demo includes:

- Relative MIDI-to-Sargam conversion with komal/shuddh, Devanagari, and repeated octave markers
- Instant ABC, Latin Sargam, and Devanagari Sargam switching
- A local two-credit mock flow and a zero-credit guard
- Mock note playback controls with active-note highlighting
- MIDI-timed falling-note piano roll and horizontal Bansuri roll, with bars sized by event duration
- Dedicated Harmonium mode with relative Sargam labels and visual Sa/Pa or Sa/Ma drone settings
- Keyboard, six-hole Bansuri, standard-guitar, and Sitar visual references
- Manual practice-taal cycles for Teentaal, Jhaptal, Rupak, Ektal, Dadra, and Keherwa; taal is never inferred from BPM alone
- Synthesized Sa/Pa or Sa/Ma reference drone, plus a Tabla practice workspace with basic theka prompts and a Sam-accented metronome
- A typed JSON i18n dictionary scaffold for English and Hindi
- Automated conversion, timing, URL-normalization, and tāla-structure tests
- Production-safe metadata, sitemap, and robots file

The audio drop zone and YouTube input are intentionally visual only. See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for the complete local QA path and [WEEKEND_SUMMARY.md](./WEEKEND_SUMMARY.md) for live-integration boundaries.

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
