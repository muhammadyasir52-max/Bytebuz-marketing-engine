# 09 — Open Questions

Decisions needed from Muhammad Yasir / the founding team before or during
Phase 1 implementation.

## 1. Backend platform: Supabase vs. Azure

[01-architecture.md](./01-architecture.md) recommends **Supabase** for the
zero-staff, ship-fast reasons given there. The main reason to reconsider is
**data residency** — Supabase has no Pakistan region (nearest: Singapore or
Mumbai). If a future government-cooperation agreement or funder requires
Pakistani data residency, Azure (which has a UAE North region, closer than
most alternatives, though still not in-country) or a Pakistani cloud
provider would need evaluation instead.

**Needed:** confirm Supabase is acceptable, or flag if data residency is a
hard requirement now (changes the Phase 1 starting point).

**Cost estimate** (requested at 500 / 5,000 / 50,000 members) — rough
monthly figures, to be firmed up once the backend choice is confirmed:

| Members | Supabase | Vercel | WhatsApp BSP | Est. total/mo |
|---|---|---|---|---|
| 500 | Free–Pro tier (~$25) | Free–Pro (~$20) | Pay-per-message, low volume (~$20–50) | ~$65–95 |
| 5,000 | Pro tier, higher usage (~$25–100) | Pro (~$20) | Moderate volume (~$100–300) | ~$145–420 |
| 50,000 | Team/Enterprise tier (custom, likely $500+) | Pro/Enterprise (~$150+) | High volume (~$500–1,500) | ~$1,150–2,150+ |

These are directional, not quotes — actual cost depends on message volume,
storage (course videos are the biggest driver), and whether Azure ends up
being required instead.

## 2. Payment gateway

Recommended: **Safepay** as the single aggregator covering JazzCash,
Easypaisa and cards, per [01-architecture.md](./01-architecture.md).
Alternative: PayFast, or integrating JazzCash/Easypaisa directly (more
integration work, no clear benefit over an aggregator for a small
organisation).

**Needed:** confirm Safepay, or state a preferred alternative. Also confirm
whether payments should even be built in Phase 1 (feature-flagged off) or
deferred entirely until the General Meeting sets a fee — building it now
avoids a second implementation phase later, but is optional effort if fees
are likely to stay at zero for a long founding period.

## 3. PMDC/PNMC verification approach

The brief and [05-automations.md](./05-automations.md) assume no reliable
public verification API exists, so verification is "semi-automatic" —
concretely, this likely means: attempt a lookup against whatever the
PMC (Pakistan Medical Commission, successor to PMDC/PNMC) publishes, and if
that's not programmatically accessible, fall back to a manual "EC reviews
the number" step shown in the application queue.

**Needed:** does anyone on the founding team have direct knowledge of a
usable PMC verification method (API, downloadable register, or a manual
process that's fast enough not to bottleneck approvals)? This determines
how much Phase 1 effort goes into verification tooling vs. just building
the manual-review UI.

## 4. CNIC collection

Brief says CNIC is optional and must be encrypted if collected.

**Needed:** is CNIC collection needed at all for Phase 1, or can it be
deferred until there's a concrete reason to need it (e.g., a specific
partner/funder requirement)? Collecting less by default is simpler and
lower-risk.

## 5. Monorepo structure for admin console

[02-sitemap-and-ia.md](./02-sitemap-and-ia.md) leaves open whether the
admin console is a route group inside the same Next.js app as the public
site/member portal, or a separate `apps/admin` package in the Turborepo.

**Recommendation:** same app, role-gated routes — simpler deployment, and
the admin console is a small enough surface (per brief §7) not to justify a
separate app. Flagging as open in case there's a reason (e.g. wanting
admin on a separate subdomain or stricter deploy gating) to split it.

## 6. Urdu (UR/RTL) rollout timing

The public site currently ships English-only (explicitly deferred to avoid
shipping low-quality machine translation — see the earlier build summary).

**Needed:** who provides/reviews Urdu translations — a founding team
member, a professional translator, or AI-drafted-then-human-reviewed? This
determines whether Urdu lands in Phase 1 (portal) or stays deferred to
Phase 2+.

## 7. WhatsApp Business Solution Provider

Using the WhatsApp Business Cloud API in Pakistan requires a BSP (e.g.
Gupshup, Twilio, or a local provider) for number provisioning and message
template approval — this has real lead time (business verification).

**Needed:** who owns setting this up, and can it start now (it gates
Phase 2, and the roadmap already flags starting it early)?

## 8. Domain and email

The website currently uses placeholder addresses (`info@rheap.org`,
`partnerships@rheap.org`) since the domain isn't purchased yet.

**Needed:** timeline for registering rheap.org and setting up real
mailboxes — this also gates fixing the Join page's `mailto:` fallback and
any transactional email sending (Resend/Postmark need a verified sending
domain).
