# from flask import jsonify
#
#
# def error_response(status_code, message=None):
#     payload = {"error": HTTP_STATUS_CODES.get(status_code, "Unknown error")}
#     if message:
#         payload["message"] = message
#     response = jsonify(payload)
#     response.status_code = status_code
#     return response
#
# def bad_request_error(error):
#     return error_response(400)
#
# def not_found_error(error):
#     return error_response(404)
#
# def internal_error(error):
#     return error_response(500)
