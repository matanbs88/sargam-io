# Sargam.io QA checklist

This build is local and mock-driven. The YouTube/audio entry is visual only;
the separate mock API route is not wired into the page.

## Automated checks

```powershell
npm.cmd run audit:repo
npm.cmd run verify
```

## Desktop practice flow

1. Start the app and confirm the header shows 2 credits.
2. Click **Transcribe melody**. Credits become 1 and the mock dashboard opens.
3. Change Sa from D4 and confirm the **Transposed** badge appears.
4. Switch ABC, Latin Sargam, and Devanagari. Notes must update without a page
   reload or request.
5. Click a note, Previous, Next, and Play. The notation, transport progress,
   selected visual instrument, Taal matra, and performance deck must stay in
   sync.
6. Open Piano roll. Bars must land on matching white/black keys and use note
   duration for their height.
7. Open Bansuri roll. Verify all six cue lanes terminate directly over the six
   finger holes; the holes show open/closed/half-open state for the active note.
8. Open **Cinema view**, switch visualizer, advance a note, and exit. The
   dashboard should remain usable.
9. Check Harmonium drone, Taal selector, Tabla practice view, and all six
   instrument-reference buttons.
10. Toggle light/dark mode in the header, refresh, and confirm the selected
    appearance persists without degrading the visualizers or Cinema view.

## Narrow viewport / recording flow

1. Test at approximately 390×844.
2. Open Bansuri roll and Cinema view.
3. Confirm the flute, six cue lanes, controls, and exit button remain visible
   without horizontal clipping.

## Credit guard

1. Use **New transcription** to return to the hero.
2. Consume the second mock credit.
3. On the next click, confirm that the no-credit alert appears and no new
   dashboard opens.

## Known mock-only limits

- Mock playback moves visual MIDI events only; it does not play a song.
- Cinema view is presentation framing, not recording/export.
- Bansuri, Guitar, and Sitar views are learning references, not calibrated
  performance prescriptions.
- Credits and selections reset after a browser refresh.
