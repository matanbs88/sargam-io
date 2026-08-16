# Repository maintenance workflow

Use this workflow before a production push, external architecture review, or
the start of a new implementation slice.

## Automated gate

```powershell
npm.cmd run audit:repo
npm.cmd run verify
git status --short
```

`audit:repo` confirms that the required project-vault files exist and reports
the source, test, and documentation inventory. `verify` runs ESLint, Vitest,
and the Next.js production build.

## Maintainer checklist

1. Read `README.md`, `MUSIC_DOMAIN.md`, and `INSTRUMENT_STRATEGY.md` before a
   feature changes product behavior.
2. Identify the owning layer: UI component, pure library, server boundary,
   database schema, or documentation. Avoid duplicating rules across layers.
3. Add or update tests for every changed pure rule, API contract, or regression.
4. Run the automated gate above.
5. Manually test the changed user path at desktop width and one narrow mobile
   width. For visualizers, verify playback sync and Cinema view.
6. Update `TESTING_CHECKLIST.md`, `WEEKEND_SUMMARY.md`, and the Gemini handoff
   whenever a claim, known limitation, or quality-gate count changes.
7. Review `git diff --check` and `git status --short`; commit only intentional
   changes with a focused message.
8. Push `main`, deploy, and make one interactive production smoke test.

## Documentation ownership

| Question | Canonical document |
| --- | --- |
| What does the product currently do? | `README.md` + `WEEKEND_SUMMARY.md` |
| What is musically safe to claim? | `MUSIC_DOMAIN.md` |
| Which instrument experiences are appropriate? | `INSTRUMENT_STRATEGY.md` |
| How should another model review the repo? | `GEMINI_REVIEW_REPORT.md` |
| What did the latest cleanup find? | `docs/audits/` |

## Conversation-to-repository rule

Important decisions made in a working conversation must be recorded in one of
the documents above before the task is handed off. The repository, not chat
memory, is the persistent source of truth.
