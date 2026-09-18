import type { Metadata } from "next";
import { rulesSections } from "./data";

export const metadata: Metadata = {
  title: "Rules & Regulations",
  description:
    "The full Rules and Regulations of the Remote Health Examination Association Pakistan (RHEAP).",
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
      <p className="text-sm font-semibold text-[var(--color-teal-700)]">
        Governing document
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Rules &amp; Regulations of RHEAP
        </h1>
        <a
          href="/rheap-rules-and-regulations.pdf"
          download
          className="shrink-0 rounded-md border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-teal-500)]"
        >
          Download PDF ↓
        </a>
      </div>
      <p className="mt-6 max-w-2xl text-[var(--color-ink-soft)] leading-relaxed">
        These Rules and Regulations govern the Remote Health Examination
        Association Pakistan (RHEAP), adopted at its Founding Meeting. They
        are the Association&apos;s source of truth on governance, membership,
        voting and finance — wherever any other RHEAP material conflicts
        with this document, this document prevails.
      </p>

      <div className="prose-rules mt-10 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
        {rulesSections.map((section) => (
          <section key={section.number} id={`section-${section.number}`}>
            <h2>
              {section.number}. {section.title}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
