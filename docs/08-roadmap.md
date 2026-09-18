# 08 — Roadmap

## Phase 0 — Public site *(shipped)*

**Status: done, pushed to `claude/rheap-website-planning-e194x4`.**

- Next.js static-export public website (`website/`): Home, What is RHE,
  Focus Areas, About & Governance, Rules & Regulations (full text +
  downloadable PDF), Research, Join (membership interest form), Contact.
- Founding-member interest capture via the Join page (currently a `mailto:`
  fallback pending a real backend/domain email — see
  [09-open-questions.md](./09-open-questions.md)).
- Founding-meeting support: the site is honest about RHEAP's pre-Founding
  status throughout rather than implying an active elected EC.
- Not yet done from the original Phase 0 scope: deployment to rheap.org /
  Hostinger (waiting on the user's go-ahead and, for a direct deploy,
  hosting credentials), Urdu language toggle.

## Phase 1 — Application, approval, register, card, payments toggle, admin console

- Supabase project setup (auth, schema from [03-data-model.md](./03-data-model.md), RLS policies from [06-roles-permissions.md](./06-roles-permissions.md)).
- Public application form → EC approval queue → membership register (Rules §8 flow, [04 §1](./04-user-flows.md#1-application--approval)).
- Digital membership card (QR + membership number; Google Wallet pass can follow once the card UI is stable).
- Payments integration (Safepay) built but **feature-flagged off** until the General Meeting sets a fee (Rules §11).
- Admin console v1: applications queue, membership register, basic finance ledger (manual entries, dual-approval).
- This is the first phase requiring real authentication, so it's also where MFA-for-officers and RLS get load-bearing for the first time — test thoroughly before any real member data enters the system.

## Phase 2 — Mobile app, events, learning hub, certificates, WhatsApp automations

- Expo/React Native app (Android-first) sharing `packages/types` and `packages/api-client` with web.
- Events module: registration, QR check-in, recordings.
- Learning hub: courses by focus area, quizzes, auto-issued certificates + CPD-hour tracking.
- WhatsApp Business Cloud API integration goes live here (renewal reminders, meeting notices, welcome messages) — this is the first phase where a BSP account and approved message templates are required, so provisioning that account is a Phase 2 prerequisite, not a Phase 2 task.
- CMS for News/Insights and Events pages on the public site (EN only; UR remains deferred).

## Phase 3 — E-voting, governance centre, committees workspace, research hub

- Governance centre: meeting notices/agenda, secure e-voting with the ⅔-for-amendments rule, EGM petition counter, annual report.
- Committees & working groups workspace: threads, shared documents, meeting scheduling, task lists.
- Research participation: study/survey listings, anonymised case-report submission (with validation blocking any patient-identifiable fields), co-authorship tracking.
- COI declaration cycle (annual + ad-hoc pre-vote) goes live — this is a prerequisite for e-voting being trustworthy, so sequence COI before or alongside e-voting, not after.
- Member directory (opt-in).

## Phase 4 — AI assistant, evidence digest, analytics, international readiness

- RHEAP AI Assistant: retrieval over an approved-content-only library (`pgvector`), source citations, "not medical advice" disclaimer enforced in the UI, every prompt/response logged.
- Weekly evidence-scan automation with human editorial approval queue.
- Full analytics dashboard (growth, engagement, geography, focus-area interest, course completion).
- International readiness: the data model and RBAC are not Pakistan-specific by construction (country/province are just fields), so a "sister association" would mean a new tenant/deployment rather than a schema rewrite — worth validating with a design spike if/when this becomes concrete, not before.

## Sequencing notes

- **Governance automation (Phase 3) depends on Phase 1's RLS and audit-log
  foundation being solid** — don't start building e-voting on top of
  auth/RLS that hasn't been tested with real approval/rejection flows yet.
- **Payments stay off until the General Meeting sets a fee**, which likely
  happens at or after the Founding Meeting — so Phase 1's payments work is
  "build and flag off," not "build and launch."
- **WhatsApp BSP provisioning takes real-world lead time** (business
  verification, template approval) — start that process at the *start* of
  Phase 1, not when Phase 2 begins, so it's ready when needed.
