"use client";
import { useId } from "react";
import { BANSURI_ART_HOLES } from '@/src/lib/bansuriArtworkGeometry';

/** Editorial bamboo artwork with independent, accessible live fingering. */
export function BansuriIllustration({ holes }: { holes?: readonly string[] }) {
  const id = useId();
  return <svg viewBox="420 30 230 1480" role="img" aria-labelledby={`${id}-title`} className="h-auto max-h-[470px] w-full max-w-[122px]">
    <title id={`${id}-title`}>{holes ? holes.map((s, i) => `Hole ${i + 1}: ${s}`).join(", ") : "Bamboo bansuri, six finger holes and a separate embouchure"}</title>
    <defs><clipPath id={`${id}-body`}><rect x="463" y="54" width="101" height="1432" rx="28"/></clipPath></defs>
    <image href="/artwork/bansuri-bamboo-smooth.png" width="1024" height="1536" clipPath={`url(#${id}-body)`}/>
    <ellipse cx="513" cy="272" rx="23" ry="18" fill="#151e22" stroke="#8c6137" strokeWidth="4"/>
    {BANSURI_ART_HOLES.map((cy, i) => {
      const state = holes?.[i];
      return <g key={cy}>
        <ellipse cx="513" cy={cy} rx="25" ry="29" fill="#131f28" stroke="#9b703f" strokeWidth="4"/>
        {state === 'closed' && <circle cx="513" cy={cy} r="26" fill="#9ad8c2"/>}
        {state === 'half-open' && <><path d={`M487 ${cy}A26 26 0 0 0 539 ${cy}Z`} fill="#9ad8c2"/><path d={`M487 ${cy}H539`} stroke="#e4fff0" strokeWidth="3"/></>}
        <path d={`M575 ${cy}h18`} stroke="#7f979c" strokeWidth="2"/>
        <text x="605" y={cy + 9} fontSize="26" fill="#c0d0d4" fontFamily="sans-serif">{i + 1}</text>
      </g>;
    })}
  </svg>;
}
