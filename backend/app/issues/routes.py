from flask import Blueprint, g, jsonify, request
from sqlalchemy.exc import IntegrityError

from app.auth.decorators import load_current_user, role_required
from app.db import (
    Category,
    Department,
    Issue,
    IssuePriority,
    IssueStatus,
    Notification,
    NotificationType,
    StatusHistory,
    Upvote,
    User,
    UserRole,
    db_session,
)
from app.errors import ApiError

bp = Blueprint("issues", __name__, url_prefix="/api/issues")

# Status only ever moves forward one step at a time -- Reported -> Ongoing
# -> Finished, per the project spec's lifecycle. Postgres's enum type
# can't see the previous row's value in a CHECK constraint (noted in
# database/SCHEMA_DESIGN.md #3), so this is enforced here instead.
STATUS_ORDER = [IssueStatus.reported, IssueStatus.ongoing, IssueStatus.finished]


def issue_to_dict(issue: Issue, upvoted_by_me: bool = False) -> dict:
    next_index = STATUS_ORDER.index(issue.status) + 1
    return {
        "id": str(issue.issue_id),
        "title": issue.title,
        "description": issue.description,
        "photo_url": issue.photo_url,
        "building": issue.building,
        "floor": issue.floor,
        "area_room": issue.area_room,
        "status": issue.status.value,
        # The only status this issue could legally move to next via PATCH
        # .../status, or null if it's already 'finished' -- lets the
        # frontend offer just that one option instead of guessing the
        # backend's transition rule.
        "next_status": STATUS_ORDER[next_index].value if next_index < len(STATUS_ORDER) else None,
        "priority": issue.priority.value,
        "upvote_count": issue.upvote_count,
        "upvoted_by_me": upvoted_by_me,
        "was_department_overridden": issue.was_department_overridden,
        "department": {"id": str(issue.department_id), "name": issue.department.name},
        "category": {"id": str(issue.category_id), "name": issue.category.name},
        "reporter": {"id": str(issue.reporter_id), "name": issue.reporter.name},
        "created_at": issue.created_at.isoformat(),
        "updated_at": issue.updated_at.isoformat(),
        "resolved_at": issue.resolved_at.isoformat() if issue.resolved_at else None,
    }


def scoped_department_id(user, requested_department_id):
    """Turns a client-supplied ?department_id= into the department_id an
    issues query should actually filter by, given who's asking:

    - administrator: always their own department, no matter what (or
      nothing) was requested -- this is what stops a department admin
      from browsing another department's queue, matching the frontend's
      own data-department scoping in assets/shared.js.
    - super_admin / student / faculty: the requested filter, or None
      (no filter -- see everything) if none was given.
    """
    if user["role"] == "administrator":
        return user["department_id"]
    return requested_department_id


def notify(user_id, issue_id, ntype: NotificationType, message: str):
    db_session.add(
        Notification(user_id=user_id, issue_id=issue_id, type=ntype, message=message)
    )


@bp.get("")
def list_issues():
    user = load_current_user()

    query = db_session.query(Issue)

    department_id = scoped_department_id(user, request.args.get("department_id"))
    if department_id:
        query = query.filter(Issue.department_id == department_id)

    status = request.args.get("status")
    if status:
        try:
            query = query.filter(Issue.status == IssueStatus(status))
        except ValueError:
            raise ApiError(f"invalid status '{status}'")

    category_id = request.args.get("category_id")
    if category_id:
        query = query.filter(Issue.category_id == category_id)

    if request.args.get("mine") == "true":
        query = query.filter(Issue.reporter_id == user["user_id"])

    # Most-upvoted first within each status, matching the spec's "surface
    # most-reported issues first" for public listings; newest first as a
    # tiebreaker.
    query = query.order_by(Issue.upvote_count.desc(), Issue.created_at.desc())
    issues = query.all()

    # One query for "which of these did I upvote" instead of one per card.
    upvoted_ids = set()
    if user["role"] in ("student", "faculty") and issues:
        rows = (
            db_session.query(Upvote.issue_id)
            .filter(
                Upvote.user_id == user["user_id"],
                Upvote.issue_id.in_([i.issue_id for i in issues]),
            )
            .all()
        )
        upvoted_ids = {row[0] for row in rows}

    return jsonify(
        [issue_to_dict(i, upvoted_by_me=i.issue_id in upvoted_ids) for i in issues]
    )


@bp.get("/<issue_id>")
def get_issue(issue_id):
    user = load_current_user()
    issue = db_session.get(Issue, issue_id)
    if issue is None:
        raise ApiError("issue not found", 404)

    if user["role"] == "administrator" and str(issue.department_id) != str(
        user["department_id"]
    ):
        raise ApiError("issue not found", 404)  # don't reveal other depts' issues exist

    upvoted_by_me = (
        user["role"] in ("student", "faculty")
        and db_session.get(Upvote, (issue.issue_id, user["user_id"])) is not None
    )
    return jsonify(issue_to_dict(issue, upvoted_by_me=upvoted_by_me))


@bp.post("")
@role_required("student", "faculty")
def create_issue():
    user = g.current_user
    data = request.get_json(silent=True) or {}

    required = ["category_id", "title", "description", "building", "floor", "area_room"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        raise ApiError(f"missing required field(s): {', '.join(missing)}")

    category = db_session.get(Category, data["category_id"])
    if category is None:
        raise ApiError("category not found", 404)

    # Manual department override (README: "manual department selection
    # alongside auto-suggested routing") -- default to the category's
    # suggested department when the reporter didn't override it.
    requested_department_id = data.get("department_id")
    if requested_department_id:
        department = db_session.get(Department, requested_department_id)
        if department is None:
            raise ApiError("department not found", 404)
        department_id = department.department_id
        was_overridden = str(department_id) != str(category.department_id)
    else:
        department_id = category.department_id
        was_overridden = False

    issue = Issue(
        reporter_id=user["user_id"],
        category_id=category.category_id,
        department_id=department_id,
        was_department_overridden=was_overridden,
        title=data["title"].strip(),
        description=data["description"].strip(),
        photo_url=data.get("photo_url"),
        building=data["building"].strip(),
        floor=str(data["floor"]).strip(),
        area_room=data["area_room"].strip(),
    )
    db_session.add(issue)
    db_session.flush()  # assigns issue.issue_id for the rows below

    db_session.add(
        StatusHistory(
            issue_id=issue.issue_id,
            old_status=None,
            new_status=IssueStatus.reported,
            changed_by=user["user_id"],
        )
    )

    # Let the routed department's admin(s) know a new report landed.
    admins = (
        db_session.query(User)
        .filter(User.role == UserRole.administrator, User.department_id == department_id)
        .all()
    )
    for admin in admins:
        notify(
            admin.user_id,
            issue.issue_id,
            NotificationType.new_report,
            f'A new {category.name} issue was reported: "{issue.title}".',
        )

    db_session.commit()
    return jsonify(issue_to_dict(issue)), 201


@bp.patch("/<issue_id>/status")
@role_required("administrator", "super_admin")
def update_status(issue_id):
    user = g.current_user
    issue = db_session.get(Issue, issue_id)
    if issue is None:
        raise ApiError("issue not found", 404)

    if user["role"] == "administrator" and str(issue.department_id) != str(
        user["department_id"]
    ):
        raise ApiError("issue not found", 404)

    data = request.get_json(silent=True) or {}
    new_status_raw = data.get("status")
    try:
        new_status = IssueStatus(new_status_raw)
    except ValueError:
        raise ApiError(
            f"status must be one of {[s.value for s in IssueStatus]}"
        )

    old_index = STATUS_ORDER.index(issue.status)
    new_index = STATUS_ORDER.index(new_status)
    if new_index != old_index + 1:
        raise ApiError(
            f"cannot move status from '{issue.status.value}' to "
            f"'{new_status.value}' -- status advances one step at a time "
            f"({' -> '.join(s.value for s in STATUS_ORDER)})"
        )

    old_status = issue.status
    issue.status = new_status
    if new_status == IssueStatus.finished:
        from datetime import datetime, timezone

        issue.resolved_at = datetime.now(timezone.utc)

    db_session.add(
        StatusHistory(
            issue_id=issue.issue_id,
            old_status=old_status,
            new_status=new_status,
            changed_by=user["user_id"],
        )
    )
    notify(
        issue.reporter_id,
        issue.issue_id,
        NotificationType.status_change,
        f'Your report "{issue.title}" moved from '
        f"{old_status.value.capitalize()} to {new_status.value.capitalize()}.",
    )

    db_session.commit()
    return jsonify(issue_to_dict(issue))


@bp.post("/<issue_id>/upvote")
@role_required("student", "faculty")
def upvote(issue_id):
    user = g.current_user
    issue = db_session.get(Issue, issue_id)
    if issue is None:
        raise ApiError("issue not found", 404)

    existing = db_session.get(Upvote, (issue.issue_id, user["user_id"]))
    if existing is not None:
        raise ApiError("already upvoted", 409)

    db_session.add(Upvote(issue_id=issue.issue_id, user_id=user["user_id"]))
    try:
        # Flush so the AFTER INSERT trigger (trg_upvotes_sync_count) runs
        # and updates issues.upvote_count before we read it back below --
        # all still inside the one transaction this request commits at
        # the end, per database/SCHEMA_DESIGN.md #3 ("casting an upvote
        # -> possibly escalating" must be atomic).
        db_session.flush()
    except IntegrityError:
        # Two requests for the same user+issue raced past the check
        # above (a genuine double-click, a flaky client retry, or two
        # open tabs) -- upvotes.PRIMARY KEY (issue_id, user_id) is what
        # actually prevents the duplicate row; this just turns the loser
        # of that race into a clean 409 instead of a raw 500.
        db_session.rollback()
        raise ApiError("already upvoted", 409)
    db_session.refresh(issue)

    if (
        issue.priority == IssuePriority.normal
        and issue.upvote_count >= issue.category.escalation_threshold
    ):
        issue.priority = IssuePriority.high
        super_admins = db_session.query(User).filter(User.role == UserRole.super_admin).all()
        for admin in super_admins:
            notify(
                admin.user_id,
                issue.issue_id,
                NotificationType.escalation,
                f'Issue "{issue.title}" ({issue.department.name}) crossed its '
                f"escalation threshold and is now High Priority.",
            )

    notify(
        issue.reporter_id,
        issue.issue_id,
        NotificationType.upvote_activity,
        f'Your report "{issue.title}" just received its {issue.upvote_count} upvote'
        + ("s." if issue.upvote_count != 1 else "."),
    )

    db_session.commit()
    return jsonify(issue_to_dict(issue, upvoted_by_me=True)), 201


@bp.delete("/<issue_id>/upvote")
@role_required("student", "faculty")
def remove_upvote(issue_id):
    user = g.current_user
    existing = db_session.get(Upvote, (issue_id, user["user_id"]))
    if existing is None:
        raise ApiError("you haven't upvoted this issue", 404)

    db_session.delete(existing)
    db_session.flush()

    issue = db_session.get(Issue, issue_id)
    db_session.refresh(issue)
    # Deliberately not de-escalating priority back to 'normal' here --
    # once an issue is flagged High Priority that fact stays true (it did
    # cross the threshold at some point), matching how escalation is
    # described as a one-way flag in the schema design notes.

    db_session.commit()
    return jsonify(issue_to_dict(issue, upvoted_by_me=False))
