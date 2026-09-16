# Pilot review packet — 16 September 2026

Status: interactive comparison available; final QA incomplete. This is not a
production release or an assertion of a 90/100 design score.

## Where to review

Local comparison: http://localhost:3010/design-lab

Routes: `/design-lab/studio`, `/design-lab/score`, `/design-lab/riyaz`,
`/design-lab/coach`. Requires the local Next server. Changes are isolated on
`codex/playback-clock-regression`; do not merge/promote the design before Matan
selects a direction. Production remains separate.

## A meaningful comparison

All directions use the same 15-note, four-bar Ode to Joy study, C4 tonic,
92 BPM, 4/4. Compare the interaction, not differing repertoire.

| Direction | Organizing idea | Strongest use | Trade-off to evaluate |
| --- | --- | --- | --- |
| Studio | Persistent library and instrument workspace | Repeated instrument practice | More controls and density |
| Score | Beat-proportional notation as the primary surface | Reading, selecting notes, printing | Instrument is secondary |
| Riyaz | Tonic and current swara as the focal point | Relative-pitch practice | Less explicit lesson progression |
| Coach | Listen, repeat a short loop, then play the phrase | First-time guided practice | Scripted steps, not adaptive assessment |

These are coded interactive alternatives, not final illustrations. The shared
instrument artwork still needs refinement. Coach does not listen to the player
or award accuracy scores; its progression must not imply measured performance.

## Review sequence (about five minutes per direction)

1. Open the study; check that its name and return navigation are visible.
2. Play Piano. Pause mid-note, resume, then restart at half speed.
3. Select Harmonium; try reed and room controls.
4. Select Bansuri, then the explicitly experimental Ventus sustain voice.
5. Switch Latin Sargam, Devanagari and pitch names. Change Sa from C4 to D4:
   this reinterprets the unchanged melody relative to Sa, not pitch transposition.
6. Export PDF. Compare the 15 onsets and four bars to the visible phrase.
7. On a narrow screen check transport access, note readability and navigation.

## Evidence and limits

See `../audits/DESIGN_LAB_BROWSER_QA_2026-09-16.md` for actual browser checks,
download evidence, dimensions and unresolved gates. See
`../audits/VENTUS_WAV_TRIAGE_2026-09-16.md` for sample measurements/provenance.

- Playback state and visual activity were observed for the three instruments.
- Browser PDF download produced a real file; all three notation exports were
  separately rendered and visually inspected.
- Half-speed Ventus pause/resume/end was observed without console errors.
- These observations do **not** establish subjective sound quality, physical
  output-device latency, or full keyboard/screen-reader accessibility.
- Remote preview access encountered an authentication redirect; it was not
  bypassed. Deployment status alone is not a remote functional test.

## Ventus scope

The opt-in preview uses one measured F-sharp-4 sustain anchor across C4–C5.
It is not a complete multisample or Kontakt instrument. There is no verified
loop or recorded legato transition; slides and overlong notes are rejected.
The original library is unchanged. Default application Bansuri remains the
procedural voice; no purchase or new commitment was made.

## Remaining work before pilot sign-off

- Post-build 44px target measurement and phone screenshots for all directions.
- Keyboard-focus, contrast and accessibility checks against rendered UI.
- Full pause/resume/speed/notation matrix across the four directions.
- Listening comparison and measured visual/audio synchronization.
- Remote preview smoke test when access is available.
- Final evidence-based category assessment, explicitly separate from user
  preference. No numerical score is justified by unit tests alone.

Matan's design selection is needed before replacing production, not before
continuing independent QA and refinement on this branch.
