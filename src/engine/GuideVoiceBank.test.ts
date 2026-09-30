import { afterEach, describe, expect, it, vi } from 'vitest';
import { GuideVoiceBank, type VoiceSettings } from './GuideVoiceBank';
import { expressBansuri } from '../lib/ventusPerformance';

const settings: VoiceSettings = { instrument: 'Bansuri', enabled: true, double: false, room: false, bansuriVoice: 'ventus-study' };
const note = { midi: 64, startMs: 0, durationMs: 652, velocity: 80 };
function audio() {
  const parameter = () => ({ value: 0, setValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() });
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
  it('prepares offline contexts without resume and avoids wall-clock cleanup timers',async()=>{
    vi.useFakeTimers();vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));
    const {bank,context}=audio();Object.assign(context,{startRendering:vi.fn()});
    bank.configure({...settings,bansuriVoice:'ventus'});await bank.prepare([note]);
    expect(context.resume).not.toHaveBeenCalled();
    bank.schedule(note,10.1,.652,0,1);expect(vi.getTimerCount()).toBe(0);bank.dispose();
  });
  it.each(['late','truncated','tongued'] as const)('does not join %s playback boundaries',async condition=>{
    vi.useFakeTimers(); vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));
    const {bank,sources,context}=audio();
    bank.configure({...settings,bansuriVoice:'ventus',bansuriArticulation:condition==='tongued'?'tongued':'natural'});
    const phrase=expressBansuri([{...note,durationMs:1000},{...note,midi:67,startMs:1000}],'meend');
    await bank.prepare(phrase);
    bank.schedule(phrase[0],10.1,condition==='truncated'?.5:1,0,1);
    if(condition==='late')context.currentTime=11.099;
    bank.schedule(phrase[1],11.1,.652,0,1);
    expect(sources[0].stop).toHaveBeenCalledTimes(1);
    expect(sources[1].start).toHaveBeenCalledWith(11.1,0);
    bank.dispose();
  });
  it('crossfades only scheduled connected natural notes, starting the destination in its sustain', async()=>{
    vi.useFakeTimers(); vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));
    const {bank,sources}=audio(); bank.configure({...settings,bansuriVoice:'ventus'});
    const phrase=expressBansuri([{...note,durationMs:1000},{...note,midi:67,startMs:1000}],'meend');
    await bank.prepare(phrase);
    bank.schedule(phrase[0],10.1,1,0,1);
    expect(sources[0].stop).toHaveBeenLastCalledWith(11.1);
    bank.schedule(phrase[1],11.1,.652,0,1);
    expect(sources[0].stop).toHaveBeenLastCalledWith(11.118);
    expect(sources[1].start).toHaveBeenCalledWith(11.1,2.15);
    bank.dispose();
  });
  it('does not suppress attacks on seeks or extend a tail after cancellation',async()=>{
    vi.useFakeTimers(); vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));
    const {bank,sources}=audio(); bank.configure({...settings,bansuriVoice:'ventus'});
    const phrase=expressBansuri([{...note,durationMs:1000},{...note,midi:67,startMs:1000}],'meend');
    await bank.prepare(phrase); bank.schedule(phrase[0],10.1,1,0,1); bank.cancel();
    bank.schedule(phrase[1],11.1,.652,0,1);
    expect(sources[1].start).toHaveBeenCalledWith(11.1,0);
    bank.dispose();
  });
  it.each(['meend','gamak-study'] as const)('schedules the generated %s transition on the actual sampled voice', async mode=>{
    vi.useFakeTimers(); vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)})));
    const {bank,sources}=audio(); bank.configure({...settings,bansuriVoice:'ventus'});
    const phrase=expressBansuri([{...note,durationMs:1000},{...note,midi:67,startMs:1000}],mode);
    await bank.prepare(phrase); bank.schedule(phrase[0],10,2,0,.5);
    expect(sources[0].detune.setValueAtTime).toHaveBeenCalledWith(0,10);
    expect(sources[0].detune.linearRampToValueAtTime).toHaveBeenCalledWith(300,12);
    expect(sources[0].detune.linearRampToValueAtTime).toHaveBeenCalledWith(0,10+phrase[0].transition!.onsetMs/500);
    bank.dispose();
  });
  it('changes master volume without stopping voices or refetching samples', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    vi.stubGlobal('fetch', fetcher);
    const { bank, context, sources } = audio();
    bank.configure({ ...settings, bansuriVoice: 'ventus' });
    bank.setBansuriVolume(70);
    await bank.prepare([note]);
    const master = context.createGain.mock.results[0].value;
    expect(master.gain.value).toBe(.7);
    bank.schedule(note, 10, .652, 0, 1);
    const stops = sources[0].stop.mock.calls.length;
    bank.setBansuriVolume(30);
    expect(master.gain.setTargetAtTime).toHaveBeenCalledWith(.3, 10, .015);
    expect(sources[0].stop).toHaveBeenCalledTimes(stops);
    expect(fetcher).toHaveBeenCalledOnce();
    bank.setBansuriVolume(0);
    expect(master.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 10, .015);
    bank.dispose();
    expect(master.disconnect).toHaveBeenCalled();
  });
  it.each([0.5, 1, 1.25])('resumes a sampled note at the elapsed audio position at %sx tempo', async (rate) => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })));
    const { bank, sources } = audio();
    await bank.prepare([note]);
    const offset = 0.3;
    const remaining = (0.652 - offset) / rate;
    bank.schedule(note, 10.05, remaining, offset, rate);
    const pitchRate = 2 ** ((note.midi - 65.993) / 12);
    expect(sources[0].start).toHaveBeenCalledWith(10.05, (offset / rate) * pitchRate);
    expect(sources[0].playbackRate.value).toBeCloseTo(pitchRate);
    expect(sources[0].stop).toHaveBeenCalledWith(10.05 + remaining);
    bank.dispose();
  });
  it('includes slow-tempo elapsed audio in the sustain-length guard', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })));
    const { bank, sources } = audio();
    await bank.prepare([note]);
    // 2 score seconds at half speed consumed 4 real seconds of the recording.
    expect(() => bank.schedule(note, 10, 0.5, 2, 0.5)).toThrow('exceeds the experimental Ventus sustain');
    expect(sources[0].start).not.toHaveBeenCalled();
    bank.dispose();
  });
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
  it('keeps procedural Bansuri only when explicitly selected', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const { bank, context } = audio(); bank.configure({ ...settings, bansuriVoice: 'procedural' });
    await bank.prepare([note]);
    expect(context.createBuffer).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled(); bank.dispose();
  });
  it('defaults to recorded Ventus, loops long notes and never synthesizes a substitute', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })); vi.stubGlobal('fetch', fetcher);
    const { bank, context, sources } = audio(); bank.configure({ ...settings, bansuriVoice: undefined });
    context.decodeAudioData.mockResolvedValue({ duration: 7, length: 308700, numberOfChannels: 1 });
    await bank.prepare([note, { ...note, midi: 69 }, { ...note, midi: 71 }]);
    expect(fetcher).toHaveBeenCalledTimes(3); expect(context.createBuffer).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(expect.stringMatching(/\/audio\/bansuri\/performance\/natural-64-v2-rr1-/), expect.anything());
    bank.schedule(note, 10, 20, 15, .5);
    expect(sources[0].loop).toBe(true); expect(sources[0].loopStart).toBe(2.15); expect(sources[0].loopEnd).toBe(6.85);
    expect(sources[0].start.mock.calls[0][1]).toBeGreaterThanOrEqual(2.15); expect(sources[0].start.mock.calls[0][1]).toBeLessThan(6.85);
    expect(sources[0].stop).toHaveBeenCalledWith(30); bank.dispose();
  });
  it('applies pitch curves to sampled Ventus without rejecting the score', async () => {
    vi.useFakeTimers(); vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })));
    const { bank, sources } = audio(); bank.configure({ ...settings, bansuriVoice: 'ventus' });
    const curved = { ...note, pitchCurve: [{ offsetMs: 0, cents: 0 }, { offsetMs: 400, cents: 100 }] };
    await bank.prepare([curved]); bank.schedule(curved, 10, .652, 0, 1);
    expect(sources[0].detune.linearRampToValueAtTime).toHaveBeenCalledWith(100, 10.4); bank.dispose();
  });
  it('reports a missing Ventus asset instead of quietly using synthetic flute', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const { bank, context } = audio(); bank.configure({ ...settings, bansuriVoice: undefined });
    await expect(bank.prepare([note])).rejects.toThrow('404'); expect(context.createBuffer).not.toHaveBeenCalled(); bank.dispose();
  });
});
