# 06 — Roles & Permissions (RBAC)

Roles per brief §3. Enforced at two layers: Postgres Row-Level Security
(source of truth) and client-side route/UI guards (UX only — never trusted
alone).

## Role summary

| Role | Who | Auth requirement |
|---|---|---|
| Visitor | Public, unauthenticated | None |
| Applicant | Submitted an application, pending EC decision | Email/phone OTP |
| Member | Approved, in good standing | Email/phone OTP |
| Student Member | Member with `membership_category=student` | Same as Member — **same voting rights**, per Rules §9 (see [07](./07-rules-compliance-map.md)) |
| Committee Member/Chair | Member with a `committee_memberships` row | Same as Member |
| EC Officer | President, VP, General Secretary, Treasurer, EC Member | OTP + **mandatory MFA** |
| Partner/Sponsor contact | Represents a `sponsors` org | Email/phone OTP, no member privileges |
| Super Admin | Technical administrator | OTP + MFA, separate from governance roles |

## Permission matrix

| Action | Visitor | Applicant | Member | Student Member | Committee Chair | EC Officer | Sponsor contact | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View public site | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit application | ✓ | — | — | — | — | — | — | — |
| View own application status | — | ✓ | — | — | — | — | — | — |
| Approve/reject applications | — | — | — | — | — | ✓ | — | — |
| View membership register | — | — | — | — | — | ✓ | — | ✓ (read-only, tech support) |
| Attend/vote at General Meetings | — | — | ✓* | ✓* | ✓* | ✓* | — | — |
| Stand for EC election | — | — | ✓* | ✓* | ✓* | ✓* | — | — |
| Open/close a vote | — | — | — | — | — | ✓ | — | — |
| Submit proposals | — | — | ✓* | ✓* | ✓* | ✓* | — | — |
| Schedule General Meeting | — | — | — | — | — | ✓ | — | — |
| Join committees/working groups | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| Manage a committee (docs, tasks, scheduling) | — | — | — | — | ✓ (own committee) | ✓ (any) | — | — |
| Enroll in courses / attend events | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| Submit anonymised case reports | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| Declare conflicts of interest | — | — | ✓ | ✓ | ✓ | ✓ (required) | — | — |
| Opt into member directory | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| Use RHEAP AI Assistant | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| View/edit own profile & payments | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Record sponsorship/donation | — | — | — | — | — | ✓ | — | — |
| Approve ledger entry (first officer) | — | — | — | — | — | ✓ | — | — |
| Approve ledger entry (second officer, required above threshold) | — | — | — | — | — | ✓ (different officer than first) | — | — |
| Manage CMS content (pages/news/courses/events) | — | — | — | — | — | ✓ | — | — |
| Manage sponsor register & disclosure flags | — | — | — | — | — | ✓ | — | — |
| View analytics dashboard | — | — | — | — | — | ✓ | — | ✓ |
| View audit log | — | — | — | — | — | ✓ (governance actions) | — | ✓ (full, including technical) |
| Manage technical config (integrations, env, deploys) | — | — | — | — | — | — | — | ✓ |
| Grant/revoke Super Admin role | — | — | — | — | — | — | — | ✓ (by another Super Admin, never self-granted) |

`*` = **only while `members.status = good_standing`** — a lapsed member
(Rules §12, brief renewal automation) loses these immediately, enforced by
RLS checking `status` at write time, not cached at login.

## Design principles

1. **Governance actions require an EC Officer role, never Super Admin
   alone.** A Super Admin can fix data or debug the system but cannot
   approve a member, open a vote, or publish results — that would let a
   technical role override governance, which the Rules place with the EC
   and General Meeting. This is the brief's own instruction (§3): "governance
   actions ... must require EC roles."
2. **The two-officer rule for finance (Rules §26)** is enforced as
   `approved_by_1 <> approved_by_2`, both required to be `EC Officer` role,
   at the database level — not just a UI checklist.
3. **Committee Chair is scoped to their own committee** by default; only EC
   Officers have cross-committee management rights.
4. **Sponsor/Partner contacts are explicitly walled off from governance** —
   no row in the permission matrix gives them voting, proposal, or
   committee-management rights, directly implementing Rules §23 ("shall not
   provide voting rights, ownership, governance rights").
5. **MFA is required for EC Officers and Super Admins**, not regular
   members — balancing the brief's "low-bandwidth friendly" goal (OTP is
   enough friction for most members) against the higher blast radius of an
   officer or admin account being compromised.
