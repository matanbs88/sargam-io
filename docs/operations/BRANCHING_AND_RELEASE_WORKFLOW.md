# Branching and release workflow

## Decision

Use a lightweight three-level workflow:

```text
codex/<feature>  ->  dev  ->  main
       Preview          Integration     Production
```

This is a practical pull-request workflow for a small product. It keeps the
live site stable while allowing continuous work and founder review.

## Branch roles

- `main` — production branch. Vercel production deployment tracks this branch.
- `dev` — shared integration branch. Vercel should provide a persistent preview
  URL for this branch when configured.
- `codex/<feature>` — short-lived implementation branch for one vertical slice,
  such as `codex/catalog-score-batch-01` or `codex/harmonium-polish`.

## Pull-request rules

1. Never develop directly on `main`.
2. Open feature PRs into `dev`.
3. Every PR must pass `npm.cmd run closeout` before merge.
4. Founder review happens on the PR Preview URL and the PR diff.
5. Merge `dev` into `main` only after the founder accepts the current slice.
6. Use a hotfix branch from `main` only for a production incident.

## Required checks

The repository workflow runs on pushes and pull requests targeting both
`dev` and `main`:

- repository audit;
- ESLint;
- Vitest;
- production Next.js build;
- `git diff --check`.

## Content-specific review

For every score-corpus PR, the reviewer checks one sample in each affected
instrument and notation mode:

- selected Sa and transposition;
- Latin Sargam, ABC and Devanagari labels;
- note onset and duration;
- Bansuri hole alignment;
- Harmonium and piano playback;
- one-page/compact PDF output where appropriate.

## Current repository state

The first release was merged to `main`. The next corpus and UX changes should
be developed on a new `codex/*` branch, merged into `dev` for review, and only
then promoted to `main`/production.
