# Pilot piece and preview checkpoint — 2026-09-15

Owner approved backing up the accumulated work, publishing a review preview,
and running one piece through the complete practice/PDF journey. Production
main is not part of this preview promotion.

Selected existing catalog entry: `pd-ode-to-joy-theme` (Ode to Joy).
This is explicitly a four-bar opening study, not the full symphony or full theme.
15 note events, 16 quarter-note beats, 4/4, 92 BPM, C4 = Sa.
Expected Latin Sargam: G G m P P m G R S S R G G R R.

Removed the generic 92% duration gate for this entry only. Event end times now
match the next onset exactly, with rounded absolute boundaries. Added a unit
regression for pitch sequence, continuity and complete 16-beat duration.
The library has a prominent pilot-piece button.

Acceptance journey: open pilot; hear all three instruments; repeat notes 1–4;
switch notation; transpose Sa; export the same score; return to library.
PDF visual review and preview deployment smoke test must be recorded as actual
results, not inferred from unit tests.

Ventus inventory is unchanged: Kontakt/NCW and phrase WAVs exist in the supplied
OneDrive directory, but no verified pitched browser-sampler mapping exists.
Current Bansuri is still the labelled procedural guide. Do not upload the whole
vendor package or pretend that licensing approval is the technical blocker.

Vercel CLI sign-in check reported Logged out. Prefer the already-connected Git
preview workflow; do not create a new temporary project or alter production.

## Actual outcome

- Local checkpoint commit: c234fe1; 120 tests, lint and production build passed.
- Git staged-content inspection found trailing whitespace in an existing Vault
  template; repaired locally after checkpoint (not yet committed).
- Push to origin/codex/playback-clock-regression was rejected by automatic
  permission review: explicit authorization of the external destination and
  code/Vault payload is required. No push, preview or production change occurred.
- Request precise owner approval for github.com/matanbs88/sargam-io, this feature
  branch, source and Vault documentation only; exclude environment files,
  credentials and vendor sound binaries. Do not work around the denied push.
- Browser/PDF end-to-end verification of the selected piece is still pending;
  no PDF output or completed Ventus integration is claimed.

## Approved backup completed

The owner explicitly approved the exact GitHub destination and branch after the
permission rejection. Branch codex/playback-clock-regression was pushed at
8bc110d455027561fc1e70d3709100fb22b53cef; main remained
c6e0c3f10ce57b17a1ef2f3bbcff4d03854c8cc1. Working tree was clean after push.
GitHub reports Vercel status success for that commit:
https://vercel.com/matanbs88s-projects/sargam-io/GkCPgP65gX6H9SqZyzVBYnpEuvcX
This is deployment-status evidence, not a completed browser smoke test.
