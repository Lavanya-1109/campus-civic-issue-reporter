# Civic Issue Reporter

A web platform for students and faculty to report campus infrastructure issues (broken equipment, maintenance problems, facility faults, etc.), route them to the right department, and track them to resolution — with built-in duplicate detection so the same problem doesn't get reported ten times.

## Overview

Students and faculty can report an issue with a photo, category, and location. The system suggests a department automatically based on category, but the reporter (or an admin) can override it. Department Administrators manage the lifecycle of issues within their own department, while a Super-Admin has visibility and control across all departments. To cut down on repeat reports of the same problem, the app detects likely duplicates at submission time and lets users upvote an existing report instead of filing a new one.

## User Roles

| Role | Report Issues | View All Reports | Upvote | Change Status | Scope |
|---|---|---|---|---|---|
| Student | ✅ | ✅ | ✅ | ❌ | — |
| Faculty | ✅ | ✅ | ✅ | ❌ | — |
| Administrator | — | ✅ | — | ✅ | Own department only |
| Super-Admin | — | ✅ | — | ✅ | All departments |

- **Student / Faculty** — submit new issue reports, browse/search all reports (read-only), upvote existing reports instead of duplicating them.
- **Administrator** — scoped to one department/category; can update the status of issues within that department (Reported → Ongoing → Finished).
- **Super-Admin** — full visibility and control across all departments; oversight role.

## Core Features

### Issue Reporting
- Photo upload
- Category selection (auto-suggests a department)
- Manual department override
- Location entry via **Building → Floor → Area/Room** selection (dropdowns + free text) rather than GPS/map pin — see [Location Design](#location-design) below

### Auto-Escalation
To prevent high-impact issues from sitting unnoticed in the queue, the system automatically escalates an issue's priority when it crosses a defined upvote threshold while still in `Reported` or `Ongoing` status.

- On crossing the threshold, the issue is flagged **High Priority** and surfaced at the top of both the Administrator's and Super-Admin's dashboards.
- Super-Admin is notified (via the notification system) when an issue in any department escalates, giving oversight visibility even if the owning Administrator hasn't acted yet.
- Escalation status is purely a priority/visibility flag — it does not change the `Reported → Ongoing → Finished` lifecycle itself, just how the issue is ranked and who's alerted.

**Threshold design:** the threshold is configurable (not hardcoded), set by the Super-Admin, so it can be tuned per category rather than applied as one flat number across the board. The rationale:

- **Safety-critical categories** (electrical, structural, fire safety) warrant a very low threshold (~2–3 upvotes) — severity matters more than volume, and these shouldn't wait for popularity to escalate.
- **High-traffic common areas** (library, cafeteria, sports complex) can use a higher threshold (~8–12 upvotes) since visibility is large and genuine problems will naturally accumulate upvotes fast.
- **Hostel/block-specific issues** sit in between (~5–8 upvotes), reflecting a smaller audience per location.
- **Low-severity/cosmetic issues** (paint, furniture) use a higher bar (~15+ upvotes) so "High Priority" doesn't lose meaning.

For the MVP, a single **default threshold of 5 upvotes** is used across categories, since real usage data from Thapar isn't available yet to calibrate per-category values. This default is intended to be reviewed and tuned post-rollout based on actual reporting patterns.

### Duplicate Detection
When a new report is submitted, the system checks for likely duplicates among open issues using:
1. **Location match** — same building + floor (exact/dropdown match), fuzzy match on area/room text
2. **Department/category match**
3. **NLP-based description similarity** — comparing the new description against existing open reports in the same location/department bucket
4. **Time window** — only compares against issues still open (not already resolved)

If a likely match is found, the reporter is shown the existing issue and prompted to **upvote** it instead of filing a new one. Upvote count also drives sort order on the public issue list, surfacing the most-reported problems first.

### Status Tracking
Each issue moves through: `Reported → Ongoing → Finished`, updated only by the Administrator of the owning department (or Super-Admin).

### Notifications
To close the feedback loop after a report is submitted, the system sends in-app notifications for key events:

- **Status change alerts** — the original reporter is notified when their issue moves `Reported → Ongoing → Finished`.
- **Duplicate/upvote alerts** — if someone upvotes an issue you originally reported, you're notified that it's gaining traction.
- **Admin-side alerts** — Administrators are notified when a new report lands in their department; Super-Admin is notified when an issue escalates (see [Auto-Escalation](#auto-escalation)) in any department.

## Location Design

Instead of GPS/map-based location (unreliable indoors, and dependent on paid map APIs at scale), location is captured as structured fields:
- `Building` — dropdown (e.g. Block A, Hostel-1, Library, Admin Block)
- `Floor` — dropdown/number
- `Area/Room` — free text (e.g. "Room 204", "Boys' Washroom near canteen", "Football Ground")

This is more precise for indoor campus locations, avoids map API dependencies, and makes duplicate-location matching a simple exact/fuzzy field comparison rather than a geospatial radius calculation.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js/Express or Flask (Python)
- **Database:** PostgreSQL
- **Image storage:** Cloudinary / AWS S3
- **Auth:** JWT-based, role-based access control (RBAC)
- **Duplicate detection:** fuzzy string matching / NLP similarity on description text, combined with structured location and department matching
**Notifications:** in-app, backed by a `notifications` table (user_id, issue_id, type, message, read_status, timestamp); delivery via polling (frontend checks for new notifications at regular intervals) rather than WebSockets, to keep infrastructure simple
- **Escalation:** threshold check runs on every upvote event against a configurable `escalation_threshold` value (default: 5, Super-Admin adjustable, tunable per category); adds a `priority` field (Normal / High) to the issue schema


## Status

🚧 In development — feature set and schema being finalized as part of coursework (UCS503 Software Engineering).

## License

TBD
