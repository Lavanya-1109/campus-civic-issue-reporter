from flask import Blueprint, jsonify

from app.db import Category, Department, db_session

bp = Blueprint("departments", __name__, url_prefix="/api")


@bp.get("/departments")
def list_departments():
    depts = db_session.query(Department).order_by(Department.name).all()
    return jsonify(
        [
            {"id": str(d.department_id), "name": d.name, "description": d.description}
            for d in depts
        ]
    )


@bp.get("/categories")
def list_categories():
    cats = db_session.query(Category).order_by(Category.name).all()
    return jsonify(
        [
            {
                "id": str(c.category_id),
                "name": c.name,
                # The department a report in this category auto-routes to.
                # The frontend can still let the reporter override it --
                # see issues.routes.create_issue's was_department_overridden.
                "default_department_id": str(c.department_id),
                "escalation_threshold": c.escalation_threshold,
            }
            for c in cats
        ]
    )
