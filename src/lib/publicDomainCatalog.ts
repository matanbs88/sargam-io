import type { MidiNoteEvent } from "./midiToSargam";
import type { CatalogSong } from "./songCatalog";

/**
 * A small, deliberately conservative public-domain practice set.
 *
 * The events below are our own compact melody studies, expressed as MIDI
 * intervals from Sa. They are not copied score files or recordings. The
 * source links identify the underlying historical work for provenance; the
 * launch rights ledger still needs to confirm territory-specific status.
 */

type MelodyStep = readonly [interval: number, beats?: number];

const ROOT_MIDI = 60;

function melodyEvents(
  steps: readonly MelodyStep[],
  tempoBpm: number,
): readonly MidiNoteEvent[] {
  const beatMs = 60_000 / tempoBpm;
  let startMs = 0;

  return steps.map(([interval, beats = 1], index) => {
    const durationMs = Math.max(120, Math.round(beatMs * beats * 0.92));
    const event = {
      durationMs,
      midi: ROOT_MIDI + interval,
      startMs: Math.round(startMs),
      velocity: index % 4 === 0 ? 98 : 84,
    } satisfies MidiNoteEvent;
    startMs += beatMs * beats;
    return event;
  });
}

function publicDomainStudy(
  id: string,
  title: string,
  artistOrSource: string,
  language: string,
  steps: readonly MelodyStep[],
  tempoBpm: number,
  sourceRef: string,
  difficulty: CatalogSong["difficulty"] = "Beginner",
  timeSignature: CatalogSong["timeSignature"] = "4/4",
): CatalogSong {
  return {
    artistOrSource,
    category: "Public domain",
    difficulty,
    exportAllowed: true,
    id,
    instruments: ["Piano", "Harmonium", "Bansuri"],
    language,
    noteEvents: melodyEvents(steps, tempoBpm),
    rightsBasis: "public-domain",
    rightsNote:
      "Public-domain composition study. Melody events were prepared by Sargam.io; verify territory and source-edition status before commercial launch.",
    rootMidi: ROOT_MIDI,
    sourceKind: "manual",
    sourceRef,
    status: "ready",
    tempoBpm,
    timeSignature,
    title,
    transcriptionStatus: "ready",
  };
}

export const PUBLIC_DOMAIN_CATALOG: readonly CatalogSong[] = [
  publicDomainStudy(
    "pd-twinkle-twinkle-theme",
    "Twinkle Twinkle · theme study",
    "Traditional French melody · Mozart theme",
    "English / French",
    [
      [0, 1], [0, 1], [7, 1], [7, 1], [9, 1], [9, 1], [7, 2],
      [5, 1], [5, 1], [4, 1], [4, 1], [2, 1], [2, 1], [0, 2],
    ],
    88,
    "https://imslp.org/wiki/12_Variations_on_%22Ah,_vous_dirai-je_maman%22,_K.265/300e_%28Mozart,_Wolfgang_Amadeus%29",
  ),
  publicDomainStudy(
    "pd-ode-to-joy-theme",
    "Ode to Joy · theme study",
    "Ludwig van Beethoven · Symphony No. 9",
    "German / instrumental",
    [
      [4, 1], [4, 1], [5, 1], [7, 1], [7, 1], [5, 1], [4, 1], [2, 1],
      [0, 1], [0, 1], [2, 1], [4, 1], [4, 1.5], [2, 0.5], [2, 2],
    ],
    92,
    "https://imslp.org/wiki/Symphony_No.9%2C_Op.125_(Beethoven%2C_Ludwig_van)",
  ),
  publicDomainStudy(
    "pd-fur-elise-opening",
    "Für Elise · opening study",
    "Ludwig van Beethoven · WoO 59",
    "Instrumental",
    [
      [4, 0.5], [3, 0.5], [4, 0.5], [3, 0.5], [4, 0.5], [-1, 0.5],
      [2, 0.5], [0, 0.5], [-3, 1], [-8, 0.5], [-1, 0.5], [1, 0.5],
      [4, 0.5], [5, 0.5], [4, 0.5], [1, 0.5], [3, 0.5], [4, 1],
    ],
    78,
    "https://imslp.org/wiki/Fur_elise",
    "Intermediate",
    "3/8",
  ),
  publicDomainStudy(
    "pd-brahms-lullaby-theme",
    "Brahms Lullaby · theme study",
    "Johannes Brahms · Op. 49 No. 4",
    "German / instrumental",
    [
      [7, 1], [7, 1], [11, 2], [7, 1], [7, 1], [11, 2],
      [7, 1], [11, 1], [0, 1], [11, 1], [9, 2], [7, 1],
      [7, 1], [11, 2], [7, 1], [11, 1], [0, 1], [11, 2],
    ],
    76,
    "https://imslp.org/wiki/Wiegenlied_(Brahms%2C_Johannes)",
  ),
  publicDomainStudy(
    "pd-the-entertainer-theme",
    "The Entertainer · theme study",
    "Scott Joplin · A Rag Time Two-Step",
    "Instrumental",
    [
      [0, 1], [2, 1], [4, 1], [5, 1], [7, 1], [4, 1], [2, 1], [0, 1],
      [2, 1], [4, 1], [5, 1], [7, 1], [9, 1], [7, 1], [5, 1], [4, 1],
      [2, 1], [4, 1], [5, 1], [7, 1], [9, 1], [7, 1], [5, 1], [4, 1],
    ],
    104,
    "https://imslp.org/wiki/The_Entertainer_(Joplin%2C_Scott)",
    "Intermediate",
  ),
  publicDomainStudy(
    "pd-minuet-in-g-theme",
    "Minuet in G · theme study",
    "Christian Petzold · formerly attributed to J. S. Bach",
    "Instrumental",
    [
      [7, 1], [4, 1], [5, 1], [7, 1], [4, 1], [5, 1], [7, 2],
      [9, 1], [7, 1], [5, 1], [4, 1], [5, 1], [7, 1], [5, 1], [4, 2],
    ],
    84,
    "https://imslp.org/wiki/Minuet_in_G_major%2C_BWV_Anh.114_(Petzold%2C_Christian)",
  ),
  publicDomainStudy(
    "pd-moonlight-sonata-opening",
    "Moonlight Sonata · opening study",
    "Ludwig van Beethoven · Op. 27 No. 2",
    "Instrumental",
    [
      [0, 1], [3, 1], [7, 1], [0, 1], [3, 1], [7, 1],
      [-1, 1], [2, 1], [5, 1], [-1, 1], [2, 1], [5, 1],
      [0, 1], [3, 1], [7, 1], [0, 1], [3, 1], [7, 2],
    ],
    58,
    "https://imslp.org/wiki/Piano_Sonata_No.14%2C_Op.27_No.2_(Beethoven%2C_Ludwig_van)",
    "Intermediate",
    "3/4",
  ),
  publicDomainStudy(
    "pd-canon-in-d-theme",
    "Canon in D · theme study",
    "Johann Pachelbel",
    "Instrumental",
    [
      [0, 1], [7, 1], [4, 1], [7, 1], [9, 1], [4, 1], [0, 1], [7, 1],
      [2, 1], [9, 1], [5, 1], [9, 1], [11, 1], [5, 1], [2, 1], [9, 1],
    ],
    72,
    "https://imslp.org/wiki/Canon_and_Gigue_in_D_major%2C_T.337_(Pachelbel%2C_Johann)",
    "Intermediate",
  ),
  publicDomainStudy(
    "pd-swan-lake-theme",
    "Swan Lake · theme study",
    "Pyotr Ilyich Tchaikovsky · Op. 20",
    "Instrumental",
    [
      [7, 2], [5, 1], [4, 1], [2, 2], [0, 1], [2, 1], [4, 2],
      [7, 2], [5, 1], [4, 1], [2, 2], [0, 1], [-1, 1], [0, 2],
    ],
    66,
    "https://imslp.org/wiki/Swan_Lake%2C_Op.20_(Tchaikovsky%2C_Pyotr)",
    "Intermediate",
    "6/8",
  ),
  publicDomainStudy(
    "pd-jesu-joy-theme",
    "Jesu, Joy of Man's Desiring · theme study",
    "Johann Sebastian Bach · BWV 147",
    "German / instrumental",
    [
      [0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [5, 1], [4, 1], [2, 1],
      [0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [9, 1], [7, 1], [5, 2],
    ],
    80,
    "https://imslp.org/wiki/Herz_und_Mund_und_Tat_und_Leben%2C_BWV_147_(Bach%2C_Johann_Sebastian)",
  ),
  publicDomainStudy(
    "pd-clair-de-lune-theme",
    "Clair de lune · theme study",
    "Claude Debussy · Suite bergamasque",
    "French / instrumental",
    [
      [7, 2], [9, 1], [11, 1], [12, 2], [11, 1], [9, 1], [7, 2],
      [5, 1], [7, 1], [9, 2], [7, 1], [5, 1], [4, 2], [2, 2],
    ],
    58,
    "https://imslp.org/wiki/Suite_bergamasque_(Debussy%2C_Claude)",
    "Advanced",
    "3/4",
  ),
];

if (PUBLIC_DOMAIN_CATALOG.length !== 11) {
  throw new Error(
    `Public-domain catalog must contain exactly 11 entries; found ${PUBLIC_DOMAIN_CATALOG.length}.`,
  );
}
