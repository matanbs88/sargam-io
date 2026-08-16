# Sargam.io quality standard

## Decision

Sargam.io is a premium music-practice product. We choose recognition,
transcription, rendering, and playback technology by demonstrated musical
quality, not by zero cost, local convenience, or the fastest implementation.

## What this means in practice

1. A score is never treated as correct merely because an engine returned
   MusicXML. It must pass structural validation and, where needed, a human
   review state.
2. The default PDF/photo recognizer must win an evidence-based provider
   bake-off on rights-cleared material representative of the audience:
   digital scores, scanned pages, ties, accidentals, multi-voice passages,
   rhythm changes, and Indian practice arrangements.
3. The selection record must include note pitch accuracy, onset/duration
   accuracy, key and meter accuracy, correction time, median/p95 job duration,
   failure rate, cost per accepted page, data retention, and operational
   support.
4. Free or open-source tooling is welcome for development, QA, recovery, and
   research. It is not automatically a production choice. Audiveris is an
   explicitly non-interactive fallback because the local benchmark was too slow
   for the principal user flow.
5. Flat OMR / Opuscan is the first production candidate. It will be accepted
   only after it meets the benchmark. ScoreFlow is the economical fallback
   candidate and must pass the same gate.
6. Sargam.io owns canonical MusicXML, validation, the relative-Sargam engine,
   playback timing, print generation, and the practice interface. Vendors are
   replaceable adapters, never the product's source of truth.

## Closed-beta operating rule

Use standard self-service API accounts and a small prepaid credit balance to
test the product. No bespoke enterprise agreement is required merely to prove
the MVP. Never use a personal desktop licence as a hidden production service;
never expose supplier keys in the browser; and limit the beta to content the
uploader is entitled to process.

## Evidence record

The current PDF benchmark is documented in
[OMR provider strategy](./OMR_PROVIDER_STRATEGY.md). The end-to-end user
experience is documented in
[Unified score experience](./UNIFIED_SCORE_EXPERIENCE.md).
