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
  it("opens the declared MXL primary .musicxml file rather than auxiliary XML", () => {
    const mxl = zipSync({
      "metadata.xml": strToU8("<metadata/>"),
      "scores/main.musicxml": strToU8(SIMPLE_SCORE),
      "META-INF/container.xml": strToU8('<container><rootfiles><rootfile full-path="scores/main.musicxml"/></rootfiles></container>'),
    });
    expect(parseMusicXmlScore(mxl).title).toBe("Import fixture");
  });
  it("refuses ambiguous, missing or excessively expanded MXL scores", () => {
    expect(() => parseMusicXmlScore(zipSync({ "a.xml": strToU8(SIMPLE_SCORE), "b.xml": strToU8(SIMPLE_SCORE) }))).toThrow("multiple XML files");
    expect(() => parseMusicXmlScore(zipSync({ "META-INF/container.xml": strToU8('<container><rootfiles><rootfile full-path="missing.musicxml"/></rootfiles></container>') }))).toThrow("available notation file");
    expect(() => parseMusicXmlScore(zipSync({ "score.xml": strToU8("x".repeat(12 * 1024 * 1024 + 1)) }))).toThrow("12 MB limit");
  });
  it("flags unexpanded form, tempo and grace instructions instead of certifying them", () => {
    const xml = SIMPLE_SCORE.replace('<note><pitch><step>C', '<direction><sound tempo="120" dacapo="yes"/></direction><note><grace/><pitch><step>A</step><octave>4</octave></pitch></note><barline><repeat direction="backward"/></barline><note><pitch><step>C');
    const score = parseMusicXmlScore(strToU8(xml));
    expect(score.warnings.join(" ")).toMatch(/repeats/);
    expect(score.warnings.join(" ")).toMatch(/96 BPM/);
    expect(score.warnings.join(" ")).toMatch(/D.C./);
    expect(score.warnings.join(" ")).toMatch(/Grace notes/);
    expect(score.measures[0].events).toHaveLength(4);
  });
  it("does not confuse a transposing instrument's written pitch with concert pitch", () => {
    const imported = parseMusicXmlScore(strToU8(SIMPLE_SCORE.replace('<divisions>2</divisions>', '<divisions>2</divisions><transpose><chromatic>-2</chromatic></transpose>')));
    expect(imported.measures[0].events.map(event => event.midi)).toEqual([58, null, 63, 63]);
    expect(imported.warnings.join(" ")).toMatch(/concert pitch/);
    const unchanged = parseMusicXmlScore(strToU8(SIMPLE_SCORE.replace('<divisions>2</divisions>', '<divisions>2</divisions><transpose><chromatic>0</chromatic></transpose>')));
    expect(unchanged.measures[0].events[0].midi).toBe(60);
  });
  it("applies staff-specific octave transposition without affecting another staff", () => {
    const xml = `<score-partwise><part><measure><attributes><transpose number="2"><chromatic>0</chromatic><octave-change>-1</octave-change></transpose></attributes>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><staff>1</staff></note>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><staff>2</staff></note>
    </measure></part></score-partwise>`;
    expect(parseMusicXmlScore(strToU8(xml)).measures[0].events.map(event => event.midi)).toEqual([60, 48]);
    expect(() => parseMusicXmlScore(strToU8(xml.replace('<chromatic>0</chromatic>', '<chromatic>0.5</chromatic>')))).toThrow("unsupported");
  });
  it("aligns chord tones and respects ordered backup / forward movements", () => {
    const xml = `<score-partwise><part id="P1"><measure number="1">
    <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><voice>1</voice><staff>1</staff></note>
    <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><voice>1</voice><staff>1</staff></note>
    <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><voice>1</voice><staff>1</staff></note>
    <backup><duration>4</duration></backup>
    <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><voice>2</voice><staff>2</staff></note>
    <forward><duration>2</duration></forward>
    <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><voice>2</voice><staff>2</staff></note>
    </measure></part></score-partwise>`;
    const score = parseMusicXmlScore(strToU8(xml));
    expect(score.measures[0].events.map(event => [event.midi, event.startDivisions, event.voice, event.staff])).toEqual([
      [60, 0, "1", "1"], [64, 0, "1", "1"], [62, 2, "1", "1"], [48, 0, "2", "2"], [55, 3, "2", "2"],
    ]);
    expect(score.keyFifths).toBeNull();
  });

  it("rejects a backup before the measure instead of inventing timing", () => {
    expect(() => parseMusicXmlScore(strToU8(`<score-partwise><part><measure><backup><duration>1</duration></backup></measure></part></score-partwise>`))).toThrow("before measure");
  });

  it("retains trailing forward silence and refuses silent microtone rounding", () => {
    const xml = `<score-partwise><part><measure><note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration></note><forward><duration>3</duration></forward></measure></part></score-partwise>`;
    expect(parseMusicXmlScore(strToU8(xml)).measures[0].durationDivisions).toBe(4);
    expect(() => parseMusicXmlScore(strToU8(xml.replace("<octave>4", "<alter>0.5</alter><octave>4")))).toThrow("Microtonal");
  });
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
