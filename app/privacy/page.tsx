import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy and early access",
  description: "How the Sargam.io early-access preview handles waitlist information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream px-5 py-8 text-charcoal sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link className="text-sm font-bold text-teal transition hover:text-mint-emerald" href="/">
          ← Back to Sargam.io
        </Link>
        <p className="mt-16 text-[10px] font-black uppercase tracking-[0.2em] text-teal">
          Early-access preview
        </p>
        <h1 className="mt-3 font-heading text-5xl leading-none text-charcoal sm:text-7xl">
          Privacy, plainly stated.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-charcoal/65">
          This preview is collecting a small amount of information to understand
          who wants to practise Indian melodies and which instruments matter most.
          It is not yet a live transcription or paid SaaS service.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <section className="rounded-[1.2rem] bg-white/75 p-5 shadow-teal-soft">
            <h2 className="font-heading text-2xl text-charcoal">What we collect</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/60">
              If you join the early-access list, we receive your email, main
              instrument, requested song, consent, and submission time.
            </p>
          </section>
          <section className="rounded-[1.2rem] bg-white/75 p-5 shadow-teal-soft">
            <h2 className="font-heading text-2xl text-charcoal">What we do not collect</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/60">
              The preview does not upload YouTube links, audio, PDFs, recordings,
              or practice notes when you join the list.
            </p>
          </section>
          <section className="rounded-[1.2rem] bg-white/75 p-5 shadow-teal-soft">
            <h2 className="font-heading text-2xl text-charcoal">Why we use it</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/60">
              We use it for early-access updates, demand research, and deciding
              which cleared practice material to build first. We do not sell it.
            </p>
          </section>
          <section className="rounded-[1.2rem] bg-white/75 p-5 shadow-teal-soft">
            <h2 className="font-heading text-2xl text-charcoal">Your choice</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/60">
              You can ask to correct or remove your request by replying to the
              message you receive or contacting the project owner directly.
              Production retention and deletion controls will be published before
              public launch.
            </p>
          </section>
        </div>

        <p className="mt-10 border-t border-teal/10 pt-5 text-xs leading-6 text-charcoal/45">
          This is a product preview notice, not a substitute for final legal
          terms. The production service will publish an updated policy before
          accounts, payments, audio uploads, or persistent libraries are enabled.
        </p>
      </div>
    </main>
  );
}
