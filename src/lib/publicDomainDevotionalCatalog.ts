import type { MidiNoteEvent } from "./midiToSargam";
import type { CatalogSong } from "./songCatalog";

/**
 * Devotional practice studies built from public-domain/traditional texts.
 *
 * Many bhajans, stotras, and mantras have several regional melodies. These
 * events therefore represent an internally authored, singable study version;
 * they are not copied from a modern singer, film, or streaming recording.
 */

type DevotionalStep = readonly [interval: number, beats?: number];

const ROOT_MIDI = 60;

function devotionalEvents(
  steps: readonly DevotionalStep[],
  tempoBpm: number,
): readonly MidiNoteEvent[] {
  const beatMs = 60_000 / tempoBpm;
  let startMs = 0;

  return steps.map(([interval, beats = 1], index) => {
    const event = {
      durationMs: Math.max(140, Math.round(beatMs * beats * 0.9)),
      midi: ROOT_MIDI + interval,
      startMs: Math.round(startMs),
      velocity: index % 8 === 0 ? 100 : 84,
    } satisfies MidiNoteEvent;
    startMs += beatMs * beats;
    return event;
  });
}

function devotionalStudy(
  id: string,
  title: string,
  nativeTitle: string,
  artistOrSource: string,
  language: string,
  steps: readonly DevotionalStep[],
  tempoBpm: number,
  sourceRef: string,
  difficulty: CatalogSong["difficulty"] = "Beginner",
  timeSignature: CatalogSong["timeSignature"] = "4/4",
): CatalogSong {
  return {
    artistOrSource,
    category: "Devotional",
    difficulty,
    exportAllowed: true,
    id,
    instruments: ["Piano", "Harmonium", "Bansuri"],
    language,
    nativeTitle,
    noteEvents: devotionalEvents(steps, tempoBpm),
    rightsBasis: "public-domain",
    rightsNote:
      "Traditional/public-domain devotional text with an internally authored practice melody. Regional melodies vary; verify the chosen version before commercial promotion.",
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

export const PUBLIC_DOMAIN_DEVOTIONAL_CATALOG: readonly CatalogSong[] = [
  devotionalStudy(
    "pd-hanuman-chalisa-study",
    "Hanuman Chalisa · practice study",
    "हनुमान चालीसा",
    "Goswami Tulsidas · traditional devotional text",
    "Awadhi / Hindi",
    [[0, 1], [0, 1], [2, 1], [4, 1], [5, 2], [4, 1], [2, 1], [0, 2], [0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [5, 1], [4, 1], [2, 2]],
    76,
    "https://en.wikipedia.org/wiki/Hanuman_Chalisa",
    "Intermediate",
  ),
  devotionalStudy(
    "pd-shri-ramachandra-kripalu",
    "Shri Ramachandra Kripalu · practice study",
    "श्री रामचन्द्र कृपालु भजु मन",
    "Goswami Tulsidas · Vinaya Patrika tradition",
    "Awadhi / Sanskrit",
    [[0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [5, 1], [4, 1], [2, 2], [0, 1], [2, 1], [4, 1], [5, 1], [7, 1], [9, 1], [7, 2]],
    72,
    "https://en.wikipedia.org/wiki/Shri_Ramachandra_Kripalu",
    "Intermediate",
  ),
  devotionalStudy(
    "pd-vaishnava-jana-to",
    "Vaishnava Jana To · practice study",
    "वैष्णव जन तो",
    "Narsinh Mehta · Gujarati bhajan tradition",
    "Gujarati",
    [[0, 1], [2, 1], [4, 2], [4, 1], [5, 1], [7, 2], [5, 1], [4, 1], [2, 2], [0, 1], [2, 1], [4, 1], [5, 1], [4, 1], [2, 1], [0, 2]],
    72,
    "https://en.wikipedia.org/wiki/Vaishnava_Jana_To",
  ),
  devotionalStudy(
    "pd-om-jai-jagdish-hare",
    "Om Jai Jagdish Hare · aarti study",
    "ॐ जय जगदीश हरे",
    "Shardha Ram Phillauri · 19th-century aarti",
    "Hindi",
    [[0, 1], [0, 1], [2, 1], [4, 1], [5, 2], [5, 1], [4, 1], [2, 2], [0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [5, 1], [4, 1], [2, 2]],
    80,
    "https://en.wikipedia.org/wiki/Om_Jai_Jagdish_Hare",
  ),
  devotionalStudy(
    "pd-bhaja-govindam",
    "Bhaja Govindam · practice study",
    "भज गोविन्दम्",
    "Adi Shankaracharya · traditional Sanskrit hymn",
    "Sanskrit",
    [[0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [7, 1], [5, 1], [4, 2], [2, 1], [4, 1], [5, 1], [7, 1], [9, 2], [7, 1], [5, 1], [4, 2]],
    68,
    "https://en.wikipedia.org/wiki/Bhaja_Govindam",
    "Intermediate",
  ),
  devotionalStudy(
    "pd-madhurashtakam",
    "Madhurashtakam · practice study",
    "मधुराष्टकम्",
    "Vallabhacharya · traditional Sanskrit hymn",
    "Sanskrit",
    [[0, 1], [2, 1], [4, 2], [5, 1], [4, 1], [2, 2], [0, 1], [-1, 1], [0, 2], [2, 1], [4, 1], [5, 2], [7, 1], [5, 1], [4, 2]],
    64,
    "https://en.wikipedia.org/wiki/Madhurashtakam",
  ),
  devotionalStudy(
    "pd-aigiri-nandini",
    "Aigiri Nandini · practice study",
    "अयि गिरिनन्दिनि नन्दितमेदिनि",
    "Mahishasura Mardini stotram · traditional Sanskrit text",
    "Sanskrit",
    [[0, 1], [0, 1], [2, 1], [4, 1], [5, 1], [7, 1], [9, 2], [7, 1], [5, 1], [4, 1], [2, 1], [0, 2], [2, 1], [4, 1], [5, 1], [7, 2]],
    96,
    "https://en.wikipedia.org/wiki/Aigiri_Nandini",
    "Intermediate",
  ),
  devotionalStudy(
    "pd-gayatri-mantra",
    "Gayatri Mantra · chant study",
    "गायत्री मन्त्र",
    "Rigveda 3.62.10 · Vedic tradition",
    "Sanskrit",
    [[0, 1], [2, 1], [4, 1], [5, 2], [4, 1], [2, 1], [0, 2], [0, 1], [2, 1], [4, 1], [5, 1], [7, 2]],
    60,
    "https://en.wikipedia.org/wiki/Gayatri_Mantra",
  ),
  devotionalStudy(
    "pd-achyutam-keshavam",
    "Achyutam Keshavam · practice study",
    "अच्युतम् केशवम्",
    "Traditional devotional composition",
    "Sanskrit / Hindi",
    [[0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [5, 1], [4, 1], [2, 2], [0, 1], [0, 1], [2, 1], [4, 1], [5, 2]],
    74,
    "https://en.wikipedia.org/wiki/Achyutam_Keshavam",
  ),
  devotionalStudy(
    "pd-raghupati-raghav",
    "Raghupati Raghav Raja Ram · practice study",
    "रघुपति राघव राजाराम",
    "Traditional bhajan · public devotional repertoire",
    "Hindi",
    [[0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [7, 1], [5, 1], [4, 2], [2, 1], [4, 1], [5, 1], [7, 1], [9, 2]],
    78,
    "https://en.wikipedia.org/wiki/Raghupati_Raghav_Raja_Ram",
  ),
  devotionalStudy(
    "pd-hare-krishna-mahamantra",
    "Hare Krishna Mahamantra · chant study",
    "हरे कृष्ण महामन्त्र",
    "Vaishnava tradition · traditional mantra",
    "Sanskrit",
    [[0, 1], [2, 1], [4, 2], [4, 1], [2, 1], [0, 2], [0, 1], [2, 1], [4, 2], [5, 1], [4, 1], [2, 2]],
    84,
    "https://en.wikipedia.org/wiki/Hare_Krishna_(mantra)",
  ),
  devotionalStudy(
    "pd-shiv-tandav-stotram",
    "Shiva Tandava Stotram · practice study",
    "शिव ताण्डव स्तोत्रम्",
    "Traditional Sanskrit stotram attributed to Ravana",
    "Sanskrit",
    [[0, 0.5], [0, 0.5], [2, 0.5], [4, 0.5], [5, 1], [7, 0.5], [9, 0.5], [7, 1], [5, 0.5], [4, 0.5], [2, 0.5], [0, 1], [2, 0.5], [4, 0.5], [5, 1]],
    112,
    "https://en.wikipedia.org/wiki/Shiva_Tandava_Stotram",
    "Advanced",
  ),
];

if (PUBLIC_DOMAIN_DEVOTIONAL_CATALOG.length !== 12) {
  throw new Error(
    `Public-domain devotional catalog must contain exactly 12 entries; found ${PUBLIC_DOMAIN_DEVOTIONAL_CATALOG.length}.`,
  );
}
