# Sargam.io — Music Content, Recording and Rights Plan

> This is a practical product checklist, not legal advice. An Indian music/IP lawyer must review every production agreement, license and user-content policy before release.

## The direct answer

We can build most of Sargam.io without recording a musician: notation,
visualizers, practice sessions, transport, playback infrastructure, mock data,
content management and QA can all be built now.

For commercial accompaniment, we must **not** download or reuse performances
found on YouTube or elsewhere on the web. A traditional composition or a
public-domain raga does not make a particular recording free to use. A product
needs rights to the sound recording/master and appropriate performer rights;
the agreement must cover how Sargam distributes, streams, caches and possibly
edits the audio.

The cleanest path is a deliberately commissioned starter library, paired with
practitioner review. The alternative is a commercial library whose written
license explicitly permits this SaaS use.

## What engineering can do without musicians

- Relative Sargam/ABC/Devanagari conversion and editable practice phrases.
- Session persistence, loop, count-in, tempo control, metronome and visual performance mode.
- Raga, taal, instrument, rights and accompaniment metadata schemas.
- Audio playback/mixing infrastructure with clearly marked development placeholders.
- Content review UI, asset manifests, rights-expiry alerts and regression fixtures.
- Provisional instrument UX labelled as draft until player sign-off.

## Asset-free practice audio now

The current product direction includes a browser-native practice-sound engine:
a tonic drone, relative guide notes and tabla-shaped cues scheduled against the
selected theka. It does not ship a copied recording or claim to be an authentic
recorded tabla/tanpura performance. Its role is to make early sessions musical,
responsive and fully legal while the product earns evidence for a future content
investment.

The engine must stay modular: selected Sa, taal, tempo and bol metadata are
separate from the voice that renders them. A licensed sample or commissioned
recording can replace a generated voice later without breaking saved sessions
or changing the interface.

## What cannot come from the internet by default

Do not scrape, sample, download or repackage publicly accessible performances
from YouTube, Spotify, Instagram, websites or competitor apps as product audio.

For any external recording, retain written evidence that its actual rightsholder
grants the required uses. Creative Commons can be suitable only where the exact
license is compatible and the recording/performance chain is documented.
"Public domain" can clear a composition while leaving a modern recording
protected.

RiyazStudio's replayed-performance approach and SurSadhak's realistic
accompaniment are quality references — never material to copy.

## Recommended strategy: commissioned starter library

Commission a narrow, reusable foundation before trying to cover every raga,
instrument or taal.

| Asset family | Initial scope | Required deliverables |
| --- | --- | --- |
| Tabla | Teentaal, Ektal, Jhaptal, Rupak, Keherwa, Dadra, Deepchandi, Addha/Sitarkhani, Tilwada and Jhoomra | Clean loops, useful stems/one-shots, fills, Sam endings and structured metadata |
| Pakhawaj | Chautal and Dhamar | Clean loops, useful stems, tempo/key metadata and performance notes |
| Tanpura | A few consistent Sa, Sa-Pa and Sa-Ma character profiles | Seamless long drones, optional individual plucks, root/tuning metadata |
| Lehra | Start with Teentaal, Ektal, Jhaptal and Rupak on one or two lead instruments | Cycle-perfect loops, stems, tempo/key/taal metadata and phrase boundaries |
| Swarmandal | Exclude from first recording day unless an advisor specifies valid contexts | If recorded: phrase constraints, root/raag metadata and usage notes |

Record musically reviewed slow, medium and fast feels where valid, with a small
number of real variations. Do not create variety by blindly time-stretching or
pitch-shifting instrument recordings; validate all transformations with a
performer or music editor.

## Exact recording package to request

For every approved asset, request:

1. Mastered seamless loop at the agreed tempo and tonic.
2. Original high-resolution WAV master and practical stems (for example close/room or instrument layers).
3. Exact loop points, cycle length, first Sam, tempo, taal, vibhag, bol/theka, tuning/key, instrument, player and take metadata.
4. Separate clean endings, Sam cues, fills and variations where they will be interactive.
5. Named music-review approval for the intended metadata and product use.
6. A delivery manifest mapping each file to its rights agreement and date.

## Alternative: commercial licensed library

Only proceed after the licensor confirms in writing that the license allows:

- Commercial web/SaaS playback to the intended user volume.
- Worldwide distribution for the intended term/platforms.
- Looping, encoding, caching, format conversion and allowed derivative editing.
- Creator video/social export if planned.
- No prohibition on streamed/bundled accompaniment as impermissible redistribution.
- Clear attribution, reporting, renewal and exclusivity conditions.

Keep the invoice, full license, version/date, licensor contact and asset
manifest. A generic "commercial use" label is insufficient for a reusable
practice-audio service.

## People required — and what they do

### Before recording

1. **Indian classical music editor/advisor** — defines starter scope and reviews metadata; does not need to record.
2. **Tabla artist + producer/engineer** — delivers controlled tabla assets and documented loop points.
3. **Tanpura performer/producer** — creates authentic approved drone assets.
4. **Lehra musicians** — begin with one or two voices such as harmonium and sarangi; add bansuri/sitar after the loop system proves itself.
5. **Bansuri reviewer** — validates the six playable finger holes across named flute keys and documents half-hole/embouchure caveats.
6. **Indian IP lawyer** — clears agreements and customer-facing terms before release.

### You personally need not record unless

- You want your own artistic voice or an exclusive branded performance library; or
- You intend to be the named performer/rightsholder for a particular asset.

Commissioning qualified performers is fully valid. Your indispensable decisions
are scope, budget, brand voice, credits and final editorial approval.

## Rights checklist for every commissioned recording

Have counsel convert this into the production agreement:

- Ownership or exclusive, perpetual, worldwide master/sound-recording rights.
- Performer/neighboring rights, consents and collective-management handling where applicable.
- Product streaming, caching, marketing and social/video export permissions.
- Permission (or a clear prohibition) for looping, trimming, mixing, tempo change and pitch conversion.
- Territory, term, exclusivity, payment/royalty, credit and dispute/takedown process.
- Right to sublicense narrowly to hosting/CDN providers needed to operate Sargam.io.
- Warranties that delivered material does not infringe third-party rights.
- File delivery, metadata, approval and replacement obligations.

Never assume permission to "use the recording" includes every one of these uses.

## Musical validation rules

For every public raga, taal or instrument claim, store:

- Source and reviewer name/date.
- What is fixed versus gharana-, school-, instrument- or performer-dependent.
- Supported tuning/range/configuration.
- Conservative UI wording and confidence level.
- A manually reviewed regression example.

For bansuri, describe the embouchure/blowing hole as part of the instrument,
but show the **six playable finger holes** in the visual fingering chart. The
UI must never imply that the blowing hole is absent or finger-controlled.

## Minimum human action plan

When we leave mock audio, the smallest practical sequence is:

1. Appoint one music editor/advisor and select the initial 8–10 taals plus a narrow raga scope.
2. Choose commissioned recording or commercial licensing with lawyer review.
3. If commissioning, hire the tabla artist, producer and one lehra voice using the exact package above.
4. Run paid validation with a bansuri player on the initial flute keys and with the advisor on copy/metadata.
5. Sign agreements before any real file reaches production storage.

All ingestion, metadata entry, UX, testing, deployment and content tooling can
then be carried forward autonomously.

## Research sources

- [RiyazStudio product overview](https://www.riyazstudio.com/)
- [SurSadhak product site](https://sursadhak.com/)
- [SurSadhak App Store listing](https://apps.apple.com/ca/app/sursadhak/id1499799176)
- [SurSadhak terms](https://sursadhak.com/terms-of-service/)
