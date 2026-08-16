# Session closeout workflow

Use this workflow at the end of every implementation session. It converts
conversation decisions into durable repository knowledge, prevents accidental
scope expansion, and leaves a reviewer a reproducible state.

## 1. Classify the change

Before running checks, record whether the session changed one or more of:

- product behaviour or a public claim;
- notation, rhythm, instrument, or audio rules;
- UI layout or visualizer geometry;
- server/API, storage, credentials, payment, or rights assumptions;
- only documentation or internal tooling.

Update the owning source-of-truth document before handoff. Do not leave a
product decision only in chat.

## 2. Automated gate

Run the cross-platform closeout command:

```powershell
npm.cmd run closeout
```

It runs the repository inventory, lint, tests, production build, and Git diff
whitespace validation. A dirty tree is expected before a commit; inspect it
rather than treating it as an automated failure.

## 3. Manual product gate

For every changed user path, test both desktop and a narrow viewport. For the
practice canvas, also verify:

1. Sa selection transposes displayed notes and visualizer pitches together.
2. ABC, Latin Sargam, and Devanagari update every visible note label.
3. Playback, Previous/Next, selected note, progress, Taal cursor, and active
   instrument remain synchronized.
4. Piano bars land on their exact physical key; Bansuri cues stay on their
   relative swara lane and the active fingering remains a reference only.
5. Cinema view has no clipped controls, and exiting it preserves the session.

Record any failure in `TESTING_CHECKLIST.md` or a dated audit; do not silently
describe an untested visual change as complete.

## 4. Repository-vault update

Update only the documents whose claims changed:

| Change | Required update |
| --- | --- |
| Current capabilities or known gaps | `README.md`, `WEEKEND_SUMMARY.md` |
| Music or instrument claim | `MUSIC_DOMAIN.md`, `INSTRUMENT_STRATEGY.md` |
| QA gate or regression path | `TESTING_CHECKLIST.md` |
| Roadmap or market decision | `docs/strategy/` |
| External-review context | `GEMINI_REVIEW_REPORT.md` or `docs/reviews/` |

Use `docs/README.md` as the vault index. New strategy, audit, review, and
operations documents must be linked there.

## 5. Release gate

1. Review `git diff --check` and `git diff`.
2. Commit one focused change with a descriptive conventional message.
3. Push `main` only after all relevant checks pass.
4. Confirm the Vercel deployment is Ready and run one production smoke test.
5. Add the commit SHA, test result, deployment URL, and any deferred risks to
   the current Gemini review request.

## 6. External-review packet

When an independent Gemini review is needed, provide:

- `docs/reviews/GEMINI_LAUNCH_REVIEW_REQUEST_2026-08-16.md`;
- the current `GEMINI_REVIEW_REPORT.md`;
- the relevant changed files and `git diff <previous-sha>..HEAD`;
- screenshots at desktop and vertical-recording dimensions if the UI changed;
- the exact output of `npm.cmd run closeout`.

Gemini is asked to report evidence-backed defects and recommendations. It does
not authorize unreviewed API integrations, musical claims, or rights use.
