import type { MidiNoteEvent } from "./midiToSargam";
import type { ImportedPracticeScore } from "./importedScoreTimeline";

export type CatalogStatus = "ready" | "planned" | "review";
export type CatalogSourceKind = "musicxml" | "mxl" | "pdf" | "midi" | "manual";
export type CatalogTranscriptionStatus = "ready" | "needs-source" | "needs-review";
export type CatalogFilterCategory = "all" | CatalogCategory;
export type CatalogCategory =
  | "Riyaz"
  | "Bollywood"
  | "Devotional"
  | "Indian pop"
  | "Regional"
  | "Evergreen"
  | "The Beatles";

export type CatalogSong = {
  readonly id: string;
  readonly title: string;
  readonly nativeTitle?: string;
  readonly artistOrSource: string;
  readonly language: string;
  readonly category: CatalogCategory;
  readonly difficulty: "Beginner" | "Intermediate" | "Advanced";
  readonly instruments: readonly ("Piano" | "Harmonium" | "Bansuri")[];
  readonly status: CatalogStatus;
  readonly transcriptionStatus: CatalogTranscriptionStatus;
  readonly sourceKind: CatalogSourceKind | null;
  readonly sourceRef: string | null;
  /** Internal launch metadata; never a development or practice gate. */
  readonly rightsBasis: "original" | "rights-review";
  readonly exportAllowed: boolean;
  readonly tempoBpm: number;
  readonly timeSignature: "4/4" | "3/4" | "6/8";
  readonly rootMidi: number;
  readonly noteEvents: readonly MidiNoteEvent[] | null;
  readonly rightsNote: string;
};

const PRACTICE_INSTRUMENTS = ["Piano", "Harmonium", "Bansuri"] as const;
const CATALOG_ROOT_MIDI = 60;

function exerciseEvents(intervals: readonly number[], stepMs = 500): readonly MidiNoteEvent[] {
  return intervals.map((interval, index) => ({
    durationMs: index === intervals.length - 1 ? stepMs * 1.6 : stepMs * 0.82,
    midi: CATALOG_ROOT_MIDI + interval,
    startMs: index * stepMs,
    velocity: index % 4 === 0 ? 96 : 82,
  }));
}

function readyExercise(
  id: string,
  title: string,
  difficulty: CatalogSong["difficulty"],
  intervals: readonly number[],
  tempoBpm = 84,
): CatalogSong {
  return {
    artistOrSource: "Sargam original Riyaz exercise",
    category: "Riyaz",
    difficulty,
    id,
    instruments: PRACTICE_INSTRUMENTS,
    language: "Sargam",
    noteEvents: exerciseEvents(intervals, Math.round(60_000 / tempoBpm / 2)),
    rightsNote: "Original Sargam.io exercise; cleared for product testing and export.",
    rightsBasis: "original",
    rootMidi: CATALOG_ROOT_MIDI,
    sourceKind: "manual",
    sourceRef: "internal:riyaz",
    status: "ready",
    transcriptionStatus: "ready",
    exportAllowed: true,
    tempoBpm,
    timeSignature: "4/4",
    title,
  };
}

function plannedSong(
  id: string,
  title: string,
  artistOrSource: string,
  language: string,
  category: CatalogCategory,
  difficulty: CatalogSong["difficulty"] = "Intermediate",
  tempoBpm = 96,
  timeSignature: CatalogSong["timeSignature"] = "4/4",
): CatalogSong {
  return {
    artistOrSource,
    category,
    difficulty,
    id,
    instruments: PRACTICE_INSTRUMENTS,
    language,
    noteEvents: null,
    rightsNote:
      "MVP catalog entry. Note data is queued for the content pipeline and will be added without blocking the rest of the product build.",
    rightsBasis: "rights-review",
    rootMidi: CATALOG_ROOT_MIDI,
    sourceKind: null,
    sourceRef: null,
    status: "planned",
    transcriptionStatus: "needs-source",
    exportAllowed: false,
    tempoBpm,
    timeSignature,
    title,
  };
}

/**
 * MVP seed catalog. Ready entries contain playable note events; repertoire
 * entries are demand-map records waiting for note data. Launch-stage content
 * review is deliberately kept separate from MVP development and UX behavior.
 */
export const SONG_CATALOG: readonly CatalogSong[] = [
  readyExercise("riyaz-sa-re-ga", "Sa · Re · Ga · Ma", "Beginner", [0, 2, 4, 5, 4, 2, 0]),
  readyExercise("riyaz-arohana", "Aroha — Sa Re Ga Ma Pa Dha Ni Sa", "Beginner", [0, 2, 4, 5, 7, 9, 11, 12]),
  readyExercise("riyaz-avarohana", "Avaroha — Sa Ni Dha Pa Ma Ga Re Sa", "Beginner", [12, 11, 9, 7, 5, 4, 2, 0]),
  readyExercise("riyaz-sa-pa-sa", "Sa · Pa · Sa drone landing", "Beginner", [0, 7, 12, 7, 0], 72),
  readyExercise("riyaz-shuddha-swara", "Shuddha swara ladder", "Beginner", [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0]),
  readyExercise("riyaz-komal-colour", "Komal swara colour study", "Intermediate", [0, 1, 3, 5, 7, 8, 10, 12]),
  readyExercise("riyaz-teevra-ma", "Teevra Ma focus", "Intermediate", [0, 2, 4, 6, 7, 6, 4, 2, 0]),
  readyExercise("riyaz-alankar-one", "Alankar 1 — paired ascent", "Beginner", [0, 2, 2, 4, 4, 5, 5, 7, 7, 5, 5, 4, 4, 2, 2, 0]),
  readyExercise("riyaz-alankar-two", "Alankar 2 — three-note turns", "Intermediate", [0, 2, 4, 2, 4, 5, 4, 5, 7, 5, 7, 9, 7, 9, 11, 9]),
  readyExercise("riyaz-meend-shapes", "Phrase shapes for meend practice", "Advanced", [0, 4, 2, 7, 5, 9, 7, 12, 9, 7, 5, 2, 0], 66),
  readyExercise("riyaz-bansuri-breath", "Bansuri breath-length ladder", "Beginner", [0, 2, 4, 5, 7, 5, 4, 2, 0], 60),
  readyExercise("riyaz-taal-teentaal", "Teentaal four-beat phrase", "Intermediate", [0, 2, 4, 5, 7, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 0], 80),

  plannedSong("tum-hi-ho", "Tum Hi Ho", "Arijit Singh · Aashiqui 2", "Hindi", "Bollywood", "Beginner", 94),
  plannedSong("kesariya", "Kesariya", "Arijit Singh · Brahmāstra", "Hindi", "Bollywood", "Beginner", 94),
  plannedSong("apna-bana-le", "Apna Bana Le", "Arijit Singh · Bhediya", "Hindi", "Bollywood", "Beginner", 102),
  plannedSong("channa-mereya", "Channa Mereya", "Arijit Singh · Ae Dil Hai Mushkil", "Hindi", "Bollywood", "Intermediate", 96),
  plannedSong("agar-tum-saath-ho", "Agar Tum Saath Ho", "Alka Yagnik & Arijit Singh · Tamasha", "Hindi", "Bollywood", "Intermediate", 88),
  plannedSong("kabira", "Kabira", "Tochi Raina & Rekha Bhardwaj · Yeh Jawaani Hai Deewani", "Hindi", "Bollywood", "Intermediate", 92),
  plannedSong("kal-ho-naa-ho", "Kal Ho Naa Ho", "Sonu Nigam · Kal Ho Naa Ho", "Hindi", "Evergreen", "Intermediate", 82),
  plannedSong("ae-dil-hai-mushkil", "Ae Dil Hai Mushkil", "Arijit Singh · Ae Dil Hai Mushkil", "Hindi", "Bollywood", "Intermediate", 82),
  plannedSong("raabta", "Raabta", "Arijit Singh · Agent Vinod", "Hindi", "Bollywood", "Beginner", 92),
  plannedSong("shayad", "Shayad", "Arijit Singh · Love Aaj Kal", "Hindi", "Bollywood", "Beginner", 78),
  plannedSong("tujhe-kitna-chahne-lage", "Tujhe Kitna Chahne Lage", "Arijit Singh · Kabir Singh", "Hindi", "Bollywood", "Beginner", 80),
  plannedSong("hamari-adhuri-kahani", "Hamari Adhuri Kahani", "Arijit Singh · Hamari Adhuri Kahani", "Hindi", "Bollywood", "Intermediate", 78),
  plannedSong("muskurane", "Muskurane", "Arijit Singh · CityLights", "Hindi", "Bollywood", "Beginner", 88),
  plannedSong("phir-bhi-tumko-chaahunga", "Phir Bhi Tumko Chaahunga", "Arijit Singh · Half Girlfriend", "Hindi", "Bollywood", "Intermediate", 86),
  plannedSong("gerua", "Gerua", "Arijit Singh & Antara Mitra · Dilwale", "Hindi", "Bollywood", "Intermediate", 92),
  plannedSong("manwa-laage", "Manwa Laage", "Arijit Singh & Shreya Ghoshal · Happy New Year", "Hindi", "Bollywood", "Beginner", 96),
  plannedSong("samjhawan", "Samjhawan", "Arijit Singh & Shreya Ghoshal · Humpty Sharma Ki Dulhania", "Hindi", "Bollywood", "Beginner", 92),
  plannedSong("jeena-jeena", "Jeena Jeena", "Atif Aslam · Badlapur", "Hindi", "Bollywood", "Beginner", 90),
  plannedSong("main-phir-bhi-tumko", "Main Phir Bhi Tumko Chaahunga", "Arijit Singh · Half Girlfriend", "Hindi", "Bollywood", "Intermediate", 86),
  plannedSong("sajni", "Sajni", "Arijit Singh · Laapataa Ladies", "Hindi", "Bollywood", "Beginner", 84),
  plannedSong("o-maahi", "O Maahi", "Arijit Singh · Dunki", "Hindi", "Bollywood", "Beginner", 82),
  plannedSong("satranga", "Satranga", "Arijit Singh · Animal", "Hindi", "Bollywood", "Intermediate", 90),
  plannedSong("ranjhan", "Ranjhan", "Sachet-Parampara · Do Patti", "Hindi", "Bollywood", "Intermediate", 92),
  plannedSong("saiyaara", "Saiyaara", "Faheem Abdullah · Saiyaara", "Hindi", "Bollywood", "Intermediate", 86),
  plannedSong("ishq", "Ishq", "Faheem Abdullah · Lost;Found", "Hindi", "Indian pop", "Intermediate", 88),
  plannedSong("jo-tum-mere-ho", "Jo Tum Mere Ho", "Anuv Jain", "Hindi", "Indian pop", "Beginner", 90),
  plannedSong("baarishein", "Baarishein", "Anuv Jain", "Hindi", "Indian pop", "Beginner", 82),
  plannedSong("gul", "Gul", "Anuv Jain", "Hindi", "Indian pop", "Beginner", 80),
  plannedSong("heeriye", "Heeriye", "Jasleen Royal & Arijit Singh", "Hindi", "Indian pop", "Beginner", 105),
  plannedSong("sahiba", "Sahiba", "Jasleen Royal", "Hindi", "Indian pop", "Beginner", 98),
  plannedSong("pasoori", "Pasoori", "Ali Sethi & Shae Gill · Coke Studio", "Punjabi", "Indian pop", "Intermediate", 94, "6/8"),
  plannedSong("afreen-afreen", "Afreen Afreen", "Rahat Fateh Ali Khan & Momina Mustehsan · Coke Studio", "Urdu", "Indian pop", "Intermediate", 92, "6/8"),
  plannedSong("tu-jhoom", "Tu Jhoom", "Naseebo Lal & Abida Parveen · Coke Studio", "Punjabi/Urdu", "Indian pop", "Advanced", 78, "6/8"),
  plannedSong("chaleya", "Chaleya", "Arijit Singh & Shilpa Rao · Jawan", "Hindi", "Bollywood", "Beginner", 100),
  plannedSong("what-jhumka", "What Jhumka?", "Arijit Singh & Jonita Gandhi · Rocky Aur Rani", "Hindi", "Bollywood", "Intermediate", 112),
  plannedSong("tauba-tauba", "Tauba Tauba", "Karan Aujla · Bad Newz", "Punjabi", "Indian pop", "Intermediate", 102),
  plannedSong("naina", "Naina", "Diljit Dosanjh · Crew", "Hindi", "Bollywood", "Intermediate", 104),
  plannedSong("tere-vaaste", "Tere Vaaste", "Varun Jain & Shadab Faridi · Zara Hatke Zara Bachke", "Hindi", "Bollywood", "Beginner", 104),
  plannedSong("ve-kamleya", "Ve Kamleya", "Arijit Singh & Shreya Ghoshal · Rocky Aur Rani", "Hindi", "Bollywood", "Intermediate", 88),
  plannedSong("deewani-mastani", "Deewani Mastani", "Shreya Ghoshal · Bajirao Mastani", "Hindi", "Bollywood", "Advanced", 92),
  plannedSong("kun-faya-kun", "Kun Faya Kun", "A.R. Rahman, Javed Ali & Mohit Chauhan · Rockstar", "Hindi", "Bollywood", "Advanced", 76),

  plannedSong("om-jai-jagdish", "Om Jai Jagdish Hare", "Traditional aarti", "Hindi", "Devotional", "Beginner", 72),
  plannedSong("achyutam-keshavam", "Achyutam Keshavam", "Traditional devotional", "Sanskrit/Hindi", "Devotional", "Beginner", 72),
  plannedSong("raghupati-raghav", "Raghupati Raghav Raja Ram", "Traditional bhajan", "Hindi", "Devotional", "Beginner", 76),
  plannedSong("vaishnav-jan-to", "Vaishnav Jan To", "Narsinh Mehta tradition", "Gujarati", "Devotional", "Beginner", 72),
  plannedSong("hanuman-chalisa", "Hanuman Chalisa", "Traditional devotional", "Hindi", "Devotional", "Intermediate", 84),
  plannedSong("shree-ram-jai-ram", "Shree Ram Jai Ram Jai Jai Ram", "Traditional mantra", "Sanskrit", "Devotional", "Beginner", 70),
  plannedSong("hare-krishna", "Hare Krishna Mahamantra", "Traditional kirtan", "Sanskrit", "Devotional", "Beginner", 80),
  plannedSong("ganesh-vandana", "Vakratunda Mahakaya", "Traditional prayer", "Sanskrit", "Devotional", "Beginner", 68),
  plannedSong("guru-brahma", "Guru Brahma Guru Vishnu", "Traditional prayer", "Sanskrit", "Devotional", "Beginner", 68),
  plannedSong("jai-ganesh-deva", "Jai Ganesh Deva", "Traditional aarti", "Hindi", "Devotional", "Beginner", 84),
  plannedSong("aarti-kunj-bihari", "Aarti Kunj Bihari Ki", "Traditional aarti", "Hindi", "Devotional", "Intermediate", 84),
  plannedSong("ambe-tu-hai", "Ambe Tu Hai Jagdambe", "Traditional aarti", "Hindi", "Devotional", "Beginner", 80),
  plannedSong("shri-ram-janki", "Shri Ram Janki Baithe Hain", "Traditional bhajan", "Hindi", "Devotional", "Beginner", 76),
  plannedSong("sukhkarta-dukhharta", "Sukhkarta Dukhharta", "Traditional aarti", "Marathi", "Devotional", "Beginner", 80),

  plannedSong("natu-natu", "Naatu Naatu", "M. M. Keeravani · RRR", "Telugu", "Regional", "Intermediate", 116),
  plannedSong("butta-bomma", "Butta Bomma", "Armaan Malik · Ala Vaikunthapurramuloo", "Telugu", "Regional", "Beginner", 106),
  plannedSong("vachinde", "Vachinde", "Madhura Audio · Fidaa", "Telugu", "Regional", "Intermediate", 104),
  plannedSong("rowdy-baby", "Rowdy Baby", "Dhanush & Dhee · Maari 2", "Tamil", "Regional", "Intermediate", 110),
  plannedSong("arabic-kuthu", "Arabic Kuthu", "Anirudh Ravichander · Beast", "Tamil", "Regional", "Intermediate", 110),
  plannedSong("vaathi-coming", "Vaathi Coming", "Anirudh Ravichander · Master", "Tamil", "Regional", "Intermediate", 112),
  plannedSong("munbe-vaa", "Munbe Vaa", "Shreya Ghoshal · Sillunu Oru Kaadhal", "Tamil", "Regional", "Intermediate", 92),
  plannedSong("apna-bana-le-bengali", "Amaro Porano Jaha Chay", "Rabindranath Tagore tradition", "Bengali", "Regional", "Advanced", 72),
  plannedSong("malare", "Malare", "Vijay Yesudas · Premam", "Malayalam", "Regional", "Intermediate", 86),
  plannedSong("kadalalle", "Kadalalle", "Sid Sriram · Dear Comrade", "Telugu", "Regional", "Intermediate", 88),

  plannedSong("lag-ja-gale", "Lag Ja Gale", "Lata Mangeshkar · Woh Kaun Thi?", "Hindi", "Evergreen", "Intermediate", 76),
  plannedSong("ajeeb-dastan", "Ajeeb Dastan Hai Yeh", "Lata Mangeshkar · Dil Apna Aur Preet Parai", "Hindi", "Evergreen", "Intermediate", 86),
  plannedSong("pal-pal-dil-ke-paas", "Pal Pal Dil Ke Paas", "Kishore Kumar · Blackmail", "Hindi", "Evergreen", "Beginner", 82),
  plannedSong("mere-sapno-ki-rani", "Mere Sapno Ki Rani", "Kishore Kumar · Aradhana", "Hindi", "Evergreen", "Beginner", 108),
  plannedSong("yeh-shaam-mastani", "Yeh Shaam Mastani", "Kishore Kumar · Kati Patang", "Hindi", "Evergreen", "Beginner", 86),
  plannedSong("ek-pyar-ka-nagma", "Ek Pyar Ka Nagma Hai", "Lata Mangeshkar & Mukesh · Shor", "Hindi", "Evergreen", "Beginner", 78),
  plannedSong("chura-liya-hai", "Chura Liya Hai Tumne", "Asha Bhosle & Mohammed Rafi · Yaadon Ki Baaraat", "Hindi", "Evergreen", "Intermediate", 88),
  plannedSong("kya-mujhe-pyar", "Kya Mujhe Pyaar Hai", "KK · Woh Lamhe", "Hindi", "Evergreen", "Beginner", 104),
  plannedSong("zara-zara", "Zara Zara", "Bombay Jayashri · Rehnaa Hai Terre Dil Mein", "Hindi", "Evergreen", "Intermediate", 80),
  plannedSong("pehla-nasha", "Pehla Nasha", "Udit Narayan & Sadhana Sargam · Jo Jeeta Wohi Sikandar", "Hindi", "Evergreen", "Beginner", 86),

  plannedSong("let-it-be", "Let It Be", "The Beatles", "English", "The Beatles", "Beginner", 72),
  plannedSong("hey-jude", "Hey Jude", "The Beatles", "English", "The Beatles", "Beginner", 74),
  plannedSong("here-comes-the-sun", "Here Comes the Sun", "The Beatles", "English", "The Beatles", "Intermediate", 129),
  plannedSong("yesterday", "Yesterday", "The Beatles", "English", "The Beatles", "Beginner", 96, "3/4"),
  plannedSong("penny-lane", "Penny Lane", "The Beatles", "English", "The Beatles", "Intermediate", 114),
  plannedSong("while-my-guitar-gently-weeps", "While My Guitar Gently Weeps", "The Beatles", "English", "The Beatles", "Advanced", 112),
  plannedSong("drive-my-car", "Drive My Car", "The Beatles", "English", "The Beatles", "Intermediate", 122),
  plannedSong("blackbird", "Blackbird", "The Beatles", "English", "The Beatles", "Intermediate", 92),
  plannedSong("something", "Something", "The Beatles", "English", "The Beatles", "Intermediate", 92),
  plannedSong("come-together", "Come Together", "The Beatles", "English", "The Beatles", "Intermediate", 82),
  plannedSong("all-you-need-is-love", "All You Need Is Love", "The Beatles", "English", "The Beatles", "Beginner", 104),
  plannedSong("twist-and-shout", "Twist and Shout", "The Beatles", "English", "The Beatles", "Beginner", 126),
  plannedSong("in-my-life", "In My Life", "The Beatles", "English", "The Beatles", "Intermediate", 103),
] as const;

if (SONG_CATALOG.length !== 100) {
  throw new Error(`Song catalog must contain exactly 100 entries; found ${SONG_CATALOG.length}.`);
}

export const READY_CATALOG_SONGS = SONG_CATALOG.filter(
  (song) => song.status === "ready",
);

export type CatalogScoreImport = Pick<
  ImportedPracticeScore,
  "noteEvents" | "sourceFormat" | "timeSignature" | "title" | "validation"
> & {
  readonly sourceRef: string;
  readonly sourceKind?: CatalogSourceKind;
  readonly tempoBpm?: number;
};

function normalizeTimeSignature(
  value: string | null,
  fallback: CatalogSong["timeSignature"],
): CatalogSong["timeSignature"] {
  return value === "3/4" || value === "6/8" || value === "4/4" ? value : fallback;
}

/**
 * Converts one validated score-import result into a catalog-ready record.
 * This is the batch-ingestion seam for the 100-title score corpus: the
 * imported notes become the canonical practice events, while the original
 * catalog metadata remains stable.
 */
export function attachImportedScoreToCatalog(
  song: CatalogSong,
  imported: CatalogScoreImport,
): CatalogSong {
  if (imported.noteEvents.length === 0) {
    throw new Error("A catalog score must contain at least one playable note.");
  }
  if (imported.sourceRef.trim().length === 0) {
    throw new Error("A catalog score must include a source reference.");
  }

  const needsReview = imported.validation.requiresReview;
  return {
    ...song,
    noteEvents: imported.noteEvents,
    rightsNote: `Imported ${imported.sourceFormat.toUpperCase()} score; review the practice timeline before publishing.`,
    sourceKind: imported.sourceKind ?? imported.sourceFormat,
    sourceRef: imported.sourceRef,
    status: needsReview ? "review" : "ready",
    transcriptionStatus: needsReview ? "needs-review" : "ready",
    exportAllowed: !needsReview,
    tempoBpm: imported.tempoBpm ?? song.tempoBpm,
    timeSignature: normalizeTimeSignature(imported.timeSignature, song.timeSignature),
  };
}

export const CATALOG_CATEGORY_OPTIONS: readonly CatalogCategory[] = [
  "Riyaz",
  "Bollywood",
  "Devotional",
  "Indian pop",
  "Regional",
  "Evergreen",
  "The Beatles",
];

export function filterCatalogSongs(
  songs: readonly CatalogSong[],
  query: string,
  category: CatalogFilterCategory,
  includePlanned: boolean,
): readonly CatalogSong[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return songs.filter((song) => {
    if (!includePlanned && song.status !== "ready") return false;
    if (category !== "all" && song.category !== category) return false;
    if (normalizedQuery.length === 0) return true;

    return [song.title, song.artistOrSource, song.language, song.category]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}
