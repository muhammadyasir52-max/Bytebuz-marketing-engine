import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & Governance",
  description:
    "RHEAP's purpose, independence, governance structure and initial committees.",
};

const committees = [
  "Women's Health Committee",
  "Hypertension and Cardiovascular Health Committee",
  "Diabetes Committee",
  "Tuberculosis and Respiratory Health Committee",
  "Clinical and Scientific Committee",
  "Research Committee",
  "Education and Training Committee",
  "Technology and Standards Committee",
  "Ethics and Patient Safety Committee",
];

const officers = [
  {
    role: "President",
    note: "Leads the Association, chairs meetings, represents RHEAP officially.",
  },
  {
    role: "Vice President",
    note: "Supports the President and performs presidential duties when required.",
  },
  {
    role: "General Secretary",
    note: "Administration, records, meeting documentation, notices and the membership register.",
  },
  {
    role: "Treasurer",
    note: "Financial administration, accounting, financial reporting and banking arrangements.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
      <p className="text-sm font-semibold text-[var(--color-teal-700)]">
        About RHEAP
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Purpose, independence and governance
      </h1>

      <div className="mt-6 rounded-xl border border-[var(--color-indigo-100)] bg-[var(--color-indigo-100)]/40 p-6">
        <h2 className="font-semibold text-[var(--color-indigo-700)]">
          Founding status
        </h2>
        <p className="mt-2 text-[var(--color-ink-soft)] leading-relaxed">
          RHEAP is currently being established. Muhammad Yasir is serving as
          Convener and General Secretary (in formation), leading the
          founding process. Under RHEAP&apos;s Rules, founding members will
          elect the first Executive Committee at the Founding Meeting, which
          will serve until the first Annual General Meeting.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Nature and purpose
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        RHEAP is an independent, non-profit, non-political and
        non-religious association established to advance research,
        education, professional cooperation and responsible implementation
        of Remote Health Examination in Pakistan. Its purpose is to
        research, promote and support the use of RHE with the primary
        objective of achieving better patient outcomes — particularly for
        communities and patient groups where access to physicians,
        specialists, diagnostics or healthcare facilities is limited.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Independence &amp; technology neutrality
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        RHEAP operates independently from individual healthcare companies,
        healthcare providers, technology companies, donors and other
        commercial organisations, and does not operate for the commercial
        benefit of any individual company, product, technology or service.
        No member, donor, sponsor, company or other organisation can acquire
        ownership, voting rights, governance rights or control over RHEAP
        through donations, sponsorship, cooperation or other financial
        support. RHEAP also remains politically and religiously independent,
        while cooperating with ministries, governmental authorities and
        policymakers on matters related to healthcare, research and RHE.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Governance structure
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        The <strong>General Meeting</strong> is RHEAP&apos;s highest
        decision-making body. An Annual General Meeting is held once every
        calendar year to review activities, approve the annual report and
        financial statements, approve the activity plan and budget, and
        elect the Executive Committee. An Extraordinary General Meeting can
        be called by the Executive Committee, or must be called where at
        least 20% of voting members submit a written request. Members
        normally receive at least 14 days&apos; notice of a General Meeting,
        and each voting member has one vote.
      </p>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        The <strong>Executive Committee</strong> (5–9 members, normal term
        two years) manages RHEAP&apos;s affairs and implements decisions of
        the General Meeting. It includes at minimum:
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {officers.map((o) => (
          <div
            key={o.role}
            className="rounded-lg border border-[var(--color-border)] p-4"
          >
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              {o.role}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {o.note}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Initial committees
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        The Executive Committee may establish permanent or temporary
        committees and working groups, and may invite external experts to
        participate. Initial committees may include:
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {committees.map((c) => (
          <li
            key={c}
            className="flex gap-3 text-sm text-[var(--color-ink-soft)]"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal-600)]" />
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Conflict of interest
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        Executive Committee members and persons participating in scientific
        or professional decision-making must disclose relevant financial,
        professional or other material conflicts of interest. A person with
        a material conflict of interest does not participate in a decision
        where that conflict could materially affect its independence.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Supporting organisations, partners &amp; sponsors
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        Companies, hospitals, universities, NGOs, foundations, professional
        organisations and other organisations may support or cooperate with
        RHEAP as Supporting Organisations, Partners or Sponsors. This status
        never provides voting rights, ownership, governance rights or
        automatic representation on the Executive Committee, and financial
        support never gives control over RHEAP&apos;s scientific, clinical
        or professional positions. Material financial support is disclosed
        transparently. RHEAP has no supporters listed yet, as the
        Association is in its founding phase.
      </p>

      <div className="mt-14 flex flex-wrap gap-4 border-t border-[var(--color-border)] pt-10">
        <Link
          href="/rules"
          className="rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-900)]"
        >
          Read the full Rules &amp; Regulations
        </Link>
        <Link
          href="/join"
          className="rounded-md border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-teal-500)]"
        >
          Become a founding member
        </Link>
      </div>
    </div>
  );
}
