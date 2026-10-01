import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMusicXmlScore } from "./musicXml";
import { validateImportedScore } from "./scoreValidation";
import { importedScoreToPracticeScore, selectImportedMelody } from "@/src/lib/importedScoreTimeline";
import { instrumentPart, isMonophonic, resolveMelody } from "@/src/lib/practiceParts";
import { parseLocalPracticeDraft } from "@/src/lib/localPracticeDraft";

describe("symbolic import to instrument practice", () => {
  it("preserves the low selected melody and high piano arrangement across serialization", () => {
    const source = parseMusicXmlScore(readFileSync(new URL("../../../tests/fixtures/melody-voice-selection.musicxml", import.meta.url)));
    // Exercise the actual server-to-client JSON boundary, not shared objects.
    const payload = JSON.parse(JSON.stringify({ score: source, validation: validateImportedScore(source) }));
    const timeline = importedScoreToPracticeScore(payload.score, payload.validation);
    const selected = selectImportedMelody(timeline, JSON.stringify(["2", "2"]));
    const piece = { title: selected.title, tempoBpm: 96, rootMidi: 60, timeSignature: "4/4",
      noteEvents: selected.noteEvents, melodyEvents: selected.melodyEvents, melodyCredit: selected.melodyCredit, melodyEstimated: selected.melodyEstimated };
    const restored = parseLocalPracticeDraft(JSON.stringify({ version: 1, piece }));
    expect(restored).not.toBeNull();
    const melody = resolveMelody(restored!.noteEvents, restored!);
    expect(melody.events.map(note => note.midi)).toEqual([60, 62, 64, 65]);
    expect(melody.events.map(note => [note.startMs, note.durationMs])).toEqual([[0, 1250], [1250, 1250], [2500, 1250], [3750, 1250]]);
    expect(isMonophonic(melody.events)).toBe(true);
    expect(restored!.noteEvents).toHaveLength(7);
    expect(isMonophonic(restored!.noteEvents)).toBe(false);
    for (const instrument of ["Bansuri", "Harmonium"] as const) expect(instrumentPart(instrument, "arrangement")).toBe("melody");
    expect(instrumentPart("Piano", "arrangement")).toBe("arrangement");
    expect(melody.estimated).toBe(false);
  });
});
