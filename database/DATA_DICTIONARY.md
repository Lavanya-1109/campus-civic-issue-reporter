# Civic Issue Reporter — Data Dictionary

Full attribute list for every table in `sql/schema.sql`. All primary keys
are `UUID` (generated with `gen_random_uuid()`), matching the team ER
diagram. Types are PostgreSQL types.

## 1. `departments`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `department_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | e.g. "Electrical Maintenance", "Hostel Warden Office", "Library Admin". |
| `description` | TEXT | nullable | Free-text note on what the department covers. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Record creation time. |

## 2. `categories`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `category_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | e.g. "Electrical", "Plumbing", "Furniture", "Structural". |
| `department_id` | UUID | FK → `departments.department_id`, NOT NULL | The department a report in this category auto-routes to. |
| `escalation_threshold` | INTEGER | NOT NULL, default `5`, CHECK `> 0` | Upvotes needed to flag an issue High Priority. Super-Admin adjustable per category (README §Auto-Escalation); MVP ships every row at the flat default of 5. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Record creation time. |

## 3. `users`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `name` | VARCHAR(150) | NOT NULL | Full name. |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier (TIET email). |
| `password_hash` | TEXT | NOT NULL | Bcrypt/argon2 hash — never plaintext. |
| `role` | ENUM `user_role` | NOT NULL | One of `student`, `faculty`, `administrator`, `super_admin`. |
| `department_id` | UUID | FK → `departments.department_id`, nullable | **Required** for `administrator` (their scope); must be NULL for every other role — enforced by `chk_admin_has_department`. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Account creation time. |

## 4. `issues`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `issue_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `reporter_id` | UUID | FK → `users.user_id`, NOT NULL | The student/faculty who filed the report. |
| `category_id` | UUID | FK → `categories.category_id`, NOT NULL | Selected/auto-suggested category. |
| `department_id` | UUID | FK → `departments.department_id`, NOT NULL | **Actual** routed department (may differ from `categories.department_id` if overridden). |
| `was_department_overridden` | BOOLEAN | NOT NULL, default `FALSE` | True if a human changed the auto-suggested department. |
| `title` | VARCHAR(200) | NOT NULL | Short one-line summary. |
| `description` | TEXT | NOT NULL | Full description; also the input to duplicate-similarity matching. |
| `photo_url` | TEXT | nullable | Cloudinary/S3 URL of the uploaded photo. |
| `building` | VARCHAR(100) | NOT NULL | e.g. "Hostel-3", "Block A", "Library". |
| `floor` | VARCHAR(20) | NOT NULL | e.g. "Ground", "2", "B1". |
| `area_room` | VARCHAR(255) | NOT NULL | Free text, e.g. "Room 204", "Boys' Washroom near canteen". |
| `status` | ENUM `issue_status` | NOT NULL, default `reported` | `reported` → `ongoing` → `finished`. |
| `priority` | ENUM `issue_priority` | NOT NULL, default `normal` | `normal` or `high` (set by the escalation check). |
| `upvote_count` | INTEGER | NOT NULL, default `0`, CHECK `>= 0` | Denormalized count, kept in sync by `trg_upvotes_sync_count`. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Submission time. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Last modification time. |
| `resolved_at` | TIMESTAMPTZ | nullable | Set when `status` moves to `finished`. |

## 5. `upvotes`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `issue_id` | UUID | PK (composite), FK → `issues.issue_id`, ON DELETE CASCADE | The upvoted issue. |
| `user_id` | UUID | PK (composite), FK → `users.user_id`, ON DELETE CASCADE | The user who upvoted. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | When the upvote was cast. |

The composite primary key `(issue_id, user_id)` is what enforces "one
upvote per user per issue" — the direct database-level mitigation for the
upvote-gaming risk in the proposal.

## 6. `notifications`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `notification_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `user_id` | UUID | FK → `users.user_id`, NOT NULL, ON DELETE CASCADE | Recipient. |
| `issue_id` | UUID | FK → `issues.issue_id`, nullable, ON DELETE CASCADE | Related issue (all four notification types today are issue-related). |
| `type` | ENUM `notification_type` | NOT NULL | `status_change`, `upvote_activity`, `new_report`, or `escalation`. |
| `message` | TEXT | NOT NULL | Human-readable notification text. |
| `read_status` | BOOLEAN | NOT NULL, default `FALSE` | Flipped when the user views it. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | When the notification was generated. |

---

## Optional audit tables (recommended, not yet on the team diagram)

These aren't in the 6-table ER diagram yet, but back the metrics section
of the proposal directly (see `SCHEMA_DESIGN.md` §1/§3). Include them if
your team wants the metrics story to be backed by real data rather than
computed after the fact from `issues.updated_at`.

### 7. `status_history`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `status_history_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `issue_id` | UUID | FK → `issues.issue_id`, NOT NULL, ON DELETE CASCADE | The issue that transitioned. |
| `old_status` | ENUM `issue_status` | nullable | NULL for the initial "created in `reported`" row. |
| `new_status` | ENUM `issue_status` | NOT NULL | The status moved to. |
| `changed_by` | UUID | FK → `users.user_id`, NOT NULL | Administrator/Super-Admin who made the change. |
| `changed_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Timestamp of the transition — this is what TTFA and resolution-time metrics are computed from. |

### 8. `duplicate_checks`

| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `duplicate_check_id` | UUID | PK, default `gen_random_uuid()` | Unique identifier. |
| `new_report_description` | TEXT | NOT NULL | Snapshot of the attempted description, even if it never became a standalone issue. |
| `matched_issue_id` | UUID | FK → `issues.issue_id`, NOT NULL, ON DELETE CASCADE | The existing issue the new report was matched against. |
| `submitted_by` | UUID | FK → `users.user_id`, NOT NULL, ON DELETE CASCADE | The user who submitted the (possibly duplicate) report. |
| `similarity_score` | NUMERIC(5,4) | CHECK `0 <= x <= 1` | The computed similarity score for this candidate. |
| `decision` | ENUM `duplicate_decision` | NOT NULL | `upvoted` (agreed it was a duplicate) or `filed_as_new` (rejected the match). |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | When the check ran. |
