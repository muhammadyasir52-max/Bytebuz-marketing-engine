import type { Metadata } from "next";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
  title: "Join RHEAP",
  description:
    "Membership eligibility, rights and responsibilities, and how to apply to join RHEAP.",
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
      <p className="text-sm font-semibold text-[var(--color-teal-700)]">
        Membership
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Join RHEAP
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
        Membership is open to individuals who support RHEAP&apos;s purpose —
        physicians, nurses, midwives, allied health professionals, students,
        researchers, academics, technology professionals, engineers,
        entrepreneurs and other interested individuals. You don&apos;t need
        to work in healthcare to join. Membership is always held personally,
        not by a company, hospital or NGO.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-semibold text-[var(--color-ink)]">
            Rights of members
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
            <li>Participate in RHEAP activities</li>
            <li>Attend and vote at General Meetings (one vote each)</li>
            <li>Stand for election to the Executive Committee</li>
            <li>Participate in committees and working groups</li>
            <li>Submit proposals to the Association</li>
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-semibold text-[var(--color-ink)]">
            Responsibilities of members
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
            <li>Support RHEAP&apos;s objectives and comply with the Rules</li>
            <li>Respect decisions lawfully made by the Association</li>
            <li>Act with professional integrity and patient safety in mind</li>
            <li>Disclose relevant conflicts of interest where appropriate</li>
            <li>Pay any membership fee set by the General Meeting</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-[var(--color-indigo-100)]/50 p-6 text-sm text-[var(--color-ink-soft)]">
        <strong className="text-[var(--color-indigo-700)]">
          On fees:
        </strong>{" "}
        RHEAP&apos;s membership fee (including any reduced or free category
        for students) is set by the General Meeting and has not yet been
        determined, since the Association is still being founded. It may
        also be set at zero. This page will be updated once fees are
        decided.
      </div>

      <div className="mt-6 rounded-xl bg-[var(--color-paper-subtle)] p-6 text-sm text-[var(--color-ink-soft)]">
        Applications are reviewed by the Executive Committee. Membership
        becomes effective once your application is approved and you&apos;re
        registered in the membership register — applications are normally
        accepted where the applicant supports RHEAP&apos;s purpose and
        principles.
      </div>

      <h2 className="mt-14 text-xl font-semibold text-[var(--color-ink)]">
        Apply to join
      </h2>
      <JoinForm />
    </div>
  );
}
