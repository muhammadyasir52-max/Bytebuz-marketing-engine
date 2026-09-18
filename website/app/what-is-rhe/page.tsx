import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is Remote Health Examination",
  description:
    "Remote Health Examination (RHE) is more than a video consultation — a technology-neutral definition of clinical examination at a distance.",
};

const capabilities = [
  "Real-time audio and video communication",
  "Connected medical devices and diagnostic instruments",
  "Real-time transmission of clinical measurements, images, sounds and other examination data",
  "Real-time guidance of a healthcare professional or appropriately trained person physically present with the patient",
  "Digital clinical decision support",
  "Artificial intelligence, where appropriate",
  "Integration with electronic health records and other digital healthcare systems",
];

export default function WhatIsRhePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
      <p className="text-sm font-semibold text-[var(--color-teal-700)]">
        Definitions
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        What is Remote Health Examination?
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
        Remote Health Examination, or <strong>RHE</strong>, refers to the use
        of digital technologies that enable a healthcare professional to
        examine, clinically assess or obtain clinically relevant information
        from a patient when the responsible healthcare professional is
        geographically separated from the patient.
      </p>

      <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-subtle)] p-6">
        <h2 className="font-semibold text-[var(--color-ink)]">
          More than a video call
        </h2>
        <p className="mt-2 text-[var(--color-ink-soft)] leading-relaxed">
          A video consultation alone is not Remote Health Examination. RHE
          depends on connected devices, real-time clinical data and, where
          needed, a trained person physically present with the patient —
          extending real clinical assessment across distance, not just
          conversation.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        RHE may include
      </h2>
      <ul className="mt-4 space-y-3">
        {capabilities.map((item) => (
          <li key={item} className="flex gap-3 text-[var(--color-ink-soft)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal-600)]" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        A technology-neutral definition
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        RHEAP maintains a technology-neutral approach. Remote Health
        Examination is not defined by reference to any particular commercial
        product, manufacturer, platform or service provider. Research,
        education and professional recommendations are based on patient
        outcomes, clinical evidence, patient safety, clinical quality,
        accessibility and usability.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-[var(--color-ink)]">
        Complementing, not replacing, clinical care
      </h2>
      <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
        RHE is intended to improve access to healthcare, strengthen clinical
        assessment, support earlier identification of health conditions and
        make specialist expertise more accessible — particularly for
        communities and patient groups with limited access to physicians,
        diagnostics or healthcare facilities. It complements, and does not
        replace, laboratory testing, imaging or other diagnostic procedures
        where these are clinically required.
      </p>

      <div className="mt-14 flex flex-wrap gap-4 border-t border-[var(--color-border)] pt-10">
        <Link
          href="/focus-areas"
          className="rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-900)]"
        >
          See our focus areas
        </Link>
        <Link
          href="/rules"
          className="rounded-md border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-teal-500)]"
        >
          Read the full Rules &amp; Regulations
        </Link>
      </div>
    </div>
  );
}
