# Gemini review request: session closeout and launch decision

Act as an independent principal product, engineering, UX, and risk reviewer
for Sargam.io. This is a local mock-driven Next.js MVP deployed at
<https://sargam-io.vercel.app>. It is **not** a live YouTube-to-MIDI service.

## Review material

Read, in order:

1. `README.md`
2. `WEEKEND_SUMMARY.md`
3. `GEMINI_REVIEW_REPORT.md`
4. `MUSIC_DOMAIN.md` and `INSTRUMENT_STRATEGY.md`
5. `docs/strategy/LAUNCH_STRATEGY.md`
6. `docs/operations/SESSION_CLOSEOUT_WORKFLOW.md`
7. `TESTING_CHECKLIST.md`

Then run:

```powershell
npm.cmd run closeout
```

## Verified current baseline

- Git branch: `main`
- Latest product commit: `7b0e8b2 feat: expand piano performance canvas`
- Preceding correctness commits: `8d5ece3` (notation parity in visualizers)
  and `53e8aab` (Sa transposition parity)
- Stack: Next.js 16.3, React 19, TypeScript, Tailwind 4, Vitest
- Automated status: lint, 36 Vitest tests, and production build pass
- Deployment: <https://sargam-io.vercel.app>

## What changed in this closeout

1. ABC / Latin Sargam / Devanagari now drives the melody line **and** all
   visible falling-note and Bansuri lane labels through the same formatter.
2. The Piano performance canvas was expanded from C4–C6 to C3–C7, with a
   deeper fall area, physical white/black key treatments, pressed-key states,
   and octave anchors.
3. A release closeout workflow and a waitlist-first launch strategy were added.

## Required review questions

1. Find any state, transposition, accessibility, viewport, or notation-parity
   regression in the current piano/Bansuri visualizers.
2. Assess whether the landing-plus-waitlist strategy is the correct launch
   order given no live ingestion, accounts, or rights-clearance system.
3. Challenge the proposed 90-day metrics and identify the smallest meaningful
   private-alpha milestone.
4. Identify anything in public copy that could overclaim transcription,
   copyright permissions, raga knowledge, or authoritative fingering.
5. Rank the next five implementation tasks by impact, dependency, and risk.

Return findings as `P0`–`P3` with exact paths, evidence, and a minimally safe
fix. Separate hard blockers from strategic suggestions. Do not implement a
provider, payments, copyrighted content, or external integrations without
explicit approval and contracts.
