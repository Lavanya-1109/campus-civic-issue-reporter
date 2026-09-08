"""
Bridges this Flask app to the models/engine defined in ../database/orm,
which is the database team's package (see database/README.md) -- we
import it rather than duplicating it, so the schema stays a single
source of truth.

This file expects the repo layout the database/README.md describes:

    <repo root>/
        backend/    <- this app
        database/   <- database/orm/models.py, database/orm/database.py
        front-end/

If your layout differs, set DATABASE_ORM_PATH in .env to the absolute
path of the database/orm directory.
"""

import os
import sys
from pathlib import Path

_here = Path(__file__).resolve()
_default_orm_path = _here.parents[2] / "database" / "orm"
_orm_path = Path(os.getenv("DATABASE_ORM_PATH", str(_default_orm_path))).resolve()

if not _orm_path.exists():
    raise RuntimeError(
        f"Could not find database/orm at {_orm_path}. Place this backend/ "
        f"folder alongside database/ (as database/README.md expects), or "
        f"set DATABASE_ORM_PATH in .env to the correct path."
    )

if str(_orm_path) not in sys.path:
    sys.path.insert(0, str(_orm_path))

# database/orm/database.py reads DATABASE_URL itself via python-dotenv;
# our own app/config.py also loads .env before this module is imported,
# so both see the same value.
from database import db_session, init_db, engine  # noqa: E402  (path set up above)
from models import (  # noqa: E402
    Base,
    Category,
    Department,
    DuplicateCheck,
    DuplicateDecision,
    Issue,
    IssuePriority,
    IssueStatus,
    Notification,
    NotificationType,
    StatusHistory,
    Upvote,
    User,
    UserRole,
)

__all__ = [
    "db_session",
    "init_db",
    "engine",
    "Base",
    "Category",
    "Department",
    "DuplicateCheck",
    "DuplicateDecision",
    "Issue",
    "IssuePriority",
    "IssueStatus",
    "Notification",
    "NotificationType",
    "StatusHistory",
    "Upvote",
    "User",
    "UserRole",
]
