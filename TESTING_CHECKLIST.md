# Sargam.io QA checklist

The classic `/` flow below is local and mock-driven. For the selected design at
`/living-score`, use the transcription-first preview checklist at the end of this
document. Its YouTube field validates input but does not perform live conversion;
the separate mock API is not a live provider.

## Automated checks

```powershell
npm.cmd run audit:repo
npm.cmd run verify
```

## Desktop practice flow

1. Start the app and confirm the header shows 2 credits.
2. Click **Open practice demo**. Credits become 1 and the mock dashboard opens.
3. Change Sa from D4 and confirm the **Transposed** badge appears.
4. Switch ABC, Latin Sargam, and Devanagari. The melody line, falling piano
   bars, Bansuri lane labels, Bansuri beams, and active Bansuri badge must all
   update without a page reload or request.
5. Click a note, Previous, Next, and Play. At the first and last note, confirm
   Previous/Next cannot move beyond the phrase. The notation, transport
   progress, selected visual instrument, Taal matra, and performance deck must
   stay in sync.
6. Open Piano roll. It must display the C3–C7 keyboard range. Bars must land
   on matching white/black keys, use note duration for their height, and press
   the active physical key without clipping.
7. Open Bansuri roll. Verify continuous time-based travel and relative pitch
   lanes. The adjacent six-hole reference shows the complete open/closed/half-open
   pattern; do not assert that each note corresponds to a single finger hole.
8. Open **Cinema view**, switch visualizer, advance a note, and exit. The
   dashboard should remain usable.
9. Check Harmonium drone, Taal selector, Tabla practice view, and all six
   instrument-reference buttons.
10. Toggle light/dark mode in the header, refresh, and confirm the selected
    appearance persists without degrading the visualizers or Cinema view.

## Narrow viewport / recording flow

1. Test at approximately 390×844.
2. Open Bansuri roll and Cinema view.
3. Confirm the flute/fingering reference, pitch timeline, controls and exit remain visible
   without horizontal clipping.

## Credit guard

1. Use **New transcription** to return to the hero.
2. Consume the second mock credit.
3. On the next click, confirm that the no-credit alert appears and no new
   dashboard opens.

## Known mock-only limits

- Demo playback uses guide voices for canonical events, not the original song
  recording. The URL transcription provider is still a fixed mock.
- Cinema view is presentation framing, not recording/export.
- Bansuri, Guitar, and Sitar views are learning references, not calibrated
  performance prescriptions.
- Credits and selections reset after a browser refresh.
# Living Score transcription-first preview — 2026-09-16

- Open `/living-score`: YouTube input and primary transcription action precede
  library discovery; no library-first hero.
- Invalid link shows a correction; valid link explains that live conversion is
  not yet connected. Neither path produces a fake source-specific score.
- Explicit demo opens labelled Ode to Joy, not the supplied URL's title.
- Library exposes all 35 playable catalog entries. Check search, level/category
  filters, title/tempo sort, 20-result pagination and no-results reset.
- Open a row, return to Library, verify filters/page remain; Resume retains the
  active piece. Home remains accessible through the brand and Transcribe tab.
- Verify desktop and 390px: no page-level overflow, readable title/composer,
  reachable Open buttons, visible focus and navigation.
- Chrome verification of home, filters, empty search, score refresh/Back and
  invalid-ID recovery passed in the subsequent autonomous sprint. Earlier browser
  access failure is historical, not the current status.

## Autonomous sprint regression matrix — 2026-09-16

Evidence: [dated sprint audit](./docs/reviews/LIVING_SCORE_THREE_HOUR_SPRINT_2026-09-16.md).

- Focus at 1920×911, 1366×768, 390×844 and 844×390: bounded viewport, reachable
  transport, no document horizontal overflow. Only notation scrolls when needed.
- Score/instrument divider: drag, arrows, Home/End; limits 15–60%; short-height
  minimum allows a complete reading line. Instrument-only expands the whole stage.
- Settings in Focus: all instrument/notation settings remain available;
  Escape closes Settings first; Exit focus restores the underlying navigation.
- Latin, Hindi and pitch names: reading symbols, roll labels and active note agree.
- Five-bar Hindi Bansuri playback: notation follows to the last bar; document
  scroll stays zero. End-of-score label and Replay restart the same piece.
- At rounded millisecond bar boundaries, follow and printed groups use the same
  96-tick presentation grid; source events and audio clock stay unquantized.
- A–B loop and out-of-loop note selection preserve intended BPM. No stale loop
  indices migrate into the next library score.
- Fractional DPR uses a stable integer canvas bitmap; resizing triggers redraw.
- Library pagination moves focus to the new results. Search/filters persist while
  moving into practice and returning within the same session.
- PDF: browser generated Alankar, explicit download saved one-page A4 output;
  Poppler rendering visually inspected.
- Import parser fixture passed; **browser upload E2E not verified** because the
  extension file access permission was denied. Do not bypass or count it as passing.
- Native browser fullscreen and physical-device/audio-latency tests remain open.
