import Link from "next/link";

const focusAreas = [
  {
    title: "Women's Health",
    blurb:
      "Maternal, reproductive and gynaecological health — improving access to screening, monitoring and specialist expertise.",
  },
  {
    title: "Hypertension",
    blurb:
      "Better identification, clinical assessment and follow-up for patients with limited access to healthcare services.",
  },
  {
    title: "Diabetes",
    blurb:
      "Prevention, identification, monitoring and long-term management through regular follow-up and patient education.",
  },
  {
    title: "TB & Respiratory Health",
    blurb:
      "Clinical assessment, screening pathways, referral and follow-up — complementing, not replacing, diagnostic testing.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-teal-100)] via-white to-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <p className="inline-flex items-center rounded-full bg-[var(--color-indigo-100)] px-3 py-1 text-xs font-semibold text-[var(--color-indigo-700)]">
            Founding phase — building RHEAP in Pakistan
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
            Advancing safe, evidence-based Remote Health Examination across
            Pakistan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            RHEAP is an independent, non-profit, non-political and
            non-religious association bringing together healthcare
            professionals, researchers and technologists to improve patient
            outcomes through Remote Health Examination (RHE) — clinical
            examination at a distance, not just a video call.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-teal-900)]"
            >
              Become a founding member
            </Link>
            <Link
              href="/what-is-rhe"
              className="rounded-md border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-teal-500)]"
            >
              What is RHE?
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
              Independent by design
            </h2>
            <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
              RHEAP operates independently of individual healthcare
              companies, technology providers and donors. No member, sponsor
              or organisation can acquire ownership, voting rights or
              control over the Association.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
              Technology-neutral
            </h2>
            <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
              RHE is defined by clinical purpose, not by any product,
              manufacturer or platform. RHEAP&apos;s recommendations rest on
              patient outcomes, evidence and safety — not vendor interests.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
              Not a regulator
            </h2>
            <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
              RHEAP is a professional and scientific association. It is not
              a healthcare regulator, medical licensing authority or medical
              device regulator, and does not represent itself as one.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-paper-subtle)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
              Initial focus areas
            </h2>
            <Link
              href="/focus-areas"
              className="text-sm font-semibold text-[var(--color-teal-700)] hover:text-[var(--color-teal-900)]"
            >
              View all →
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">
            RHEAP may address any condition where RHE can improve patient
            outcomes. In its initial phase, the Association is particularly
            focused on four areas of major importance to healthcare in
            Pakistan.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map((area) => (
              <div
                key={area.title}
                className="rounded-xl border border-[var(--color-border)] bg-white p-6"
              >
                <h3 className="font-semibold text-[var(--color-teal-900)]">
                  {area.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {area.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="rounded-2xl bg-[var(--color-teal-900)] px-8 py-14 text-center sm:px-16">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Help build RHEAP from the ground up
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Membership is open to individuals — clinicians, researchers,
            students, technologists and anyone who supports safe,
            evidence-based Remote Health Examination in Pakistan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/join"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-[var(--color-teal-900)] hover:bg-[var(--color-teal-100)]"
            >
              Register your interest
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Read our governance
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
