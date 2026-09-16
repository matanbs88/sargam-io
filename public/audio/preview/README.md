# Ventus prototype comparison asset

`ventus-fsharp4-sustain.wav` is a measured 3.7-second extraction of the user's
Ventus Winds Bansuri `Phrases_Close_212.wav`, source 0.3–4.0 seconds, with 25ms
fades. Mono 44.1kHz PCM16; measured anchor MIDI 65.993 (approximately F#4).

ISW Partners' prototype permission supplied by the user is recorded in the
project's Ventus documentation. This asset is not an open-source sample and is
not offered for reuse or download as a sample library. The custom commercial
license is a release checklist item; this opt-in experiment is for the pilot.

Reproduction: `prepare-ventus-candidate.mjs` then `stage-ventus-preview.mjs`.
Staging verifies SHA256
`49fa0dea225ba69a9a496832296ed7cf9d5356bf1d07ebf351901a983606ab7a`.

Limitations: one anchor, artificial fade-in, no validated loop, no listening QA.
The UI exposes it only as **Ventus sustain · experimental** in the design lab.
The existing procedural voice remains the default. The sampler rejects notes
outside C4–C5, pitch curves and sustains exceeding available recording length.
