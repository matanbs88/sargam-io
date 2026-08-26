"use client";

import { useState, type FormEvent } from "react";
import { trackProductEvent } from "@/src/lib/productAnalytics";

type WaitlistPanelProps = {
  readonly endpoint?: string;
};

const WAITLIST_STORAGE_KEY = "sargam-waitlist-preview";

export function WaitlistPanel({ endpoint = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT }: WaitlistPanelProps) {
  const [email, setEmail] = useState("");
  const [instrument, setInstrument] = useState("Harmonium");
  const [songRequest, setSongRequest] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setState("sending");

    const payload = { email, instrument, songRequest };
    trackProductEvent("waitlist_started", { instrument, requestedSong: songRequest.trim().length > 0 });

    try {
      if (endpoint !== undefined && endpoint.trim().length > 0) {
        const response = await fetch(endpoint, {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (!response.ok) throw new Error("Waitlist endpoint rejected the request.");
      } else {
        window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(payload));
      }

      setState("success");
      trackProductEvent("waitlist_completed", { instrument, requestedSong: songRequest.trim().length > 0 });
      setEmail("");
      setSongRequest("");
      setConsent(false);
    } catch {
      setState("error");
    }
  }

  return (
    <section
      aria-labelledby="waitlist-title"
      className="relative mx-auto mt-8 max-w-7xl overflow-hidden rounded-[1.6rem] bg-teal px-5 py-8 text-white shadow-[0_24px_70px_rgba(15,61,54,0.2)] sm:px-8 sm:py-10"
      id="waitlist"
    >
      <div aria-hidden="true" className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-mint-emerald/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-yellow-soft/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-soft">Founding circle</p>
          <h2 id="waitlist-title" className="mt-2 font-heading text-4xl leading-none sm:text-5xl">Bring your next song into Sa.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/68">
            Tell us what you play and which melody is waiting for you. We are
            shaping the first practice library around real Indian musicians.
          </p>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
            No audio upload · no automatic transcription yet · early access preview
          </p>
        </div>

        <form className="grid gap-3 rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/55">Email</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-[#0b4b40] px-3 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-yellow-soft"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/55">Main instrument</span>
            <select
              className="w-full rounded-lg border border-white/10 bg-[#0b4b40] px-3 py-3 text-sm font-semibold text-white outline-none focus:border-yellow-soft"
              onChange={(event) => setInstrument(event.target.value)}
              value={instrument}
            >
              <option>Harmonium</option>
              <option>Piano / Keyboard</option>
              <option>Bansuri</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-white/55">Song you want to practice</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-[#0b4b40] px-3 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-yellow-soft"
              onChange={(event) => setSongRequest(event.target.value)}
              placeholder="e.g. Kesariya"
              value={songRequest}
            />
          </label>
          <label className="flex items-start gap-2 text-[10px] font-semibold leading-4 text-white/55 sm:col-span-2">
            <input
              checked={consent}
              className="mt-0.5 h-4 w-4 shrink-0 accent-yellow-soft"
              onChange={(event) => setConsent(event.target.checked)}
              required
              type="checkbox"
            />
            <span>I agree to receive early-access updates about Sargam.io. No audio or song files are collected by this preview.</span>
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
            <div>
              <p aria-live="polite" className={[
                "text-[10px] font-semibold",
                state === "error" ? "text-red-200" : state === "success" ? "text-yellow-soft" : "text-white/45",
              ].join(" ")}>
                {state === "success"
                  ? endpoint
                    ? "You are on the founding list."
                    : "Preview saved on this device; connect a waitlist endpoint before launch."
                  : state === "error"
                    ? "Could not save this request. Try again."
                    : "We will use this only for early-access research."}
              </p>
              <a className="mt-1 inline-block text-[10px] font-bold text-white/55 underline decoration-white/25 underline-offset-2 transition hover:text-yellow-soft" href="/privacy">
                Read the preview privacy notice
              </a>
            </div>
            <button
              className="rounded-lg bg-yellow-soft px-5 py-3 text-xs font-black text-charcoal shadow-yellow-glow transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-wait disabled:opacity-60"
              disabled={state === "sending"}
              type="submit"
            >
              {state === "sending" ? "Saving…" : "Join the waitlist"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
