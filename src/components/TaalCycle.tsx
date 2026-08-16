import { beatsInTaal, type TaalDefinition } from "@/src/lib/taal";

type TaalCycleProps = {
  readonly activeMatra: number;
  readonly taal: TaalDefinition;
};

type Matra = {
  readonly gesture: "sam" | "tali" | "khali";
  readonly isDivisionStart: boolean;
  readonly number: number;
};

function buildMatras(taal: TaalDefinition): readonly Matra[] {
  let number = 1;

  return taal.divisions.flatMap((division) =>
    Array.from({ length: division.beats }, (_, index) => {
      const matra = {
        gesture: division.gesture,
        isDivisionStart: index === 0,
        number,
      } as const;
      number += 1;
      return matra;
    }),
  );
}

function gestureLabel(gesture: Matra["gesture"]): string {
  if (gesture === "sam") return "Sam";
  if (gesture === "khali") return "Khali";
  return "Tali";
}

/** Manual cycle visual only; choosing a taal is not automatic rhythm detection. */
export function TaalCycle({ activeMatra, taal }: TaalCycleProps) {
  const matras = buildMatras(taal);
  const normalizedActiveMatra = activeMatra % beatsInTaal(taal);

  return (
    <section aria-label={taal.label + " taal cycle"} className="rhythm-surface rounded-[1.15rem] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-2xl leading-none text-teal">{taal.label} cycle</p>
          <p className="mt-1 text-xs text-charcoal/60">{taal.matras} matras · {taal.divisions.map((division) => division.beats).join(" + ")}</p>
        </div>
        <span className="w-fit rounded-full bg-cream px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal/70">Matra {normalizedActiveMatra + 1}</span>
      </div>

      <div className="mt-5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${taal.matras}, minmax(0, 1fr))` }}>
        {matras.map((matra) => {
          const isActive = matra.number - 1 === normalizedActiveMatra;
          const isSam = matra.isDivisionStart && matra.gesture === "sam";
          const isKhali = matra.isDivisionStart && matra.gesture === "khali";

          return (
            <div className="min-w-0 text-center" key={matra.number}>
              <span className={["mb-1 block h-1.5 rounded-full", isSam ? "bg-mint-emerald" : isKhali ? "border border-dashed border-teal/45" : matra.isDivisionStart ? "bg-teal/35" : "bg-transparent"].join(" ")} />
              <span aria-label={`Matra ${matra.number}${matra.isDivisionStart ? ", " + gestureLabel(matra.gesture) : ""}${isActive ? ", active" : ""}`} className={["tactile-beat grid aspect-square min-h-8 place-items-center rounded-full text-xs font-black transition duration-300", isActive ? "tactile-beat-active scale-105 bg-yellow-soft text-charcoal" : isSam ? "bg-mint-emerald text-white" : "bg-cream text-teal"].join(" ")} role="img">{matra.number}</span>
              {matra.isDivisionStart ? <span className="mt-2 block truncate text-[8px] font-black uppercase tracking-[0.16em] text-teal/70">{gestureLabel(matra.gesture)}</span> : null}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] leading-5 text-charcoal/50">The cycle is manually selected for this mock practice view. Future audio analysis must confirm taal; BPM alone is not enough.</p>
    </section>
  );
}
