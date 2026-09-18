"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "info@rheap.org";

export default function JoinForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const role = String(data.get("role") ?? "");
    const city = String(data.get("city") ?? "");
    const message = String(data.get("message") ?? "");

    const subject = encodeURIComponent(`RHEAP membership interest — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProfession / role: ${role}\nCity: ${city}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1.5 w-full rounded-md border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-teal-500)] focus:ring-2 focus:ring-[var(--color-teal-100)]"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-md border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-teal-500)] focus:ring-2 focus:ring-[var(--color-teal-100)]"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Profession / role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            placeholder="e.g. Physician, Nurse, Researcher, Engineer, Student"
            required
            className="mt-1.5 w-full rounded-md border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-teal-500)] focus:ring-2 focus:ring-[var(--color-teal-100)]"
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            className="mt-1.5 w-full rounded-md border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-teal-500)] focus:ring-2 focus:ring-[var(--color-teal-100)]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Why do you want to join RHEAP?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1.5 w-full rounded-md border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-teal-500)] focus:ring-2 focus:ring-[var(--color-teal-100)]"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-teal-900)] sm:w-auto"
      >
        Send application
      </button>

      {status === "sent" && (
        <p className="text-sm text-[var(--color-teal-700)]">
          Your email client should have opened with your details filled in —
          please review and send it to complete your application.
        </p>
      )}

      <p className="text-xs text-[var(--color-ink-soft)]">
        RHEAP doesn&apos;t yet have a live application system, so this opens
        a pre-filled email to {CONTACT_EMAIL}. Applications are reviewed by
        the Executive Committee per Rule 8 of the Rules &amp; Regulations.
      </p>
    </form>
  );
}
