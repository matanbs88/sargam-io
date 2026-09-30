import {it,expect} from 'vitest';
import {BANSURI_ART_HOLES,bansuriArtworkY} from './bansuriArtworkGeometry';
it('aligns natural swaras with exact painted hole centers in every register',()=>{
  [4,2,0,-1,-3,-5].forEach((pitch,hole)=>{
    for(const octave of [-12,0,12])expect(bansuriArtworkY(pitch+octave)).toBe(BANSURI_ART_HOLES[hole]);
  });
});
it('places altered swaras between their natural fingering landmarks',()=>{
  expect(bansuriArtworkY(1)).toBe((770+625)/2);
  expect(bansuriArtworkY(3)).toBe((625+480)/2);
});
