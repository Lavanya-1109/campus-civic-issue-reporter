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

### Duplicate Detection
When a new report is submitted, the system checks for likely duplicates among open issues using:
1. **Location match** — same building + floor (exact/dropdown match), fuzzy match on area/room text
2. **Department/category match**
3. **NLP-based description similarity** — comparing the new description against existing open reports in the same location/department bucket
4. **Time window** — only compares against issues still open (not already resolved)

If a likely match is found, the reporter is shown the existing issue and prompted to **upvote** it instead of filing a new one. Upvote count also drives sort order on the public issue list, surfacing the most-reported problems first.

### Status Tracking
Each issue moves through: `Reported → Ongoing → Finished`, updated only by the Administrator of the owning department (or Super-Admin).

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

## Status

🚧 In development — feature set and schema being finalized as part of coursework (UCS503 Software Engineering).

## License

TBD
