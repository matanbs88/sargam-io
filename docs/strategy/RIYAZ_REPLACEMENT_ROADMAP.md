# Sargam.io — Indian Music Practice Platform Roadmap

> Status: product strategy. No roadmap item becomes a public musical claim until its validation gate is met.

## Product ambition

Sargam.io will be the modern, web-first practice workspace for Indian music.
A musician will be able to bring a melody or exercise, understand it through
relative Sargam, see it on their chosen instrument, practice it in taal, and
eventually record, share, and learn with measured guidance.

The initial wedge is transcription and visual practice. The destination is a
responsive practice instrument centred on each musician's Sa, instrument,
repertoire, and progress — not a generic SaaS dashboard or a static loop
player.

## Competitive position

RiyazStudio publicly presents a comprehensive practice toolkit: tanpura,
tabla, lehra, swarmandal, configurable taals, Tihai tools and persistent
practice settings. Its FAQ says it does not interact with or respond to the
musician. SurSadhak publicly combines accompaniment with recording, song
creation, Bhatkhande notation, raag material, a tuner, and a user-song
community.

We should treat both as proof that the market values serious practice tools;
we should not copy their content, recordings, UX, or proprietary behaviour.

| Existing expectation | Sargam.io advantage |
| --- | --- |
| Start a tanpura or tabla loop | Start from a song, phrase, or exercise and create a playable visual session |
| Fixed accompaniment | A session linked to selected Sa, instrument profile, phrase, and practice goal |
| Mobile/desktop utility screens | A focused creator-performance canvas that looks excellent in lessons and social video |
| Notation and visual practice separated | Relative Sargam, Devanagari, falling cues, fingering and taal in one workspace |
| No meaningful learner response | Add feedback only after robust evaluation, calibrated audio capture and consent |
| Song community alone | A teacher-ready, rights-aware practice library with better source attribution |

## Product principles

1. **Sa first.** Tonic and relative relationships are visible throughout the session.
2. **Music before automation.** Never state a raga, fingering, or correction as certain unless the player profile and musical rules support it.
3. **The performance canvas is the product.** Controls should get out of the way while a musician is practicing or recording.
4. **Authenticity is designed in.** Practitioners review Indian instruments, terminology, notation and rhythm before public release.
5. **Web-first, creator-ready.** Sessions should feel native on desktop and mobile and look excellent on screen recordings.
6. **Rights are a product requirement.** No unlicensed performance, sample or web recording becomes product content.

## Delivery roadmap

### Phase 0 — Current foundation

- Relative MIDI-to-Sargam conversion in English, ABC and Devanagari.
- Mock transcription, selectable Sa, notation switching, credits and session UI.
- Visual performance workspace with piano and six playable bansuri finger-hole references.
- Mock transport, note timing, taal and tabla-oriented practice surfaces.

Exit gate: mock-data scope and current conversion logic remain test-covered and clearly labelled.

### Phase 1 — Reliable practice sessions

- Saved session model: source, Sa, tempo, taal, phrase range, notation and instrument.
- Count-in, loop range, speed ladder, beat cursor and practice history.
- Manual phrase editor to correct imperfect transcription.
- Learner modes: listen, follow, slow practice, phrase loop and cinema/performance mode.

Exit gate: a complete exercise can run without a transcription provider or real accompaniment audio.

### Phase 2 — Licensed accompaniment engine

- Modular tanpura drones: Sa, Sa-Pa, Sa-Ma and approved raag-specific settings.
- Tabla/Pakhawaj patterns with loop-safe boundaries, Sam cues and controlled variations.
- Lehra for tabla and Kathak practice.
- Metronome, count-in, mixer, device-safe caching and low-latency Web Audio playback.
- Swarmandal only where a musical advisor defines appropriate use.

Exit gate: every asset has a rights record, technical manifest and musical sign-off.

### Phase 3 — Raga and taal intelligence

- Curated raga profiles: aroh, avroh, pakad, important phrases, relevant restrictions and practice notes.
- Taal profiles: matras, vibhag, tali/khali, theka, Sam, tempo ranges and reviewed variations.
- Tihai Lab to place a phrase accurately in a selected cycle and rehearse its landing.
- Manual raga selection and conservative confidence labels; no speculative automatic raga claims.

Exit gate: every starter profile has named practitioner review and source provenance.

### Phase 4 — Instrument-native practice

- Harmonium/keyboard with Sa highlighting and playable layouts.
- Six-hole bansuri profiles by flute key with reviewed half-hole alternatives and range limits.
- Sitar profiles: strings, tunings, fret positions, chikari cues and phrase-aware alternatives.
- Candidate instruments after research: sarangi, violin, tabla, pakhawaj, veena, mridangam, dholak and vocals.
- In-product limits/confidence notes where one "correct" fingering does not exist.

Exit gate: players test the specific physical configuration represented in the UI.

### Phase 5 — Adaptive practice and teaching

- Microphone pitch/timing following, calibration, privacy controls and transparent error states.
- Diagnostics for beat placement, onset timing, sustained-note stability and exercise completion.
- Teacher assignments, phrase annotations and opt-in recording review.
- Curated learning paths for vocal, harmonium, bansuri and tabla learners.

Exit gate: feedback is evaluated against annotated recordings and reviewed for misleading or harmful advice.

### Phase 6 — Creator and community layer

- Recording-ready performance canvas, visual-video export and share links.
- Teacher/publisher-owned exercises and a licensed repertoire catalog.
- Subscription/credit system only after user value and rights-aware unit economics are proven.

## Future data model

Keep musical data, assets, rights and UI rendering separate:

- `raag_profiles`: source, reviewer, phrases, tuning guidance, caveats and confidence policy.
- `taal_patterns`: matras, vibhag, bols, Sam, tempo range, variation metadata and review state.
- `instrument_profiles`: configuration, range, fingering map, caveats, reviewer and revision.
- `accompaniment_assets`: stems, loop points, tempo/key, performer, technical manifest and rights record.
- `practice_sessions`: user-owned session settings, progress and privacy flags.
- `content_rights`: licensor, agreement, territory, term, allowed uses, attribution and renewal date.

## Human gates

Engineering can autonomously build the platform, mock data, schemas, visual UX,
playback plumbing, QA and content-management tools. These decisions require a
human specialist:

1. Rights clearance and contracting for real recordings or sample libraries.
2. Musical sign-off for raga theory, taal variation, fingering and language.
3. Consent and policy for learner audio/video analysis.
4. Final pricing, brand claims and market positioning.

See [Music content and rights plan](MUSIC_CONTENT_AND_RIGHTS_PLAN.md) for the
minimum work needed from people and the exact recording package to request.

## Research sources

- [RiyazStudio product overview](https://www.riyazstudio.com/)
- [RiyazStudio FAQ](https://www.riyazstudio.com/faq.html)
- [RiyazStudio tips](https://www.riyazstudio.com/tips.html)
- [SurSadhak product site](https://sursadhak.com/)
- [SurSadhak App Store listing](https://apps.apple.com/ca/app/sursadhak/id1499799176)

