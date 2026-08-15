
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt


def role_required(*required_roles):
    def decorator(function):

        @wraps(function)
        @jwt_required()
        def wrapper(*args, **kwargs):

            claims = get_jwt()
            role = claims.get("role")

            if role not in required_roles:
                return {
                    "success": False,
                    "message": "Access denied"
                }, 403

            return function(*args, **kwargs)

        return wrapper

    return decorator

