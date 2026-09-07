"""
Database engine/session setup for the Civic Issue Reporter backend (Flask).

Usage in the Flask app factory:

    from database import init_db, db_session

    app = Flask(__name__)
    init_db(app)

    @app.teardown_appcontext
    def remove_session(exception=None):
        db_session.remove()
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://civic_user:civic_pass@localhost:5432/civic_issue_reporter",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))


def init_db(app=None):
    """Create all tables (idempotent) and, if a Flask app is passed,
    wire the scoped session's lifecycle to the request context."""
    Base.metadata.create_all(bind=engine)

    if app is not None:
        @app.teardown_appcontext
        def _remove_session(exception=None):
            db_session.remove()

    return engine
