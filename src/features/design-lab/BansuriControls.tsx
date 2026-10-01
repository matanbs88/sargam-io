"use client";
import type { PilotSession } from './usePilotSession';
export function BansuriControls({session:p}:{session:PilotSession}) {
  const connections=p.roll.events.filter(n=>n.transition).length;
  return <>
    <label>Playing style<select value={p.bansuriArticulation} onChange={e=>p.setBansuriArticulation(e.target.value as PilotSession['bansuriArticulation'])}>
      <option value="natural">Natural sustain</option><option value="tongued">Tongued attack</option><option value="breath">Recorded breath vibrato</option><option value="flutter">Recorded flutter</option>
    </select></label>
    <label>Pitch expression<select value={p.bansuriExpression} onChange={e=>p.setBansuriExpression(e.target.value as PilotSession['bansuriExpression'])}>
      <option value="plain">As written</option><option value="meend">Meend · connected-note glide</option>
    </select><small>{p.bansuriExpression==='plain'?'Original melody; no added ornaments.':'Optional synthesized pitch gesture, not recorded Kontakt legato or a raga-specific interpretation.'}</small></label>
    {p.bansuriExpression!=='plain' && <small role="status">{connections ? `${connections} connected-note transitions. Sustained note bodies stay steady.` : 'No eligible connections in this score. Rests and repeated pitches are preserved. Try the Ode to Joy study to compare transitions.'}</small>}
    <label>Bansuri volume · {p.bansuriVolume}%<input aria-label="Bansuri volume" aria-valuetext={`${p.bansuriVolume} percent`} type="range" min="0" max="100" value={p.bansuriVolume} onChange={e=>p.setBansuriVolume(Number(e.target.value))}/><small>Adjust while playing.</small></label>
    {p.events.some(n=>n.midi<64||n.midi>90) && <small>Some notes are outside the recorded E4–F♯6 range and use pitch-shifted samples.</small>}
  </>;
}
