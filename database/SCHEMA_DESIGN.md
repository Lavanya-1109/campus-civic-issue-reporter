# Civic Issue Reporter — Database Design Notes

Owner: database layer (Gill) · Stack: PostgreSQL + Flask/SQLAlemy backend
Course: UCS503P (Software Engineering)

This document explains the *why* behind the schema in `sql/schema.sql`, tied
back to specific requirements in the README and Project Proposal, so it can
be dropped straight into the report for the Week 1–2 "Proposal + ER diagram"
deliverable.

## 1. Design goals, traced to requirements

| Requirement (source) | Schema decision |
|---|---|
| 4 roles with different scopes (README §User Roles) | `users.role` enum + `users.department_id` (NULL unless `administrator`), enforced with a `CHECK` constraint at the DB level, not just in application code — defense in depth for RBAC. |
| Category auto-suggests a department, but is overridable (README, Proposal §5.2) | `categories.default_department_id` gives the suggestion; `issues.department_id` is the actual routed department; `issues.was_department_overridden` records whether a human changed it — useful later for measuring how often auto-routing is wrong. |
| Location as Building → Floor → Area/Room, not GPS (README §Location Design) | Three plain columns (`building`, `floor`, `area_room`) instead of a geo type — matches the proposal's explicit trade-off against geospatial queries. |
| Duplicate detection: location + department + description similarity, restricted to open issues (Proposal §6.1) | Composite index on `(department_id, status)` and `(building, floor)` so the "bucket" query (same department, same location, still open) is a fast indexed lookup, not a table scan. `pg_trgm` GIN index on `description` supports fuzzy text similarity directly in Postgres. |
| Duplicate decision is always shown to a human, never auto-merged (Proposal §6.1, §14) | `duplicate_checks` logs every candidate shown and what the user chose (`upvoted` vs `filed_as_new`) — this *is* the data the proposal's "duplicate-detection precision" metric (§8.1) needs, and it exists independently of whether an issue was created. |
| Upvote gaming risk (Proposal §14) | `UNIQUE(issue_id, user_id)` on `upvotes` enforced at the database level — cannot be bypassed by a buggy or malicious API client. |
| Auto-escalation, configurable per category, MVP default = 5 (README §Auto-Escalation, Proposal §7) | `categories.escalation_threshold` (not a global constant) so the per-category design the proposal argues for is already the schema shape; MVP just seeds every row to 5. `issues.priority` is a plain enum flag, deliberately decoupled from `status` — escalation never changes the Reported/Ongoing/Finished lifecycle (explicit non-goal in the README). |
| Status only moves Reported → Ongoing → Finished, changed by owning admin or super-admin (README §Status Tracking) | `issues.status` enum restricts the domain; enforcing the *direction* of the transition (no skipping back) is done in the backend service layer, not the DB, since Postgres CHECK constraints can't see the previous row value without a trigger — call this out in your report as an app-layer invariant. |
| 4 notification types (README §Notifications, Proposal §5.2) | `notifications.type` enum + `(user_id, read_status)` index, since the delivery mechanism is polling (proposal explicitly avoids WebSockets) and the backend will run "give me this user's unread notifications" on every poll. |
| Metrics: TTFA, resolution time by category (Proposal §8.1–8.2) | `status_history` is an append-only log of every transition with a timestamp, so TTFA = first `reported→ongoing` row's `changed_at` minus `issues.created_at`, computed directly with SQL rather than reconstructed from a single mutable `updated_at` column. |
| Managed PostgreSQL, deployable, no bespoke infra (Proposal §5.4, §9, §12) | Plain relational schema, no Postgres-specific exotic types beyond `pg_trgm` (available on every managed Postgres — Supabase/Railway/RDS all support it) — nothing that blocks moving to a different managed host later. |

## 2. Normalization

The schema is in **3NF**: every non-key column depends on the whole key and
nothing but the key.

- `categories.default_department_id` and `escalation_threshold` are
  category-level facts, not issue-level facts, so they live in `categories`
  and are only *referenced* from `issues.category_id` — avoids repeating
  (and risking drift on) the threshold on every single issue row.
- Location fields stay flat columns on `issues` rather than a separate
  `locations` table, because Building/Floor/Area-Room is captured per-issue
  as free-form-ish structured text (per the README's explicit rejection of a
  normalized geospatial model) — normalizing it further would add joins the
  duplicate-detection query doesn't need.
- `upvote_count` on `issues` is a deliberate **denormalization** (it's
  derivable as `COUNT(*) FROM upvotes WHERE issue_id = ...`) kept in sync via
  a trigger (see `sql/schema.sql`, `trg_upvotes_sync_count`) because the
  escalation check and dashboard sort order both read it on every request —
  recomputing a COUNT on every page load doesn't scale the way the proposal's
  "Scalability" section (§9) requires. This is called out explicitly in the
  SQL comments so it doesn't read as a mistake.

## 3. Transactions and integrity

Two operations are multi-step and must be atomic:

1. **Casting an upvote → possibly escalating.** Insert into `upvotes`,
   increment `issues.upvote_count` (handled by trigger), compare against
   `categories.escalation_threshold`, and if crossed, flip
   `issues.priority` to `high` and insert a `notifications` row for the
   super-admin. All of this happens in one DB transaction so a crash
   mid-way can't leave an upvote recorded without the corresponding
   escalation check having run.
2. **Changing status.** Update `issues.status` + `updated_at` (and
   `resolved_at` when moving to `finished`), insert a `status_history` row,
   and insert a `notifications` row for the reporter — again one
   transaction, so the audit log used for TTFA metrics can never drift from
   the actual status.

Foreign keys use `ON DELETE CASCADE` only where a child row is meaningless
without its parent (`upvotes`, `status_history`, `notifications` cascade from
`issues`); `users`, `departments`, and `categories` are never cascade-deleted
from application code — deactivation, not deletion, is the intended pattern
for an educational-institution deployment where audit history matters.

## 4. Indexing rationale

| Index | Query it serves |
|---|---|
| `idx_issues_dept_status` on `issues(department_id, status)` | Administrator dashboard: "all open issues in my department" |
| `idx_issues_location` on `issues(building, floor)` | Duplicate-detection bucket lookup |
| `idx_issues_description_trgm` (GIN, `pg_trgm`) | Fuzzy description-similarity comparison within a bucket |
| `idx_issues_priority` partial index (`WHERE priority = 'high'`) | "Surface high-priority issues at the top" (both dashboards) without scanning normal-priority rows |
| `idx_upvotes_issue` on `upvotes(issue_id)` | Recomputing/validating `upvote_count`, escalation checks |
| `idx_notifications_user_unread` on `notifications(user_id, read_status)` | Polling endpoint — "give me this user's unread notifications" |

## 5. What's intentionally left to the application layer

- Status-transition direction enforcement (no `finished → reported`).
- The actual duplicate-similarity scoring algorithm (token overlap / TF-IDF) —
  the schema only stores its *inputs and outputs*, not the algorithm itself.
- Password hashing algorithm choice (bcrypt/argon2) — `password_hash` is just
  `TEXT`, wide enough for either.
- JWT issuance/validation — no session table is needed since auth is
  stateless JWT per the proposal (§6.2).

## 6. Files in this package

- `sql/schema.sql` — full DDL: types, tables, constraints, indexes, triggers.
- `sql/seed.sql` — sample departments, categories, users (one per role),
  and a couple of sample issues/upvotes so the backend team has something
  to query against immediately.
- `orm/models.py` — SQLAlchemy models mirroring the DDL 1:1, for the Flask
  backend.
- `orm/database.py` — engine/session setup (`DATABASE_URL` from env).
- `orm/requirements.txt` — `SQLAlchemy`, `psycopg2-binary`, `python-dotenv`.
- `docker-compose.yml` — local Postgres 16 for development, with `pg_trgm`
  enabled automatically on first boot.
- `.env.example` — connection string template.
- `README.md` — setup steps for the rest of the team.
