export const BANSURI_ART_HOLES = [480,625,770,915,1060,1205] as const;
// Fingering landmarks, NOT a linear frequency axis. Octaves share fingerings.
const LANES = [770,697.5,625,552.5,480,407.5,335,1205,1132.5,1060,987.5,915];
export function bansuriArtworkY(relativePitch:number):number {
  const pitch=((relativePitch%12)+12)%12;
  const low=Math.floor(pitch), fraction=pitch-low;
  return LANES[low]+(LANES[(low+1)%12]-LANES[low])*fraction;
}
