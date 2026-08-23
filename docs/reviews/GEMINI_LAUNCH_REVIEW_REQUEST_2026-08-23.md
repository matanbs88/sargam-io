# Gemini launch review request — 2026-08-23

## Context

Please review the current Sargam.io repository as an independent Principal
Engineer, product strategist, and Indian-music domain reviewer. This packet is
the current handoff; the 2026-08-16 request is historical.

- Baseline commit: `7803a53`
- Public preview: <https://sargam-io.vercel.app/>
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest
- Current automated baseline: 58 tests across 21 test files
- Current scope: local mock-driven practice MVP; no live provider, accounts,
  payments, or persistent user library

## What changed since the previous handoff

- Salamander Piano is now the browser piano guide voice with attribution.
- Bansuri roll mode now uses a browser-native procedural Bansuri guide voice
  instead of silently reusing the piano sound.
- The roll selector is the instrument mode control; the redundant instrument
  reference surface was removed from the main flow.
- The source-of-truth and 90-day launch execution documents were synchronized
  with the actual repository state.

## Read these files first

1. [`PROJECT_SOURCE_OF_TRUTH.md`](../PROJECT_SOURCE_OF_TRUTH.md)
2. [`LAUNCH_EXECUTION_PLAN.md`](../strategy/LAUNCH_EXECUTION_PLAN.md)
3. [`README.md`](../../README.md)
4. [`WEEKEND_SUMMARY.md`](../../WEEKEND_SUMMARY.md)
5. [`LAUNCH_STRATEGY.md`](../strategy/LAUNCH_STRATEGY.md)
6. [`UNIFIED_SCORE_EXPERIENCE.md`](../strategy/UNIFIED_SCORE_EXPERIENCE.md)
7. [`QUALITY_STANDARD.md`](../strategy/QUALITY_STANDARD.md)
8. [`SESSION_CLOSEOUT_WORKFLOW.md`](../operations/SESSION_CLOSEOUT_WORKFLOW.md)

Please run the repository checks, including:

```powershell
npm.cmd run closeout
```

## Review questions

### Product and launch

1. Is the waitlist-first, rights-safe launch sequence the correct risk-adjusted
   strategy for this product?
2. Is the initial keyboard/harmonium wedge sufficiently focused while still
   preserving Bansuri as a defensible design-partner wedge?
3. Which five user behaviors or metrics should determine whether we move from
   waitlist to private alpha?
4. Are the 12–20 rights-cleared showcase sessions the right amount and scope
   for the first public proof?

### Engineering and architecture

5. Identify the three largest production risks in the current architecture.
6. Review the canonical MusicXML/timed-event direction and provider-adapter
   boundary for future audio and OMR integrations.
7. Review the planned auth, credit ledger, cache, job state, and review flow for
   isolation, abuse, cost, and recoverability gaps.

### Domain and UX

8. Verify that the Sa/transposition language cannot be misunderstood as a
   Western-key or raga claim.
9. Review the six-hole Bansuri presentation and list the minimum musician
   validation required before calling it accurate.
10. Review the practice canvas for musician clarity, visual hierarchy, and
    mobile/vertical capture quality.

### Rights and business

11. What must be written into provider and sample-library agreements before a
    Web/SaaS beta?
12. Are there any claims in the launch plan or UI that should be removed until
    rights, confidence, or support workflows exist?

## Required output from the review

Please return:

- A score from 1–100 for engineering readiness and product readiness.
- P0/P1/P2 findings with exact file references.
- The five most valuable changes for the next two weeks.
- A go/no-go recommendation for waitlist, private alpha, and public beta as
  separate decisions.
- Any domain or licensing statement that is unsafe or overstated.

