import minuet from "../../content/catalog/verified/minuet-g.json";
import type { CatalogSong } from "./songCatalog";
import type { MidiNoteEvent } from "./midiToSargam";

/** Source-reviewed bar data, not approximate familiar-tune fixtures. */
export function minuetMelodyEvents(): readonly MidiNoteEvent[] {
  const beatMs = 60_000 / minuet.tempoBpm;
  let beat = 0;
  return minuet.form.flatMap((section) =>
    minuet.sections[section].flatMap((bar) => {
      if (bar.reduce((sum, [, duration]) => sum + duration, 0) !== 3) {
        throw new Error("Verified Minuet measure must contain three quarter beats.");
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

export const VERIFIED_REPERTOIRE: readonly CatalogSong[] = [{
  id: minuet.id,
  title: minuet.title,
  artistOrSource: `${minuet.composer} · ${minuet.edition}`,
  language: "Instrumental",
  category: "Public domain",
  difficulty: "Intermediate",
  instruments: ["Piano", "Harmonium", "Bansuri"],
  status: "ready",
  transcriptionStatus: "ready",
  sourceKind: "manual",
  sourceRef: minuet.source,
  rightsBasis: "public-domain",
  exportAllowed: true,
  tempoBpm: minuet.tempoBpm,
  timeSignature: "3/4",
  rootMidi: minuet.rootMidi,
  noteEvents: minuetMelodyEvents(),
  rightsNote: `${minuet.sourceCredit}. ${minuet.sourceLicense}. ${minuet.edition}.`,
}];
