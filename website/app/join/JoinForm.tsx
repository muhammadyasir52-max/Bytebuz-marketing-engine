"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "info@rheap.org";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

export default function JoinForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    data.append("_subject", `RHEAP membership interest — ${data.get("name")}`);
    data.append("_template", "table");
    data.append("_captcha", "false");

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
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
        disabled={status === "sending"}
        className="w-full rounded-md bg-[var(--color-teal-700)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-teal-900)] disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send application"}
      </button>

      {status === "sent" && (
        <p className="text-sm text-[var(--color-teal-700)]">
          Thank you — your application has been sent to the RHEAP founding
          team. We&apos;ll be in touch.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong sending your application. Please try again,
          or email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <p className="text-xs text-[var(--color-ink-soft)]">
        Applications are sent directly to {CONTACT_EMAIL} and reviewed by the
        Executive Committee per Rule 8 of the Rules &amp; Regulations.
      </p>
    </form>
  );
}
