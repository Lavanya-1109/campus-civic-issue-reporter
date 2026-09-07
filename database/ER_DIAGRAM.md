# Civic Issue Reporter — Entity-Relationship Diagram

This is the ER diagram for the database layer of the Civic Issue Reporter project
(UCS503P). It implements every entity implied by the README, the project
proposal, and the use-case diagram: the four roles (Student, Faculty,
Administrator, Super-Admin), department-scoped routing, duplicate detection,
auto-escalation, upvoting, and notifications.

```mermaid
erDiagram
    DEPARTMENTS ||--o{ CATEGORIES : "routes"
    DEPARTMENTS ||--o{ USERS : "scopes (admins)"
    DEPARTMENTS ||--o{ ISSUES : "owns"
    CATEGORIES  ||--o{ ISSUES : "classifies"
    USERS       ||--o{ ISSUES : "reports"
    USERS       ||--o{ UPVOTES : "casts"
    ISSUES      ||--o{ UPVOTES : "receives"
    ISSUES      ||--o{ STATUS_HISTORY : "logs"
    USERS       ||--o{ STATUS_HISTORY : "changes"
    USERS       ||--o{ NOTIFICATIONS : "receives"
    ISSUES      ||--o{ NOTIFICATIONS : "triggers"
    ISSUES      ||--o{ DUPLICATE_CHECKS : "matched-as"
    USERS       ||--o{ DUPLICATE_CHECKS : "attempts"

    DEPARTMENTS {
        int id PK
        string name UK
        timestamptz created_at
    }

    CATEGORIES {
        int id PK
        string name UK
        int default_department_id FK
        int escalation_threshold
        timestamptz created_at
    }

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        enum role "student | faculty | administrator | super_admin"
        int department_id FK "required for administrator"
        timestamptz created_at
    }

    ISSUES {
        int id PK
        int reporter_id FK
        int category_id FK
        int department_id FK
        boolean was_department_overridden
        string title
        text description
        text photo_url
        string building
        string floor
        string area_room
        enum status "reported | ongoing | finished"
        enum priority "normal | high"
        int upvote_count
        timestamptz created_at
        timestamptz updated_at
        timestamptz resolved_at
    }

    UPVOTES {
        int id PK
        int issue_id FK
        int user_id FK
        timestamptz created_at
    }

    STATUS_HISTORY {
        int id PK
        int issue_id FK
        enum old_status
        enum new_status
        int changed_by FK
        timestamptz changed_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        int issue_id FK
        enum type "status_change | upvote_activity | new_report | escalation"
        text message
        boolean read_status
        timestamptz created_at
    }

    DUPLICATE_CHECKS {
        int id PK
        text new_report_description
        int matched_issue_id FK
        int submitted_by FK
        numeric similarity_score
        enum decision "upvoted | filed_as_new"
        timestamptz created_at
    }
```

## Cardinality notes

- One **department** owns many **categories** (a category's default routing
  target) and many **issues** (the department actually handling them — these
  can diverge when an override happens).
- One **department** scopes zero-or-more **administrator** users; students,
  faculty and the super-admin have `department_id = NULL`.
- One **user** (student/faculty) reports many **issues**; one **issue** has
  exactly one reporter.
- **Upvotes** is the many-to-many resolver between `users` and `issues`, with
  a `UNIQUE(issue_id, user_id)` constraint so a user can only upvote a given
  issue once — this is the DB-level fix for the "upvote gaming" risk called
  out in the proposal (§14).
- **Status_history** is an append-only audit log, one row per transition, so
  the required metrics (time-to-first-action, resolution time by category —
  proposal §8) can be computed directly from timestamps instead of being
  inferred from `issues.updated_at` alone.
- **Duplicate_checks** logs every duplicate-candidate decision (not just the
  ones that became upvotes), which is what the proposal's "duplicate-detection
  precision" metric (§8.1) is measured from.
