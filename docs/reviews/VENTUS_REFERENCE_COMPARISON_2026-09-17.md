# Ventus decoding verification

Founder authorized autonomous conversion/comparison, without requiring Kontakt.
Executed conNCW-NG C# decoding compiled in memory using PowerShell Add-Type.
Reference checkout: b4300ce6d0de5ebd0ec648055c2335c914498b70.
No installer, account, signature bypass or changes to vendor files.

Compared all 16 full SustainNormal source files with our JavaScript decoder:
18,844,081 PCM values, zero mismatches (24-bit integer comparison).
This is separate-implementation agreement, not wholly independent format
validation: conNCW-NG was also one of our original format references.
It is not a Kontakt instrument rendering or perceptual listening test.

First three seconds of shipped samples differ from decoded originals only
by the existing PCM16 scaling/quantization (max absolute error <=0.00003219).
The later loop crossfade is outside this comparison. It still needs audition.
The source appears intact; no evidence of a decoder discrepancy was found.

Confirmed other differences: GuideVoiceBank gain attenuates Ode by about
15.3–15.9 dB; 6 of its 15 events fall below the bank's E4 lower native limit,
requiring sample playback-rate changes. Articulations/legato remain absent.
Neither gain nor pitch shifting is equivalent to a decoding failure.

Artifacts in ignored output/audio-comparison:
- ventus-reference-comparison.json (per-file numerical evidence)
- ventus-A4-reference-3s.wav (reference-decoded A4, PCM16 listening export)
- ventus-A4-app-level-3s.wav (offline reconstruction of dry guide envelope/gain)
- ventus-A4-app-level-matched-3s.wav (same reconstruction, attenuation removed)

Reproduce: pwsh -NoProfile -File scripts/verify-ventus-reference.ps1
then node scripts/compare-ventus-reference.mjs.
Offline reconstruction uses no browser audio capture; no auditory quality
approval asserted. No application gain changes or deployment in this task.
