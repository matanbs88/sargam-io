import { BASIC_THEKAS } from "@/src/lib/tabla";
import type { TaalDefinition } from "@/src/lib/taal";

type TablaPracticeUIProps = { readonly activeMatra: number; readonly isPlaying: boolean; readonly onTempoChange: (tempo: number) => void; readonly onToggle: () => void; readonly taal: TaalDefinition; readonly tempoBpm: number };

function gestureAtMatra(taal: TaalDefinition, matraIndex: number): "sam" | "tali" | "khali" | null {
  let current = 0;
  for (const division of taal.divisions) { if (current === matraIndex) return division.gesture; current += division.beats; }
  return null;
}

/** Browser-native practice accompaniment plus a displayed learner theka. */
export function TablaPracticeUI({ activeMatra, isPlaying, onTempoChange, onToggle, taal, tempoBpm }: TablaPracticeUIProps) {
  const bols = BASIC_THEKAS[taal.id];
  return (
    <section aria-label="Tabla practice workspace" className="studio-rhythm-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="font-heading text-2xl leading-none text-white">Tabla</p><p className="mt-1 text-[10px] font-bold text-white/62">{taal.label} theka · practice prompt</p></div>
        <button aria-pressed={isPlaying} className={["inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black transition active:scale-95", isPlaying ? "bg-yellow-soft text-charcoal shadow-[0_0_18px_rgba(255,240,153,0.24)]" : "bg-mint-emerald text-white shadow-[0_7px_16px_rgba(40,177,130,0.2)] hover:brightness-110"].join(" ")} onClick={onToggle} type="button"><span className="grid h-4 w-4 place-items-center rounded-full bg-white/15 text-[8px]">{isPlaying ? "II" : ">"}</span>{isPlaying ? "Stop" : "Start"}</button>
      </div>
      <div className="mt-4 flex items-center gap-2.5 rounded-md bg-white/[0.045] p-2">
        <span className="mr-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/62">Tempo</span>
        <button aria-label="Decrease tempo" className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.08] text-sm font-black text-white transition active:scale-95 disabled:opacity-30" disabled={tempoBpm <= 40} onClick={() => onTempoChange(tempoBpm - 5)} type="button">−</button>
        <span className="min-w-10 text-center text-sm font-black text-yellow-soft">{tempoBpm}</span>
        <button aria-label="Increase tempo" className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.08] text-sm font-black text-white transition active:scale-95 disabled:opacity-30" disabled={tempoBpm >= 200} onClick={() => onTempoChange(tempoBpm + 5)} type="button">+</button>
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/32">BPM</span>
      </div>
      <div className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${taal.matras}, minmax(0, 1fr))` }}>
        {bols.map((bol, index) => {
          const gesture = gestureAtMatra(taal, index);
          const isActive = index === activeMatra;
          const isSam = gesture === "sam";
          return <div className="min-w-0 text-center" key={`${index}-${bol}`}>
            <span className={["mb-1 block h-px", isSam ? "bg-mint-emerald" : gesture === "khali" ? "border-t border-dashed border-white/35" : gesture ? "bg-white/30" : "bg-transparent"].join(" ")} />
            <span aria-label={`Matra ${index + 1}: ${bol}${isActive ? ", active" : ""}`} className={["grid aspect-square min-h-8 place-items-center rounded-full px-0.5 text-[8px] font-black transition duration-300", isActive ? "scale-105 bg-yellow-soft text-charcoal shadow-[0_0_0_4px_rgba(255,240,153,0.12),0_7px_18px_rgba(255,240,153,0.2)]" : isSam ? "bg-mint-emerald text-white" : "bg-white/[0.06] text-white/65"].join(" ")} role="img">{bol}</span>
          </div>;
        })}
      </div>
    </section>
  );
}
