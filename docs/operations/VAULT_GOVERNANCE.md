# Sargam.io Vault governance

**Status:** Active
**Owner:** Founder + engineering agent
**Last reviewed:** 2026-08-28

## Decision

The repository is the canonical project Vault. Product decisions, research,
vendor correspondence, technical decisions, QA evidence, and session handoffs
must be stored as versioned Markdown in this repository. Chat is a working
surface, not the system of record.

This is a docs-as-code model: documentation changes use the same branches,
pull requests, review, CI, and history as code changes.

## Information architecture

```text
docs/
├── README.md                         # navigation index
├── PROJECT_SOURCE_OF_TRUTH.md       # current status and non-negotiables
├── ATTRIBUTIONS.md                   # third-party credits
├── operations/                       # repeatable processes and release gates
│   ├── VAULT_GOVERNANCE.md
│   ├── SESSION_CLOSEOUT_WORKFLOW.md
│   ├── BRANCHING_AND_RELEASE_WORKFLOW.md
│   └── templates/                    # reusable document shapes
├── strategy/                         # product, market, content, and roadmap
├── reviews/                          # dated external reviews and dispositions
├── audits/                           # dated evidence-based audits
└── partnerships/                     # vendor inquiries and replies
```

Code-adjacent truth stays beside the code when that is the clearest reference:
schemas, fixtures, source manifests, and tests remain under `src/` or
`content/`. The Vault links to them instead of duplicating their contents.

## Document types

Use the smallest document type that fits the job:

| Type | Folder | Purpose |
| --- | --- | --- |
| Tutorial | `docs/operations/` or product docs | Teach a newcomer a complete path. |
| How-to | `docs/operations/` | Help a capable contributor complete a task. |
| Reference | `docs/` or domain folder | State stable facts, interfaces, and rules. |
| Explanation | `docs/strategy/` | Explain context, trade-offs, and why. |
| ADR | `docs/decisions/` | Record one durable technical/product decision. |
| Audit | `docs/audits/` | Record evidence, findings, and remediation. |
| Handoff | `docs/reviews/` or root | Capture a dated state for another reviewer. |

This follows the practical Diátaxis distinction between tutorials, how-to
guides, reference, and explanation. Do not create empty folders just to satisfy
the framework; create a document when there is a real need.

## Required metadata

Every new durable document should begin with YAML frontmatter:

```yaml
---
title: Short descriptive title
type: decision | strategy | reference | how-to | audit | handoff | partnership
status: draft | active | superseded | archived
owner: founder | engineering | shared
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_by: YYYY-MM-DD
---
```

Historical documents may be upgraded gradually. Do not rewrite history merely
to add metadata; add metadata when the document is next materially changed.

## Source-of-truth rules

1. `docs/README.md` is the navigation index.
2. `PROJECT_SOURCE_OF_TRUTH.md` contains current product status, rules, and
   launch truth — not a diary.
3. One decision has one canonical home. Other documents link to it.
4. Dated audits, reviews, and handoffs are immutable records; add a new dated
   record instead of silently changing an old conclusion.
5. External messages and replies are copied verbatim into `partnerships/`.
6. Secrets and personal data never enter the Vault.
7. When code changes invalidate a document, the same change must update the
   document or explicitly record the discrepancy.

## Operating workflow

### Before work

- Read `docs/README.md` and `PROJECT_SOURCE_OF_TRUTH.md`.
- Search the Vault before creating a new document: `rg -n "term" docs`.
- Identify the owning source-of-truth document and affected code/tests.

### During work

- Record material decisions immediately in an ADR or the owning strategy doc.
- Keep research sources, date accessed, and confidence visible.
- Keep vendor messages and replies in `docs/partnerships/`.
- Use one feature branch per coherent change.

### Before handoff

- Update current status and affected documents.
- Run `npm.cmd run closeout` when code or product behavior changed.
- Run `git diff --check`.
- Confirm every new document is linked from `docs/README.md`.
- Report changed files, tests, known gaps, and deployment state.

### Before release

- Review the diff and the source-of-truth changes together.
- Merge through the documented branch workflow.
- Record commit, CI result, deployment URL, and smoke-test result.

## Quality checks for the Vault

A document is healthy when a reader can answer: what is this, who owns it,
what is its status, what evidence supports it, what supersedes it, and what is
the next action? If one of those is missing, improve the document rather than
adding another summary elsewhere.

## Research basis

- [Obsidian: a Vault is a local folder](https://obsidian.md/help/vault)
- [Obsidian: Properties](https://obsidian.md/help/properties)
- [Obsidian: Sync and backups](https://obsidian.md/help/sync)
- [Diátaxis documentation framework](https://diataxis.fr/start-here/)
- [GitHub issue and pull-request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
