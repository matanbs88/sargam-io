/**
 * Rights-safe showcase registry for the waitlist preview.
 *
 * These entries deliberately point at original Sargam.io Riyaz exercises in
 * the catalog. Keeping the marketing surface separate from the demand map
 * prevents an uncleared commercial title from being presented as a playable
 * public demo by accident.
 */
export type ShowcaseSession = {
  readonly catalogSongId: string;
  readonly id: string;
  readonly rightsRecord: string;
  readonly subtitle: string;
  readonly featuredInstruments: readonly ("Piano" | "Harmonium" | "Bansuri")[];
  readonly exportAllowed: true;
};

export const RIGHTS_SAFE_SHOWCASES: readonly ShowcaseSession[] = [
  {
    catalogSongId: "riyaz-sa-re-ga",
    exportAllowed: true,
    featuredInstruments: ["Piano", "Harmonium", "Bansuri"],
    id: "showcase-sa-re-ga",
    rightsRecord: "original-sargam-riyaz-001",
    subtitle: "A compact phrase to hear, transpose, and print.",
  },
  {
    catalogSongId: "riyaz-arohana",
    exportAllowed: true,
    featuredInstruments: ["Piano", "Harmonium"],
    id: "showcase-arohana",
    rightsRecord: "original-sargam-riyaz-002",
    subtitle: "Aroha in your Sa with a clean practice arc.",
  },
  {
    catalogSongId: "riyaz-bansuri-breath",
    exportAllowed: true,
    featuredInstruments: ["Bansuri"],
    id: "showcase-bansuri-breath",
    rightsRecord: "original-sargam-riyaz-003",
    subtitle: "Short phrases designed around breath length.",
  },
  {
    catalogSongId: "riyaz-taal-teentaal",
    exportAllowed: true,
    featuredInstruments: ["Harmonium", "Bansuri"],
    id: "showcase-taal-teentaal",
    rightsRecord: "original-sargam-riyaz-004",
    subtitle: "A 16-matra phrase with a clear Sam landing.",
  },
  {
    catalogSongId: "riyaz-komal-colour",
    exportAllowed: true,
    featuredInstruments: ["Piano", "Harmonium", "Bansuri"],
    id: "showcase-komal-colour",
    rightsRecord: "original-sargam-riyaz-005",
    subtitle: "Hear komal colour without losing the relative frame.",
  },
];

if (RIGHTS_SAFE_SHOWCASES.length !== 5) {
  throw new Error("The launch preview must contain exactly five cleared showcases.");
}
