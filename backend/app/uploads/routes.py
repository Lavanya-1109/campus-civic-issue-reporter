"""
Photo upload -- stubbed to local disk for now.

The project spec calls for Cloudinary/S3, but that choice was
deliberately deferred so the rest of the backend isn't blocked on
picking and configuring one. This endpoint keeps the same contract a
real cloud-storage version would have (POST a file, get back a URL you
can store as issues.photo_url and hand to <img src>), so swapping the
inside of save_upload() for a Cloudinary/S3 call later is a one-file
change -- nothing that calls this endpoint needs to change.
"""

import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, send_from_directory

from app.auth.decorators import role_required
from app.errors import ApiError

bp = Blueprint("uploads", __name__, url_prefix="/api/uploads")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "heic"}


def _extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


@bp.post("")
@role_required("student", "faculty")
def upload_photo():
    if "photo" not in request.files:
        raise ApiError("multipart field 'photo' is required")

    file = request.files["photo"]
    if file.filename == "":
        raise ApiError("no file selected")

    ext = _extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise ApiError(f"unsupported file type '.{ext}'")

    upload_folder = Path(current_app.config["UPLOAD_FOLDER"])
    upload_folder.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4()}.{ext}"
    file.save(upload_folder / stored_name)

    return jsonify({"url": f"/api/uploads/{stored_name}"}), 201


@bp.get("/<path:filename>")
def serve_upload(filename):
    # Local-disk-only convenience so the demo can actually render photos
    # without a real object store yet. A managed deployment would point
    # photo_url at Cloudinary/S3 directly instead of this route.
    upload_folder = Path(current_app.config["UPLOAD_FOLDER"]).resolve()
    return send_from_directory(upload_folder, filename)
