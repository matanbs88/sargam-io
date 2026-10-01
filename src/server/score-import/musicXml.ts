import "server-only";

import { XMLParser } from "fast-xml-parser";
import { strFromU8, unzipSync } from "fflate";
import {
  formatRelativeNote,
  midiToRelativeNote,
  type NotationSystem,
} from "@/src/lib/midiToSargam";

export type ImportedScoreEvent = {
  readonly voice?: string;
  readonly staff?: string;
  readonly durationDivisions: number;
  readonly midi: number | null;
  readonly startDivisions: number;
  readonly tie: "none" | "start" | "stop" | "continue";
};

export type ImportedScoreMeasure = {
  readonly durationDivisions?: number;
  readonly divisionsPerQuarter: number;
  readonly events: readonly ImportedScoreEvent[];
  readonly number: number;
  readonly timeSignature: string | null;
};

export type ImportedScore = {
  readonly divisionsPerQuarter: number;
  readonly keyFifths: number | null;
  readonly measures: readonly ImportedScoreMeasure[];
  readonly sourceFormat: "musicxml" | "mxl";
  readonly timeSignature: string | null;
  readonly title: string;
  readonly warnings: readonly string[];
};

export type ImportedSargamEvent = {
  readonly durationDivisions: number;
  readonly notation: string;
  readonly startDivisions: number;
  readonly tie: ImportedScoreEvent["tie"];
};

export type ImportedSargamMeasure = {
  readonly events: readonly ImportedSargamEvent[];
  readonly number: number;
};

type XmlNode = Record<string, unknown>;

const STEP_TO_SEMITONES: Readonly<Record<string, number>> = {
  A: 9,
  B: 11,
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
};

/** Lead-sheet beta guardrail; larger scores need a dedicated async workflow. */
const MAX_IMPORTED_MEASURES = 200;

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function asNode(value: unknown): XmlNode | null {
  return typeof value === "object" && value !== null ? (value as XmlNode) : null;
}

function asText(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const node = asNode(value);
  const text = node?.["#text"];
  return typeof text === "string" || typeof text === "number" ? String(text) : null;
}

function asFiniteInteger(value: unknown): number | null {
  const text = asText(value);
  if (text === null) return null;
  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : null;
}

function getSingleNode(value: unknown): XmlNode | null {
  return asNode(Array.isArray(value) ? value[0] : value);
}

function parseXml(bytes: Uint8Array): XmlNode {
  const parser = new XMLParser({
    attributeNamePrefix: "@_",
    ignoreAttributes: false,
    parseTagValue: false,
    trimValues: true,
  });
  const parsed = parser.parse(strFromU8(bytes));
  const root = asNode(parsed);
  if (root === null) throw new Error("The MusicXML document is empty.");
  return root;
}

function resolveMusicXmlBytes(bytes: Uint8Array): {
  readonly bytes: Uint8Array;
  readonly sourceFormat: ImportedScore["sourceFormat"];
} {
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (!isZip) return { bytes, sourceFormat: "musicxml" };

  const archive = unzipSync(bytes);
  const filename = Object.keys(archive).find(
    (entry) => entry.endsWith(".xml") && !entry.startsWith("META-INF/"),
  );
  if (filename === undefined) {
    throw new Error("The MXL file does not contain a MusicXML score.");
  }

  const xml = archive[filename];
  if (xml === undefined) throw new Error("The MXL score could not be opened.");
  return { bytes: xml, sourceFormat: "mxl" };
}

function getTie(node: XmlNode): ImportedScoreEvent["tie"] {
  const tieTypes = asArray(node.tie)
    .map(asNode)
    .map((tie) => tie?.["@_type"])
    .filter((value): value is string => value === "start" || value === "stop");
  if (tieTypes.includes("start") && tieTypes.includes("stop")) return "continue";
  if (tieTypes.includes("start")) return "start";
  if (tieTypes.includes("stop")) return "stop";
  return "none";
}

function getMidi(node: XmlNode): number | null {
  const pitch = getSingleNode(node.pitch);
  if (pitch === null) return null;

  const step = asText(pitch.step);
  const octave = asFiniteInteger(pitch.octave);
  const alter = asFiniteInteger(pitch.alter) ?? 0;
  if (step === null || octave === null || STEP_TO_SEMITONES[step] === undefined) {
    return null;
  }

  const midi = (octave + 1) * 12 + STEP_TO_SEMITONES[step] + alter;
  return midi >= 0 && midi <= 127 ? midi : null;
}

function titleFromScore(root: XmlNode): string {
  const score = getSingleNode(root["score-partwise"]);
  const work = score === null ? null : getSingleNode(score.work);
  const movementTitle = score === null ? null : asText(score["movement-title"]);
  return asText(work?.["work-title"]) ?? movementTitle ?? "Untitled imported score";
}

/**
 * Reads a single-part MusicXML or compressed MXL lead sheet. Polyphonic scores
 * are retained as events but are explicitly flagged for editor review.
 */
export function parseMusicXmlScore(bytes: Uint8Array): ImportedScore {
  if (bytes.byteLength === 0) throw new Error("The score file is empty.");
  const resolved = resolveMusicXmlBytes(bytes);
  const root = parseXml(resolved.bytes);
  const score = getSingleNode(root["score-partwise"]);
  const part = score === null ? null : getSingleNode(score.part);
  if (part === null) throw new Error("The MusicXML file does not contain a score part.");

  let divisionsPerQuarter = 1;
  let keyFifths: number | null = null;
  let timeSignature: string | null = null;
  const warnings: string[] = [];
  const measures: ImportedScoreMeasure[] = [];
  if (asArray(score?.part).length > 1) {
    warnings.push("Only the first instrument part is imported in this beta. Export the desired part separately.");
  }
  // The object parser groups like tags. A second ordered view preserves the
  // interleaving of note / backup / forward without reparsing every note.
  const ordered = new XMLParser({ preserveOrder: true, parseTagValue: false }).parse(strFromU8(resolved.bytes));
  const orderedScore = asArray(ordered).map(asNode).find(node => node?.["score-partwise"] !== undefined);
  const orderedPart = asArray(orderedScore?.["score-partwise"]).map(asNode).find(node => node?.part !== undefined);
  const orderedMeasures = asArray(orderedPart?.part).map(asNode).filter(node => node?.measure !== undefined);

  for (const [index, rawMeasure] of asArray(part.measure).entries()) {
    if (index >= MAX_IMPORTED_MEASURES) {
      throw new Error(
        `This beta import supports up to ${MAX_IMPORTED_MEASURES} measures.`,
      );
    }
    const measure = asNode(rawMeasure);
    if (measure === null) continue;
    const attributes = getSingleNode(measure.attributes);
    if (asArray(measure.attributes).length > 1) throw new Error("Mid-measure attribute changes are not supported. Split the measure before importing.");
    const divisions = asFiniteInteger(attributes?.divisions);
    if (divisions !== null && divisions > 0) divisionsPerQuarter = divisions;

    const fifths = asFiniteInteger(getSingleNode(attributes?.key)?.fifths);
    if (fifths !== null && fifths >= -7 && fifths <= 7) keyFifths = fifths;

    const time = getSingleNode(attributes?.time);
    const beats = asText(time?.beats);
    const beatType = asText(time?.["beat-type"]);
    if (beats !== null && beatType !== null) timeSignature = `${beats}/${beatType}`;

    let cursor = 0;
    let extent = 0;
    let previousNoteStart: number | null = null;
    let noteIndex = 0;
    const notes = asArray(measure.note);
    const events: ImportedScoreEvent[] = [];
    for (const rawEntry of asArray(orderedMeasures[index]?.measure)) {
      const entry = asNode(rawEntry);
      if (!entry) continue;
      const movement = entry.backup ?? entry.forward;
      if (movement !== undefined) {
        const durationNode = asArray(movement).map(asNode).find(node => node?.duration !== undefined);
        const textNode = asArray(durationNode?.duration).map(asNode).find(node => node?.["#text"] !== undefined);
        const duration = asFiniteInteger(textNode?.["#text"]);
        if (duration === null || duration <= 0) throw new Error(`Invalid timeline movement in measure ${index + 1}.`);
        cursor += entry.backup !== undefined ? -duration : duration;
        if (cursor < 0) throw new Error(`Timeline moves before measure ${index + 1}.`);
        extent = Math.max(extent, cursor);
        previousNoteStart = null;
        continue;
      }
      if (entry.note === undefined) continue;
      const note = asNode(notes[noteIndex++]);
      if (note === null) continue;
      const durationDivisions = asFiniteInteger(note.duration);
      if (durationDivisions === null || durationDivisions <= 0) {
        warnings.push(`A note in measure ${index + 1} has no usable duration.`);
        continue;
      }

      const isChordTone = note.chord !== undefined;
      if (isChordTone && previousNoteStart === null) throw new Error(`Chord has no preceding note in measure ${index + 1}.`);
      const startDivisions = isChordTone ? previousNoteStart! : cursor;
      const isRest = note.rest !== undefined;
      const midi = isRest ? null : getMidi(note);
      const alter = asText(getSingleNode(note.pitch)?.alter);
      if (alter !== null && !Number.isInteger(Number(alter))) throw new Error("Microtonal MusicXML pitches need an explicit pitch-curve import and cannot be rounded to semitones.");
      // Even an unsupported pitched symbol consumes its written duration.
      if (!isChordTone) {
        previousNoteStart = cursor;
        cursor += durationDivisions;
      }
      extent = Math.max(extent, startDivisions + durationDivisions, cursor);
      if (!isRest && midi === null) {
        warnings.push(`A non-pitched symbol in measure ${index + 1} was skipped.`);
        continue;
      }
      if (isChordTone) {
        warnings.push(`Measure ${index + 1} contains harmony and needs a melody selection.`);
      }

      events.push({
        durationDivisions,
        midi,
        startDivisions,
        tie: getTie(note),
        ...(asText(note.voice) !== null ? { voice: asText(note.voice)! } : {}),
        ...(asText(note.staff) !== null ? { staff: asText(note.staff)! } : {}),
      });
    }

    measures.push({
      durationDivisions: extent,
      divisionsPerQuarter,
      events,
      number: index + 1,
      timeSignature,
    });
  }

  if (measures.length === 0) throw new Error("No readable measures were found in the score.");
  return {
    divisionsPerQuarter,
    keyFifths,
    measures,
    sourceFormat: resolved.sourceFormat,
    timeSignature,
    title: titleFromScore(root),
    warnings: [...new Set(warnings)],
  };
}

export function toImportedSargam(
  score: ImportedScore,
  rootMidi: number,
  notation: NotationSystem = "Sargam_EN",
): ImportedSargamMeasure[] {
  return score.measures.map((measure) => ({
    number: measure.number,
    events: measure.events.map((event) => ({
      durationDivisions: event.durationDivisions,
      notation:
        event.midi === null
          ? "rest"
          : formatRelativeNote(midiToRelativeNote(event.midi, rootMidi), notation),
      startDivisions: event.startDivisions,
      tie: event.tie,
    })),
  }));
}
