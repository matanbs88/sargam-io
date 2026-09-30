# Ventus / adaptive correction

Founder rejected the three phrase-cut bank's tone and instrument-only scaling.
Replaced active manifest with 16 original named SustainNormal NCW recordings.
Each decoded file independently matched its named MIDI pitch at 1,2,3 seconds.
Original files remain untouched; new public assets use hashed filenames.
Decoder is limited to recognized mono integer PCM, with bounds/overflow checks.
Bank covers E4–F#6; samples outside the native range still require pitch shifting.
Only V1 RR1 is used. Round robins, legato and release articulations remain work.
No perceptual quality score: live browser tool returns Transport closed.

Adaptive piano/harmonium now derive the entire key/lane/note geometry from the
phrase and viewport width, including desktop. The Sargam reader observes its
own width/height and adapts measure columns, row height and bounded font size.
No audio transport or MIDI math changes. Resize does not pan based on the
currently sounding note; geometry remains stable for the full phrase.

Local preview only; no production release. `npm run verify` passed: ESLint,
200 tests / 56 files, TypeScript and Next production build. Preview page and
all 16 new sample URLs returned HTTP 200 on port 3010. Browser visual and
listening verification remain open (`Transport closed`).
