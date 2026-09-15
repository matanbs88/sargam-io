"use client";
import { KeyboardRoll, type KeyboardRollProps } from "./KeyboardRoll";
import type { HarmoniumReedMode, HarmoniumReverbMode } from "@/src/features/practice/useDigitalAccompaniment";
type Props = KeyboardRollProps & {
  harmoniumReedMode: HarmoniumReedMode; harmoniumReverbMode: HarmoniumReverbMode;
  onHarmoniumReedModeChange: (mode: HarmoniumReedMode) => void;
  onHarmoniumReverbModeChange: (mode: HarmoniumReverbMode) => void;
};
export function HarmoniumFallingNotes(props: Props) {
  return <KeyboardRoll {...props} title="Harmonium" controls={<div className="flex flex-wrap gap-3 text-xs">
    <div role="group" aria-label="Harmonium reeds" className="flex items-center gap-1"><span className="mr-1 text-[#b7c5d0]">Reeds</span>{(["single", "double"] as const).map((mode) => <button type="button" key={mode} aria-pressed={props.harmoniumReedMode === mode} onClick={() => props.onHarmoniumReedModeChange(mode)} className="min-h-11 rounded-md px-3 text-[#f4f7fa] aria-pressed:bg-[#ffe08a] aria-pressed:text-[#101820] focus-visible:outline-2">{mode}</button>)}</div>
    <div role="group" aria-label="Harmonium space" className="flex items-center gap-1"><span className="mr-1 text-[#b7c5d0]">Space</span>{(["dry", "room"] as const).map((mode) => <button type="button" key={mode} aria-pressed={props.harmoniumReverbMode === mode} onClick={() => props.onHarmoniumReverbModeChange(mode)} className="min-h-11 rounded-md px-3 text-[#f4f7fa] aria-pressed:bg-[#80cfff] aria-pressed:text-[#101820] focus-visible:outline-2">{mode}</button>)}</div>
  </div>} />;
}
