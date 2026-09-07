# database/

Database layer for **Civic Issue Reporter** (UCS503P). This folder is
self-contained — drop it into the project repo (e.g. as `database/` at the
repo root, alongside `front-end/` and `code/`) and the backend team can
point their Flask app at it.

## Contents

```
database/
├── ER_DIAGRAM.md         # Mermaid ER diagram + cardinality notes
├── SCHEMA_DESIGN.md       # Design rationale, traced to README/proposal requirements
├── DATA_DICTIONARY.md     # Full attribute list for every table
├── docker-compose.yml     # Local Postgres 16 for development
├── .env.example           # DATABASE_URL template
├── sql/
│   ├── schema.sql         # DDL: types, tables, constraints, indexes, triggers
│   └── seed.sql            # Dummy/sample data (departments, users, issues, upvotes, notifications)
└── orm/
    ├── models.py           # SQLAlchemy models (mirrors schema.sql 1:1)
    ├── database.py         # Engine/session setup for Flask
    └── requirements.txt
```

## Quick start (local development)

1. **Start Postgres:**
   ```bash
   cd database
   docker compose up -d
   ```

2. **Apply the schema and load dummy data:**
   ```bash
   docker exec -i civic_issue_db psql -U civic_user -d civic_issue_reporter < sql/schema.sql
   docker exec -i civic_issue_db psql -U civic_user -d civic_issue_reporter < sql/seed.sql
   ```

3. **Verify:**
   ```bash
   docker exec -it civic_issue_db psql -U civic_user -d civic_issue_reporter -c "SELECT title, status, priority, upvote_count FROM issues;"
   ```
   You should see 6 seeded issues, including one flagged `high` priority.

## Wiring it into the Flask backend

```bash
cd database/orm
pip install -r requirements.txt
cp ../.env.example ../.env   # then edit DATABASE_URL if needed
```

```python
# app.py (backend team)
from flask import Flask
from database import init_db, db_session
from models import User, Issue, Department  # etc.

app = Flask(__name__)
init_db(app)   # creates tables if they don't exist, wires session teardown

@app.route("/departments")
def list_departments():
    depts = db_session.query(Department).all()
    return [{"id": str(d.department_id), "name": d.name} for d in depts]
```

`init_db()` calls `Base.metadata.create_all()`, which is safe to run
repeatedly (it won't touch existing tables) — but for anything beyond the
initial prototype, prefer running `sql/schema.sql` directly against a
managed Postgres instance (Supabase/Railway, per the proposal's Resources
section) and treat `models.py` as the source of truth for queries only.

## Moving to managed hosting (pilot / staging)

Point `DATABASE_URL` in `.env` at the managed instance's connection string
(Supabase/Railway both give you one directly), then run:

```bash
psql "$DATABASE_URL" -f sql/schema.sql
psql "$DATABASE_URL" -f sql/seed.sql   # optional — skip in production
```

Both `pgcrypto` and `pg_trgm` (used for UUID generation and fuzzy
description matching) are available on every major managed Postgres
provider without special configuration.

## Design docs

Read `SCHEMA_DESIGN.md` first — it walks through every table and index
choice and ties each one back to a specific line in the README or the
Project Proposal, which is exactly what you'll want quoted in the software
engineering report (requirement traceability, normalization discussion,
ACID/transaction handling for the escalation and status-update flows).
`DATA_DICTIONARY.md` is the flat attribute-by-attribute reference to paste
into the report's appendix. `ER_DIAGRAM.md` has the Mermaid diagram, which
GitHub and most Markdown viewers render inline.
