# Living Score application expansion — 2026-09-16

## Founder requirements

- Instrument-only view must expand to the available viewport.
- Build the application journey, not only the practice screen.
- Provide explicit numeric BPM control.
- Keep all work on the preview branch; do not replace production.

## Implemented

- `/living-score`: playable catalog, title/composer search, collection filters,
  empty state, score import, practice, return/resume navigation and PDF export.
- Shared practice session accepts actual catalog/imported note events rather than
  a fixed demonstration. Scores paginate in four-bar windows and clip sustained
  notes correctly at bar boundaries without changing playback events.
- Instrument-only layout removes width caps and scales its canvas to viewport
  height. Focus hides surrounding navigation; this is not the browser Fullscreen API.
- Numeric BPM drives the existing playback rate within its 0.25–2 range. Speed
  and displayed BPM agree. Export retains source tempo so note values stay correct.
- Responsive keyboard geometry covers the phrase on narrow screens; default
  legacy rendering is preserved. Bansuri uses a responsive timeline.
- Navigation does not reload the page or discard the current session.

## Evidence and limits

- Production build and TypeScript passed before final small navigation/guard edits.
- 149 tests passed across 43 files, including keyboard bounds and bar clipping.
- Earlier Chrome checks at 390×844 verified responsive piano/bansuri focus views
  and no horizontal overflow. These predate the new library and BPM changes.
- Final Chrome verification is blocked by `Debugger unattached` from the browser
  connector. Do not describe the new full journey as visually verified.
- No production deployment, no claim of 95/100, no claim of a completed V1.

## Next concrete acceptance checks

1. Open `/living-score` in Chrome; search, filter, open two different pieces,
   return to library and resume without losing position.
2. Check instrument-only plus Focus at desktop and 390px widths for all three
   instruments; ensure transport and exit controls remain reachable.
3. Set BPM to a non-preset value, play/pause/seek, switch instrument and verify
   audio/visual timing. Test empty and out-of-range BPM values.
4. Import MusicXML and PDF through the existing services, inspect validation,
   practice and export; verify resulting PDF separately.
5. Complete saved practice/history, unified audio import and accompaniment
   journeys before calling the whole application finished. Imports currently
   remain session-only; classic workspace remains available for audio import.
6. Repeat visual/accessibility audit and record category scores with screenshots.
   Retain the previous verified assessment rather than inventing a 95 score.
