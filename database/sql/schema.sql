-- =====================================================================
-- Civic Issue Reporter — PostgreSQL Schema
-- Matches the team ER diagram (UUID primary keys on every table).
-- Core tables: departments, categories, users, issues, upvotes,
-- notifications. Two optional audit tables (status_history,
-- duplicate_checks) are included at the bottom — they aren't on the
-- team diagram yet but directly back the metrics in Project Proposal
-- §8 (time-to-first-action, duplicate-detection precision). Comment
-- them out if you want to ship only the 6-table diagram for now.
-- =====================================================================

-- Extensions -----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy text similarity (duplicate detection)

-- Enum types -------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'administrator', 'super_admin');
CREATE TYPE issue_status AS ENUM ('reported', 'ongoing', 'finished');
CREATE TYPE issue_priority AS ENUM ('normal', 'high');
CREATE TYPE notification_type AS ENUM ('status_change', 'upvote_activity', 'new_report', 'escalation');
CREATE TYPE duplicate_decision AS ENUM ('upvoted', 'filed_as_new');

-- =====================================================================
-- DEPARTMENTS
-- =====================================================================
CREATE TABLE departments (
    department_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- CATEGORIES
-- One row per issue category (e.g. "Electrical", "Plumbing", "Furniture").
-- default_department_id is the auto-suggested routing target; an issue
-- can still be routed elsewhere via override (README: Manual department
-- override).
-- =====================================================================
CREATE TABLE categories (
    category_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100) NOT NULL UNIQUE,
    department_id           UUID NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    escalation_threshold    INTEGER NOT NULL DEFAULT 5 CHECK (escalation_threshold > 0),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_department ON categories(department_id);

-- =====================================================================
-- USERS
-- department_id is required for 'administrator' (their scope), and must
-- be NULL for student / faculty / super_admin (super-admin sees every
-- department, so isn't scoped to one).
-- =====================================================================
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL,
    department_id   UUID REFERENCES departments(department_id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_admin_has_department
        CHECK (
            (role = 'administrator' AND department_id IS NOT NULL)
            OR (role <> 'administrator' AND department_id IS NULL)
        )
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);

-- =====================================================================
-- ISSUES
-- department_id is the ACTUAL routed department (may differ from
-- categories.department_id if overridden).
-- =====================================================================
CREATE TABLE issues (
    issue_id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id                UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    category_id                UUID NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    department_id              UUID NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    was_department_overridden  BOOLEAN NOT NULL DEFAULT FALSE,
    title                      VARCHAR(200) NOT NULL,
    description                TEXT NOT NULL,
    photo_url                  TEXT,
    building                   VARCHAR(100) NOT NULL,
    floor                      VARCHAR(20) NOT NULL,
    area_room                  VARCHAR(255) NOT NULL,
    status                     issue_status NOT NULL DEFAULT 'reported',
    priority                   issue_priority NOT NULL DEFAULT 'normal',
    upvote_count               INTEGER NOT NULL DEFAULT 0 CHECK (upvote_count >= 0),
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at                TIMESTAMPTZ
);

-- Administrator / Super-Admin dashboard: "open issues in my department"
CREATE INDEX idx_issues_dept_status ON issues(department_id, status);
-- Duplicate-detection bucket lookup
CREATE INDEX idx_issues_location ON issues(building, floor);
CREATE INDEX idx_issues_category ON issues(category_id);
-- Fuzzy description similarity within a bucket
CREATE INDEX idx_issues_description_trgm ON issues USING GIN (description gin_trgm_ops);
-- "Surface high-priority issues at the top" without scanning normal rows
CREATE INDEX idx_issues_high_priority ON issues(department_id) WHERE priority = 'high';

-- =====================================================================
-- UPVOTES
-- Composite primary key doubles as the "one upvote per user per issue"
-- constraint — the DB-level fix for the "upvote gaming" risk (Proposal §14).
-- =====================================================================
CREATE TABLE upvotes (
    issue_id    UUID NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (issue_id, user_id)
);

CREATE INDEX idx_upvotes_user ON upvotes(user_id);

-- Keep issues.upvote_count in sync automatically so dashboards and the
-- escalation check never have to run a COUNT(*) on every request.
CREATE OR REPLACE FUNCTION fn_sync_upvote_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE issues SET upvote_count = upvote_count + 1 WHERE issue_id = NEW.issue_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE issues SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE issue_id = OLD.issue_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upvotes_sync_count
AFTER INSERT OR DELETE ON upvotes
FOR EACH ROW EXECUTE FUNCTION fn_sync_upvote_count();

-- =====================================================================
-- NOTIFICATIONS
-- issue_id nullable in principle (future non-issue notifications), but
-- every notification type used today is issue-related.
-- =====================================================================
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    issue_id        UUID REFERENCES issues(issue_id) ON DELETE CASCADE,
    type            notification_type NOT NULL,
    message         TEXT NOT NULL,
    read_status     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Polling endpoint: "give me this user's unread notifications"
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_status);
CREATE INDEX idx_notifications_issue ON notifications(issue_id);

-- =====================================================================
-- OPTIONAL AUDIT TABLES (not yet on the team ER diagram)
-- Recommended additions — feed the metrics in Proposal §8 directly.
-- Comment out this section if you want to ship only the 6 diagrammed
-- tables for the current lab submission.
-- =====================================================================

-- Append-only log of every status transition, so time-to-first-action
-- and resolution-time-by-category can be computed from timestamps
-- instead of reconstructed from a single mutable issues.updated_at.
CREATE TABLE status_history (
    status_history_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id            UUID NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
    old_status          issue_status,
    new_status          issue_status NOT NULL,
    changed_by          UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_issue ON status_history(issue_id);

-- Logs every duplicate candidate shown to a reporter, and what they
-- chose — this IS the data the "duplicate-detection precision" metric
-- (Proposal §8.1) is computed from, independent of whether a new issue
-- was ever created.
CREATE TABLE duplicate_checks (
    duplicate_check_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    new_report_description  TEXT NOT NULL,
    matched_issue_id        UUID NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
    submitted_by            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    similarity_score        NUMERIC(5,4) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    decision                duplicate_decision NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_duplicate_checks_matched_issue ON duplicate_checks(matched_issue_id);
