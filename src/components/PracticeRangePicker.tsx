"use client";
import { useId, useState } from "react";
import type { EventLoopRange } from "@/src/lib/playback";
import { validPracticeRange } from "@/src/lib/practiceNavigation";

export function PracticeRangePicker({ notes, range, onApply, onClear }: {
  notes: readonly string[]; range: EventLoopRange | null;
  onApply: (range: EventLoopRange) => void; onClear: () => void;
}) {
  const id = useId();
  const [start, setStart] = useState(range?.startIndex ?? 0);
  const [end, setEnd] = useState(range?.endIndex ?? Math.min(3, notes.length - 1));
  const valid = validPracticeRange(start, end, notes.length);
  return <details className="practice-range">
    <summary className="cursor-pointer rounded-md bg-white/5 px-3 py-3 text-sm text-white">{range ? `Repeating notes ${range.startIndex + 1}–${range.endIndex + 1}` : "Repeat a section"}</summary>
    <div className="mt-2 flex flex-wrap items-end gap-3 rounded-lg bg-[#192630] p-4">
      <p className="w-full text-sm text-[#b7c5d0]">Choose a small passage. Apply, then press Play. Slow it down if needed.</p>
      {(["From note", "To note"] as const).map((label, i) => <label className="grid gap-1 text-xs text-[#b7c5d0]" key={label} htmlFor={`${id}-${i}`}>
        {label}<select id={`${id}-${i}`} className="min-h-11 rounded-md bg-[#101820] px-3 text-sm text-white" value={i ? end : start} onChange={e => i ? setEnd(Number(e.target.value)) : setStart(Number(e.target.value))}>
          {notes.map((note, index) => <option key={index} value={index}>{index + 1} · {note}</option>)}
        </select>
      </label>)}
      <button type="button" disabled={!valid} onClick={() => valid && onApply(valid)} className="min-h-11 rounded-md bg-[#80cfff] px-4 text-sm font-semibold text-[#101820] disabled:opacity-40">Apply repeat</button>
      {range && <button type="button" onClick={onClear} className="min-h-11 rounded-md border border-white/20 px-4 text-sm text-white">Whole piece</button>}
      {!valid && <p role="status" className="w-full text-sm text-[#ffe08a]">The end must be at or after the start, within this piece.</p>}
    </div>
  </details>;
}
