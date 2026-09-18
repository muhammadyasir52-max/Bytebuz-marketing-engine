# 04 — User Flows

## 1. Application → Approval

Per the brief's detailed application flow (§6) and Rules §8.

```mermaid
sequenceDiagram
    actor A as Applicant
    participant W as Web/App
    participant DB as Database
    participant Edge as Edge Function
    actor EC as EC Officer
    participant WA as WhatsApp/Email

    A->>W: Fill application form
    W->>W: Validate (required fields, email/phone format)
    A->>W: Optionally enter PMDC/PNMC number
    W->>Edge: Submit application
    Edge->>Edge: If PMDC/PNMC given, attempt semi-automatic verification
    Edge->>DB: Insert application (status=submitted, verification_status)
    A->>W: Record COI declaration (standard applicant disclosure)
    W->>DB: Insert coi_declarations, link to application
    DB->>EC: Application appears in EC approval queue
    EC->>W: Review application + COI + verification status
    alt Approved
        EC->>Edge: Approve
        Edge->>DB: Generate membership_number, insert into members
        Edge->>DB: Update application.status=approved
        Edge->>DB: Issue digital card (QR + wallet pass)
        Edge->>WA: Send welcome message (WhatsApp + email)
        Edge->>DB: Add to member community / directory (if opted in)
        Edge->>DB: audit_log entry (actor=EC officer, action=application.approved)
    else Rejected
        EC->>W: Select rejection ground (Rules §8 picklist only)
        EC->>Edge: Reject with ground + optional note
        Edge->>DB: Update application.status=rejected, rejection_ground
        Edge->>WA: Notify applicant with the stated ground
        Edge->>DB: audit_log entry
    end
```

## 2. Renewal

```mermaid
sequenceDiagram
    participant Cron as pg_cron (daily)
    participant Edge as Edge Function
    participant DB as Database
    actor M as Member
    participant Pay as Payments

    Cron->>Edge: Check members with renewal_due_at in 30/14/3 days
    Edge->>M: Reminder (WhatsApp + email) with one-tap pay link
    M->>Pay: Pay (or ignore)
    alt Paid before due date
        Pay->>Edge: Payment webhook
        Edge->>DB: Insert payment, extend renewal_due_at by 1 year
        Edge->>DB: audit_log entry
    else Not paid by due date
        Cron->>Edge: Renewal lapsed
        Edge->>DB: members.status = not_in_good_standing
        Edge->>DB: Voting access revoked (enforced by RLS on ballots insert)
        Edge->>M: Lapse notice (WhatsApp + email)
        Edge->>DB: audit_log entry
    end
```

## 3. AGM: Notice → Vote → Result

Encodes Rules §13 (AGM), §15 (≥14 days' notice), §16 (voting), §31 (⅔ for
amendments).

```mermaid
sequenceDiagram
    actor EC as EC Officer
    participant W as Admin console
    participant DB as Database
    participant Edge as Edge Function
    actor M as Members
    participant WA as WhatsApp/Email

    EC->>W: Schedule General Meeting (date, agenda, format)
    W->>Edge: Create meeting
    Edge->>DB: Insert meeting
    Edge->>Edge: Enforce scheduled_at >= now() + 14 days (Rules §15) — reject if not
    Edge->>DB: notice_sent_at = now()
    Edge->>WA: Send notice + agenda to all members in good standing
    M->>W: RSVP
    Note over EC,M: Meeting occurs (physical/virtual/hybrid)
    EC->>W: Open vote(s) on agenda items
    W->>Edge: Open vote(s)
    Edge->>DB: Insert vote, majority_required = simple (default) or two_thirds (if vote_type=rules_amendment)
    M->>W: Cast ballot (RLS: member.status=good_standing AND vote.status=open)
    W->>DB: Insert ballot
    Edge->>DB: Auto-close vote at closes_at
    Edge->>Edge: Tally: count yes/no/abstain, compare to majority_required
    Edge->>DB: vote.result, vote.status=tallied
    Edge->>DB: audit_log entry (immutable tally record)
    Edge->>M: Publish results (WhatsApp + email + portal)
```

## 4. EGM Petition

Encodes Rules §14 (20% threshold).

```mermaid
sequenceDiagram
    actor M as Member
    participant W as Portal
    participant DB as Database
    participant Edge as Edge Function
    actor EC as Executive Committee

    M->>W: Sign EGM petition, state matter to be considered
    W->>DB: Insert egm_petition_signatures
    DB->>Edge: Trigger recount
    Edge->>Edge: signatures / total_voting_members_in_good_standing >= 20%?
    Edge->>W: Live counter updates (Realtime) — visible to signers
    alt Threshold reached
        Edge->>EC: Notify EC automatically (Rules §14 — EGM must be called)
        Edge->>DB: audit_log entry
        EC->>W: Schedule EGM (re-enters the AGM/EGM notice→vote flow above)
    else Threshold not reached
        Note over Edge: Counter keeps accumulating; no action until it is
    end
```

## 5. Event Attendance → Certificate

```mermaid
sequenceDiagram
    actor M as Member
    participant W as App
    participant DB as Database
    participant Edge as Edge Function

    M->>W: Register for event
    W->>DB: Insert event_registrations
    Note over M,W: Day of event
    M->>W: Scan QR at check-in
    W->>DB: Insert event_attendance
    opt Event requires quiz
        M->>W: Complete quiz
        W->>DB: Record quiz result on the linked enrollment
    end
    DB->>Edge: Trigger on attendance (+ quiz pass if required)
    Edge->>DB: Generate certificate (wording: completion/participation, never "licence")
    Edge->>DB: Log CPD hours
    Edge->>M: Certificate available (portal + email)
```

## 6. Conflict-of-Interest Declaration

Encodes Rules §22 and brief §5.7 (annual + ad-hoc before any vote).

```mermaid
sequenceDiagram
    participant Cron as pg_cron (annual)
    participant Edge as Edge Function
    actor P as EC/Committee member
    participant W as Portal
    participant DB as Database

    Cron->>Edge: Trigger annual COI re-declaration cycle
    Edge->>P: Request declaration (WhatsApp + email)
    P->>W: Submit declaration_type=annual
    W->>DB: Insert coi_declarations

    Note over P,DB: Separately, before any vote a participant is part of
    W->>P: Prompt ad-hoc COI declaration before ballot is enabled
    P->>W: Submit declaration_type=ad_hoc_vote, related_vote_id
    W->>DB: Insert coi_declarations
    DB->>DB: RLS: ballot insert requires a matching ad_hoc_vote declaration to exist for (member, vote) if the member has a registered conflict flag
```
