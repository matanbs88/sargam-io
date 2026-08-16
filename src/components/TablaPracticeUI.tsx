import { BASIC_THEKAS } from "@/src/lib/tabla";
import type { TaalDefinition } from "@/src/lib/taal";

type TablaPracticeUIProps = {
  readonly activeMatra: number;
  readonly isPlaying: boolean;
  readonly onTempoChange: (tempo: number) => void;
  readonly onToggle: () => void;
  readonly taal: TaalDefinition;
  readonly tempoBpm: number;
};

function gestureAtMatra(taal: TaalDefinition, matraIndex: number): "sam" | "tali" | "khali" | null {
  let current = 0;

  for (const division of taal.divisions) {
    if (current === matraIndex) return division.gesture;
    current += division.beats;
  }
  return null;
}

/** Synth-metronome controls plus a basic displayed theka for one taal cycle. */
export function TablaPracticeUI({
  activeMatra,
  isPlaying,
  onTempoChange,
  onToggle,
  taal,
  tempoBpm,
}: TablaPracticeUIProps) {
  const bols = BASIC_THEKAS[taal.id];

  return (
    <section aria-label="Tabla practice workspace" className="rounded-2xl border border-teal/10 bg-cream p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-teal">Tabla practice</p>
          <p className="mt-1 text-xs text-charcoal/60">Basic {taal.label} theka — bols are a practice prompt and may vary by style.</p>
        </div>
        <button aria-pressed={isPlaying} className={["inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition", isPlaying ? "bg-yellow-soft text-charcoal shadow-[0_3px_0_#d8ca70]" : "bg-teal text-white hover:brightness-95"].join(" ")} onClick={onToggle} type="button">
          <span className={isPlaying ? "text-base" : "text-sm"}>{isPlaying ? "||" : ">"}</span>
          {isPlaying ? "Stop metronome" : "Start metronome"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
        <span className="text-xs font-bold text-charcoal/55">Tempo</span>
        <button aria-label="Decrease tempo" className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-sm font-black text-teal" disabled={tempoBpm <= 40} onClick={() => onTempoChange(tempoBpm - 5)} type="button">-</button>
        <span className="min-w-14 text-center text-lg font-black text-teal">{tempoBpm}</span>
        <button aria-label="Increase tempo" className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-sm font-black text-teal" disabled={tempoBpm >= 200} onClick={() => onTempoChange(tempoBpm + 5)} type="button">+</button>
        <span className="text-[10px] font-bold uppercase tracking-wide text-charcoal/40">BPM · click accents Sam</span>
      </div>

      <div className="mt-5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${taal.matras}, minmax(0, 1fr))` }}>
        {bols.map((bol, index) => {
          const gesture = gestureAtMatra(taal, index);
          const isActive = index === activeMatra;
          const isSam = gesture === "sam";
          const isKhali = gesture === "khali";

          return (
            <div className="min-w-0 text-center" key={`${index}-${bol}`}>
              <span className={["mb-1 block h-1.5 rounded-full", isSam ? "bg-mint-emerald" : isKhali ? "border border-dashed border-teal/45" : gesture ? "bg-teal/35" : "bg-transparent"].join(" ")} />
              <span aria-label={`Matra ${index + 1}: ${bol}${isActive ? ", active" : ""}`} className={["grid aspect-square min-h-9 place-items-center rounded-lg px-0.5 text-[9px] font-black transition sm:text-xs", isActive ? "bg-yellow-soft text-charcoal shadow-[0_3px_0_#d8ca70]" : isSam ? "bg-mint-emerald text-white" : "bg-white text-teal shadow-sm"].join(" ")} role="img">{bol}</span>
              {gesture ? <span className="mt-1 block truncate text-[8px] font-black uppercase tracking-wide text-charcoal/45">{gesture}</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
