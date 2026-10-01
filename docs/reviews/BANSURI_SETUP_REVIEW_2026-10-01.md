# Bansuri setup and complete repertoire review

The founder requested one final complete piece, then a pause in repertoire expansion. The selected piece is Hen Wlad Fy Nhadau, a complete 28-bar Welsh anthem melody. Its 75 pitches, onsets and durations matched a freshly fetched publisher MIDI exactly. The initial two-quarter skip is preserved. The source tempo follows the publisher MIDI at 60 BPM.

## Library classification

The Full pieces only filter selects explicit completeness metadata. Registered source-reviewed complete scores are included; studies, excerpts and unclassified entries are excluded. Filtering precedes sorting and pagination, and changing the filter returns to page one. No title inference is used.

## Three bansuri choices

Song Sa and flute native Sa are separate sounding MIDI pitches, including octave. The native flute reference is the three-upper-holes-closed Sa, not an ambiguous manufacturer key name. Key mode and raga are not inferred from a tonic alone.

1. Matching flute preserves source pitches and uses the confirmed song Sa as flute native Sa.
2. Transpose shifts corrected source events once by flute Sa minus song Sa. Playback, score and PDF share those effective events. Relative Sargam stays unchanged for the same confirmed tonic.
3. Keep source pitches preserves song events and song Sa. Holes and lanes use flute native Sa. For example, A4 as song Sa on an F4-native-Sa flute remains song S while using physical G fingering.

Setup is confirmed before first bansuri playback. Cancel and Escape discard drafts; reopening setup pauses playback. Applying a setup preserves the selected score position. Piano and harmonium retain their previous reference-selection behavior. Western pitch-name display now uses concert pitches rather than C-anchored relative names in the preview.

## Independent reviews and fixes

The musician agent verified interval preservation, timing, physical reference separation and repeated application without stacked transposition. Its review identified correction overflow, missing setup dialogs in alternate directions, incorrect western pitch labels and missing setup attribution in PDFs. These were addressed through validation, dialog mounts, absolute pitch formatting and export provenance plus invalidation.

The UI and UX agent checked the implemented controls and found a position reset, ambiguous YOUR SA label, missing tonic-relabel notice and a dialog at the viewport origin. The fixes preserve position, show SONG SA and FLUTE NATIVE SA, disclose tonic relabelling and center the dialog. Copy now says shift the song, not move every pitch to Sa.

## Verification boundaries

Local complete-piece playback reached Replay at 84,000 ms in Piano, Harmonium and Ventus Bansuri at 1x. The one-page A4 Sargam PDF was rendered and visually inspected; automated acceptance preserves all 75 note onsets. Pure mapping tests cover transposition, cents curves, transition targets, MIDI limits and unverified physical range.

These checks do not certify every physical flute. Maker tuning, half-hole technique and octave response still require player confirmation; the interface labels its six-hole guide as generic. No automatic octave correction is performed.

Final verification passed: 355 tests in 73 files, ESLint, TypeScript, optimized Next build, repository inventory and diff checks. The deployed preview at https://sargam-8dr9m6whd-matanbs88s-projects.vercel.app/ runs release `61d1071`. A complete Ode to Joy setting transposed from G4 to D4 reached Replay at 38,400 ms with Ventus selected, no captured browser errors and a successful generated PDF download. Local mode-3 checks preserved concert pitches and the selected 15.871-second position. The UI/UX re-review found no remaining blocking issue.

The final catalog production release and PDF hotfix passed live Library, playback and download acceptance. The former 100-piece goal and its catalog follow-up are paused at the founder's requested 11-piece checkpoint. Preview controls have not replaced production controls.

## Next automation stage

Continue from the existing transcription adapter, not a new parallel pipeline. First automate canonical MIDI or MusicXML ingestion with explicit source tonic, completeness and source provenance. Persist job state, deduplicated cache keys and recoverable failures before connecting paid audio recognition. Benchmark Indian melody, bansuri and harmonium clips against the same canonical score and report pitch, onset and duration error separately. Current audio and YouTube demo output remains clearly labelled Mock until a live provider is connected and verified.
