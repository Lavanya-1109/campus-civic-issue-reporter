from flask import jsonify


class ApiError(Exception):
    """Raised anywhere in the app for an expected, user-facing error.

    Route code should raise this instead of returning ad-hoc error
    tuples, so every error response has the same {"error": "..."} shape.
    """

    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return jsonify({"error": err.message}), err.status_code

    @app.errorhandler(404)
    def handle_not_found(err):
        return jsonify({"error": "not found"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(err):
        return jsonify({"error": "method not allowed"}), 405

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        app.logger.exception("Unhandled exception")
        return jsonify({"error": "internal server error"}), 500
