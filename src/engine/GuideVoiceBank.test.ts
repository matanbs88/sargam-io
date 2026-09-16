import { afterEach, describe, expect, it, vi } from 'vitest';
import { GuideVoiceBank, type VoiceSettings } from './GuideVoiceBank';

const settings: VoiceSettings = { instrument: 'Bansuri', enabled: true, double: false, room: false, bansuriVoice: 'ventus-study' };
const note = { midi: 64, startMs: 0, durationMs: 652, velocity: 80 };
function audio() {
  const parameter = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() });
  const node = () => {
    const n = { connect: vi.fn(), disconnect: vi.fn(), gain: parameter() };
    n.connect.mockReturnValue(n); return n;
  };
  const sources: Array<ReturnType<typeof source>> = [];
  function source() { return { ...node(), playbackRate: parameter(), detune: parameter(), buffer: null, loop: false, loopStart: 0, loopEnd: 0, start: vi.fn(), stop: vi.fn() }; }
  const context = {
    currentTime: 10, sampleRate: 44100, state: 'running', destination: node(), resume: vi.fn(async () => {}),
    createGain: vi.fn(node),
    createBufferSource: vi.fn(() => { const s = source(); sources.push(s); return s; }),
    createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(44100) })),
    decodeAudioData: vi.fn(async () => ({ duration: 3.7, length: 163170, numberOfChannels: 1 })),
  };
  return { context, sources, bank: new GuideVoiceBank(() => context as unknown as AudioContext, settings) };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('experimental Ventus voice', () => {
  it('preloads one anchor and schedules transposed samples without fetching on the audio path', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    vi.stubGlobal('fetch', fetch);
    const { bank, sources } = audio();
    await bank.prepare([note, { ...note, midi: 67 }]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/audio/preview/ventus-fsharp4-sustain.wav', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    bank.schedule(note, 10.05, .652, 0, 1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(sources[0].playbackRate.value).toBeCloseTo(2 ** ((64 - 65.993) / 12));
    expect(sources[0].loop).toBe(false);
    expect(sources[0].start).toHaveBeenCalledWith(10.05, 0);
    expect(sources[0].stop).toHaveBeenCalledWith(10.05 + .652);
    bank.cancel(); expect(sources[0].disconnect).toHaveBeenCalled();
  });
  it('rejects unsupported notes and pitch slides before downloading', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const { bank } = audio();
    await expect(bank.prepare([{ ...note, midi: 80 }])).rejects.toThrow('C4–C5');
    await expect(bank.prepare([{ ...note, pitchCurve: [{ offsetMs: 0, cents: 0 }, { offsetMs: 200, cents: 50 }] }])).rejects.toThrow('pitch slides');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not silently truncate a note longer than the available recording', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })));
    const { bank, sources } = audio(); await bank.prepare([note]);
    expect(() => bank.schedule(note, 10, 10, 0, 1)).toThrow('exceeds the experimental Ventus sustain');
    expect(sources[0].start).not.toHaveBeenCalled();
    expect(sources[0].disconnect).toHaveBeenCalled(); bank.dispose();
  });
  it('keeps procedural Bansuri as the existing default without a sample request', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const { bank, context } = audio(); bank.configure({ ...settings, bansuriVoice: undefined });
    await bank.prepare([note]);
    expect(context.createBuffer).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled(); bank.dispose();
  });
});
