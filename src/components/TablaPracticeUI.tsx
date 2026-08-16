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

/** Browser-native practice accompaniment plus a displayed learner theka. */
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
    <section aria-label="Tabla practice workspace" className="rhythm-surface rounded-[1.15rem] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-2xl leading-none text-teal">Tabla practice</p>
          <p className="mt-1 text-xs text-charcoal/60">Basic {taal.label} theka — bols are a practice prompt and may vary by style.</p>
        </div>
        <button aria-pressed={isPlaying} className={["inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition duration-200 active:scale-95", isPlaying ? "bg-yellow-soft text-charcoal shadow-yellow-glow" : "bg-teal text-white shadow-[0_10px_22px_rgba(15,96,82,0.24)] hover:bg-teal-deep"].join(" ")} onClick={onToggle} type="button">
          <span className={["grid h-5 w-5 place-items-center rounded-full text-[10px]", isPlaying ? "bg-charcoal/10" : "bg-white/15"].join(" ")}>{isPlaying ? "||" : ">"}</span>
          {isPlaying ? "Stop practice sound" : "Start practice sound"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-cream p-3">
        <span className="text-xs font-bold text-charcoal/55">Tempo</span>
        <button aria-label="Decrease tempo" className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-teal shadow-sm transition active:scale-95" disabled={tempoBpm <= 40} onClick={() => onTempoChange(tempoBpm - 5)} type="button">-</button>
        <span className="min-w-14 text-center text-lg font-black text-teal">{tempoBpm}</span>
        <button aria-label="Increase tempo" className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-teal shadow-sm transition active:scale-95" disabled={tempoBpm >= 200} onClick={() => onTempoChange(tempoBpm + 5)} type="button">+</button>
        <span className="text-[10px] font-bold uppercase tracking-wide text-charcoal/40">BPM · Sam is accented</span>
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
              <span aria-label={`Matra ${index + 1}: ${bol}${isActive ? ", active" : ""}`} className={["tactile-beat grid aspect-square min-h-9 place-items-center rounded-full px-0.5 text-[9px] font-black transition duration-300 sm:text-xs", isActive ? "tactile-beat-active scale-105 bg-yellow-soft text-charcoal" : isSam ? "bg-mint-emerald text-white" : "bg-cream text-teal"].join(" ")} role="img">{bol}</span>
              {gesture ? <span className="mt-2 block truncate text-[8px] font-black uppercase tracking-[0.16em] text-teal/70">{gesture}</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
