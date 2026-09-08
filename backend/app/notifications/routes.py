"""
The project proposal explicitly avoids WebSockets for notification
delivery (see database/SCHEMA_DESIGN.md #1) -- the frontend is expected
to poll GET /api/notifications periodically instead.
"""

from flask import Blueprint, jsonify

from app.auth.decorators import load_current_user
from app.db import Notification, db_session
from app.errors import ApiError

bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


def notification_to_dict(n: Notification) -> dict:
    return {
        "id": str(n.notification_id),
        "issue_id": str(n.issue_id) if n.issue_id else None,
        "type": n.type.value,
        "message": n.message,
        "read_status": n.read_status,
        "created_at": n.created_at.isoformat(),
    }


@bp.get("")
def list_notifications():
    user = load_current_user()
    notifications = (
        db_session.query(Notification)
        .filter(Notification.user_id == user["user_id"])
        # Unread first so a polling client can badge/show new ones without
        # re-sorting client-side; newest-first within each group.
        .order_by(Notification.read_status.asc(), Notification.created_at.desc())
        .all()
    )
    return jsonify([notification_to_dict(n) for n in notifications])


@bp.patch("/<notification_id>/read")
def mark_read(notification_id):
    user = load_current_user()
    notification = db_session.get(Notification, notification_id)
    if notification is None or str(notification.user_id) != str(user["user_id"]):
        raise ApiError("notification not found", 404)

    notification.read_status = True
    db_session.commit()
    return jsonify(notification_to_dict(notification))
