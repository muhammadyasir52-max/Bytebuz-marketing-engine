import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Logo from "./Logo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RHEAP — Remote Health Examination Association Pakistan",
    template: "%s — RHEAP",
  },
  description:
    "RHEAP is an independent, non-profit association advancing research, education and the safe, evidence-based use of Remote Health Examination (RHE) in Pakistan.",
};

const navLinks = [
  { href: "/what-is-rhe", label: "What is RHE" },
  { href: "/focus-areas", label: "Focus Areas" },
  { href: "/about", label: "About" },
  { href: "/rules", label: "Rules" },
  { href: "/research", label: "Research" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded-md focus:shadow"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <Logo size={32} />
                <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
                  RHEAP
                </span>
              </Link>

              <nav
                aria-label="Primary"
                className="hidden md:flex items-center gap-1 overflow-x-auto"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-teal-100)] hover:text-[var(--color-teal-900)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Link
                href="/join"
                className="shrink-0 rounded-md bg-[var(--color-teal-700)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-teal-900)]"
              >
                Join RHEAP
              </Link>
            </div>

            <nav
              aria-label="Primary mobile"
              className="flex md:hidden gap-3 overflow-x-auto pb-3 text-sm"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-teal-100)] hover:text-[var(--color-teal-900)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-[var(--color-border)] bg-[var(--color-paper-subtle)]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Logo size={28} />
                  <span className="font-semibold text-[var(--color-ink)]">
                    RHEAP
                  </span>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  Remote Health Examination Association Pakistan — an
                  independent, non-profit, non-political and non-religious
                  association advancing research, education and the safe,
                  evidence-based use of Remote Health Examination.
                </p>
                <p className="mt-4 inline-flex items-center rounded-full bg-[var(--color-indigo-100)] px-3 py-1 text-xs font-medium text-[var(--color-indigo-700)]">
                  Currently being established — founding phase
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  Focus areas
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
                  <li>Women&apos;s Health</li>
                  <li>Hypertension</li>
                  <li>Diabetes</li>
                  <li>TB &amp; Respiratory Health</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  Association
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/about"
                      className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-700)]"
                    >
                      Governance
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rules"
                      className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-700)]"
                    >
                      Rules &amp; Regulations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/join"
                      className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-700)]"
                    >
                      Membership
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-700)]"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-2 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-ink-soft)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} Remote Health Examination
                Association Pakistan (RHEAP). RHEAP is not a healthcare
                regulator, medical licensing authority or medical device
                regulator.
              </p>
              <p>Technology-neutral · Independent · Non-profit</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
