import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with RHEAP.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-20">
      <p className="text-sm font-semibold text-[var(--color-teal-700)]">
        Get in touch
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Contact RHEAP
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
        RHEAP is in its founding phase. For membership, partnership, media
        or general enquiries, reach out and a member of the founding team
        will respond.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">
            General &amp; membership enquiries
          </h2>
          <a
            href="mailto:info@rheap.org"
            className="mt-2 inline-block text-[var(--color-teal-700)] hover:text-[var(--color-teal-900)]"
          >
            info@rheap.org
          </a>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">
            Partnerships &amp; press
          </h2>
          <a
            href="mailto:partnerships@rheap.org"
            className="mt-2 inline-block text-[var(--color-teal-700)] hover:text-[var(--color-teal-900)]"
          >
            partnerships@rheap.org
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-[var(--color-paper-subtle)] p-6 text-sm text-[var(--color-ink-soft)]">
        These are placeholder addresses on the rheap.org domain. Once the
        domain and mailboxes are set up, update them here — until then,
        route submissions to whichever inbox the founding team is actually
        monitoring.
      </div>
    </div>
  );
}
