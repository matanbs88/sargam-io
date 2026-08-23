import { beatsInTaal, type TaalDefinition } from "@/src/lib/taal";

type TaalCycleProps = { readonly activeMatra: number; readonly taal: TaalDefinition };
type Matra = { readonly gesture: "sam" | "tali" | "khali"; readonly isDivisionStart: boolean; readonly number: number };

function buildMatras(taal: TaalDefinition): readonly Matra[] {
  let number = 1;
  return taal.divisions.flatMap((division) => Array.from({ length: division.beats }, (_, index) => {
    const matra = { gesture: division.gesture, isDivisionStart: index === 0, number } as const;
    number += 1;
    return matra;
  }));
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
    <section aria-label={`${taal.label} taal cycle`} className="studio-rhythm-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-2xl leading-none text-white">{taal.label}</p>
          <p className="mt-1 text-[10px] font-bold text-white/40">{taal.matras} matras · {taal.divisions.map((division) => division.beats).join(" + ")}</p>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-mint-emerald">Matra {normalizedActiveMatra + 1}</span>
      </div>
      <div className="mt-5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${taal.matras}, minmax(0, 1fr))` }}>
        {matras.map((matra) => {
          const isActive = matra.number - 1 === normalizedActiveMatra;
          const isSam = matra.isDivisionStart && matra.gesture === "sam";
          const isKhali = matra.isDivisionStart && matra.gesture === "khali";
          return <div className="min-w-0 text-center" key={matra.number}>
            <span className={["mb-1 block h-px", isSam ? "bg-mint-emerald" : isKhali ? "border-t border-dashed border-white/35" : matra.isDivisionStart ? "bg-white/30" : "bg-transparent"].join(" ")} />
            <span aria-label={`Matra ${matra.number}${matra.isDivisionStart ? `, ${gestureLabel(matra.gesture)}` : ""}${isActive ? ", active" : ""}`} className={["grid aspect-square min-h-8 place-items-center rounded-full text-[10px] font-black transition duration-300", isActive ? "scale-105 bg-yellow-soft text-charcoal shadow-[0_0_0_4px_rgba(255,240,153,0.12),0_7px_18px_rgba(255,240,153,0.2)]" : isSam ? "bg-mint-emerald text-white" : "bg-white/[0.06] text-white/62"].join(" ")} role="img">{matra.number}</span>
            {matra.isDivisionStart ? <span className="mt-2 block truncate text-[8px] font-black uppercase tracking-[0.14em] text-mint-emerald/85">{gestureLabel(matra.gesture)}</span> : null}
          </div>;
        })}
      </div>
    </section>
  );
}
