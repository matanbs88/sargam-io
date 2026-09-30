# Bansuri practice refinement — 2026-09-18

Founder selected Mehfil as the preferred visual direction. This iteration remains on the preview branch; no production deployment is included.

## Delivered
- Practice expression selector offers As written and Meend (connected-note glide). Gamak remains a diagnostic experiment, not a regular practice option.
- Existing Meend audio transitions are retained; this is not a claim of recorded Kontakt legato.
- Flute geometry no longer depends on the playing/rest caption or register label. Fixed overlay slots reserve their space.
- Fingering lanes use the actual illustration SVG transform, including aspect-ratio letterboxing. G/R/S/N/D/P landmarks align with holes 1–6. Altered swaras lie between landmarks. Octaves share landmarks; note labels retain register. This is explicitly a fingering diagram, not a linear pitch axis.
- Closed holes use a color fill without check marks, including the compact view.
- Smooth bamboo artwork replaces the visible joint between holes 5 and 6. Original artwork retained.

## Verification
- 223 tests across 60 files passed, including new natural/altered/octave landmark tests.
- ESLint passed.
- Production build passed. Final CSS adjustment shares stage height between canvas and flute; browser confirms no internal vertical canvas overflow in normal and focus views.
- Browser: Meend selectable; actual playback reaches end and replays. Focused instrument view SVG measured 130 × 782.671875 CSS pixels before playback, during playback, and after returning to rest.
- Visual inspection confirmed hole/lane alignment and continuous smooth bamboo, with no check marks.

## Artwork provenance
Mode: imagegen edit, precise-object-edit. Input: public/artwork/bansuri-bamboo.png. Output: public/artwork/bansuri-bamboo-smooth.png.

Prompt: Use case: precise-object-edit. Edit target is this exact 1024x1536 bamboo instrument asset. Remove ONLY the dark horizontal bamboo joint/ring around y1085 on the central tube (between x465 and560), fill seamlessly with continuous smooth vertical golden bamboo grain matching above and below. Preserve exact composition, tube placement/width/height, red/navy thread bindings at top and bottom, background, lighting, texture and all other pixels as closely as possible. Do not add holes, text, marks, or change proportions. Keep 1024x1536.
