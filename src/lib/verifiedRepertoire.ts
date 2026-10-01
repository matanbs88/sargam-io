import minuet from "../../content/catalog/verified/minuet-g.json";
import silentNight from "../../content/catalog/verified/silent-night.json";
import wenceslas from "../../content/catalog/verified/good-king-wenceslas.json";
import raghupati from "../../content/catalog/verified/raghupati-raghav.json";
import gymnopedie from "../../content/catalog/verified/gymnopedie-1.json";
import harkHerald from "../../content/catalog/verified/hark-herald.json";
import odeToJoy from "../../content/catalog/verified/ode-to-joy.json";
import oatsAndBeans from "../../content/catalog/verified/oats-and-beans.json";
import auClair from "../../content/catalog/verified/au-clair-de-la-lune.json";
import joyToTheWorld from "../../content/catalog/verified/joy-to-the-world.json";
import { verifiedVoiceEvents } from './verifiedVoiceEvents';
import type { CatalogSong } from "./songCatalog";
import type { MidiNoteEvent } from "./midiToSargam";

/** Source-reviewed bar data, not approximate familiar-tune fixtures. */
export type VerifiedMelody = {
  readonly title: string;
  readonly tempoBpm: number;
  readonly form: readonly number[];
  /** null is a written rest; its duration advances the source clock. */
  // JSON imports infer arrays rather than tuples; enforce the pair shape below.
  readonly sections: readonly (readonly (readonly (readonly (number | null)[])[])[])[];
  readonly timeSignature?: string;
};

export function verifiedMelodyEvents(score: VerifiedMelody): readonly MidiNoteEvent[] {
  const signature = /^(\d+)\/(\d+)$/.exec(score.timeSignature ?? "3/4");
  if (!signature || !Number.isFinite(score.tempoBpm) || score.tempoBpm <= 0) {
    throw new Error(`Verified ${score.title} needs a valid meter and positive tempo.`);
  }
  const beatsPerBar = Number(signature[1]) * 4 / Number(signature[2]);
  if (!Number.isFinite(beatsPerBar) || beatsPerBar <= 0) {
    throw new Error(`Verified ${score.title} needs a positive measure length.`);
  }
  if (score.form.length === 0) {
    throw new Error(`Verified ${score.title} form must reference a nonempty source section.`);
  }
  const beatMs = 60_000 / score.tempoBpm;
  let beat = 0;
  return score.form.flatMap((section) => {
    if (!Number.isInteger(section) || section < 0 || !score.sections[section]?.length) {
      throw new Error(`Verified ${score.title} form must reference a nonempty source section.`);
    }
    return score.sections[section].flatMap((bar) => {
      if (bar.some((note) => note.length !== 2 || (note[0] !== null && (!Number.isInteger(note[0]) || note[0]! < 0 || note[0]! > 127)) || typeof note[1] !== "number" || !Number.isFinite(note[1]) || note[1] <= 0)
          || Math.abs(bar.reduce((sum, [, duration]) => sum + (duration ?? 0), 0) - beatsPerBar) > 1e-9) {
        throw new Error(`Verified ${score.title} measure must contain ${beatsPerBar} quarter beats and valid notes.`);
      }
      return bar.flatMap(([midi, duration]) => {
        const startMs = Math.round(beat * beatMs);
        // Pair shape and numeric duration were validated for the whole bar.
        beat += duration!;
        // Rest time is not converted into a phantom MIDI note or collapsed.
        if (midi === null) return [];
        const durationMs = Math.round(beat * beatMs) - startMs;
        if (durationMs <= 0) {
          throw new Error(`Verified ${score.title} note is shorter than the millisecond playback resolution.`);
        }
        return [{
          midi,
          startMs,
          durationMs,
          velocity: 88,
        }];
      });
    });
  });
}

export function minuetMelodyEvents(): readonly MidiNoteEvent[] {
  return verifiedMelodyEvents(minuet);
}

// Ready means source-reviewed playable data; live-complete is separately audited in the ledger.
function catalogEntry(score: {
  id: string; title: string; composer: string; edition: string; source: string;
  sourceCredit: string; sourceLicense: string; tempoBpm: number; timeSignature: string; rootMidi: number;
}, noteEvents: readonly MidiNoteEvent[]): CatalogSong { return {
  id: score.id,
  title: score.title,
  artistOrSource: `${score.composer} · ${score.edition}`,
  language: score.id === raghupati.id ? "Hindi · instrumental melody" : "Instrumental",
  category: score.id === raghupati.id ? "Devotional" : "Public domain",
  difficulty: "Intermediate",
  instruments: ["Piano", "Harmonium", "Bansuri"],
  status: "ready",
  transcriptionStatus: "ready",
  sourceKind: "manual",
  sourceRef: score.source,
  rightsBasis: score.sourceLicense.startsWith("Public Domain") ? "public-domain" : "rights-review",
  exportAllowed: true,
  tempoBpm: score.tempoBpm,
  timeSignature: catalogMeter(score.timeSignature),
  rootMidi: score.rootMidi,
  noteEvents,
  rightsNote: `${score.sourceCredit}. ${score.sourceLicense}. ${score.edition}.`,
}; }

export const VERIFIED_REPERTOIRE: readonly CatalogSong[] = [
  ...[minuet, silentNight, wenceslas, raghupati, harkHerald, odeToJoy, oatsAndBeans, joyToTheWorld].map(score => catalogEntry(score, verifiedMelodyEvents(score))),
  catalogEntry(gymnopedie, verifiedVoiceEvents(gymnopedie)),
  catalogEntry(auClair, verifiedVoiceEvents(auClair)),
];

function catalogMeter(meter: string): CatalogSong["timeSignature"] {
  if (meter === "2/4" || meter === "3/4" || meter === "4/4" || meter === "3/8" || meter === "6/8") return meter;
  throw new Error(`Unsupported catalog meter: ${meter}`);
}
