import re

import bcrypt
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import create_access_token

from app.auth.decorators import load_current_user
from app.db import Department, User, UserRole, db_session
from app.errors import ApiError

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Self-signup is for Student/Faculty only -- matches front-end/login/sign_up.html
# and the react/ signup form, both of which only offer those two roles.
# Administrator and Super-Admin accounts are provisioned directly in the
# database (see database/sql/seed.sql) since they're scoped to a specific
# department by whoever runs the college's deployment, not self-service.
SELF_SIGNUP_ROLES = {"student", "faculty"}


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.user_id),
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "department_id": str(user.department_id) if user.department_id else None,
        "created_at": user.created_at.isoformat(),
    }


def issue_token(user: User) -> str:
    return create_access_token(
        identity=str(user.user_id),
        additional_claims={
            "role": user.role.value,
            "department_id": str(user.department_id) if user.department_id else None,
            "name": user.name,
            "email": user.email,
        },
    )


@bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "").strip().lower()

    if not name:
        raise ApiError("name is required")
    if not EMAIL_RE.match(email):
        raise ApiError("a valid email is required")
    if len(password) < 8:
        raise ApiError("password must be at least 8 characters")
    if role not in SELF_SIGNUP_ROLES:
        raise ApiError(f"role must be one of {sorted(SELF_SIGNUP_ROLES)}")

    if db_session.query(User).filter_by(email=email).first() is not None:
        raise ApiError("an account with this email already exists", 409)

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=UserRole(role),
        department_id=None,
    )
    db_session.add(user)
    db_session.commit()

    return jsonify({"token": issue_token(user), "user": user_to_dict(user)}), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = db_session.query(User).filter_by(email=email).first()
    if user is None or not bcrypt.checkpw(
        password.encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        raise ApiError("invalid email or password", 401)

    return jsonify({"token": issue_token(user), "user": user_to_dict(user)})


@bp.get("/me")
def me():
    claims = load_current_user()
    user = db_session.get(User, claims["user_id"])
    if user is None:
        raise ApiError("user not found", 404)
    return jsonify(user_to_dict(user))
