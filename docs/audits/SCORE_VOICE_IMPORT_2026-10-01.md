---
title: MusicXML melody voice selection and timing audit
type: audit
status: draft
owner: engineering
created: 2026-10-01
updated: 2026-10-01
review_by: 2026-10-08
---

# MusicXML melody voice selection and timing audit

This preview slice addresses polyphonic score ingestion after the production
single-line bansuri release. It does not add catalog pieces or connect live
audio recognition. Production remains on `dc1c3ed`.

## Changes

MusicXML notes now follow the actual ordered note, backup and forward timeline.
Chord tones share the preceding note onset. Written staff and voice identifiers
are preserved; rests and trailing forward silence advance measure time.
Contiguous ties merge only within the same staff, voice and pitch. Broken ties
remain separate attacks with review warnings.

When an import has multiple voices or a chordal voice, the learner chooses its
melodic voice before opening practice. A single-note written line can be lower
than its accompaniment. The full imported first-part arrangement remains
available in piano mode. Bansuri and harmonium use the chosen monophonic line.
Chordal choices use a labelled upper-note estimate, not certified melody
recognition. The estimate flag survives practice and local draft storage.

Saving a melodic correction updates the saved melody without replacing the
original arrangement. Local drafts validate and retain both timelines.

## Evidence

The fixture `tests/fixtures/melody-voice-selection.musicxml` contains high
accompaniment and a lower four-note melody. Chrome upload displayed both
staff/voice choices, correctly labelled the chordal choice as an estimate,
and opened the selected lower voice as S, R, G, m across two bars. The note
navigator reported four notes rather than including the high accompaniment.

Final `npm.cmd run closeout` passed repository audit, lint, all 375 tests in
74 files, production build and whitespace checks. Two strengthened assertions
then passed the focused 48-test timeline/storage suite. TypeScript completed
inside the final build. These checks do not certify UI playback or audio quality.

## Remaining acceptance gates

Chrome became unresponsive during the subsequent instrument and save-draft
check. Bansuri playback, refresh/restore, narrow-viewport layout and a final
screen capture are not browser-verified for this slice. Automated storage
tests are not a substitute for those checks. Keep this change on preview.

The importer still processes only the first instrument part and explicitly
warns on multipart files. Mid-measure attribute changes and microtonal pitch
alterations are rejected rather than silently approximated. Written repeats,
tempo changes and grace-note performance are not expanded by this slice.
Selecting a written voice is a learner decision, not proof of melodic intent.

## Next work

Complete the remaining browser gates, then introduce an explicit canonical
import model for multipart selection and repeat/tempo semantics before durable
transcription jobs. Do not restart manual catalog expansion.
