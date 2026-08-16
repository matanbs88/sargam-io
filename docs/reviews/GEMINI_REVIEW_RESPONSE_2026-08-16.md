# Response to Gemini engineering review — 2026-08-16

## Disposition

The review was evaluated against the current local, mock-driven MVP. The
transport-state recommendation has been implemented. The cache-version and
visualizer-observer findings required clarification because the repository
already addresses them differently.

## Implemented from the review

### Isolated mock transport

`app/page.tsx` no longer owns the timer and event-index transition logic.
`src/features/practice/useMockTransport.ts` owns the mock playback lifecycle;
`src/lib/playback.ts` contains pure, bounded helpers for selection, stepping,
and progress. This keeps the page focused on composition and prepares a clean
replacement point for a future server job/result model.

The helpers have unit coverage for empty phrases, boundary clamping, forward
and backward stepping, and progress calculation. The quality suite now has 27
passing tests across 10 files.

### Musical safety boundary retained

The six-hole Bansuri display remains a visual/reference aid. Its geometry is
exact within the interface because the falling cue lanes and rendered finger
holes use the same shared position helper. The generic chromatic fingering
map is not presented as a calibrated prescription. A player, flute-key,
octave, embouchure, half-hole, and gharana profile is required before the
product promotes any instrument-specific fingering as definitive.

## Clarifications

### Cache keys already include provider version

The future database schema in `db/schema.sql` has the unique key:

```sql
unique (source_fingerprint, provider, provider_version)
```

`provider_version` is the model/provider-version component requested by the
review. A live adapter will still need an explicit policy for version changes
and cache invalidation; the schema is already safe to store both versions.

### No ResizeObserver or canvas geometry exists

The current visualizers are CSS/DOM components, not canvas renderers, and do
not use `ResizeObserver`. Geometry correctness is covered by pure shared
position functions and browser QA at desktop and narrow capture sizes. Add
observer mocks and resize-specific tests only if a later visualizer introduces
runtime measurements.

### The mock API seam remains intentionally

`app/api/transcriptions` is retained because it validates and canonicalizes
input, exercises the cache/provider contract, has route tests, and uses no
external credential. The local page deliberately does not call it. This is a
small, clearly documented integration seam rather than a hidden product
capability. Reassess it when the approved live-provider slice begins.

## Future live-processing UX decision

For a 30–60 second non-cached transcription, do not show fabricated percentage
progress. Use a durable job and clear stage language:

1. Validate the submitted source.
2. For a cache hit, immediately show “Opening your saved arrangement.”
3. For a cache miss, show “Preparing a practice-ready transcription” with
   truthful stages such as source check, melody extraction, and notation
   formatting, plus “usually under one minute” only after it is measured.
4. Let an authenticated user leave and return while the durable job continues;
   surface completion in the library/status area.
5. On failure, give a retry path and a transparent credit policy. A credit
   should not silently disappear for a rejected source or failed provider job.

This design is deferred until authentication, persistence, an approved source
policy, and a real provider contract exist.
