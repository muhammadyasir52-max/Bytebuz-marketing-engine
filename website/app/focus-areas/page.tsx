import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Focus Areas",
  description:
    "RHEAP's initial focus areas: Women's Health, Hypertension, Diabetes, and TB & Respiratory Health.",
};

const areas = [
  {
    id: "womens-health",
    title: "Women's Health",
    committee: "Women's Health Committee",
    summary:
      "Promoting research, education and practical applications of RHE that improve women's access to healthcare, clinical assessment, screening, monitoring and specialist expertise.",
    scope: [
      "Maternal health and pregnancy-related care",
      "Reproductive health",
      "Gynaecological and cervical health",
      "Other areas relevant to improving women's health outcomes",
    ],
  },
  {
    id: "hypertension",
    title: "Hypertension",
    committee: "Hypertension and Cardiovascular Health Committee",
    summary:
      "Supporting approaches that improve the identification, clinical assessment, monitoring and management of hypertension.",
    scope: [
      "Regular measurement and follow-up",
      "Access to healthcare professionals for patients with limited access to services",
      "Cardiovascular risk monitoring more broadly",
    ],
  },
  {
    id: "diabetes",
    title: "Diabetes",
    committee: "Diabetes Committee",
    summary:
      "Promoting the use of RHE in the prevention, identification, monitoring and long-term management of diabetes.",
    scope: [
      "Regular follow-up and collection of clinically relevant measurements",
      "Patient education",
      "Access to healthcare professionals for long-term management",
    ],
  },
  {
    id: "tb-respiratory",
    title: "TB & Respiratory Health",
    committee: "Tuberculosis and Respiratory Health Committee",
    summary:
      "Promoting research and practical approaches in which RHE can support clinical assessment, screening pathways, referral, monitoring and follow-up related to tuberculosis and other respiratory conditions.",
    scope: [
      "Clinical assessment and screening pathways",
      "Referral, monitoring and follow-up",
      "Complementing — not replacing — laboratory testing and imaging where clinically required",
    ],
  },
];

export default function FocusAreasPage() {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-5 sm:px-8 pt-16 sm:pt-20">
        <p className="text-sm font-semibold text-[var(--color-teal-700)]">
          Where we start
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Initial focus areas
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
          RHEAP may address any health condition or healthcare challenge
          where Remote Health Examination can contribute to better patient
          outcomes. In its initial phase, the Association is particularly
          focused on four areas of major importance to healthcare in
          Pakistan — this does not limit RHEAP&apos;s future activities.
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-14 sm:py-16 space-y-10">
        {areas.map((area) => (
          <div
            key={area.id}
            id={area.id}
            className="rounded-2xl border border-[var(--color-border)] p-7 sm:p-9"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                {area.title}
              </h2>
              <span className="rounded-full bg-[var(--color-teal-100)] px-3 py-1 text-xs font-semibold text-[var(--color-teal-900)]">
                {area.committee}
              </span>
            </div>
            <p className="mt-4 text-[var(--color-ink-soft)] leading-relaxed">
              {area.summary}
            </p>
            <ul className="mt-5 space-y-2">
              {area.scope.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-[var(--color-ink-soft)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal-600)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-4xl px-5 sm:px-8 pb-20">
        <div className="rounded-xl bg-[var(--color-paper-subtle)] p-7 text-center">
          <p className="text-[var(--color-ink-soft)]">
            Interested in contributing research, clinical expertise or time
            to one of these areas?
          </p>
          <Link
            href="/join"
            className="mt-4 inline-block rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-900)]"
          >
            Join a committee
          </Link>
        </div>
      </div>
    </div>
  );
}
