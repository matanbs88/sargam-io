"use client";
import { useId } from "react";

/** Original vector artwork. Ornament is separate from the six live finger states. */
export function BansuriIllustration({ holes }: { holes?: readonly string[] }) {
  const id = useId();
  return <svg viewBox="0 0 140 540" role="img" aria-labelledby={`${id}-title`} className="h-auto max-h-[470px] w-full max-w-[122px]">
    <title id={`${id}-title`}>{holes ? holes.map((s, i) => `Hole ${i + 1}: ${s}`).join(", ") : "Bamboo bansuri, six finger holes and a separate embouchure"}</title>
    <defs>
      <clipPath id={`${id}-body`}><path d="M51 24Q69 16 87 24L83 509Q68 521 54 509Z"/></clipPath>
    </defs>
    <path d="M59 31Q78 23 93 32L88 514Q74 528 61 516Z" fill="#070f15" opacity=".5"/>
    <path d="M51 24Q69 16 87 24L83 509Q68 521 54 509Z" fill="#c89751" stroke="#725334" strokeWidth="1.2"/>
    <g clipPath={`url(#${id}-body)`}>
      <path d="M57 19H77L74 520H60Z" fill="#dfb97b"/>
      <path d="M61 20H66L65 522H60Z" fill="#edcf98" opacity=".65"/>
      <path d="M82 17H91L87 522H77Z" fill="#af7d42"/>
      <g fill="none" stroke="#947044" strokeWidth=".65" opacity=".45">
        <path d="M57 91Q63 133 58 168T60 246M77 68Q73 102 78 146T77 236M59 315Q64 371 60 419M75 354Q72 413 77 465"/>
        <path d="M69 102L68 147M71 274L72 299M65 391L66 449"/>
      </g>
      {[43, 476].map(y => <g key={y}>
        <path d={`M49 ${y}Q69 ${y + 4} 89 ${y}V${y + 20}Q69 ${y + 24} 49 ${y + 20}Z`} fill="#633f38"/>
        {[3, 7, 11, 15, 19].map(d => <path key={d} d={`M49 ${y + d}Q69 ${y + d + 4} 89 ${y + d}`} fill="none" stroke="#ba7960" strokeWidth="1"/>)}
        <path d={`M49 ${y}Q69 ${y + 4} 89 ${y}M49 ${y + 21}Q69 ${y + 25} 89 ${y + 21}`} fill="none" stroke="#e3c68b" strokeWidth="1.5"/>
      </g>)}
      {[119, 451].map(y => <g key={y} fill="none">
        <path d={`M50 ${y}Q68 ${y - 5} 86 ${y}`} stroke="#a27947" strokeWidth="2"/>
        <path d={`M50 ${y + 3}Q68 ${y - 2} 86 ${y + 3}`} stroke="#edcf98" strokeWidth="1"/>
      </g>)}
    </g>
    <ellipse cx="69" cy="25" rx="17" ry="5" fill="#b8894e" stroke="#e2bf86" strokeWidth="1"/>
    <ellipse cx="69" cy="88" rx="9.5" ry="7.5" fill="#89603b"/>
    <ellipse cx="69" cy="87" rx="7.8" ry="5.9" fill="#172028"/>
    {[175, 224, 273, 322, 371, 420].map((cy, i) => {
      const state = holes?.[i];
      return <g key={cy}>
        <ellipse cx="69" cy={cy + 1} rx="11" ry="12" fill="#e7c78e"/>
        <ellipse cx="69" cy={cy} rx="10" ry="11" fill="#795333"/>
        <ellipse cx="69" cy={cy - .5} rx="8" ry="9" fill="#131f28"/>
        {state === "closed" && <><circle cx="69" cy={cy} r="9" fill="#93d6d0"/><path d={`M65 ${cy}l3 3 5-6`} fill="none" stroke="#174541" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>}
        {state === "half-open" && <><path d={`M60 ${cy}A9 9 0 0 0 78 ${cy}Z`} fill="#93d6d0"/><path d={`M60 ${cy}H78`} stroke="#d5f4ed" strokeWidth="1"/></>}
        <path d={`M92 ${cy}h8`} stroke="#526573" strokeWidth=".75"/>
        <text x="106" y={cy + 3} fontSize="9" fill="#9caeb8" fontFamily="sans-serif">{i + 1}</text>
      </g>;
    })}
    <path d="M56 506Q69 512 82 506" fill="none" stroke="#e4c58d" strokeWidth="1.5"/>
  </svg>;
}
