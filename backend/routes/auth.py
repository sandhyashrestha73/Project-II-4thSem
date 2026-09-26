'''
from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from database import db
from models.tourists import Tourist
from models.agency import Agency
from models.admin import Admin

auth_bp = Blueprint("auth", __name__)




@auth_bp.route("/api/auth/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    
    
    # Find admin by email
    admin = Admin.query.filter_by(email=email).first()

    if not admin:
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401

    # Check password
    if not check_password_hash(admin.password, password):
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401


    access_token = create_access_token(
             identity=str(admin.admin_id),
             additional_claims={"role": "admin"}
            )
    
        
    return {
        "success": True,
        "message": "Admin login successful",
        "access_token": access_token,
        "admin": {
            "admin_id": admin.admin_id,
            "username": admin.username,
            "email": admin.email
        }
    }, 200



@auth_bp.route("/api/auth/tourists/register", methods=["POST"])
def tourist_register():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    # Check required fields
    if not full_name or not email or not phone or not password:
        return {
            "success": False,
            "message": "All fields are required"
        }, 400

    # Check whether email already exists
    existing_tourist = Tourist.query.filter_by(email=email).first()

    if existing_tourist:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    # Hash password
    hashed_password = generate_password_hash(password)

    # Create tourist
    tourist = Tourist(
        full_name=full_name,
        email=email,
        phone=phone,
        password=hashed_password
    )

    db.session.add(tourist)
    db.session.commit()

    return {
        "success": True,
        "message": "Tourist registered successfully",
        "tourist": {
            "tourist_id": tourist.tourist_id,
            "full_name": tourist.full_name,
            "email": tourist.email,
            "phone": tourist.phone
        }
    }, 201




#login
@auth_bp.route("/api/auth/tourists/login", methods=["POST"])
def tourist_login():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    # Find tourist by email
    tourist = Tourist.query.filter_by(email=email).first()

    if not tourist:
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401

    # Check password
    if not check_password_hash(tourist.password, password):
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401

    
    access_token = create_access_token(
        identity=str(tourist.tourist_id),
        additional_claims={"role": "tourist"}
     )
    
    return {
        "success": True,
        "message": "Login successful",
         "access_token": access_token,
        "tourist": {
            "tourist_id": tourist.tourist_id,
            "full_name": tourist.full_name,
            "email": tourist.email,
            "phone": tourist.phone
        }
    }, 200





# Used for password reset tokens
RESET_TOKEN_MAX_AGE = 15 * 60  # 15 minutes


def get_reset_serializer():
    from flask import current_app

    return URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"]
    )



@auth_bp.route("/api/auth/agency/register", methods=["POST"])
def agency_register():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    agency_name = data.get("agency_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    address = data.get("address")
    description = data.get("description")
    license_no = data.get("license_no")

    # Check required fields
    if not agency_name or not email or not phone or not password or not address or not license_no:
        return {
            "success": False,
            "message": "Required fields are missing"
        }, 400

    # Check whether email already exists
    existing_agency = Agency.query.filter_by(email=email).first()

    if existing_agency:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    # Check whether license number already exists
    existing_license = Agency.query.filter_by(
        license_no=license_no
    ).first()

    if existing_license:
        return {
            "success": False,
            "message": "License number already registered"
        }, 409

    # Hash password
    hashed_password = generate_password_hash(password)

    # Create agency
    agency = Agency(
        agency_name=agency_name,
        email=email,
        phone=phone,
        password=hashed_password,
        address=address,
        description=description,
        license_no=license_no
    )

    db.session.add(agency)
    db.session.commit()

    return {
        "success": True,
        "message": "Agency registered successfully",
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "phone": agency.phone,
            "address": agency.address,
            "description": agency.description,
            "license_no": agency.license_no,
            "verified": agency.verified,
            "created_at": agency.created_at
        }
    }, 201




@auth_bp.route("/api/auth/agency/login", methods=["POST"])
def agency_login():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    # Find agency by email
    agency = Agency.query.filter_by(email=email).first()

    if not agency:
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401

    # Check password
    if not check_password_hash(agency.password, password):
        return {
            "success": False,
            "message": "Invalid email or password"
        }, 401

    
    access_token = create_access_token(
        identity=str(agency.agency_id),
        additional_claims={"role": "agency"}
    )


    return {
        "success": True,
        "message": "Agency login successful",
        "access_token": access_token,
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "phone": agency.phone,
            "address": agency.address,
            "description": agency.description,
            "license_no": agency.license_no,
            "verified": agency.verified
        }
    }, 200





@auth_bp.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    role = data.get("role")

    if not email or not role:
        return {
            "success": False,
            "message": "Email and account type are required"
        }, 400

    role = role.lower().strip()

    # Find account according to role
    if role == "tourist":
        user = Tourist.query.filter_by(email=email).first()

    elif role == "agency":
        user = Agency.query.filter_by(email=email).first()

    elif role == "admin":
        user = Admin.query.filter_by(email=email).first()

    else:
        return {
            "success": False,
            "message": "Invalid account type"
        }, 400

    # Do not reveal whether email exists
    if not user:
        return {
            "success": True,
            "message": "If the account exists, a password reset link has been generated."
        }, 200

    # Create secure reset token
    serializer = get_reset_serializer()

    token_data = {
        "email": email,
        "role": role
    }

    token = serializer.dumps(token_data, salt="password-reset")

    # Frontend reset URL
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    # For development/testing
    print("\n========================================")
    print("PASSWORD RESET LINK")
    print(reset_link)
    print("========================================\n")

    return {
        "success": True,
        "message": "Password reset link generated successfully.",
        "reset_link": reset_link
    }, 200

'''





from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from database import db
from models.tourists import Tourist
from models.agency import Agency
from models.admin import Admin

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    # Find admin by email
    admin = Admin.query.filter_by(email=email).first()

    if not admin:
        return {
            "success": False,
            "message": "Invalid email"
        }, 401

    # Check password
    if not check_password_hash(admin.password, password):
        return {
            "success": False,
            "message": "Invalid password"
        }, 401

    access_token = create_access_token(
        identity=str(admin.admin_id),
        additional_claims={"role": "admin"}
    )

    return {
        "success": True,
        "message": "Admin login successful",
        "access_token": access_token,
        "admin": {
            "admin_id": admin.admin_id,
            "username": admin.username,
            "email": admin.email
        }
    }, 200


@auth_bp.route("/api/auth/tourists/register", methods=["POST"])
def tourist_register():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    # Check required fields
    if not full_name or not email or not phone or not password:
        return {
            "success": False,
            "message": "All fields are required"
        }, 400

    # Check whether email already exists
    existing_tourist = Tourist.query.filter_by(email=email).first()

    if existing_tourist:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    # Hash password
    hashed_password = generate_password_hash(password)

    # Create tourist
    tourist = Tourist(
        full_name=full_name,
        email=email,
        phone=phone,
        password=hashed_password
    )

    db.session.add(tourist)
    db.session.commit()

    return {
        "success": True,
        "message": "Tourist registered successfully",
        "tourist": {
            "tourist_id": tourist.tourist_id,
            "full_name": tourist.full_name,
            "email": tourist.email,
            "phone": tourist.phone
        }
    }, 201


# login
@auth_bp.route("/api/auth/tourists/login", methods=["POST"])
def tourist_login():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    # Find tourist by email
    tourist = Tourist.query.filter_by(email=email).first()

    if not tourist:
        return {
            "success": False,
            "message": "Invalid email"
        }, 401

    # Check password
    if not check_password_hash(tourist.password, password):
        return {
            "success": False,
            "message": "Invalid password"
        }, 401

    access_token = create_access_token(
        identity=str(tourist.tourist_id),
        additional_claims={"role": "tourist"}
    )

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "tourist": {
            "tourist_id": tourist.tourist_id,
            "full_name": tourist.full_name,
            "email": tourist.email,
            "phone": tourist.phone
        }
    }, 200


# Used for password reset tokens
RESET_TOKEN_MAX_AGE = 15 * 60  # 15 minutes


def get_reset_serializer():
    from flask import current_app

    return URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"]
    )


@auth_bp.route("/api/auth/agency/register", methods=["POST"])
def agency_register():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    agency_name = data.get("agency_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    address = data.get("address")
    description = data.get("description")
    license_no = data.get("license_no")

    # Check required fields
    if not agency_name or not email or not phone or not password or not address or not license_no:
        return {
            "success": False,
            "message": "Required fields are missing"
        }, 400

    # Check whether email already exists
    existing_agency = Agency.query.filter_by(email=email).first()

    if existing_agency:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    # Check whether license number already exists
    existing_license = Agency.query.filter_by(
        license_no=license_no
    ).first()

    if existing_license:
        return {
            "success": False,
        "message": "License number already registered"
        }, 409

    # Hash password
    hashed_password = generate_password_hash(password)

    # Create agency
    agency = Agency(
        agency_name=agency_name,
        email=email,
        phone=phone,
        password=hashed_password,
        address=address,
        description=description,
        license_no=license_no
    )

    db.session.add(agency)
    db.session.commit()

    return {
        "success": True,
        "message": "Agency registered successfully",
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "phone": agency.phone,
            "address": agency.address,
            "description": agency.description,
            "license_no": agency.license_no,
            "verified": agency.verified,
            "created_at": agency.created_at
        }
    }, 201


@auth_bp.route("/api/auth/agency/login", methods=["POST"])
def agency_login():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    # Find agency by email
    agency = Agency.query.filter_by(email=email).first()

    if not agency:
        return {
            "success": False,
            "message": "Invalid email"
        }, 401

    # Check password
    if not check_password_hash(agency.password, password):
        return {
            "success": False,
            "message": "Invalid password"
        }, 401

    # NEW: Check admin verification
    if not agency.verified:
        return {
            "success": False,
            "message": "Your agency account is pending admin verification"
        }, 403

    access_token = create_access_token(
        identity=str(agency.agency_id),
        additional_claims={"role": "agency"}
    )

    return {
        "success": True,
        "message": "Agency login successful",
        "access_token": access_token,
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "phone": agency.phone,
            "address": agency.address,
            "description": agency.description,
            "license_no": agency.license_no,
            "verified": agency.verified
        }
    }, 200


@auth_bp.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    email = data.get("email")
    role = data.get("role")

    if not email or not role:
        return {
            "success": False,
            "message": "Email and account type are required"
        }, 400

    role = role.lower().strip()

    # Find account according to role
    if role == "tourist":
        user = Tourist.query.filter_by(email=email).first()

    elif role == "agency":
        user = Agency.query.filter_by(email=email).first()

    elif role == "admin":
        user = Admin.query.filter_by(email=email).first()

    else:
        return {
            "success": False,
            "message": "Invalid account type"
        }, 400

    # Do not reveal whether email exists
    if not user:
        return {
            "success": True,
            "message": "If the account exists, a password reset link has been generated."
        }, 200

    # Create secure reset token
    serializer = get_reset_serializer()

    token_data = {
        "email": email,
        "role": role
    }

    token = serializer.dumps(token_data, salt="password-reset")

    # Frontend reset URL
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    # For development/testing
    print("\n========================================")
    print("PASSWORD RESET LINK")
    print(reset_link)
    print("========================================\n")

    return {
        "success": True,
        "message": "Password reset link generated successfully.",
        "reset_link": reset_link
    }, 200
