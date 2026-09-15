"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Native modal supplies focus containment, inert background and focus restoration. */
export function PracticeCinema({ title, context, playing, loading, onExit, onToggle, onRestart, children }: {
  title: string; context: string; playing: boolean; loading: boolean;
  onExit: () => void; onToggle: () => void; onRestart: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const invoker = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    return () => {
      dialog.close();
      queueMicrotask(() => { if (invoker?.isConnected) invoker.focus(); });
    };
  }, []);
  return <dialog ref={ref} aria-label="Cinema performance view" onCancel={e => { e.preventDefault(); onExit(); }} className="practice-cinema">
    <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0"><h2 className="text-lg font-semibold text-white">{title}</h2><p className="text-xs text-[#b7c5d0]">{context}</p></div>
      <button autoFocus aria-label="Exit cinema view" type="button" onClick={onExit} className="min-h-11 rounded-md border border-white/20 px-4 text-sm text-white">Exit view · Esc</button>
    </header>
    <div className="min-h-0 flex-1 overflow-auto px-4">{children}</div>
    <footer className="flex shrink-0 items-center justify-center gap-3 bg-[#192630] p-3">
      <button type="button" onClick={onToggle} className="min-h-11 min-w-28 rounded-md bg-[#ffe08a] px-5 text-sm font-semibold text-[#101820]">{loading ? "Cancel loading" : playing ? "Pause" : "Play"}</button>
      <button type="button" onClick={onRestart} className="min-h-11 rounded-md border border-white/20 px-4 text-sm text-white">Restart</button>
    </footer>
  </dialog>;
}
