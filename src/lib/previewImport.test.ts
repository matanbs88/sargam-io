import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { parseMusicXmlScore } from '../server/score-import/musicXml';
import { validateImportedScore } from '../server/score-import/scoreValidation';
import { importedScoreToPracticeScore } from './importedScoreTimeline';
import { buildReadingScore } from './readingScore';

it('carries original fixture pitches, silence and held notes from import into the reader', () => {
  const xml = readFileSync(new URL('../../tests/fixtures/preview-practice.musicxml', import.meta.url));
  const imported = parseMusicXmlScore(xml);
  const validation = validateImportedScore(imported);
  expect(validation.requiresReview).toBe(false);
  const practice = importedScoreToPracticeScore(imported, validation);
  expect(practice.noteEvents.map(note => note.midi)).toEqual([60, 62, 64, 66, 67, 69]);
  expect(practice.noteEvents[4].startMs).toBe(3125);
  expect(practice.noteEvents[5].durationMs).toBe(1250);
  const reader = buildReadingScore(practice.noteEvents, 96, '4/4');
  expect(reader.bars).toHaveLength(2);
  expect(reader.bars[1][0]).toEqual([]);
  expect(reader.bars[1][3]).toEqual([{ index: 5, continued: true }]);
});
