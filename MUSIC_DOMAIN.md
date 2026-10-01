# Sargam.io music-domain notes

This document is the working domain boundary for the product. It covers a learner-facing Hindustani/Sargam layer, not a claim to automatically identify a raga or replace a guru.

## Product language

- **Sa Re Ga Ma Pa Dha Ni** are relative swara names; Sa is chosen by the singer/player rather than being intrinsically equal to Western C.
- The product ASCII mapping is `S r R g G m M P d D n N`: lowercase `r/g/d/n` represents komal swaras and `M` represents tivra Ma. This preserves the requested 12-pitch-class model for MIDI sources.
- The app uses an explicit ASCII convention: `S.` is mandra (lower) saptak and `S'` is taar (upper) saptak. Traditional Bhatkhande notation uses visual marks (for example, dots above/below) and is not identical to this plain-text rendering.
- `Sa` and `Pa` are achal in the 12-position framework. `Re`, `Ga`, `Dha`, and `Ni` may be komal; `Ma` may be tivra. Raga practice also includes intonation, approach, ornament, and melodic movement that cannot be reduced safely to an equal-tempered MIDI sequence.

## Engineering implications

MusicXML staff/voice identifiers describe written parts, not automatic melodic
intent. Polyphonic imports offer explicit melody selection; chordal choices
remain labelled estimates. Preserve the complete imported arrangement separately.
Do not round fractional pitch alterations silently to Western semitones.
MusicXML instrument transposition adds the declared chromatic offset and octave
change to written pitches to obtain concert pitch. Staff-specific declarations
apply only to that staff. The source key signature remains written-pitch
metadata; never use it silently as an inferred concert Sa. Unexpanded repeats,
tempo instructions and omitted grace notes require visible review warnings.

**Practice part policy (2026-10-01):** Bansuri is monophonic. Harmonium supports
chords physically, but this product's harmonium practice uses melody only.
Piano offers Melody or Melody + harmony. Select the part before transposition,
ornament generation, playback, notation and PDF export. Explicit reviewed melody
data takes precedence over pitch-ranking heuristics. Unknown polyphonic sources
may use a labelled upper-voice estimate, which must not be represented as verified
melody extraction. See [part separation audit](docs/audits/MELODY_PARTS_2026-10-01.md).

1. **MIDI conversion is relative transposition, not raga classification.** The current engine labels the 12 equal-tempered pitch classes produced by an audio-to-MIDI provider. It must never infer a raga, aroha/avaroha, vadi/samvadi, or shruti from that output alone.
2. **Persist time.** A real provider adapter must retain onset and duration, not only pitches. `MidiNoteEvent` exists for that reason.
3. **Song Sa and instrument key are independent.** The transcription root describes the musical reference. A bansuri key describes the instrument's physical concert-pitch reference. The fingering layer must join them only after player/instrument calibration.
4. **Fingering is a profile, not a lookup table.** Six- and seven-hole instruments, makers, partial-hole technique, breath, and octave all matter. The current six-hole Bansuri roll anchors natural swaras to the opening/closing landmarks of its drawn six holes (Sa is the three-closed-hole midpoint); komal/tivra variants sit between those landmarks. The generic map remains a learning reference until validation for a selected profile.
5. **BPM is not tāla.** Tempo can be estimated from audio; tāla requires a rhythmic-cycle interpretation. The code contains manually selected tāla structures for future display/practice, never an automatic label based only on BPM.

## Initial tāla structures

| Taal | Matras | Vibhag grouping |
| --- | ---: | --- |
| Teentaal | 16 | 4 + 4 + 4 + 4 |
| Jhaptal | 10 | 2 + 3 + 2 + 3 |
| Rupak | 7 | 3 + 2 + 2 |
| Ektal | 12 | 2 + 2 + 2 + 2 + 2 + 2 |
| Dadra | 6 | 3 + 3 |
| Keherwa | 8 | 4 + 4 |

## Practice Theka boundary

The current Tabla workspace displays one basic practice theka per selected
taal and accents Sam in a synthesized metronome. A theka is a recurring
rhythmic support pattern, but it has legitimate stylistic and performance
variations. The product must not claim to recognize tabla strokes, choose a
canonical theka, or infer taal from BPM alone.

## Research references

- [Frontiers: tempo and rhythmic elaboration in Hindustani music](https://www.frontiersin.org/journals/digital-humanities/articles/10.3389/fdigh.2017.00020/full) documents the vibhag/matra groupings for Teentaal, Jhaptal, Rupak, and Ektal.
- [Sharda Music: common taals](https://www.sharda.org/about-taal/) gives
  learner-facing Teentaal, Dadra, and Keherwa structures and basic bols;
  [TaalGyan: Keherwa](https://www.taalgyan.com/taals/keherwa/) documents the
  frequently used `Dha Ge Na Ti | Na Ka Dhi Na` practice theka.
- [Sharda Music: Hindustani raga classification](https://www.sharda.org/music_theory/raga-classification-systems/) provides the requested uppercase/lowercase-style thaat examples and the ten Bhatkhande parent scales.
- [University of HNB Garhwal Hindustani music syllabus](https://www.hnbgu.ac.in/sites/default/files/2025-06/Univerity%20Entrance%20Test%20%28UET%29%202025-26%20Syllabus%20for%20Diffrent%20Programmes.pdf) treats swara, thaat, raga, laya, taal, matra, tali, khali, sam, and vibhag as distinct concepts.
- [UC eScholarship on Bhatkhande](https://escholarship.org/uc/item/7r7315x6) gives historical context for the Bhatkhande classification/notation system.
- [Klangio's official API](https://api.klang.io/open_api) documents asynchronous transcription jobs and MIDI result endpoints; [Klangio's API page](https://klang.io/api/) currently lists request quotas and duration limits. The live adapter must be verified against the exact account-level API contract before activation.

## Decisions before live API work

- Support the initial product notation as **Sargam ASCII**, not "full Bhatkhande notation".
- Treat an external transcription response as an uncertain melody candidate that needs confidence and timing metadata.
- Ask the user to choose or confirm song Sa; do not silently infer a raga.
- Defer claims of exact bansuri fingerings until an instrument-profile validation protocol exists.
