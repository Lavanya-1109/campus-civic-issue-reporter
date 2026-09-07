"""
Minimal Flask API for demoing DB connectivity — NO duplicate detection or
NLP (deliberately deferred to post-mid-sem, per team decision). Just
enough CRUD to prove frontend -> backend -> Supabase works end to end.

Run:
    pip install flask flask-cors sqlalchemy psycopg2-binary python-dotenv
    export DATABASE_URL="postgresql+psycopg2://...supabase connection string..."
    python app_demo.py

Then hit it with curl or point your React frontend at
http://localhost:5000/api/...
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from database import db_session, init_db
from models import Department, Category, Issue, IssueStatus

app = Flask(__name__)
CORS(app)  # allow the React dev server (different port) to call this API
init_db(app)


def issue_to_dict(issue: Issue) -> dict:
    return {
        "id": str(issue.issue_id),
        "title": issue.title,
        "description": issue.description,
        "building": issue.building,
        "floor": issue.floor,
        "area_room": issue.area_room,
        "status": issue.status.value,
        "priority": issue.priority.value,
        "upvote_count": issue.upvote_count,
        "department": issue.department.name,
        "category": issue.category.name,
        "reporter": issue.reporter.name,
        "created_at": issue.created_at.isoformat(),
    }


@app.get("/api/departments")
def list_departments():
    depts = db_session.query(Department).all()
    return jsonify([{"id": str(d.department_id), "name": d.name} for d in depts])


@app.get("/api/categories")
def list_categories():
    cats = db_session.query(Category).all()
    return jsonify([
        {
            "id": str(c.category_id),
            "name": c.name,
            "default_department_id": str(c.department_id),
        }
        for c in cats
    ])


@app.get("/api/issues")
def list_issues():
    issues = db_session.query(Issue).order_by(Issue.created_at.desc()).all()
    return jsonify([issue_to_dict(i) for i in issues])


@app.post("/api/issues")
def create_issue():
    """Plain create — no duplicate check, no auto-escalation yet.
    That logic gets added back in after mid-sem eval."""
    data = request.get_json()

    issue = Issue(
        reporter_id=data["reporter_id"],
        category_id=data["category_id"],
        department_id=data["department_id"],
        title=data["title"],
        description=data["description"],
        building=data["building"],
        floor=data["floor"],
        area_room=data["area_room"],
    )
    db_session.add(issue)
    db_session.commit()
    return jsonify(issue_to_dict(issue)), 201


@app.patch("/api/issues/<issue_id>/status")
def update_status(issue_id):
    """Administrator moves an issue Reported -> Ongoing -> Finished."""
    issue = db_session.get(Issue, issue_id)
    if issue is None:
        return jsonify({"error": "not found"}), 404

    new_status = request.get_json()["status"]
    issue.status = IssueStatus(new_status)
    db_session.commit()
    return jsonify(issue_to_dict(issue))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
