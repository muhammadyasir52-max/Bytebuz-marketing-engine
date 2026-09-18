# 05 — Automations

Every automation from the brief's trigger table (§6), each with its
trigger, logic, channels and failure handling. All are implemented as
Supabase Edge Functions, invoked either by a Postgres trigger (event-driven)
or `pg_cron` (scheduled).

## 1. Application submitted

- **Trigger:** row inserted into `applications`.
- **Logic:** validate → attempt semi-automatic PMDC/PNMC verification → link COI declaration → place in EC queue. Full detail in [04-user-flows.md](./04-user-flows.md#1-application--approval).
- **Channels:** in-app queue (EC), WhatsApp + email to applicant on decision.
- **Failure handling:** if PMDC/PNMC verification fails or times out (no reliable public API assumed), the application is not blocked — it's flagged `verification_status=pending` and shown to the EC as "unverified," leaving the human decision intact rather than silently rejecting.

## 2. Renewal due

- **Trigger:** `pg_cron` daily scan of `members.renewal_due_at`.
- **Logic:** reminders at 30/14/3 days via WhatsApp + email with a one-tap pay link; on lapse, `status → not_in_good_standing` and voting access is revoked (enforced by RLS on `ballots` insert, not just UI).
- **Channels:** WhatsApp (primary), email (fallback).
- **Failure handling:** if a WhatsApp message fails to deliver (invalid number, opted out), fall back to email only and log a `notification_failed` audit entry so the EC can see members who may be unreachable — important because a lapse silently removes voting rights.

## 3. General Meeting scheduled

- **Trigger:** EC creates a `meetings` row.
- **Logic:** **hard-enforced** `scheduled_at >= now() + 14 days` (Rules §15) — the Edge Function rejects creation otherwise, it is not just a UI warning. Auto-sends notice + agenda, tracks RSVPs, generates a hybrid meeting link (e.g. via a calendar/video API).
- **Channels:** WhatsApp + email + portal notice.
- **Failure handling:** if notice dispatch partially fails (some members unreachable), the meeting is still valid (Rules §15 says members "shall normally receive" notice — a delivery failure to an individual doesn't invalidate the meeting), but the EC sees a delivery report and can manually follow up with anyone who didn't receive it.

## 4. Vote opened

- **Trigger:** EC opens a vote within a meeting.
- **Logic:** eligibility checked at ballot-cast time (member must be `good_standing`); majority rule set at creation — `simple` by default, **hard-set to `two_thirds`** when `vote_type=rules_amendment` (Rules §16, §31) so an officer cannot accidentally configure a Rules amendment to pass on a simple majority. Auto-close at `closes_at`, auto-tally, results published with an audit-log entry.
- **Channels:** portal + WhatsApp/email on open and on results.
- **Failure handling:** if tallying is triggered twice (e.g. a retried cron job), the tally function is idempotent — it recomputes from `ballots` rather than incrementing, so a duplicate run can't double-count.

## 5. EGM petition

- **Trigger:** each `egm_petition_signatures` insert.
- **Logic:** live counter (Realtime) against 20% of voting members in good standing (Rules §14). On threshold reached, the EC is notified automatically and a `meetings` (type=egm) draft is created for them to schedule.
- **Channels:** live portal counter for signers, WhatsApp/email alert to EC on threshold.
- **Failure handling:** the denominator ("total voting members in good standing") is recalculated at signature time, not cached — so if membership changes between signatures, the threshold check stays accurate rather than using a stale count.

## 6. Annual cycle

- **Trigger:** `pg_cron` yearly (e.g. fixed date ahead of the AGM).
- **Logic:** COI re-declaration requests sent to EC + committee members; AGM package auto-generated (member stats, activity summary, draft financial summary) and handed to the Treasurer/General Secretary to finalize — **never auto-published**, since annual accounts require sign-off (Rules §27).
- **Channels:** WhatsApp + email to EC/committee members; AGM package delivered in the admin console.
- **Failure handling:** a committee member who doesn't (re-)declare within the cycle is flagged in the admin console rather than being auto-suspended — COI non-declaration is a governance issue for the EC to act on, not something to automate a penalty for.

## 7. Event attendance

- **Trigger:** QR check-in scan (+ quiz pass, if the event requires one).
- **Logic:** auto-issue certificate (completion/participation wording only, never "licence"), log CPD hours.
- **Channels:** portal + email with the certificate.
- **Failure handling:** if check-in succeeds but the quiz is left incomplete, no certificate issues until the quiz is passed or the event's `requires_quiz=false` — avoids issuing completion certificates for incomplete participation.

## 8. New content published

- **Trigger:** CMS content (news/courses/events) marked published.
- **Logic:** queues into a monthly digest draft; **requires EC one-click approval before send** — nothing goes out automatically.
- **Channels:** email + WhatsApp broadcast to members (with unsubscribe/preference respect per brief §5.11).
- **Failure handling:** if the EC doesn't approve within the send window, the digest simply rolls to next month's cycle rather than sending unapproved content on a timeout.

## 9. Weekly evidence scan

- **Trigger:** `pg_cron` weekly.
- **Logic:** AI (Claude, via the Edge Function AI proxy) drafts summaries of new RHE research across the 4 focus areas and queues them for **human editorial approval** — nothing auto-publishes, matching the brief's explicit requirement and RHEAP's "not a regulator, evidence-based" positioning.
- **Channels:** admin console review queue.
- **Failure handling:** if the scan finds nothing new, no draft is created (no empty/placeholder digests); if the AI call fails, the run is logged and retried on the next weekly cycle rather than silently dropped.

## 10. Donation/sponsorship recorded

- **Trigger:** EC/Treasurer records a sponsorship in the admin console.
- **Logic:** updates the public supporters disclosure page and the finance ledger; payments above a configurable threshold require **dual-officer approval** before the ledger entry is finalized (Rules §26).
- **Channels:** admin console; public `/supporters` page update.
- **Failure handling:** an entry pending second-officer approval is visible in the ledger as `pending`, never silently treated as approved — so partial approval is never ambiguous.

## 11. Logo/name usage request

- **Trigger:** external party submits a usage-request form.
- **Logic:** routes to EC approval; on approval, auto-generates an authorization letter (Rules §30).
- **Channels:** email to requester with the letter (or the rejection reason).
- **Failure handling:** unresolved requests older than a configurable window surface as a reminder to the EC rather than expiring silently — Rules §30 puts control of the name/logo on the EC, so a request shouldn't be lost.
