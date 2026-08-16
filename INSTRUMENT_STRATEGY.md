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
| Keyboard | Exact chromatic key reference | High |
| Harmonium | Relative Sargam key reference with synthesized Sa/Pa or Sa/Ma reference drone | High for the local reference; sampled Tanpura remains deferred |
| Tabla | Basic practice theka, metronome, and active-matra view | High for practice timing; it is not recorded Tabla audio or stroke recognition |
| Bansuri | Generic six-finger-hole reference with natural-swara landmarks; Sa is the three-closed-hole midpoint and altered swaras sit between landmarks | Conditional: UI geometry is deliberate; player/flute profile is required for definitive output |
| Guitar | Standard-tuning fretboard reference | High for configured tuning/range |
| Sitar | Relative swara/fret learning reference | Conditional: actual string setup, raga, and movable fret positions vary |

## Next instruments to prioritize

1. **Venu / Carnatic flute** — model separately from Hindustani bansuri. It
   needs its own hole conventions, notation vocabulary, and eventually
   Carnatic raga support.
2. **Tabla** — expand the existing workspace with a real loop-range selector,
   theka variations, and eventually licensed/sample-based Tabla sounds. Do not
   treat its current synthesized metronome as Tabla stroke recognition.
3. **Tanpura** — replace the existing synthesized Sa/Pa or Sa/Ma reference
   drone with a licensed/sample-based Tanpura experience and tuning reference.
   It supports every melodic learner without pretending to transcribe notes on
   the instrument.
4. **Santoor** — build only after its tuning layout is configurable; a fixed
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
