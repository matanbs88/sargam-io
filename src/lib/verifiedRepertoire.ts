import minuet from "../../content/catalog/verified/minuet-g.json";
import silentNight from "../../content/catalog/verified/silent-night.json";
import wenceslas from "../../content/catalog/verified/good-king-wenceslas.json";
import type { CatalogSong } from "./songCatalog";
import type { MidiNoteEvent } from "./midiToSargam";

/** Source-reviewed bar data, not approximate familiar-tune fixtures. */
type VerifiedMelody = Pick<typeof minuet, "title" | "tempoBpm" | "form" | "sections"> & {
  timeSignature?: string;
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
  const beatMs = 60_000 / score.tempoBpm;
  let beat = 0;
  return score.form.flatMap((section) =>
    score.sections[section].flatMap((bar) => {
      if (bar.some(([midi, duration]) => !Number.isInteger(midi) || midi < 0 || midi > 127 || !Number.isFinite(duration) || duration <= 0)
          || Math.abs(bar.reduce((sum, [, duration]) => sum + duration, 0) - beatsPerBar) > 1e-9) {
        throw new Error(`Verified ${score.title} measure must contain ${beatsPerBar} quarter beats and valid notes.`);
      }
      return bar.map(([midi, duration]) => {
        const startMs = Math.round(beat * beatMs);
        beat += duration;
        return {
          midi,
          startMs,
          durationMs: Math.round(beat * beatMs) - startMs,
          velocity: 88,
        };
      });
    }),
  );
}

export function minuetMelodyEvents(): readonly MidiNoteEvent[] {
  return verifiedMelodyEvents(minuet);
}

// Ready means source-reviewed playable data; live-complete is separately audited in the ledger.
export const VERIFIED_REPERTOIRE: readonly CatalogSong[] = [minuet, silentNight, wenceslas].map((score) => ({
  id: score.id,
  title: score.title,
  artistOrSource: `${score.composer} · ${score.edition}`,
  language: "Instrumental",
  category: "Public domain",
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
  noteEvents: verifiedMelodyEvents(score),
  rightsNote: `${score.sourceCredit}. ${score.sourceLicense}. ${score.edition}.`,
}));

function catalogMeter(meter: string): CatalogSong["timeSignature"] {
  if (meter === "3/4" || meter === "4/4" || meter === "3/8" || meter === "6/8") return meter;
  throw new Error(`Unsupported catalog meter: ${meter}`);
}
