export type BansuriHoleState = "closed" | "open" | "half-open";

type SevenHolePattern = readonly [
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
  BansuriHoleState,
];

export type BansuriFingering = {
  readonly label: string;
  readonly holes: SevenHolePattern;
};

type BansuriChartUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

/**
 * Phase 2 reference map for a seven-hole Hindustani bansuri. Hole 1 is
 * nearest the embouchure; the seventh hole is shown as the lower tuning hole.
 * Exact fingerings vary by flute construction, octave, breath, and gharana.
 */
const REFERENCE_FINGERINGS: readonly BansuriFingering[] = [
  { label: "S · Sa", holes: ["closed", "closed", "closed", "open", "open", "open", "closed"] },
  { label: "r · Komal Re", holes: ["closed", "closed", "half-open", "open", "open", "open", "closed"] },
  { label: "R · Re", holes: ["closed", "closed", "open", "open", "open", "open", "closed"] },
  { label: "g · Komal Ga", holes: ["closed", "half-open", "open", "open", "open", "open", "closed"] },
  { label: "G · Ga", holes: ["closed", "open", "open", "open", "open", "open", "closed"] },
  { label: "m · Ma", holes: ["open", "open", "open", "open", "open", "open", "closed"] },
  { label: "M · Teevra Ma", holes: ["open", "open", "open", "open", "open", "half-open", "closed"] },
  { label: "P · Pa", holes: ["closed", "closed", "closed", "closed", "closed", "closed", "closed"] },
  { label: "d · Komal Dha", holes: ["closed", "closed", "closed", "closed", "closed", "half-open", "closed"] },
  { label: "D · Dha", holes: ["closed", "closed", "closed", "closed", "closed", "open", "closed"] },
  { label: "n · Komal Ni", holes: ["closed", "closed", "closed", "closed", "half-open", "open", "closed"] },
  { label: "N · Ni", holes: ["closed", "closed", "closed", "closed", "open", "open", "closed"] },
];

function getRelativeInterval(activeMidi: number, rootMidi: number): number {
  return ((activeMidi - rootMidi) % 12 + 12) % 12;
}

export function getBansuriReferenceFingering(
  activeMidi: number | null,
  rootMidi: number,
): BansuriFingering | null {
  if (activeMidi === null) {
    return null;
  }

  return REFERENCE_FINGERINGS[getRelativeInterval(activeMidi, rootMidi)] ?? null;
}

function Hole({
  index,
  state,
}: {
  readonly index: number;
  readonly state: BansuriHoleState;
}) {
  const holeClass =
    state === "closed"
      ? "bg-teal"
      : state === "half-open"
        ? "bg-white"
        : "bg-cream";

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-right text-xs font-bold text-charcoal/55">
        {index}
      </span>
      <span
        aria-label={"Hole " + index + ": " + state}
        className={[
          "relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-teal/60",
          holeClass,
        ].join(" ")}
        role="img"
      >
        {state === "half-open" ? (
          <span className="absolute bottom-0 h-1/2 w-full bg-teal" />
        ) : null}
      </span>
    </div>
  );
}

/**
 * A visual reference only. Future calibration will attach this map to a
 * specific bansuri scale and player-preferred fingering system.
 */
export function BansuriChartUI({
  activeMidi,
  rootMidi,
}: BansuriChartUIProps) {
  const fingering = getBansuriReferenceFingering(activeMidi, rootMidi);

  return (
    <section
      aria-label="Seven-hole bansuri fingering reference"
      className="rounded-2xl border border-teal/10 bg-cream p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal">Bansuri reference</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Seven-hole reference chart relative to Sa.
          </p>
        </div>
        <span className="w-fit rounded-full bg-mint-emerald px-2.5 py-1 text-xs font-bold text-white">
          {fingering?.label ?? "No active note"}
        </span>
      </div>

      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
        {Array.from({ length: 7 }, (_, index) => (
          <Hole
            index={index + 1}
            key={index}
            state={fingering?.holes[index] ?? "open"}
          />
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-charcoal/60">
        Closed holes are teal, open holes are empty, and half-open holes are
        half filled. This is a learning reference; exact fingerings depend on
        flute design, octave, breath, and playing style.
      </p>
    </section>
  );
}
