# Principal review disposition — 2026-08-16

This record evaluates the independent review supplied against the current
repository, not the older `7b0e8b2` baseline cited by that review. The current
baseline when this record was written is `ef8f639`.

## Implemented immediately

### P1 — mobile piano-canvas usability

**Accepted and implemented.** The implementation lives in
`src/components/visualizers/FallingNotesPianoRoll.tsx`, not in the reviewed
`PianoRollUI.tsx` path. The C3–C7 keyboard now keeps its physical dimensions on
narrow screens inside a horizontal `snap-x` viewport. The viewport smoothly
recentres on the active key during mock playback. Desktop retains the complete
four-octave canvas without a scroll container.

### P2 — public capability and music-claim safety

**Accepted and implemented where applicable.** No public Raga claim existed,
but the landing mock looked too much like a working YouTube ingestion service.
It now identifies the input as future/private-alpha scope and opens a
prepared practice demo. Public copy says relative-note practice, not sheet
music extraction, automatic Raga knowledge, authoritative shruti, or
universal fingering.

### P3 — visualizer accessibility

**Accepted and implemented.** The piano bars and physical keys were already
`aria-hidden`; the Bansuri visual canvas is now also hidden from assistive
technology. The accessible controls and the melody-line note buttons remain
the stable interaction surface, avoiding repeated visualizer announcements.

## Recommendations accepted but deliberately deferred

| Review recommendation | Decision | Trigger |
| --- | --- | --- |
| Waitlist collection | Accept | Build a minimal server-owned waitlist entry path after the owner provides Supabase project credentials and privacy/consent wording. Authentication is not needed for a simple waitlist form. |
| Profiles, credits, cache, library and RLS | Accept | Private alpha after a legal ingestion/provider decision; do not add unused account friction to the waitlist. |
| React Context for the full page | Defer | `useMockTransport` already isolates time-sensitive playback. Split page composition further when a real async result model has more than one consumer; Context alone is not a performance fix. |
| Feature-flagged provider/cache | Accept | Only after a provider contract, permitted source policy, cost ceiling, job lifecycle and failure-credit rule are approved. |
| Bansuri key/profile calibration | Accept | Before any paid or definitive fingering guidance; preserve the current generic-learning disclaimer. |

## Recommendation rejected

Do not manually transcribe popular Bollywood songs for the alpha unless the
composition/arrangement/public-display rights are cleared. Manual work changes
neither copyright nor marketing rights. Alpha content must be original,
public-domain after a jurisdiction-specific review, teacher/creator-authorized,
or participant-provided under explicit permission.

## Smallest meaningful private alpha

Twenty invited learners use five to ten rights-cleared practice sessions. The
success questions are whether a learner completes one five-minute practice
loop, understands the chosen Sa and notation, and returns to the session. The
conversion from waitlist invite to active alpha participant is more meaningful
than raw waitlist size. Collect correction requests and confidence feedback
before connecting any paid live transcription provider.
