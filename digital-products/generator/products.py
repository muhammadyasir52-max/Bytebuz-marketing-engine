"""
Batch 1 — Cluster 2: Health & Medical Trackers.

Five interiors. Each build function draws the complete book into an
engine.Book and is reused unchanged for the KDP (mirrored-margin) and
digital (symmetric-margin) editions.
"""

from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch

from engine import Book, Theme

IN = inch


# ---------------------------------------------------------------------------
# 1. Blood Pressure & Medication Log for Seniors (Large Print)
# ---------------------------------------------------------------------------
def build_bp_log(b: Book):
    t = b.theme
    b.title_page(
        "Blood Pressure &\nMedication Log",
        "Large Print Edition for Seniors\n104 Weeks of Easy Daily Tracking",
        "Track it. Chart it. Bring it to your doctor.",
    )
    b.ownership_page(["Name:", "Doctor:", "Doctor's Phone:",
                      "Emergency Contact:", "My Target Blood Pressure:"])
    b.copyright_page("Blood Pressure & Medication Log for Seniors")

    # How to use
    b.new_page()
    b.section = "Getting Started"
    y = b.header("How to Use This Log")
    for para in [
        "1.  Measure at the same times each day — once in the morning before "
        "medication, once in the evening. Sit quietly for five minutes first, "
        "feet flat on the floor, arm supported at heart level.",
        "2.  Write each reading in the weekly log. One page is one week, and "
        "the book is undated, so you can start any day you like.",
        "3.  Every four weeks, fill in the Monthly Review page. Plot your "
        "evening readings on the chart to see your trend at a glance.",
        "4.  Before each doctor visit, complete a Doctor Visit page. Bring "
        "this book with you — your doctor will love you for it.",
    ]:
        y = b.paragraph(b.left, y, b.width, para) - 10

    # BP categories reference
    b.new_page()
    y = b.header("Blood Pressure Categories", "Reference chart (American Heart Association)")
    cols = [b.width * 0.34, b.width * 0.24, b.width * 0.18, b.width * 0.24]
    rows = [
        ("Normal", "Below 120", "and", "Below 80"),
        ("Elevated", "120 – 129", "and", "Below 80"),
        ("High — Stage 1", "130 – 139", "or", "80 – 89"),
        ("High — Stage 2", "140 or higher", "or", "90 or higher"),
        ("Crisis — call your doctor", "Above 180", "and/or", "Above 120"),
    ]
    y0 = y
    y = b.table(b.left, y, cols, 40, len(rows),
                headers=["Category", "Systolic\n(top number)", "", "Diastolic\n(bottom number)"])
    yy = y0 - (26 if t.large_print else 20)
    for cat, sys, join, dia in rows:
        b.label(b.left + 8, yy - 24, cat, size=12)
        b.c.setFont("Helvetica", 12)
        b.c.drawCentredString(b.left + cols[0] + cols[1] / 2, yy - 24, sys)
        b.c.drawCentredString(b.left + cols[0] + cols[1] + cols[2] / 2, yy - 24, join)
        b.c.drawCentredString(b.left + cols[0] + cols[1] + cols[2] + cols[3] / 2, yy - 24, dia)
        yy -= 40
    y = b.paragraph(b.left, y - 24, b.width,
                    "These ranges are general guidelines. Your doctor may set "
                    "different targets for you — write them on the first page "
                    "and follow your doctor's advice.")

    # Medication pages
    for i in (1, 2):
        b.new_page()
        b.section = "My Medications"
        y = b.header("My Medications", f"Page {i} — keep this list current")
        b.table(b.left, y,
                [b.width * 0.34, b.width * 0.18, b.width * 0.26, b.width * 0.22],
                46, 12, headers=["Medication", "Dose", "When I Take It", "Prescribed By"])

    # 24 four-week cycles: 4 weekly pages + 1 monthly review = 120 wk / ~2 yrs
    for month in range(1, 19):
        for week in range(1, 5):
            b.new_page()
            b.section = "Weekly Log"
            y = b.header("Weekly Blood Pressure Log",
                         f"Month {month} · Week {week} — two readings a day")
            y = b.field(b.left, y, "Week beginning:", 2.2 * IN) and y
            y -= 26
            day_w = b.width * 0.16
            rest = (b.width - day_w) / 6
            y = b.table(b.left, y, [day_w] + [rest] * 6, 56, 7,
                        headers=["Day", "AM\nSys", "AM\nDia", "AM\nPulse",
                                 "PM\nSys", "PM\nDia", "PM\nPulse"],
                        row_labels=["Day 1", "Day 2", "Day 3", "Day 4",
                                    "Day 5", "Day 6", "Day 7"])
            y -= 28
            b.checkbox(b.left, y, "I took my medications every day this week")
            y -= 34
            b.label(b.left, y, "Notes this week (symptoms, salt, sleep, stress):")
            b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)
        # Monthly review + trend chart
        b.new_page()
        b.section = "Monthly Review"
        y = b.header("Monthly Review & Trend Chart", f"Month {month}")
        x2 = b.left + b.width / 2
        b.field(b.left, y, "Average AM reading:", 1.5 * IN)
        b.field(x2, y, "Average PM reading:", 1.5 * IN)
        y -= 34
        b.field(b.left, y, "Highest reading:", 1.6 * IN)
        b.field(x2, y, "Lowest reading:", 1.7 * IN)
        y -= 40
        b.label(b.left, y, "Plot one evening systolic reading per day:")
        y -= 16
        y = b.chart_grid(b.left + 40, y, b.width - 50, 3.4 * IN, 28, 10,
                         y_labels=[80, 100, 120, 140, 160, 180],
                         x_label="Days 1 – 28", y_title="Systolic (top number)")
        y -= 4
        b.label(b.left, y, "This month I noticed:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Doctor visit pages
    for v in range(1, 5):
        b.new_page()
        b.section = "Doctor Visits"
        y = b.header("Doctor Visit", f"Visit {v} — fill in before you go")
        b.field(b.left, y, "Date:", 1.4 * IN)
        b.field(b.left + b.width / 2, y, "Doctor:", 2 * IN)
        y -= 36
        y = b.lined_area(b.left, y, b.width, 130,
                         label="Questions I want to ask:") - 22
        y = b.lined_area(b.left, y, b.width, 130,
                         label="Changes since my last visit:") - 22
        y = b.lined_area(b.left, y, b.width, 130,
                         label="What the doctor said:") - 22
        b.label(b.left, y, "Medication changes:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    b.notes_page()
    b.notes_page()


# ---------------------------------------------------------------------------
# 2. Caregiver's Daily Log & Medical Appointment Planner
# ---------------------------------------------------------------------------
def build_caregiver_log(b: Book):
    b.title_page(
        "Caregiver's Daily Log &\nAppointment Planner",
        "Daily Care Records · Medication Schedule · Handoff Notes\n12 Weeks, Undated",
        "Because you can't pour from an empty cup.",
    )
    b.ownership_page(["Caregiver Name:", "Caring For:", "Relationship:",
                      "Primary Doctor:", "Pharmacy / Phone:"])
    b.copyright_page("Caregiver's Daily Log & Medical Appointment Planner")

    b.new_page()
    b.section = "Getting Started"
    y = b.header("How to Use This Planner")
    for para in [
        "This planner keeps everything about your loved one's care in one "
        "place — so nothing gets forgotten, and anyone who steps in can pick "
        "up exactly where you left off.",
        "Start with the Care Profile and Medication List so the essential "
        "facts are always at the front of the book. Then use one Daily Log "
        "page per day: vitals, medications given, meals, personal care, and "
        "handoff notes for the next caregiver or family member.",
        "Every week there is a check-in page for the person the care system "
        "always forgets: you. Two minutes a week. Don't skip it.",
        "Before every medical appointment, fill in an Appointment page — the "
        "questions you prepare are the ones that get answered.",
    ]:
        y = b.paragraph(b.left, y, b.width, para) - 10

    # Care profile
    b.new_page()
    b.section = "Care Profile"
    y = b.header("Care Recipient Profile")
    half = b.width / 2
    for row in [("Name:", "Date of birth:"), ("Height:", "Weight:"),
                ("Blood type:", "Insurance / ID #:")]:
        b.field(b.left, y, row[0], half - b.c.stringWidth(row[0], "Helvetica-Bold", 9) - 30)
        b.field(b.left + half + 10, y, row[1], half - b.c.stringWidth(row[1], "Helvetica-Bold", 9) - 30)
        y -= 30
    y -= 6
    y = b.lined_area(b.left, y, b.width, 90, label="Medical conditions:") - 18
    y = b.lined_area(b.left, y, b.width, 66, label="Allergies (medications, food, other):") - 18
    y = b.lined_area(b.left, y, b.width, 66, label="Mobility, diet, and daily-routine notes:") - 18
    b.label(b.left, y, "What comfort looks like for them (favorites, soothers, routines):")
    b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Care team
    b.new_page()
    y = b.header("Care Team & Emergency Contacts")
    b.table(b.left, y, [b.width * 0.28, b.width * 0.3, b.width * 0.22, b.width * 0.2],
            40, 14, headers=["Name", "Role / Specialty", "Phone", "Notes"])

    # Medication list + schedule
    b.new_page()
    b.section = "Medications"
    y = b.header("Medication List", "Keep current — update after every change")
    b.table(b.left, y, [b.width * 0.3, b.width * 0.15, b.width * 0.2,
                        b.width * 0.35],
            42, 13, headers=["Medication", "Dose", "When", "Purpose / Side effects to watch"])
    b.new_page()
    y = b.header("Daily Medication Schedule", "The at-a-glance version for any caregiver")
    slots = ["Early AM", "Breakfast", "Midday", "Afternoon", "Dinner", "Bedtime", "As needed"]
    b.table(b.left, y, [b.width * 0.18, b.width * 0.52, b.width * 0.3],
            62, len(slots), headers=["Time", "Medication & dose", "Special instructions"],
            row_labels=slots)

    # 12 weeks: 7 daily pages + 1 weekly check-in
    day_total = 0
    for week in range(1, 13):
        for day in range(1, 8):
            day_total += 1
            b.new_page()
            b.section = "Daily Log"
            y = b.header("Daily Care Log", f"Week {week} · Day {day}")
            b.field(b.left, y, "Date:", 1.1 * IN)
            b.field(b.left + b.width * 0.36, y, "Caregiver on duty:", 1.5 * IN)
            y -= 24
            b.label(b.left, y, "VITALS")
            y -= 6
            y = b.table(b.left, y, [b.width * 0.14, b.width * 0.18, b.width * 0.14,
                                    b.width * 0.14, b.width * 0.14, b.width * 0.26],
                        24, 3, headers=["Time", "Blood pressure", "Pulse", "Temp", "O2 / Glucose", "Notes"],
                        header_h=18) - 12
            b.label(b.left, y, "MEDICATIONS GIVEN")
            y -= 6
            y = b.table(b.left, y, [b.width * 0.36, b.width * 0.16, b.width * 0.14,
                                    b.width * 0.34],
                        24, 5, headers=["Medication & dose", "Time", "Given by", "Taken OK? / Notes"],
                        header_h=18) - 12
            b.label(b.left, y, "MEALS & FLUIDS")
            y -= 6
            y = b.table(b.left, y, [b.width * 0.16, b.width * 0.48, b.width * 0.18,
                                    b.width * 0.18],
                        24, 4, headers=["Meal", "What was eaten", "Amount eaten", "Fluids"],
                        header_h=18,
                        row_labels=["Breakfast", "Lunch", "Dinner", "Snacks"]) - 14
            b.label(b.left, y, "PERSONAL CARE")
            y -= 20
            items = ["Bathing", "Dressing", "Toileting", "Teeth / denture care",
                     "Exercise / walk", "Skin check"]
            colw = b.width / 3
            for i, item in enumerate(items):
                b.checkbox(b.left + (i % 3) * colw, y - (i // 3) * 22, item)
            y -= 52
            b.label(b.left, y, "Mood today:")
            moods = ["Calm", "Cheerful", "Tired", "Anxious", "Agitated", "Confused", "In pain"]
            x = b.left + 80
            for m in moods:
                b.checkbox(x, y - 3, m, size=8)
                x += b.c.stringWidth(m, "Helvetica", 8) + 38
            y -= 26
            b.label(b.left, y, "HANDOFF NOTES — what the next person needs to know:")
            b.lined_area(b.left, y - 8, b.width, y - b.bottom - 18, gap=20)
        # weekly caregiver check-in
        b.new_page()
        b.section = "Weekly Check-In"
        y = b.header("Week in Review & Caregiver Check-In", f"Week {week}")
        y = b.lined_area(b.left, y, b.width, 80,
                         label="Changes in condition this week (better / worse / new):") - 18
        y = b.lined_area(b.left, y, b.width, 60,
                         label="To mention at the next appointment:") - 18
        y = b.lined_area(b.left, y, b.width, 60,
                         label="Supplies running low / errands:") - 24
        b.c.setFillColor(b.theme.accent_light)
        box_h = 190
        b.c.rect(b.left, y - box_h, b.width, box_h, stroke=0, fill=1)
        yy = y - 24
        b.label(b.left + 14, yy, "YOU — the caregiver. Two minutes, honestly:", size=10)
        yy -= 30
        yy = b.scale_row(b.left + 14, yy, "My energy this week (0 = running on empty, 10 = strong):",
                         width=b.width - 28)
        yy -= 6
        b.field(b.left + 14, yy, "One thing I did just for myself:", b.width - 220)
        yy -= 26
        b.field(b.left + 14, yy, "One thing I need help with:", b.width - 200)
        y -= box_h + 20
        b.label(b.left, y, "A good moment from this week worth remembering:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Appointment pages
    for a in range(1, 7):
        b.new_page()
        b.section = "Appointments"
        y = b.header("Medical Appointment", f"Appointment {a}")
        b.field(b.left, y, "Date:", 1.1 * IN)
        b.field(b.left + b.width * 0.3, y, "Time:", 0.9 * IN)
        b.field(b.left + b.width * 0.58, y, "With:", 1.6 * IN)
        y -= 28
        b.field(b.left, y, "Reason for visit:", b.width - 120)
        y -= 34
        y = b.lined_area(b.left, y, b.width, 120,
                         label="Questions to ask (from the weekly check-ins):") - 20
        y = b.lined_area(b.left, y, b.width, 120,
                         label="What the doctor said / diagnosis / results:") - 20
        y = b.lined_area(b.left, y, b.width, 80,
                         label="Medication or care-plan changes:") - 20
        b.label(b.left, y, "Follow-up needed (tests, referrals, next visit):")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    b.notes_page()


# ---------------------------------------------------------------------------
# 3. Diabetes Food, Glucose & Insulin Tracker (90 Days)
# ---------------------------------------------------------------------------
def build_diabetes_tracker(b: Book):
    b.title_page(
        "Diabetes Food, Glucose\n& Insulin Tracker",
        "90 Days of Daily Logs · Weekly Reviews · Doctor Visit Summaries",
        "Ninety days of data your doctor can actually use.",
    )
    b.ownership_page(["Name:", "Doctor / Clinic:", "Emergency Contact:",
                      "My Target Glucose Range:", "Last A1C  /  Date:"])
    b.copyright_page("Diabetes Food, Glucose & Insulin Tracker — 90 Days")

    b.new_page()
    b.section = "Getting Started"
    y = b.header("How to Use This Tracker")
    for para in [
        "Ninety days is the number that matters: it is roughly the period an "
        "A1C test reflects and the interval most doctors use between reviews. "
        "Fill this book completely and you walk into your next appointment "
        "with the full picture.",
        "Each day gets one page: fasting reading, glucose before and after "
        "each meal, medication or insulin doses, what you actually ate, and "
        "how you felt. Honest beats perfect — a real log with gaps is worth "
        "more than a tidy one with invented numbers.",
        "Every week, complete the Weekly Review to spot patterns: which "
        "meals spike you, how activity and sleep move your numbers. Every "
        "30 days, fill in a Monthly Summary to bring to your care team.",
        "Ask your doctor for your personal target ranges and write them on "
        "the front page. This book records; your care team advises.",
    ]:
        y = b.paragraph(b.left, y, b.width, para) - 10

    b.new_page()
    b.section = "Medications"
    y = b.header("My Medications & Insulin")
    b.table(b.left, y, [b.width * 0.3, b.width * 0.18, b.width * 0.22, b.width * 0.3],
            42, 13, headers=["Medication / Insulin", "Dose", "When", "Notes"])

    day = 0
    for week in range(1, 14):
        for d in range(7):
            day += 1
            if day > 90:
                break
            b.new_page()
            b.section = "Daily Log"
            y = b.header(f"Day {day}", f"Week {week} — one honest page")
            b.field(b.left, y, "Date:", 1.2 * IN)
            b.field(b.left + b.width * 0.34, y, "Fasting glucose:", 0.9 * IN)
            b.field(b.left + b.width * 0.74, y, "Hours slept:", 0.7 * IN)
            y -= 26
            b.label(b.left, y, "GLUCOSE & DOSES")
            y -= 6
            y = b.table(b.left, y,
                        [b.width * 0.16, b.width * 0.15, b.width * 0.15,
                         b.width * 0.2, b.width * 0.34],
                        27, 4,
                        headers=["", "Before", "After (2 hr)", "Insulin / med dose", "Time & notes"],
                        header_h=18,
                        row_labels=["Breakfast", "Lunch", "Dinner", "Bedtime"]) - 14
            b.label(b.left, y, "FOOD LOG — what I actually ate (carbs if you count them)")
            y -= 6
            y = b.table(b.left, y, [b.width * 0.16, b.width * 0.64, b.width * 0.2],
                        30, 4, headers=["Meal", "Food & drink", "Carbs (g)"],
                        header_h=18,
                        row_labels=["Breakfast", "Lunch", "Dinner", "Snacks"]) - 14
            b.field(b.left, y, "Activity / exercise today:", b.width * 0.5)
            b.field(b.left + b.width * 0.72, y, "Minutes:", 0.6 * IN)
            y -= 26
            b.label(b.left, y, "How I felt (energy, lows, highs, stress):")
            y = b.lined_area(b.left, y - 6, b.width, 58, gap=20) - 16
            b.label(b.left, y, "Notes for my care team:")
            b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16, gap=20)
        if day > 90:
            break
        # Weekly review
        b.new_page()
        b.section = "Weekly Review"
        y = b.header("Weekly Review", f"Week {week} — find the pattern")
        half = b.width / 2
        b.field(b.left, y, "Average fasting:", 1.1 * IN)
        b.field(b.left + half, y, "Readings in range:", 1.1 * IN)
        y -= 30
        b.field(b.left, y, "Highest reading / when:", 1.8 * IN)
        b.field(b.left + half, y, "Lowest reading / when:", 1.6 * IN)
        y -= 40
        y = b.lined_area(b.left, y, b.width, 90,
                         label="Meals or foods that spiked me this week:") - 18
        y = b.lined_area(b.left, y, b.width, 90,
                         label="What helped keep me steady (food, walks, sleep, timing):") - 18
        y = b.lined_area(b.left, y, b.width, 70,
                         label="One thing I'll try next week:") - 18
        b.label(b.left, y, "Questions this week raised for my doctor:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Monthly summaries
    for m in range(1, 4):
        b.new_page()
        b.section = "Monthly Summary"
        y = b.header("30-Day Summary for My Care Team", f"Month {m}")
        half = b.width / 2
        b.field(b.left, y, "Average fasting this month:", 1.3 * IN)
        b.field(b.left + half, y, "Weight:", 1.0 * IN)
        y -= 34
        b.label(b.left, y, "Plot your fasting readings (one point per day):")
        y -= 14
        y = b.chart_grid(b.left + 40, y, b.width - 50, 3.1 * IN, 30, 10,
                         y_labels=[60, 90, 120, 150, 180, 210],
                         x_label="Days 1 – 30", y_title="Fasting glucose (mg/dL)")
        y = b.lined_area(b.left, y, b.width, 90,
                         label="Biggest patterns I found this month:") - 18
        b.label(b.left, y, "What I want to discuss at my next appointment:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    b.notes_page()
    b.notes_page()


# ---------------------------------------------------------------------------
# 4. Post-Surgery Recovery Journal & Symptom Tracker
# ---------------------------------------------------------------------------
def build_recovery_journal(b: Book):
    b.title_page(
        "Post-Surgery\nRecovery Journal",
        "12 Weeks of Daily Pain, Medication & Mobility Tracking\nwith Follow-Up Appointment Planner",
        "Healing isn't linear. Track it anyway.",
    )
    b.ownership_page(["Name:", "Surgery / Procedure:", "Surgery Date:",
                      "Surgeon:", "Surgeon's Office Phone:"])
    b.copyright_page("Post-Surgery Recovery Journal & Symptom Tracker")

    b.new_page()
    b.section = "Getting Started"
    y = b.header("How to Use This Journal")
    for para in [
        "Recovery is measured in small differences — a little less pain than "
        "Tuesday, a few more steps than last week. Day to day you can't feel "
        "the progress. On paper, you can see it.",
        "Fill in one Daily Recovery page per day: pain scores morning and "
        "evening, medications, wound care, movement, and one win — however "
        "small. At the end of each week, the Weekly Milestones page shows "
        "you how far you've come.",
        "Before we start: complete the My Surgery page, then sit down with "
        "your discharge instructions and copy your care team's warning "
        "signs into the Warning Signs page. That page is yours to fill — "
        "every surgery is different, and your team's list is the one that "
        "counts.",
        "Bring this book to every follow-up. Precise answers about pain, "
        "medications, and mobility get you better care than 'fine, I guess.'",
    ]:
        y = b.paragraph(b.left, y, b.width, para) - 10

    b.new_page()
    b.section = "My Surgery"
    y = b.header("My Surgery & Care Plan")
    half = b.width / 2
    b.field(b.left, y, "Procedure:", b.width - 100)
    y -= 30
    b.field(b.left, y, "Date:", half - 60)
    b.field(b.left + half, y, "Hospital / center:", half - 120)
    y -= 36
    y = b.lined_area(b.left, y, b.width, 80,
                     label="Discharge instructions (summary):") - 18
    y = b.lined_area(b.left, y, b.width, 80,
                     label="Activity restrictions (what I must not do yet, and until when):") - 18
    y = b.lined_area(b.left, y, b.width, 80,
                     label="Wound / incision care instructions:") - 18
    b.label(b.left, y, "Physical therapy / rehab plan:")
    b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    b.new_page()
    y = b.header("Warning Signs — Ask Your Care Team",
                 "Copy the 'call us if…' list from your discharge papers here")
    y = b.paragraph(b.left, y, b.width,
                    "Every procedure has its own red flags. Write your care "
                    "team's exact list below, with the phone number to call, "
                    "so it's never buried in a drawer when you need it.")
    y -= 10
    b.field(b.left, y, "If these happen, call:", 2.4 * IN)
    y -= 30
    y = b.table(b.left, y, [b.width * 0.7, b.width * 0.3], 40, 10,
                headers=["Warning sign", "Call who / how fast"])

    b.new_page()
    b.section = "Medications"
    y = b.header("My Recovery Medications")
    b.table(b.left, y, [b.width * 0.28, b.width * 0.16, b.width * 0.22, b.width * 0.34],
            42, 13, headers=["Medication", "Dose", "How often", "Taper / stop notes"])

    day = 0
    for week in range(1, 13):
        for d in range(7):
            day += 1
            b.new_page()
            b.section = "Daily Recovery"
            y = b.header(f"Recovery Day {day}", f"Week {week}")
            b.field(b.left, y, "Date:", 1.2 * IN)
            b.field(b.left + b.width * 0.4, y, "Hours slept:", 0.7 * IN)
            b.field(b.left + b.width * 0.72, y, "Temp (if taken):", 0.7 * IN)
            y -= 30
            y = b.scale_row(b.left, y, "Pain this morning  (0 = none, 10 = worst):") - 8
            y = b.scale_row(b.left, y, "Pain this evening:") - 10
            b.label(b.left, y, "MEDICATIONS TAKEN")
            y -= 6
            y = b.table(b.left, y, [b.width * 0.4, b.width * 0.18, b.width * 0.42],
                        24, 4, headers=["Medication & dose", "Times", "Helped? Side effects?"],
                        header_h=18) - 14
            b.label(b.left, y, "WOUND & BODY CHECK")
            y -= 22
            checks = ["Dressing changed", "Incision looks OK", "Ice / elevation done",
                      "Breathing exercises", "Compression worn", "Bowels OK"]
            colw = b.width / 3
            for i, item in enumerate(checks):
                b.checkbox(b.left + (i % 3) * colw, y - (i // 3) * 22, item)
            y -= 54
            b.field(b.left, y, "Movement today (steps, walks, PT exercises):", b.width * 0.42)
            y -= 28
            b.field(b.left, y, "Appetite & fluids:", b.width * 0.35)
            b.field(b.left + b.width * 0.55, y, "Energy (0–10):", 0.55 * IN)
            y -= 30
            b.field(b.left, y, "Today's win (however small):", b.width * 0.6)
            y -= 26
            b.label(b.left, y, "Symptoms or worries to watch (check the Warning Signs page):")
            b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16, gap=20)
        # Weekly milestones
        b.new_page()
        b.section = "Weekly Milestones"
        y = b.header("Weekly Milestones", f"End of week {week} — look how far you've come")
        half = b.width / 2
        b.field(b.left, y, "Average pain this week:", 0.9 * IN)
        b.field(b.left + half, y, "Average pain last week:", 0.9 * IN)
        y -= 34
        y = b.lined_area(b.left, y, b.width, 76,
                         label="What I can do now that I couldn't last week:") - 18
        y = b.lined_area(b.left, y, b.width, 76,
                         label="What still hurts or worries me:") - 18
        y = b.lined_area(b.left, y, b.width, 62,
                         label="Questions for my next follow-up:") - 18
        y = b.scale_row(b.left, y, "How I feel about my recovery overall this week:") - 14
        b.label(b.left, y, "Note to future me, for a hard day:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Follow-up appointments
    for a in range(1, 5):
        b.new_page()
        b.section = "Follow-Ups"
        y = b.header("Follow-Up Appointment", f"Follow-up {a}")
        b.field(b.left, y, "Date:", 1.1 * IN)
        b.field(b.left + b.width * 0.3, y, "Time:", 0.9 * IN)
        b.field(b.left + b.width * 0.58, y, "With:", 1.6 * IN)
        y -= 34
        y = b.lined_area(b.left, y, b.width, 110,
                         label="Questions to ask (from the weekly pages):") - 20
        y = b.lined_area(b.left, y, b.width, 110,
                         label="What the doctor said:") - 20
        y = b.lined_area(b.left, y, b.width, 80,
                         label="Medication changes / new restrictions lifted:") - 20
        b.label(b.left, y, "Next steps and next appointment:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    b.notes_page()
    b.notes_page()


# ---------------------------------------------------------------------------
# 5. Chronic Pain & Symptom Flare Tracker
# ---------------------------------------------------------------------------
def build_pain_tracker(b: Book):
    b.title_page(
        "Chronic Pain &\nSymptom Flare Tracker",
        "90 Days of Pattern-Spotting: Triggers, Sleep, Weather & Relief\nwith Flare Logs and Appointment Prep",
        "Your pain is real. Now make it visible.",
    )
    b.ownership_page(["Name:", "Conditions:", "Doctor / Specialist:",
                      "Pharmacy:", "Emergency Contact:"])
    b.copyright_page("Chronic Pain & Symptom Flare Tracker")

    b.new_page()
    b.section = "Getting Started"
    y = b.header("How to Use This Tracker")
    for para in [
        "Chronic pain is hard to treat partly because it's hard to see. "
        "Doctors get fifteen minutes and a memory blurred by the pain "
        "itself. This book turns ninety days of your life into evidence: "
        "when it hurts, what makes it worse, what actually helps.",
        "Each day takes about three minutes: pain levels through the day, "
        "sleep, stress, weather, suspected triggers, and what relief you "
        "tried. On bad days, write less — a single pain score still counts.",
        "When a flare hits, give it its own Flare Log page while it's fresh: "
        "what the 48 hours before looked like is where the patterns hide.",
        "Every 30 days, the Pattern Review pulls it together — and the "
        "Appointment Prep pages turn your data into the ten sentences that "
        "make a specialist visit count.",
    ]:
        y = b.paragraph(b.left, y, b.width, para) - 10

    b.new_page()
    b.section = "My Baseline"
    y = b.header("My Conditions, Medications & Suspects")
    y = b.lined_area(b.left, y, b.width, 70,
                     label="My diagnoses / conditions:") - 16
    b.label(b.left, y, "Current medications & supplements:")
    y -= 8
    y = b.table(b.left, y, [b.width * 0.36, b.width * 0.18, b.width * 0.22, b.width * 0.24],
                30, 7, headers=["Medication", "Dose", "When", "For"], header_h=18) - 18
    y = b.lined_area(b.left, y, b.width, 60,
                     label="Triggers I already suspect (foods, weather, activities, stress):") - 16
    b.label(b.left, y, "What has helped before (even a little):")
    b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    day = 0
    for week in range(1, 14):
        for d in range(7):
            day += 1
            if day > 90:
                break
            b.new_page()
            b.section = "Daily Tracker"
            y = b.header(f"Day {day}", "Three minutes. Bad days count double.")
            b.field(b.left, y, "Date:", 1.1 * IN)
            b.field(b.left + b.width * 0.3, y, "Weather:", 1.0 * IN)
            b.field(b.left + b.width * 0.66, y, "Hours slept:", 0.6 * IN)
            y -= 26
            b.label(b.left, y, "PAIN THROUGH THE DAY  (0 = none, 10 = worst)")
            y -= 6
            y = b.table(b.left, y,
                        [b.width * 0.18, b.width * 0.14, b.width * 0.34, b.width * 0.34],
                        26, 4,
                        headers=["", "Pain 0–10", "Where (location & type)", "What I was doing"],
                        header_h=18,
                        row_labels=["Morning", "Afternoon", "Evening", "Night"]) - 14
            y = b.scale_row(b.left, y, "Stress today:") - 4
            y = b.scale_row(b.left, y, "Energy / fatigue (0 = flattened, 10 = fully charged):") - 10
            b.label(b.left, y, "POSSIBLE TRIGGERS TODAY")
            y -= 22
            trig = ["Poor sleep", "Stress / conflict", "Weather change", "Overdid activity",
                    "Skipped meals", "Alcohol / sugar", "Long sitting / posture", "Hormonal",
                    "Screen time", "Other:"]
            colw = b.width / 2
            for i, item in enumerate(trig):
                b.checkbox(b.left + (i % 2) * colw, y - (i // 2) * 21, item)
            y -= 5 * 21 + 8
            b.label(b.left, y, "RELIEF I TRIED")
            y -= 6
            y = b.table(b.left, y, [b.width * 0.5, b.width * 0.5], 24, 3,
                        headers=["What I tried (meds, heat, rest, stretch…)", "Did it help? (0–10)"],
                        header_h=18) - 12
            b.label(b.left, y, "Notes:")
            b.lined_area(b.left, y - 6, b.width, y - b.bottom - 14, gap=19)
        if day > 90:
            break

    # Flare logs
    for f in range(1, 13):
        b.new_page()
        b.section = "Flare Log"
        y = b.header("Flare Log", f"Flare {f} — capture it while it's fresh")
        b.field(b.left, y, "Started (date & time):", 1.6 * IN)
        b.field(b.left + b.width * 0.55, y, "Lasted:", 1.2 * IN)
        y -= 30
        y = b.scale_row(b.left, y, "Peak intensity:") - 10
        y = b.lined_area(b.left, y, b.width, 76,
                         label="The 48 hours before: sleep, food, stress, weather, activity —") - 18
        y = b.lined_area(b.left, y, b.width, 76,
                         label="Symptoms beyond pain (brain fog, nausea, numbness…):") - 18
        y = b.lined_area(b.left, y, b.width, 76,
                         label="What I tried, in order, and what finally helped:") - 18
        b.label(b.left, y, "What I'd tell my doctor about this one:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Monthly pattern reviews
    for m in range(1, 4):
        b.new_page()
        b.section = "Pattern Review"
        y = b.header("30-Day Pattern Review", f"Month {m} — read back, connect dots")
        half = b.width / 2
        b.field(b.left, y, "Good days (pain ≤ 3):", 0.8 * IN)
        b.field(b.left + half, y, "Hard days (pain ≥ 7):", 0.8 * IN)
        y -= 30
        b.field(b.left, y, "Flares this month:", 0.8 * IN)
        b.field(b.left + half, y, "Average sleep:", 0.8 * IN)
        y -= 36
        y = b.lined_area(b.left, y, b.width, 84,
                         label="Triggers that showed up before most hard days:") - 18
        y = b.lined_area(b.left, y, b.width, 84,
                         label="Relief methods with the best scores this month:") - 18
        y = b.lined_area(b.left, y, b.width, 70,
                         label="One experiment for next month (change one variable):") - 18
        b.label(b.left, y, "Anything getting better that deserves credit:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    # Appointment prep
    for a in range(1, 4):
        b.new_page()
        b.section = "Appointment Prep"
        y = b.header("Appointment Prep & Summary", f"Visit {a}")
        b.field(b.left, y, "Date:", 1.1 * IN)
        b.field(b.left + b.width * 0.35, y, "With:", 1.8 * IN)
        y -= 30
        y = b.lined_area(b.left, y, b.width, 90,
                         label="My 10-sentence summary (frequency, intensity, triggers, what helps):") - 18
        y = b.lined_area(b.left, y, b.width, 80,
                         label="Top 3 questions I will not leave without asking:") - 18
        y = b.lined_area(b.left, y, b.width, 90,
                         label="What the doctor said / plan:") - 18
        b.label(b.left, y, "Changes to try before next visit:")
        b.lined_area(b.left, y - 6, b.width, y - b.bottom - 16)

    b.notes_page()


# ---------------------------------------------------------------------------
PRODUCTS = {
    "blood-pressure-log-seniors": dict(
        build=build_bp_log,
        theme=Theme(accent=HexColor("#1f4e79"), accent_light=HexColor("#e8eef5"),
                    large_print=True),
    ),
    "caregiver-daily-log": dict(
        build=build_caregiver_log,
        theme=Theme(accent=HexColor("#0e7c7b"), accent_light=HexColor("#e6f4f4")),
    ),
    "diabetes-90-day-tracker": dict(
        build=build_diabetes_tracker,
        theme=Theme(accent=HexColor("#8c2f39"), accent_light=HexColor("#f7ebec")),
    ),
    "post-surgery-recovery-journal": dict(
        build=build_recovery_journal,
        theme=Theme(accent=HexColor("#2d6a4f"), accent_light=HexColor("#e9f3ee")),
    ),
    "chronic-pain-flare-tracker": dict(
        build=build_pain_tracker,
        theme=Theme(accent=HexColor("#5b4b8a"), accent_light=HexColor("#eeebf5")),
    ),
}
