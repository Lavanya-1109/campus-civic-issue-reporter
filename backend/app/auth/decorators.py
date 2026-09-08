"""
RBAC decorators. Every protected route enforces its role check here,
server-side -- matching the project spec's "RBAC enforced server-side"
requirement (the frontend's role switcher is dev-only UI, never trusted).

Roles: student, faculty, administrator, super_admin (schema: user_role
enum in database/sql/schema.sql).

- student / faculty: identical permissions everywhere in this API.
- administrator: scoped to their own department_id (from schema's
  chk_admin_has_department constraint -- always set for this role).
- super_admin: bypasses department scoping entirely.
"""

from functools import wraps

from flask import g
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from app.errors import ApiError


def load_current_user():
    """Verifies the JWT and stashes its claims on flask.g for the request.
    Call once per request via role_required/department_scope_required, or
    directly in a route that just needs to know who's asking."""
    verify_jwt_in_request()
    claims = get_jwt()
    g.current_user = {
        "user_id": claims["sub"] if "sub" in claims else None,
        "role": claims.get("role"),
        "department_id": claims.get("department_id"),
        "name": claims.get("name"),
        "email": claims.get("email"),
    }
    return g.current_user


def role_required(*allowed_roles):
    """Rejects the request with 403 unless the JWT's role is one of
    allowed_roles. Always verifies the JWT first (401 if missing/invalid)."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = load_current_user()
            if user["role"] not in allowed_roles:
                raise ApiError("forbidden: role not permitted for this action", 403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def department_scope_required(get_department_id):
    """For routes an administrator may only use within their own
    department. get_department_id(*args, **kwargs) returns the target
    resource's department_id (as a string) given the route's own
    arguments, so this decorator can compare it against the caller's JWT
    claim without loading the resource twice.

    super_admin always passes. administrator passes only when the two
    department_ids match. student/faculty never reach here -- routes
    using this decorator should also be wrapped in
    role_required('administrator', 'super_admin').
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = g.current_user
            if user["role"] == "super_admin":
                return fn(*args, **kwargs)

            target_department_id = get_department_id(*args, **kwargs)
            if target_department_id is None or str(target_department_id) != str(
                user["department_id"]
            ):
                raise ApiError(
                    "forbidden: outside your department's scope", 403
                )
            return fn(*args, **kwargs)

        return wrapper

    return decorator
