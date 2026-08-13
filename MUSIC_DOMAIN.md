# Sargam.io music-domain notes

This document is the working domain boundary for the product. It covers a learner-facing Hindustani/Sargam layer, not a claim to automatically identify a raga or replace a guru.

## Product language

- **Sa Re Ga Ma Pa Dha Ni** are relative swara names; Sa is chosen by the singer/player rather than being intrinsically equal to Western C.
- The product ASCII mapping is `S r R g G m M P d D n N`: lowercase `r/g/d/n` represents komal swaras and `M` represents tivra Ma. This preserves the requested 12-pitch-class model for MIDI sources.
- The app uses an explicit ASCII convention: `S.` is mandra (lower) saptak and `S'` is taar (upper) saptak. Traditional Bhatkhande notation uses visual marks (for example, dots above/below) and is not identical to this plain-text rendering.
- `Sa` and `Pa` are achal in the 12-position framework. `Re`, `Ga`, `Dha`, and `Ni` may be komal; `Ma` may be tivra. Raga practice also includes intonation, approach, ornament, and melodic movement that cannot be reduced safely to an equal-tempered MIDI sequence.

## Engineering implications

1. **MIDI conversion is relative transposition, not raga classification.** The current engine labels the 12 equal-tempered pitch classes produced by an audio-to-MIDI provider. It must never infer a raga, aroha/avaroha, vadi/samvadi, or shruti from that output alone.
2. **Persist time.** A real provider adapter must retain onset and duration, not only pitches. `MidiNoteEvent` exists for that reason.
3. **Song Sa and instrument key are independent.** The transcription root describes the musical reference. A bansuri key describes the instrument's physical concert-pitch reference. The fingering layer must join them only after player/instrument calibration.
4. **Fingering is a profile, not a lookup table.** Six- and seven-hole instruments, makers, partial-hole technique, breath, and octave all matter. The product can first offer relative notes; it may only show definitive finger holes after validation for a selected profile.
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

## Research references

- [Frontiers: tempo and rhythmic elaboration in Hindustani music](https://www.frontiersin.org/journals/digital-humanities/articles/10.3389/fdigh.2017.00020/full) documents the vibhag/matra groupings for Teentaal, Jhaptal, Rupak, and Ektal.
- [Sharda Music: Hindustani raga classification](https://www.sharda.org/music_theory/raga-classification-systems/) provides the requested uppercase/lowercase-style thaat examples and the ten Bhatkhande parent scales.
- [University of HNB Garhwal Hindustani music syllabus](https://www.hnbgu.ac.in/sites/default/files/2025-06/Univerity%20Entrance%20Test%20%28UET%29%202025-26%20Syllabus%20for%20Diffrent%20Programmes.pdf) treats swara, thaat, raga, laya, taal, matra, tali, khali, sam, and vibhag as distinct concepts.
- [UC eScholarship on Bhatkhande](https://escholarship.org/uc/item/7r7315x6) gives historical context for the Bhatkhande classification/notation system.

## Decisions before live API work

- Support the initial product notation as **Sargam ASCII**, not "full Bhatkhande notation".
- Treat an external transcription response as an uncertain melody candidate that needs confidence and timing metadata.
- Ask the user to choose or confirm song Sa; do not silently infer a raga.
- Defer claims of exact bansuri fingerings until an instrument-profile validation protocol exists.
