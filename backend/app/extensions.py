from flask import jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

jwt = JWTManager()
cors = CORS()


# Match flask-jwt-extended's error responses to the rest of the API's
# {"error": "..."} shape instead of its default {"msg": "..."}, so the
# frontend has one error format to handle everywhere.
@jwt.unauthorized_loader
def _missing_token(reason):
    return jsonify({"error": "authentication required"}), 401


@jwt.invalid_token_loader
def _invalid_token(reason):
    return jsonify({"error": "invalid or malformed token"}), 422


@jwt.expired_token_loader
def _expired_token(jwt_header, jwt_payload):
    return jsonify({"error": "token expired, please log in again"}), 401
