# Sargam.io local MVP testing checklist

This build is entirely local and mock-driven. It does not upload files, fetch
YouTube audio, or contact an external transcription service.

## Happy path

1. Start the app with npm.cmd run dev.
2. Confirm the header displays Credits: 2.
3. Click Transcribe. Credits should become 1 and the mock dashboard should
   appear.
4. Change Sa from D4 to another value and confirm the Transposed badge appears.
5. Switch among ABC, Sa Re Ga, and the Devanagari tab. The note text should
   change immediately, without a request.
6. Click a note, or use Previous, Next, and Play mock. The selected note should
   update in the notation pane.
7. Select Keyboard, Bansuri, and Guitar. Each reference should follow the
   active mock note and the selected Sa.

## Credit guard

1. Use Transcribe another to return to the hero.
2. Run one more mock transcription. Credits should become 0.
3. Return to the hero again and click Transcribe. The app should display its
   no-credit alert and should not show a new dashboard.

## Known mock-only limits

- The audio drop zone and YouTube field are visual placeholders.
- Play mock advances visual note events only; it does not play audio.
- Bansuri and guitar diagrams are reference visualizations, not calibrated
  performance prescriptions.
- Credits reset when the browser refreshes.
