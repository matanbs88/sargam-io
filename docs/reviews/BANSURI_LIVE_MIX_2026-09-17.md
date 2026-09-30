# Bansuri live mix follow-up

- Moved Bansuri volume to a shared master GainNode, including the room send.
- Volume changes use a 15 ms exponential smoothing time constant, including mute.
- Removed volume from the transport pause/configure effect. Active and scheduled
  voices share the master gain; no refetch or transport reset on slider changes.
- Disconnect the master when disposing; recreate it during subsequent preparation.
- Disable inferred Meend on polyphonic scores: adjacent array entries do not
  reliably describe musical voice-leading. Preserve imported pitch curves.
- Added regressions for live volume/mute/disposal and polyphonic Meend safety.
- Focused tests passed (18); full suite passed (207 across 57 files).
- ESLint and production build passed. Browser check: volume changed from 85%
  to 30% while Pause remained available and position advanced to 6750 ms.
  Restored 85%, 1x and start position afterward.

Kontakt: native UI connection succeeded and Bansuri.nki was submitted through
the Load dialog. The application temporarily displayed Not Responding while
loading, then successfully displayed the Ventus Bansuri instrument. Clicking
the virtual keyboard displayed `Articulation: Sustain` and its audio waveform.
No successful acoustic reference render or perceptual comparison is claimed.

Visible preset controls include Close and Room microphones, attack/release
ornament choices and probability, dynamics, vibrato and flutter. The web bank
currently uses Close only; its algorithmic curves are not this scripted engine.
Next reference checkpoint: capture the same phrase with controlled MIDI,
velocity, mic balance and loudness before drawing timbre conclusions.
