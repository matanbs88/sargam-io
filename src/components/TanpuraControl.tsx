import type { DroneMode } from "@/src/lib/digitalAccompaniment";

type TanpuraControlProps = {
  readonly droneMode: DroneMode;
  readonly isPlaying: boolean;
  readonly onModeChange: (mode: DroneMode) => void;
  readonly onToggle: () => void;
  readonly rootLabel: string;
};

/** Controls a tonic-aware, four-string Tanpura practice layer. */
export function TanpuraControl({
  droneMode,
  isPlaying,
  onModeChange,
  onToggle,
  rootLabel,
}: TanpuraControlProps) {
  const firstString = droneMode === "SaPa" ? "Pa" : "Ma";

  return (
    <section aria-label="Tanpura practice layer" className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-mint-emerald">Tanpura</p>
          <p className="mt-1 text-xs font-bold text-white/75">{rootLabel} is Sa · four-string practice drone</p>
        </div>
        <span className={isPlaying ? "mt-0.5 h-2 w-2 rounded-full bg-mint-emerald shadow-[0_0_12px_rgba(40,177,130,0.9)]" : "mt-0.5 h-2 w-2 rounded-full bg-white/20"} />
      </div>

      <div aria-label="Tanpura tuning" className="mt-3 flex rounded-lg bg-white/[0.06] p-1" role="group">
        {(["SaPa", "SaMa"] as const).map((mode) => {
          const isActive = droneMode === mode;
          return (
            <button aria-pressed={isActive} className={["flex-1 rounded-md px-2 py-2 text-[10px] font-black transition", isActive ? "bg-mint-emerald text-white shadow-[0_4px_12px_rgba(40,177,130,0.24)]" : "text-white/50 hover:text-white"].join(" ")} key={mode} onClick={() => onModeChange(mode)} type="button">
              {mode === "SaPa" ? "Pa · Sa · Sa · Sa" : "Ma · Sa · Sa · Sa"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div aria-label={`Tanpura strings: ${firstString}, Sa, Sa, upper Sa`} className="flex flex-1 items-end gap-1.5" role="img">
          {[firstString, "Sa", "Sa", "Sā"].map((string, index) => (
            <span className={["flex-1 rounded-full bg-gradient-to-b from-yellow-soft via-yellow-soft/55 to-transparent", isPlaying ? "animate-pulse" : "opacity-50"].join(" ")} key={`${string}-${index}`} style={{ height: `${22 + index * 7}px`, animationDelay: `${index * 160}ms` }}><span className="sr-only">{string}</span></span>
          ))}
        </div>
        <button aria-pressed={isPlaying} className={["shrink-0 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition active:scale-95", isPlaying ? "bg-yellow-soft text-charcoal shadow-[0_0_16px_rgba(255,240,153,0.28)]" : "bg-white/10 text-white hover:bg-white/15"].join(" ")} onClick={onToggle} type="button">
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>
    </section>
  );
}
