"""
SQLAlchemy models for Civic Issue Reporter — mirrors sql/schema.sql 1:1.
Target stack: Flask + SQLAlchemy + PostgreSQL (psycopg2).

These models include the two optional audit tables (StatusHistory,
DuplicateCheck) described in SCHEMA_DESIGN.md / DATA_DICTIONARY.md.
Remove them (and their relationships) if the team decides to ship only
the 6-table ER diagram for now.
"""

import enum
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class UserRole(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    administrator = "administrator"
    super_admin = "super_admin"


class IssueStatus(str, enum.Enum):
    reported = "reported"
    ongoing = "ongoing"
    finished = "finished"


class IssuePriority(str, enum.Enum):
    normal = "normal"
    high = "high"


class NotificationType(str, enum.Enum):
    status_change = "status_change"
    upvote_activity = "upvote_activity"
    new_report = "new_report"
    escalation = "escalation"


class DuplicateDecision(str, enum.Enum):
    upvoted = "upvoted"
    filed_as_new = "filed_as_new"


class Department(Base):
    __tablename__ = "departments"

    department_id = uuid_pk()
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    categories = relationship("Category", back_populates="department")
    users = relationship("User", back_populates="department")
    issues = relationship("Issue", back_populates="department")


class Category(Base):
    __tablename__ = "categories"

    category_id = uuid_pk()
    name = Column(String(100), nullable=False, unique=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.department_id"), nullable=False)
    escalation_threshold = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (CheckConstraint("escalation_threshold > 0", name="chk_threshold_positive"),)

    department = relationship("Department", back_populates="categories")
    issues = relationship("Issue", back_populates="category")


class User(Base):
    __tablename__ = "users"

    user_id = uuid_pk()
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.department_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    department = relationship("Department", back_populates="users")
    issues_reported = relationship("Issue", back_populates="reporter", foreign_keys="Issue.reporter_id")
    upvotes = relationship("Upvote", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Issue(Base):
    __tablename__ = "issues"

    issue_id = uuid_pk()
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.category_id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.department_id"), nullable=False)
    was_department_overridden = Column(Boolean, nullable=False, default=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    photo_url = Column(Text)
    building = Column(String(100), nullable=False)
    floor = Column(String(20), nullable=False)
    area_room = Column(String(255), nullable=False)
    status = Column(Enum(IssueStatus, name="issue_status"), nullable=False, default=IssueStatus.reported)
    priority = Column(Enum(IssuePriority, name="issue_priority"), nullable=False, default=IssuePriority.normal)
    upvote_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (CheckConstraint("upvote_count >= 0", name="chk_upvote_count_nonneg"),)

    reporter = relationship("User", back_populates="issues_reported", foreign_keys=[reporter_id])
    category = relationship("Category", back_populates="issues")
    department = relationship("Department", back_populates="issues")
    upvotes = relationship("Upvote", back_populates="issue", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="issue", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="issue", cascade="all, delete-orphan")


class Upvote(Base):
    __tablename__ = "upvotes"

    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.issue_id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    issue = relationship("Issue", back_populates="upvotes")
    user = relationship("User", back_populates="upvotes")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = uuid_pk()
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.issue_id", ondelete="CASCADE"), nullable=True)
    type = Column(Enum(NotificationType, name="notification_type"), nullable=False)
    message = Column(Text, nullable=False)
    read_status = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="notifications")
    issue = relationship("Issue", back_populates="notifications")


# ---------------------------------------------------------------------
# Optional audit tables — see DATA_DICTIONARY.md
# ---------------------------------------------------------------------

class StatusHistory(Base):
    __tablename__ = "status_history"

    status_history_id = uuid_pk()
    issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.issue_id", ondelete="CASCADE"), nullable=False)
    old_status = Column(Enum(IssueStatus, name="issue_status"), nullable=True)
    new_status = Column(Enum(IssueStatus, name="issue_status"), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    issue = relationship("Issue", back_populates="status_history")


class DuplicateCheck(Base):
    __tablename__ = "duplicate_checks"

    duplicate_check_id = uuid_pk()
    new_report_description = Column(Text, nullable=False)
    matched_issue_id = Column(UUID(as_uuid=True), ForeignKey("issues.issue_id", ondelete="CASCADE"), nullable=False)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    similarity_score = Column(Numeric(5, 4), nullable=True)
    decision = Column(Enum(DuplicateDecision, name="duplicate_decision"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
