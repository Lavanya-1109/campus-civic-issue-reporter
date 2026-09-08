# Civic Issue Reporter — Backend

Flask + JWT + SQLAlchemy API on top of the `database/` package (schema,
seed data, and ORM models designed by the database team). This folder
expects to sit at the repo root **alongside** `database/` and
`front-end/`:

```
<repo root>/
├── backend/     <- this folder
├── database/    <- schema.sql, seed.sql, orm/models.py, orm/database.py
└── front-end/
```

`app/db.py` imports `models.py`/`database.py` straight out of
`database/orm/` (via a relative path) rather than copying them, so the
schema stays defined in exactly one place. If you keep a different repo
layout, set `DATABASE_ORM_PATH` in `.env` to wherever `database/orm`
lives.

Duplicate detection is **not implemented** here — it's deferred, per the
current plan (this mirrors `database/orm/app_demo.py`'s own note). The
`duplicate_checks` table exists in the schema for later.

## Setup

Requires Python 3.12 and a Postgres instance with the schema + seed data
already loaded — see `database/README.md` for that part (docker-compose
is the easiest route). Once that's up:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate        # .venv\Scripts\activate on Windows
pip install -r requirements.txt
pip install -r ../database/orm/requirements.txt

cp .env.example .env             # edit DATABASE_URL/JWT_SECRET_KEY if needed
python run.py                    # http://localhost:5000
```

`GET /api/health` should return `{"status": "ok"}` once it's running.

## Auth

- `POST /api/auth/signup` — `{name, email, password, role}`. `role` must
  be `student` or `faculty` — administrator/super_admin accounts are
  provisioned directly in the database (see `database/sql/seed.sql`),
  not self-service, since an administrator's department assignment is a
  deployment decision, not something a signup form should hand out.
- `POST /api/auth/login` — `{email, password}` → `{token, user}`.
- `GET /api/auth/me` — current user, from the `Authorization: Bearer
  <token>` header.

Every other route requires that same header. The JWT carries `role` and
`department_id` as claims, and every route re-checks them server-side —
nothing on the frontend is trusted for authorization.

## Endpoints

| Method & path | Who | Notes |
|---|---|---|
| `GET /api/departments` | anyone authenticated | |
| `GET /api/categories` | anyone authenticated | includes `default_department_id`, `escalation_threshold` |
| `GET /api/issues` | anyone authenticated | `?status=`, `?department_id=`, `?category_id=`, `?mine=true`. An `administrator`'s `department_id` filter is always forced to their own department, regardless of the query string. Each issue includes `next_status` (the one legal value a `PATCH .../status` could move it to next, or `null` if already `finished`) and `upvoted_by_me` (only meaningful for student/faculty callers) so the frontend doesn't have to guess either one. |
| `GET /api/issues/<id>` | anyone authenticated | 404 (not 403) if an `administrator` requests an issue outside their department — doesn't confirm it exists |
| `POST /api/issues` | student, faculty | `category_id` required; `department_id` optional (manual override — sets `was_department_overridden`) |
| `PATCH /api/issues/<id>/status` | administrator (own dept only), super_admin | `{status}`, one step at a time: `reported → ongoing → finished` |
| `POST /api/issues/<id>/upvote` | student, faculty | one per user (DB-enforced, and a race that slips past the app-level check still gets a clean 409 from the DB's own unique constraint rather than a 500); crosses `escalation_threshold` → issue flips to `priority: high` and every super_admin gets a notification, all in one transaction |
| `DELETE /api/issues/<id>/upvote` | student, faculty | removing an upvote never de-escalates `priority` back down |
| `GET /api/notifications` | anyone authenticated | own notifications, unread first — meant to be polled, no websockets |
| `PATCH /api/notifications/<id>/read` | anyone authenticated | must own the notification |
| `POST /api/uploads` | student, faculty | multipart `photo` field → `{url}`. Saves to local disk (`UPLOAD_FOLDER`) as a stand-in for Cloudinary/S3, which hasn't been decided yet — swapping it out later only touches `app/uploads/routes.py` |
| `GET /api/uploads/<filename>` | public | serves a locally stored photo |

## What's deliberately not here yet

- Duplicate detection (explicitly deferred).
- Cloudinary/S3 (photo uploads are local-disk only for now).
- Refresh tokens — access tokens are short-lived (1 hour by default,
  `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` in `.env`) with no refresh flow,
  which is fine for a course-project demo.
