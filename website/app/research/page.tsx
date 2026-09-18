import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research & Evidence",
  description:
    "RHEAP's research and evidence programme is beginning — how the Association intends to contribute evidence on Remote Health Examination.",
};

const activities = [
  "Conduct and support research related to Remote Health Examination",
  "Support clinical studies, evaluations, surveys and pilot projects",
  "Collect and publish evidence on patient outcomes, healthcare access, clinical quality and healthcare delivery",
  "Establish scientific, clinical and technical working groups",
  "Cooperate with hospitals, universities, healthcare professionals and research institutions",
  "Facilitate national and international exchange of knowledge",
  "Support academic research and publication",
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
      <p className="text-sm font-semibold text-[var(--color-teal-700)]">
        Research &amp; evidence
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Our evidence programme is just beginning
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
        RHEAP is in its founding phase, so there are no published studies to
        share yet. Once the Executive Committee and Research Committee are
        established, this page will list active studies, calls for
        participation, publications and an evidence library across our four
        initial focus areas.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        What RHEAP intends to do here
      </h2>
      <ul className="mt-4 space-y-3">
        {activities.map((item) => (
          <li key={item} className="flex gap-3 text-[var(--color-ink-soft)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal-600)]" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-subtle)] p-7">
        <h2 className="font-semibold text-[var(--color-ink)]">
          Researcher or academic?
        </h2>
        <p className="mt-2 text-[var(--color-ink-soft)] leading-relaxed">
          If you&apos;re a researcher, clinician or student interested in
          contributing to RHEAP&apos;s research agenda — as a founding
          member, committee participant or study collaborator — we&apos;d
          like to hear from you.
        </p>
        <Link
          href="/join"
          className="mt-4 inline-block rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-900)]"
        >
          Register your interest
        </Link>
      </div>
    </div>
  );
}
