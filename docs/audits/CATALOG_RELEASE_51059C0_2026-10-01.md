# Live complete catalog release 51059c0

Release `51059c027b69879d474769b50503f84e8d464054` pushed to main; exact-commit
GitHub Vercel status reported success. Selected Mehfil design was preserved.

## Live acceptance: two newly complete editions

| Piece | Complete declared form | Live transport endpoint | Live PDF |
| --- | --- | --- | --- |
| Gymnopedie No. 1 | 78 played bars, 128 scalar upper-voice events, full repeat body and both endings | Piano, Harmonium, Bansuri each Replay at 234,000 ms | 200 application/pdf, 71,602 bytes, one A4 page |
| Hark! The Herald Angels Sing | 20 bars, 76 soprano attacks, full hymn setting | Piano, Harmonium, Bansuri each Replay at 41,739 ms | 200 application/pdf, 68,515 bytes, one A4 page |

Actual production Chrome runs were started from time zero at 1x. All six returned
Replay and empty captured error lists. These checks establish runtime completion,
not a claim of expert acoustic listening. Exact engine pitch/onset/duration
regressions complement these browser tests.

Public root Library was opened and searched for each piece. Both Open actions
immediately displayed their complete Sargam (78/20 bars respectively). Gymnopedie
Bar 78 contains all four pitches P, R, n., P.; earlier ending chords also persist
in the source-event and PDF tests. Actual Download score actions returned PDF-ready
links. Actual production export bytes were opened and rendered; all bars, titles,
source attribution and ending chords fit without clipping or overlaps.

Artifacts:

- `output/pdf/catalog-qa/gymnopedie-1-live.pdf`
- `output/pdf/catalog-qa/hark-herald-live.pdf`
- `tmp/catalog-proof/gymnopedie-live.jpg`
- `tmp/catalog-proof/hark-live.jpg`

## Authoritative count

**6/100** live verified complete pieces. The 35 older studies remain distinct from
this count. Public Library total is 41 playable entries. The full goal remains
active and incomplete.

## Next concrete intake

Full Ode to Joy hymn source: 16 bars, 62 attacks, 38,400 ms; all events independently
match official MIDI, including literal low D4 in bar 12. Data and dedicated test
are prepared but not catalog-registered or live. Next: register, run batch playback
and PDF acceptance, verify release, then continue the reviewed digital-source
batch. Research-only candidates are not counted as complete.
