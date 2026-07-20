# Bytebuz Digital Products

Programmatic publishing pipeline for planner/tracker products — Amazon KDP
paperbacks first, with matching digital editions for Etsy/Gumroad.

## What's here

```
digital-products/
├── catalog/50-product-catalog.md     # the full 50-title roadmap (8 clusters)
├── research/MARKET_RESEARCH.md       # what top sellers do + the gaps we exploit
├── generator/
│   ├── engine.py                     # KDP-compliant PDF page engine (reportlab)
│   ├── products.py                   # one build function per product
│   └── build_all.py                  # builds every product, both editions
└── products/<slug>/
    ├── interior_kdp_8.5x11.pdf       # print-ready KDP interior (mirrored margins)
    ├── interior_digital_letter.pdf   # Etsy/Gumroad digital edition (symmetric margins)
    └── listing.md                    # title, subtitle, 7 backend keywords,
                                      # description, pricing, tags, cover brief
```

Rebuild everything: `pip install reportlab && python3 generator/build_all.py`

## Batch 1 — Cluster 2: Health & Medical (SHIPPED)

| # | Product | Pages | KDP | Etsy |
|---|---------|-------|-----|------|
| 8 | Blood Pressure & Medication Log for Seniors (Large Print) | 104 | $8.99 | $4.99 |
| 9 | Caregiver's Daily Log & Appointment Planner | 112 | $12.99 | $6.99 |
| 10 | Diabetes Food, Glucose & Insulin Tracker (90 Days) | 112 | $9.99 | $5.99 |
| 11 | Post-Surgery Recovery Journal & Symptom Tracker | 110 | $10.99 | $5.99 |
| 12 | Chronic Pain & Symptom Flare Tracker | 114 | $10.99 | $5.99 |

All interiors: 8.5×11, no bleed, even page counts, undated, 0.75" gutter /
0.5" outside margins (KDP spec for ≤150 pages), disclaimer on copyright page.

## To publish (manual steps)

1. **Covers.** Each `listing.md` has a cover brief (palette + motif + tagline).
   Build at KDP's cover calculator size for the page count; white paper.
2. **KDP upload.** Title/subtitle/description/keywords are copy-paste ready in
   `listing.md`. Run the Phase-1 validation checklist in
   `research/MARKET_RESEARCH.md` for each title first.
3. **Etsy.** Upload `interior_digital_letter.pdf`, use the Etsy title/tags/price
   from `listing.md`. First listing photo = interior page collage, not the cover.

## Roadmap

- **Batch 2 — Cluster 3 (Mental Health & Neurodivergence):** ADHD Planner for
  Women is the proven top keyword; needs a dopamine-menu/time-blocking page
  system (new engine primitives: time-block columns, habit chains).
- **Batch 3 — winners get variants** (playbook Phase 4): large-print editions,
  men's/women's covers, 6-month editions.
- Track per-title BSR weekly after launch; kill or re-cover anything outside
  the top 100k after 60 days.
