# Instrument strategy

## Product rule

Sargam.io should group instruments by the type of musical guidance a learner
needs, not simply place every Indian instrument in one selector.

- **Discrete-pitch instruments** can use a note-to-position reference now.
- **Fretless or expressive instruments** need a pitch path, register, and
  ornament view rather than a misleading exact position.
- **Percussion** needs taal, matra, bols, and practice loops; it is a separate
  product surface from melody transcription.
- **Drone instruments** help establish Sa and raga context, but do not need a
  note-by-note fingering view.

## Available now

| Instrument | Experience | Confidence |
| --- | --- | --- |
| Keyboard / harmonium | Exact chromatic key reference | High |
| Bansuri | Generic seven-hole relative fingering reference | Conditional: flute profile required for exact output |
| Guitar | Standard-tuning fretboard reference | High for configured tuning/range |
| Sitar | Relative swara/fret learning reference | Conditional: actual string setup, raga, and movable fret positions vary |

## Next instruments to prioritize

1. **Harmonium mode** — reuse the keyboard geometry, add an Indian pedagogical
   label mode, comfortable Sa range, and optional left-hand drone/chord hints.
   It is the most direct continuation of the existing keyboard system.
2. **Venu / Carnatic flute** — model separately from Hindustani bansuri. It
   needs its own hole conventions, notation vocabulary, and eventually
   Carnatic raga support.
3. **Tabla** — add a dedicated taal workspace (theka, sam, khali, vibhag,
   bols, tempo and loop), not a melody fingering card.
4. **Tanpura** — add a Sa/Pa or Sa/Ma drone configuration and tuning reference.
   It supports every melodic learner without pretending to transcribe notes on
   the instrument.
5. **Santoor** — build only after its tuning layout is configurable; a fixed
   visual grid would misrepresent instruments with different tunings.

## Deliberately later

- **Sarod, sarangi, and Indian violin:** pitch is continuous and performance
  depends on meend/gamak. Build a pitch-contour and target-swara trainer first,
  then a position guide after instrument-specific research.
- **Mridangam, dholak, pakhawaj, ghatam, kanjira:** important instruments, but
  belong in the future rhythm/bol system alongside tabla.
- **Shehnai / nadaswaram:** promising wind-instrument additions, but require
  manufacturer/key-specific fingering profiles and a separate reed model.

## Why sitar is a relative reference in v1

Sitar examples have different numbers of strings and frets. Museum records
also document movable metal frets and multiple classes of strings. Its
sympathetic strings are retuned to the raga, so a generic fixed MIDI tab would
be incorrect. The app therefore shows the active swara relative to Sa on the
main melody-string row and clearly labels it as a learning reference.

## Sources consulted

- Centre for Cultural Resources and Training, Government of India:
  <https://ccrtindia.gov.in/musical-instruments/1000/>
- Centre for Cultural Resources and Training scholarship taxonomy:
  <https://ccrtindia.gov.in/wp-content/uploads/2024/02/Annexure-A-SYA-Scheme.pdf>
- Horniman Museum, sitar object record (moveable frets and string types):
  <https://www.horniman.ac.uk/object/M15.10.48/248/>
- University of La Plata museum, sitar description (moveable frets and
  sympathetic strings):
  <https://unlp.edu.ar/arte/museo_azzarini/texto_ingles_azzarini_sitar-6641-11641/>
