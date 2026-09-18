# 07 — Rules Compliance Map

Every relevant section of the actual **Rules and Regulations of RHEAP**
(now in hand — see `website/app/rules/data.ts` for the full text) mapped to
the specific feature or constraint that enforces it. Where the Rules and
the original brief's paraphrase differ in a way that matters, the Rules
text wins and is noted.

| Rules § | Provision | Enforced by |
|---|---|---|
| §2 Nature | No member/donor/sponsor can acquire ownership, voting or governance rights through financial support. | `SPONSORS`/`SPONSORSHIPS` tables have no link to voting or governance tables at all (schema-level impossibility, not just a UI rule) — see [03-data-model.md](./03-data-model.md). RBAC matrix gives Sponsor contacts zero governance permissions — [06](./06-roles-permissions.md). |
| §5 Definition of RHE | Technology-neutral definition; not tied to any product/platform. | `/what-is-rhe` public page (built) uses the Rules' own definition verbatim; content-management guidelines for `/focus-areas` and `/research` (Phase 2 CMS) prohibit vendor/product naming — a copy-review checklist item, not a technical constraint. |
| §6 Objectives | RHEAP is not a regulator/licensing authority and must not represent itself as one. | Every certificate (`CERTIFICATES.wording`) is hard-constrained to completion/participation language, never "licence" or "certification" in the regulatory sense — [03](./03-data-model.md), [05-automations.md §7](./05-automations.md#7-event-attendance). Public site footer states this explicitly (already live on `website/`). |
| §7 Membership | Individuals only, in personal capacity; companies/hospitals/NGOs are never voting members. | `MEMBERS` table has no organisation-type row at all; `SPONSORS` is a fully separate table with no path to `BALLOTS` — [03](./03-data-model.md). |
| §8 Admission | Applications go through EC-established procedure; EC may reject only where membership would "materially conflict with purpose, independence, ethical principles or reputation." | `applications.rejection_ground` is a **constrained picklist**, not free text, so an officer cannot reject for an out-of-policy reason — [04-user-flows.md §1](./04-user-flows.md#1-application--approval), [05](./05-automations.md#1-application-submitted). |
| §9 Rights of members | Each member in good standing may attend/vote/stand for election/join committees/submit proposals; one vote each. | RLS on `BALLOTS` requires `members.status = good_standing`; **no distinction by `membership_category`** — this is why Student Members retain full voting rights (see the note below). |
| §10 Responsibilities | Comply with Rules, act with integrity/patient safety, disclose conflicts, pay any fee set by the General Meeting. | `COI_DECLARATIONS` table + ad-hoc pre-vote declaration flow ([04 §6](./04-user-flows.md#6-conflict-of-interest-declaration)); fee obligation enforced via the renewal automation ([05 §2](./05-automations.md#2-renewal-due)). |
| §11 Membership fees | Set by the General Meeting; may be reduced/free for students; may be zero for everyone. | `membership_categories.annual_fee` is nullable and admin-configurable, not hardcoded; payments module is entirely **toggleable off** — [01-architecture.md](./01-architecture.md) payments row, [09-open-questions.md](./09-open-questions.md). |
| §12 Termination | Terminates on resignation/death/failure to fulfil obligations/serious violation; expulsion requires a reasonable opportunity to explain first. | `members.status` includes `expelled`/`resigned`; the admin console's expulsion action is a two-step flow (raise → member response window → EC decision) rather than a single toggle — flagged for implementation detail in Phase 3. |
| §13 General Meeting | AGM once per calendar year; reviews activities, approves annual report/financials, approves budget, sets fees, elects EC. | `MEETINGS.type=agm`; annual-cycle automation auto-generates the AGM package (stats, activity summary, draft financials) for EC finalization — [05 §6](./05-automations.md#6-annual-cycle). |
| §14 Extraordinary General Meeting | EC may call one; **must** be called if ≥20% of voting members petition in writing. | `EGM_PETITION_SIGNATURES` + live-threshold automation — [04 §4](./04-user-flows.md#4-egm-petition), [05 §5](./05-automations.md#5-egm-petition). |
| §15 Notice and participation | ≥14 days' notice, normally; physical/electronic/hybrid meetings where legally permitted. | Hard-enforced at the API layer: meeting creation rejected if `scheduled_at < now() + 14 days` — [05 §3](./05-automations.md#3-general-meeting-scheduled). `meetings.format` supports all three modes. |
| §16 Voting | Simple majority by default, one vote per member; Rules amendments require ⅔. | `votes.majority_required` hard-set to `two_thirds` when `vote_type=rules_amendment`, not left to officer discretion — [05 §4](./05-automations.md#4-vote-opened). |
| §17 Executive Committee | 5–9 members, elected by General Meeting, minimum roles listed, 2-year normal term, re-electable. | EC roster is a subset of `MEMBERS` with an `ec_officer_role` assignment (President/VP/General Secretary/Treasurer/Member), term-tracked for re-election reminders (Phase 3 admin feature). |
| §18 EC responsibilities | Manages affairs/finances, implements GM decisions, maintains register, prepares reports, establishes committees, safeguards independence. | Admin console modules map 1:1: membership register, finance ledger, meetings, committees — [02-sitemap-and-ia.md §3](./02-sitemap-and-ia.md#3-admin--ec-console). |
| §19 Officers | President/VP/General Secretary/Treasurer duties. | Role-specific admin console views (e.g. Treasurer sees the finance ledger by default) — a UX detail, not a hard permission difference beyond the shared EC Officer role in [06](./06-roles-permissions.md). |
| §20 Committees | EC may establish committees; initial 9 listed; external experts may be invited. | `COMMITTEES` seeded with the 9 named committees at launch; `committee_memberships.role` includes `external_expert` — [03](./03-data-model.md). |
| §21 Independence & tech neutrality | No commercial organisation controls governance/research/clinical positions; recommendations based on evidence/safety, not vendor interest. | Same schema isolation as §2; weekly evidence-scan automation requires **human editorial approval** before anything publishes, so no automated (or sponsor-influenced) content goes out unreviewed — [05 §9](./05-automations.md#9-weekly-evidence-scan). |
| §22 Conflict of interest | EC/decision-makers disclose conflicts; a conflicted person doesn't participate in that decision. | `COI_DECLARATIONS.related_vote_id` + RLS check gating ballot insertion on a required declaration where a conflict flag exists — [03](./03-data-model.md) notes, [04 §6](./04-user-flows.md#6-conflict-of-interest-declaration). |
| §23 Supporting orgs/partners/sponsors | No voting/ownership/governance rights or automatic EC seat from sponsorship. | Structural isolation, as in §2 — [06](./06-roles-permissions.md) principle 4. |
| §24 Financial resources | Income/assets used exclusively for RHEAP's objectives; no distribution to members. | Ledger `category` taxonomy excludes any "member distribution" category by design; this is a policy/process control more than a schema one — flagged for the Treasurer's chart of accounts in Phase 3. |
| §25 Donations | No donor control; material financial support transparently disclosed. | `sponsors.disclosure_summary` + `is_public` drive the public `/supporters` page automatically on `SPONSORSHIPS` insert — [05 §10](./05-automations.md#10-donationsponsorship-recorded). |
| §26 Financial administration | Association-named account; proper records; controls; **significant payments require ≥2 authorised officers.** | `LEDGER_ENTRIES.approved_by_1`/`approved_by_2` with a distinct-officer constraint, enforced by RLS — [03](./03-data-model.md), [06](./06-roles-permissions.md). |
| §27 Financial reporting | Annual statements presented to AGM; audited/reviewed where required. | AGM package generation includes the draft financial statement; a Phase 3 admin feature attaches the auditor/reviewer sign-off before it's marked final. |
| §28 Compensation & expenses | No remuneration solely for EC service; reasonable expenses reimbursable; RHEAP may employ staff/contract services. | Ledger `category` includes `expense_reimbursement`; no schema construct pays officers for service by design (a policy control, not a technical one). |
| §29 Political/religious independence | RHEAP stays politically/religiously independent while cooperating with government bodies. | Content/editorial guideline for the CMS (Phase 2), same review gate as §21. |
| §30 Name and logo | Controlled by the Association; no unauthorised use implying endorsement. | Logo/name usage-request workflow with EC approval + auto-generated authorization letter — [05 §11](./05-automations.md#11-logoname-usage-request). |
| §31 Amendments | Rules amended by General Meeting with ⅔ majority. | Same mechanism as §16 — `vote_type=rules_amendment` hard-sets `two_thirds`. |
| §32 Dissolution | Remaining assets go to another non-profit with compatible objectives, never to members. | Out of scope for the platform (a one-time legal/financial event, not a recurring system feature) — noted for completeness only. |
| §33 Applicable law | Pakistani/provincial law governs; mandatory law prevails over the Rules. | Data residency and payment-provider choices in [01-architecture.md](./01-architecture.md) are flagged as open questions partly *because* of this — see [09](./09-open-questions.md). |
| §34 Founding Executive Committee | Founding members elect the first EC at the Founding Meeting; serves until first AGM. | Not yet applicable — RHEAP is pre-Founding-Meeting (per the public site's "founding phase" framing). The member/EC data model supports seeding the founding EC once elected. |
| §35 Adoption | Rules adopted at the Founding Meeting. | Reference document — the full, unaltered text is already published at `/rules` on the public site with a downloadable PDF. |

## Where the actual Rules corrected the brief's paraphrase

- **Student Member voting rights (brief §3 table said "voting, unless the
  Rules are amended otherwise"):** the actual Rules text (§9) ties voting
  purely to being "a member in good standing" — there is no fee-category
  carve-out anywhere in the document. So this is **not an open question**:
  Student Members vote exactly like any other member today, full stop. The
  data model reflects this by not gating `BALLOTS` on
  `membership_category` at all.
- **Rules §4 (initial focus areas)** explicitly states these "shall not
  limit the future activities of RHEAP" and additional focus areas may be
  added — the schema's `committees.focus_area` and `courses.focus_area`
  are free-text/extensible fields, not a fixed enum of 4, so a 5th focus
  area doesn't require a schema migration.
