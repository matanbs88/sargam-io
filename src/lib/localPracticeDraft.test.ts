import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteLocalPracticeDraft, LOCAL_PRACTICE_DRAFT_KEY, parseLocalPracticeDraft, readLocalPracticeDraft, saveLocalPracticeDraft } from './localPracticeDraft';
import { navigatePreview, parsePreviewLocation } from '../features/design-lab/usePreviewNavigation';
import { adjustMidiEvent } from './editableMidi';

const piece = {
  title: 'Imported melody', tempoBpm: 96, rootMidi: 60, timeSignature: '4/4',
  noteEvents: [{ midi: 60, startMs: 0, durationMs: 625, velocity: 90 }, { midi: 62, startMs: 625, durationMs: 625 }],
};
const encoded = (value: unknown = piece, version = 1) => JSON.stringify({ version, piece: value });
function memoryStorage() {
  const values = new Map<string, string>();
  return { values, getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn((key: string) => { values.delete(key); }) };
}
afterEach(() => vi.unstubAllGlobals());

describe('versioned local practice drafts', () => {
  it('round-trips piece-only data across a fresh storage read', () => {
    const storage = memoryStorage();
    expect(saveLocalPracticeDraft(piece, () => storage)).toEqual({ piece, error: null });
    expect(JSON.parse(storage.values.get(LOCAL_PRACTICE_DRAFT_KEY)!)).toEqual({ version: 1, piece });
    expect(readLocalPracticeDraft(() => storage)).toEqual({ piece, error: null });
  });
  it('persists corrected source events without changing the original piece', () => {
    const storage = memoryStorage();
    const sourceEvents = adjustMidiEvent(piece.noteEvents, 0, 1);
    expect(saveLocalPracticeDraft({ ...piece, noteEvents: sourceEvents }, () => storage).error).toBeNull();
    expect(readLocalPracticeDraft(() => storage).piece?.noteEvents[0].midi).toBe(61);
    expect(readLocalPracticeDraft(() => storage).piece?.noteEvents[1]).toEqual(piece.noteEvents[1]);
    expect(piece.noteEvents[0].midi).toBe(60);
  });
  it('allowlists every level and removes IDs, source material, credentials and settings', () => {
    const storage = memoryStorage();
    const unsafe = { ...piece, id: 'remote-job', sourceUrl: 'https://example.com/private', audio: 'source-audio', token: 'secret', settings: { root: 67 },
      noteEvents: piece.noteEvents.map(note => ({ ...note, token: 'note-secret', audio: 'note-audio' })) };
    expect(saveLocalPracticeDraft(unsafe, () => storage).piece).toEqual(piece);
    expect(storage.values.get(LOCAL_PRACTICE_DRAFT_KEY)).not.toMatch(/secret|audio|sourceUrl|remote-job|settings/);
    expect(parseLocalPracticeDraft(encoded(unsafe))).toEqual(piece);
  });
  it('preserves validated expression without retaining extra point/transition fields', () => {
    const expressive = { ...piece, artistOrSource: 'Personal study', noteEvents: [{ ...piece.noteEvents[0],
      pitchCurve: [{ offsetMs: 0, cents: 0, secret: 'drop' }, { offsetMs: 625, cents: 200 }],
      transition: { kind: 'meend', onsetMs: 400, targetMidi: 62, secret: 'drop' } }] };
    const restored = parseLocalPracticeDraft(encoded(expressive));
    expect(restored?.artistOrSource).toBe('Personal study');
    expect(restored?.noteEvents[0].pitchCurve).toEqual([{ offsetMs: 0, cents: 0 }, { offsetMs: 625, cents: 200 }]);
    expect(restored?.noteEvents[0].transition).toEqual({ kind: 'meend', onsetMs: 400, targetMidi: 62 });
  });
  it.each([null, '', '{', 'null', '[]', '{}', encoded(piece, 2), JSON.stringify({ piece }), 'x'.repeat(1024 * 1024 + 1)])('rejects absent, corrupt, unsupported or oversized input (%#)', raw => {
    expect(parseLocalPracticeDraft(raw)).toBeNull();
  });
  it.each([
    { title: '' }, { title: 'x'.repeat(161) }, { artistOrSource: 'x'.repeat(241) },
    { rootMidi: -1 }, { rootMidi: 60.5 }, { tempoBpm: 0 }, { tempoBpm: 601 },
    { timeSignature: '0/4' }, { timeSignature: '999/4' }, { timeSignature: '4/3' },
    { noteEvents: [] }, { noteEvents: Array(10001).fill(piece.noteEvents[0]) },
    { noteEvents: [{ midi: 128, startMs: 0, durationMs: 1 }] },
    { noteEvents: [{ midi: 60, startMs: -1, durationMs: 1 }] },
    { noteEvents: [{ midi: 60, startMs: 0, durationMs: 0 }] },
    { noteEvents: [{ midi: 60, startMs: 0, durationMs: 1, velocity: 128 }] },
    { noteEvents: [...piece.noteEvents].reverse() },
    { noteEvents: [{ midi: 60, startMs: 0, durationMs: 1, pitchCurve: [{ offsetMs: 2, cents: 0 }] }] },
    { noteEvents: [{ midi: 60, startMs: 0, durationMs: 1, transition: { kind: 'bad', onsetMs: 0, targetMidi: 60 } }] },
    { noteEvents: [{ midi: 60, startMs: 21_600_000, durationMs: 1 }] },
    { tempoBpm: 600, timeSignature: '1/32', noteEvents: [{ midi: 60, startMs: 1_000_000, durationMs: 1 }] },
  ])('rejects invalid or unsafe pieces without writing (%#)', override => {
    const storage = memoryStorage();
    expect(parseLocalPracticeDraft(encoded({ ...piece, ...override }))).toBeNull();
    expect(saveLocalPracticeDraft({ ...piece, ...override }, () => storage).error).toBeTruthy();
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('rejects non-finite numbers before serialization', () => {
    const storage = memoryStorage();
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(saveLocalPracticeDraft({ ...piece, tempoBpm: value }, () => storage).error).toBeTruthy();
      expect(saveLocalPracticeDraft({ ...piece, noteEvents: [{ midi: 60, startMs: value, durationMs: 1 }] }, () => storage).error).toBeTruthy();
    }
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('bounds total continuation cells and serialized curve size', () => {
    const storage = memoryStorage();
    expect(saveLocalPracticeDraft({ ...piece, noteEvents: Array(100).fill({ midi: 60, startMs: 0, durationMs: 625 * 1000 }) }, () => storage).error).toBeTruthy();
    expect(saveLocalPracticeDraft({ ...piece, noteEvents: Array(1000).fill({ midi: 60, startMs: 0, durationMs: 625,
      pitchCurve: Array(256).fill({ offsetMs: 0, cents: 0 }) }) }, () => storage).error).toMatch(/too large/);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('reports corruption without silently deleting stored data', () => {
    const storage = memoryStorage(); storage.values.set(LOCAL_PRACTICE_DRAFT_KEY, '{');
    expect(readLocalPracticeDraft(() => storage)).toMatchObject({ piece: null, error: expect.any(String) });
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
  it('distinguishes no saved draft from a storage failure', () => {
    expect(readLocalPracticeDraft(() => memoryStorage())).toEqual({ piece: null, error: null });
    const denied = () => { throw new DOMException('Denied', 'SecurityError'); };
    expect(readLocalPracticeDraft(denied).error).toBeTruthy();
    expect(saveLocalPracticeDraft(piece, denied).error).toBeTruthy();
    expect(deleteLocalPracticeDraft(denied).error).toBeTruthy();
  });
  it('handles getItem, quota and deletion failures, preserving the previous draft', () => {
    const storage = memoryStorage(); saveLocalPracticeDraft(piece, () => storage);
    storage.getItem.mockImplementationOnce(() => { throw new Error('Denied'); });
    expect(readLocalPracticeDraft(() => storage).error).toBeTruthy();
    storage.setItem.mockImplementationOnce(() => { throw new DOMException('Full', 'QuotaExceededError'); });
    expect(saveLocalPracticeDraft({ ...piece, title: 'Replacement' }, () => storage).error).toMatch(/blocked or full/);
    expect(readLocalPracticeDraft(() => storage).piece?.title).toBe(piece.title);
    storage.removeItem.mockImplementationOnce(() => { throw new Error('Denied'); });
    expect(deleteLocalPracticeDraft(() => storage).error).toBeTruthy();
    expect(readLocalPracticeDraft(() => storage).piece).toEqual(piece);
  });
  it('replaces exactly one draft and deletes only the draft key', () => {
    const storage = memoryStorage(); storage.values.set('unrelated', 'keep');
    saveLocalPracticeDraft(piece, () => storage);
    saveLocalPracticeDraft({ ...piece, title: 'Second score' }, () => storage);
    expect(readLocalPracticeDraft(() => storage).piece?.title).toBe('Second score');
    expect(deleteLocalPracticeDraft(() => storage)).toEqual({ error: null });
    expect(readLocalPracticeDraft(() => storage)).toEqual({ piece: null, error: null });
    expect(storage.values.get('unrelated')).toBe('keep');
  });
  it('restores a noncatalog draft URL without retaining a stale catalog ID', () => {
    const storage = memoryStorage(); saveLocalPracticeDraft({ ...piece, id: 'remote-id' }, () => storage);
    const restored = readLocalPracticeDraft(() => storage).piece!;
    const pushState = vi.fn();
    vi.stubGlobal('window', { location: { pathname: '/design-lab/indian/mehfil', search: '?pilot=1&score=catalog-old', hash: '#library' }, history: { pushState }, dispatchEvent: vi.fn() });
    expect(restored.id).toBeUndefined();
    navigatePreview('practice', null);
    expect(pushState).toHaveBeenCalledWith(null, '', '/design-lab/indian/mehfil?pilot=1#practice');
    expect(parsePreviewLocation('?pilot=1#practice')).toEqual({ screen: 'practice', scoreId: null });
  });
  it('does not access browser storage at module import time and fails safely without window', () => {
    expect(readLocalPracticeDraft().error).toBeTruthy();
  });
});
