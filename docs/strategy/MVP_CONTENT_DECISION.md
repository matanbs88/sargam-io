# MVP content decision — build first, launch review later

**Decision date:** 2026-08-26
**Owner:** Founder directive
**Applies to:** Local MVP, catalog UX, practice flows, PDF generation, and
content-pipeline implementation

## Decision

During MVP development, Sargam.io will not stop implementation, hide catalog
items, or block a product capability because of a rights assessment. The
founder owns the decision about which material is used during this private
build and test phase. The engineering team should build the complete product
flow against realistic catalog records and keep moving.

Rights, attribution, permissions, and publication policy are launch-stage
work. They will be reviewed before the public/commercial release and before
any final production catalogue is selected.

## Engineering rules

1. Never use a rights field as a reason to stop an unrelated MVP feature.
2. Never label an MVP catalog card “locked”, “forbidden”, or “blocked by
   rights”.
3. A catalog record with no note events is a content-pipeline task, not a
   legal block. It should be labelled `planned` or `in MVP queue`.
4. Keep provenance and rights fields as editable metadata for the later launch
   review, but do not make them part of practice navigation or UI gating.
5. Do not fabricate note events merely to make a title look complete. Missing
   transcription data is a normal backlog state and must be communicated as
   such.
6. PDF export and practice code must be technically reusable for every score
   that has valid note events. Any final publication policy is configured at
   the launch/deployment boundary, not hardcoded into the MVP experience.

## Current implementation consequence

The catalog contains 100 records. Twelve have playable original note events;
the remaining records are visible in the MVP queue and are waiting for score
or transcription data. They are not removed from search because of a rights
decision. The `rightsBasis` and `exportAllowed` fields remain internal,
editable metadata for the later launch review and are not presented as a
product warning.

## What happens at launch preparation

Before a public or commercial release, the founder will choose the final
content set and complete the required review for songs, arrangements,
recordings, samples, attribution, and export policy. That review is a release
gate only. It is not a reason to pause the MVP build, the practice engine, the
visualizers, the PDF pipeline, or the content import workflow today.

This document supersedes older MVP wording that described planned catalogue
entries as “rights-gated” or “locked”. Older research documents remain useful
as background, but this decision controls current implementation language and
behavior.
