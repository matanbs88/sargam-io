import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy and early access",
  description: "How the Sargam preview handles scores, audio uploads, local drafts and early-access information.",
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

        <section className="mt-10 space-y-4 text-sm leading-7" aria-labelledby="upload-handling">
          <h2 id="upload-handling" className="font-heading text-2xl">Scores, audio and practice drafts</h2>
          <p>Uploading sends your selected file to our server. MusicXML/MXL scores are parsed there; PDF recognition depends on the configured recognition service and may be unavailable. PDF export sends your score notes and title to our server to create the download.</p>
          <p>The transcription form displays its active mode. In Mock mode, the server accepts your source but returns a fixed demonstration: it does not analyze the audio or send it to a transcription provider. In Klangio mode, uploaded audio is forwarded to Klangio for analysis. Live YouTube acquisition is not connected.</p>
          <p>Our transcription job/result cache is temporary, held in server memory for up to 30 minutes; restart or another server instance can make it disappear sooner. This limit is not a promise about a provider’s retention. Cancellation stops this app waiting but does not guarantee that provider processing or retention ends.</p>
          <p>Saved practice drafts, when you choose to save one, contain note data rather than source audio and are stored in this browser. Shared devices can expose them to other users of the same browser. Use Delete saved draft to remove your local copy. These drafts are not cloud backups.</p>
        </section>
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
          terms. Accounts, payments and cloud-saved personal libraries are not
          enabled in this preview.
        </p>
      </div>
    </main>
  );
}
