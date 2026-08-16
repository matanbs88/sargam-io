type SitarUIProps = {
  readonly activeMidi: number | null;
  readonly rootMidi: number;
};

const FRET_COUNT = 12;

const SWARA_LABELS = [
  "Sa",
  "komal Re",
  "Re",
  "komal Ga",
  "Ga",
  "Ma",
  "Tivra Ma",
  "Pa",
  "komal Dha",
  "Dha",
  "komal Ni",
  "Ni",
  "Sa'",
] as const;

const STRING_ROWS = [
  { id: "baj-tar", label: "Baj tar", detail: "melody" },
  { id: "jod", label: "Jod", detail: "support" },
  { id: "kharaj", label: "Kharaj", detail: "bass" },
  { id: "chikari", label: "Chikari", detail: "drone" },
] as const;

function relativeInterval(midi: number, rootMidi: number): number {
  return ((midi - rootMidi) % 12 + 12) % 12;
}

/**
 * A relative visual aid, not a physical sitar tab system. Sitar fret placement,
 * string setup, and tuning vary with the instrument, raga, and playing style.
 */
export function SitarUI({ activeMidi, rootMidi }: SitarUIProps) {
  const activeFret =
    activeMidi === null ? null : relativeInterval(activeMidi, rootMidi);
  const activeLabel =
    activeFret === null ? "No active note" : SWARA_LABELS[activeFret];

  return (
    <section
      aria-label="Sitar relative fret reference"
      className="rounded-2xl border border-teal/10 bg-cream p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal">Sitar reference</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Relative swara positions on the main melody string.
          </p>
        </div>
        <span className="w-fit rounded-full bg-mint-emerald px-2.5 py-1 text-xs font-bold text-white">
          {activeLabel}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="min-w-[700px] rounded-2xl border border-teal/15 bg-white p-4 shadow-sm">
          <div className="ml-[104px] grid grid-cols-[repeat(13,minmax(0,1fr))] text-center text-[9px] font-bold text-charcoal/45">
            {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
              <span key={fret}>{fret === 0 ? "Sa" : fret}</span>
            ))}
          </div>

          <div className="mt-2 space-y-2">
            {STRING_ROWS.map((string) => (
              <div
                className="grid grid-cols-[104px_repeat(13,minmax(0,1fr))] items-center"
                key={string.id}
              >
                <span className="pr-3 text-right text-xs font-bold text-teal">
                  {string.label}
                  <span className="ml-1 text-[9px] font-medium text-charcoal/45">
                    {string.detail}
                  </span>
                </span>
                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
                  const isActive = string.id === "baj-tar" && fret === activeFret;
                  const isRoot = string.id === "baj-tar" && fret === 0;

                  return (
                    <span
                      aria-label={
                        string.label +
                        ", relative fret " +
                        fret +
                        (isActive ? ", active note" : "") +
                        (isRoot ? ", Sa" : "")
                      }
                      className="relative flex h-9 items-center justify-center border-l border-teal/15 first:border-l-0"
                      key={fret}
                      role="img"
                    >
                      <span className="absolute h-px w-full bg-teal/50" />
                      {isActive ? (
                        <span className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-yellow-soft text-[10px] font-black text-charcoal shadow-sm">
                          {SWARA_LABELS[fret]}
                        </span>
                      ) : null}
                      {isRoot ? (
                        <span
                          aria-label="Sa"
                          className="absolute bottom-0.5 right-1 h-2 w-2 rounded-full bg-mint-emerald ring-1 ring-white"
                          title="Sa"
                        />
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-charcoal/60">
        The yellow point shows the active swara relative to Sa. This is a
        learning reference, not a claim of fixed fret placement or tuning for
        every sitar, raga, or gharana.
      </p>
    </section>
  );
}
