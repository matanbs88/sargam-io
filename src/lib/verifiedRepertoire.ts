import minuet from "../../content/catalog/verified/minuet-g.json";
import silentNight from "../../content/catalog/verified/silent-night.json";
import type { CatalogSong } from "./songCatalog";
import type { MidiNoteEvent } from "./midiToSargam";

/** Source-reviewed bar data, not approximate familiar-tune fixtures. */
export function verifiedMelodyEvents(score: Pick<typeof minuet, "title" | "tempoBpm" | "form" | "sections">): readonly MidiNoteEvent[] {
  const beatMs = 60_000 / score.tempoBpm;
  let beat = 0;
  return score.form.flatMap((section) =>
    score.sections[section].flatMap((bar) => {
      if (bar.reduce((sum, [, duration]) => sum + duration, 0) !== 3) {
        throw new Error(`Verified ${score.title} measure must contain three quarter beats.`);
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

export const VERIFIED_REPERTOIRE: readonly CatalogSong[] = [minuet, silentNight].map((score) => ({
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
  timeSignature: "3/4",
  rootMidi: score.rootMidi,
  noteEvents: verifiedMelodyEvents(score),
  rightsNote: `${score.sourceCredit}. ${score.sourceLicense}. ${score.edition}.`,
}));
