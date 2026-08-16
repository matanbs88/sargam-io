import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { parseMusicXmlScore, toImportedSargam } from "./musicXml";

const SIMPLE_SCORE = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><work><work-title>Import fixture</work-title></work>
<part-list><score-part id="P1"><part-name>Melody</part-name></score-part></part-list>
<part id="P1"><measure number="1"><attributes><divisions>2</divisions><key><fifths>-4</fifths></key><time><beats>3</beats><beat-type>4</beat-type></time></attributes>
<note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration></note>
<note><rest/><duration>1</duration></note>
<note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><tie type="start"/></note>
<note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><tie type="stop"/></note>
</measure></part></score-partwise>`;

describe("parseMusicXmlScore", () => {
  it("preserves meter, rests, durations, and ties from MusicXML", () => {
    const score = parseMusicXmlScore(strToU8(SIMPLE_SCORE));

    expect(score).toMatchObject({
      divisionsPerQuarter: 2,
      keyFifths: -4,
      sourceFormat: "musicxml",
      timeSignature: "3/4",
      title: "Import fixture",
    });
    expect(score.measures[0]?.events).toEqual([
      { durationDivisions: 2, midi: 60, startDivisions: 0, tie: "none" },
      { durationDivisions: 1, midi: null, startDivisions: 2, tie: "none" },
      { durationDivisions: 1, midi: 65, startDivisions: 3, tie: "start" },
      { durationDivisions: 2, midi: 65, startDivisions: 4, tie: "stop" },
    ]);
    expect(score.measures[0]).toMatchObject({
      divisionsPerQuarter: 2,
      timeSignature: "3/4",
    });
  });

  it("rejects score files above the beta measure limit", () => {
    const measures = Array.from(
      { length: 201 },
      (_, index) => `<measure number="${index + 1}" />`,
    ).join("");
    const oversizedScore = `<score-partwise><part id="P1">${measures}</part></score-partwise>`;

    expect(() => parseMusicXmlScore(strToU8(oversizedScore))).toThrow(
      "up to 200 measures",
    );
  });

  it("reads compressed MXL and maps pitches relative to the selected Sa", () => {
    const mxl = zipSync({ "fixture.xml": strToU8(SIMPLE_SCORE) });
    const score = parseMusicXmlScore(mxl);
    const sargam = toImportedSargam(score, 65);

    expect(score.sourceFormat).toBe("mxl");
    expect(sargam[0]?.events.map((event) => event.notation)).toEqual([
      "P.",
      "rest",
      "S",
      "S",
    ]);
  });
});
