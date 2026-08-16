# Indian Music Practice Product Research — 2026-08-16

> Scope: public product claims only. This is a strategic feature inventory,
> not a claim that Sargam has implemented any of these capabilities. Product
> copy, music content and recordings must not be copied from competitors.

## Executive finding

The established market has split into two strong but separate experiences:

1. **Indian-classical accompaniment and notation utilities** — sound-rich,
   configurable and useful in a daily riyaz, but typically not responsive to
   the performer.
2. **AI vocal coaching** — immediate pitch/timing feedback and a large guided
   curriculum, but not inherently built around a player's relative Sa,
   instrument fingering or a transcription-derived phrase.

Sargam's defensible product direction is the bridge: a musician brings a
melody, song or exercise; chooses their Sa and instrument; receives relative
Sargam plus an accurate visual practice path; and then repeats the phrase in a
purpose-built riyaz session. The performance canvas, notation and practice
engine should remain one connected experience.

## Verified competitor findings

| Product | Publicly verified strengths | Strategic lesson for Sargam |
| --- | --- | --- |
| [SwarShala](https://www.swarclassical.com/SwarShala/) | Separate Learn, Practice and Compose modes across Hindustani and Carnatic traditions; virtual musicians and pitch analysis; recording/MIDI support in full editions; notation sequences can be created from singing or playing; cloud sharing. | A serious practice product needs a complete loop: learn → rehearse → create → save/share. We should take the loop, not its legacy desktop-style complexity. |
| [Bandish](https://apps.apple.com/cz/app/bandish-music-riyaz-app/id6443525889) | Tanpura, tabla and manjira accompaniment; 75+ taals/200+ variations; live theka/beat counter; pitch, tempo and volume control; recorder, tap tempo, favourites, reminders, long-session focus and background playback. | Daily reliability is a feature: a quick-start ritual, persistent settings, favourites, beat accuracy and no-interruption controls matter as much as a sophisticated music engine. |
| [Riyaz](https://riyazapp.com/) | Guided practice with immediate pitch/timing feedback; real-time pitch detector; lesson library; vocal-range/accuracy/breath tracking; audio upload creates a practice track; progress and leaderboard. | The feedback loop makes practice sticky. Sargam should earn this only after microphone calibration, confidence scoring, consent and evaluation against annotated Indian-music recordings. |
| DailyRiaz landing page supplied by the founder | The public URL could not be independently retrieved or indexed during this review. | Treat it as visual/product inspiration only until a stable public source or product access is available; do not turn inferred features into requirements. |

## What Sargam should build — ordered backlog

### A. The daily riyaz ritual (next product slice)

- One-click **Resume practice**: restore Sa, taal, tempo, instrument, notation,
  loop range and last phrase.
- A focused session header: duration, beat cursor, Sam, count-in, loop and
  tempo ladder — with controls hidden in cinema/recording mode.
- Practice presets: `Morning alap`, `Slow phrase`, `Taal clarity`, and
  `Performance take`. They are configurable session templates, not claims of
  raga correctness.
- Local first history: minutes practised, repeated phrase count and completion
  state; account sync can follow later.
- Favourite taals, instruments and phrase loops.

**Acceptance bar:** a returning user begins a meaningful session in under ten
seconds, and nothing resets if they change view or reload.

### B. Structured phrase practice (the core differentiation)

- Phrase range editor over the existing transcription timeline.
- Explicit note onset, sustain, rest, bar and Sam markers rather than a mere
  scrolling note list.
- Three linked modes: **listen**, **follow**, **slow loop**. The piano roll,
  Sargam/Devanagari and selected instrument view follow one transport.
- Manual correction of a transcription with an audit trail. Never silently
  overwrite the source result.
- Export a compact share card/video only after content and music rights rules
  are designed.

### C. Accompaniment quality and depth (after rights clearance)

- Mixer lanes for tanpura, tabla, lehra and guide melody.
- A reviewed taal registry: matras, vibhag, tali/khali, bol, Sam, tempo bounds,
  variations and named reviewer.
- Tap tempo, count-in, beat-cursor sync checks, preferred-speed persistence,
  background playback and device output tests.
- Start with a narrow, reliable taal set; 200 unreviewed variations are less
  valuable than a small set that lands exactly on Sam.

**Gate:** current browser-native audio remains the honest fallback. Any real
sample/recording must pass the rights and technical intake protocol in
[Open audio sourcing](OPEN_AUDIO_SOURCING.md).

### D. Guided learning and teacher workflows

- Curated, rights-cleared exercise packs: swara drills, alankars, rhythm
  exercises and instrument-specific phrase packs.
- A teacher can assign a session/phrase, annotate one time range and review an
  opt-in learner recording.
- Separate Hindustani and Carnatic curricula from the data model onward; do not
  flatten two traditions into one generic scale picker.
- Content provenance shown to the learner: author, school/context, reviewer,
  license and revision.

### E. Microphone feedback — a measured later milestone

- Browser input calibration for mic/device noise and a selectable reference Sa.
- Show pitch trace, onset timing and sustained-note stability with a confidence
  indicator — not binary “correct/wrong”.
- Make the first version exercise-relative; avoid automatic raga judgment,
  gharana claims or definitive bansuri fingering correction.
- User consent, local-processing preference where possible, recording deletion
  and transparent failure states are required.

**Gate:** benchmark against annotated recordings across vocal ranges,
instruments, noise conditions and intended traditions. A musician-advisor
reviews any public scoring language.

### F. Motivation without shallow gamification

- A streak is optional and secondary to musical continuity.
- Track personal baselines (steady Sam landings, sustained-note stability,
  completed loops), not a universal leaderboard score.
- Support a private practice journal before public rankings.
- If community comes later, it needs source attribution, moderation, abuse
  reporting and rights handling for uploaded performances.

## Product boundaries — what not to imitate

- Do not make Sargam a giant instrument catalog before individual profiles are
  musically reviewed.
- Do not market a generated drone or tabla-shaped cue as a real recorded
  tanpura/tabla performance.
- Do not derive a feature specification from competitor screenshots, app audio
  or private content.
- Do not launch automatic “raga detection”, pitch grades or fixed bansuri
  fingerings without qualified evaluation.
- Do not force an account or leaderboard between a musician and a quick daily
  practice session.

## Product model implication

The future data model needs these separate entities, each with provenance and
revision state: `exercise`, `phrase`, `practice_session`, `practice_attempt`,
`taal_pattern`, `raag_profile`, `instrument_profile`, `accompaniment_voice`,
`accompaniment_asset`, `content_rights`, `teacher_assignment` and
`reviewer_approval`. This avoids conflating a visual feature with a musical
claim, or an exercise with the recorded asset used to render it.

## Sources consulted

- [SwarShala product overview](https://www.swarclassical.com/SwarShala/)
- [Bandish — Music Riyaz App, App Store](https://apps.apple.com/cz/app/bandish-music-riyaz-app/id6443525889)
- [Riyaz product site](https://riyazapp.com/)
- [DailyRiaz URL supplied for review](https://prodct-sndbx-landingpage.vercel.app/DailyRiaz) — unavailable for independent public verification at time of review.
