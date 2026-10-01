from flask import Blueprint, request, current_app
from flask_jwt_extended import create_access_token
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer

from database import db
from models.tourists import Tourist
from models.agency import Agency
from models.admin import Admin

auth_bp = Blueprint("auth", __name__)


# =========================================================
# EMAIL HELPER - ADMIN: NEW AGENCY REGISTRATION
# =========================================================

def send_admin_agency_registration_email(agency):
    """
    Send notification to admin when a new agency registers.
    """

    try:
        admin_email = current_app.config.get("MAIL_USERNAME")

        if not admin_email:
            print("Admin notification email is not configured.")
            return False

        msg = Message(
            subject="New Agency Registration - TourEase Nepal",
            recipients=[admin_email]
        )

        msg.body = f"""
Hello Admin,

A new tourism agency has registered on TourEase Nepal.

Please review the submitted agency information and verify
the agency before approving or rejecting the account.

========================================
       AGENCY REGISTRATION DETAILS
========================================

Agency ID      : {agency.agency_id}
Agency Name    : {agency.agency_name}
Email          : {agency.email}
Phone          : {agency.phone}
Address        : {agency.address}
License Number : {agency.license_no}
Description    : {agency.description or "Not provided"}

Status         : Pending Verification

Please log in to the TourEase Nepal admin portal and review
the agency details.

Regards,
TourEase Nepal
"""

        current_app.extensions["mail"].send(msg)

        print(
            f"Admin notification email sent for agency #{agency.agency_id}"
        )

        return True

    except Exception as e:
        print(
            "Failed to send admin agency notification email:",
            e
        )
        return False


# =========================================================
# EMAIL HELPER - AGENCY: REGISTRATION RECEIVED
# =========================================================

def send_agency_registration_received_email(agency):
    """
    Send confirmation email to the agency after registration.
    """

    try:
        if not agency.email:
            print("Agency email is not available.")
            return False

        msg = Message(
            subject="TourEase Nepal - Registration Received",
            recipients=[agency.email]
        )

        msg.body = f"""
Hello {agency.agency_name},

Thank you for registering your agency with TourEase Nepal.

Your agency registration has been successfully received.

========================================
          REGISTRATION DETAILS
========================================

Agency ID      : {agency.agency_id}
Agency Name    : {agency.agency_name}
Email          : {agency.email}
Phone          : {agency.phone}
Address        : {agency.address}
License Number : {agency.license_no}

Status         : Pending Verification

Your account is currently waiting for admin verification.

Our admin team will review your submitted agency information
and license details.

You will receive another email once your application has been
approved or rejected.

Please do not try to log in until your agency has been approved.

Regards,
TourEase Nepal
"""

        current_app.extensions["mail"].send(msg)

        print(
            f"Registration confirmation email sent to {agency.email}"
        )

        return True

    except Exception as e:
        print(
            "Failed to send agency registration email:",
            e
        )
        return False


# =========================================================
# EMAIL HELPER - AGENCY: APPROVED
# =========================================================

def send_agency_approved_email(agency):
    """
    Send approval email to the agency.
    """

    try:
        if not agency.email:
            print("Agency email is not available.")
            return False

        msg = Message(
            subject="TourEase Nepal - Agency Verified",
            recipients=[agency.email]
        )

        msg.body = f"""
Hello {agency.agency_name},

Congratulations!

Your agency has been successfully verified by the
TourEase Nepal admin team.

========================================
             AGENCY VERIFIED
========================================

Agency ID      : {agency.agency_id}
Agency Name    : {agency.agency_name}
License Number : {agency.license_no}

Status         : Approved / Verified

You can now log in to your TourEase Nepal agency account
and manage your tourism services, packages and bookings.

Thank you for joining TourEase Nepal.

Regards,
TourEase Nepal
"""

        current_app.extensions["mail"].send(msg)

        print(
            f"Agency approval email sent to {agency.email}"
        )

        return True

    except Exception as e:
        print(
            "Failed to send agency approval email:",
            e
        )
        return False


# =========================================================
# EMAIL HELPER - AGENCY: REJECTED
# =========================================================

def send_agency_rejected_email(agency):
    """
    Send rejection email to the agency.
    """

    try:
        if not agency.email:
            print("Agency email is not available.")
            return False

        msg = Message(
            subject="TourEase Nepal - Agency Registration Rejected",
            recipients=[agency.email]
        )

        msg.body = f"""
Hello {agency.agency_name},

Thank you for registering your agency with TourEase Nepal.

After reviewing your submitted agency information,
the admin team has rejected your agency registration
at this time.

========================================
          REGISTRATION STATUS
========================================

Agency ID      : {agency.agency_id}
Agency Name    : {agency.agency_name}
License Number : {agency.license_no}

Status         : Rejected

If you believe this decision was made in error or you need
further information, please contact the TourEase Nepal team.

Regards,
TourEase Nepal
"""

        current_app.extensions["mail"].send(msg)

        print(
            f"Agency rejection email sent to {agency.email}"
        )

        return True

    except Exception as e:
        print(
            "Failed to send agency rejection email:",
            e
        )
        return False


# =========================================================
# ADMIN LOGIN
# =========================================================

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

    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    admin = Admin.query.filter_by(email=email).first()

    if not admin:
        return {
            "success": False,
            "message": "Invalid email"
        }, 401

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


# =========================================================
# TOURIST REGISTER
# =========================================================

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

    if not full_name or not email or not phone or not password:
        return {
            "success": False,
            "message": "All fields are required"
        }, 400

    existing_tourist = Tourist.query.filter_by(email=email).first()

    if existing_tourist:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    hashed_password = generate_password_hash(password)

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
            "phone": tourist.phone,
            "profile_image": tourist.profile_image

        }
    }, 201


# =========================================================
# TOURIST LOGIN
# =========================================================

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

    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    tourist = Tourist.query.filter_by(email=email).first()

    if not tourist:
        return {
            "success": False,
            "message": "Invalid email"
        }, 401

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
            "phone": tourist.phone,
            "profile_image": tourist.profile_image

        }
    }, 200


# =========================================================
# PASSWORD RESET TOKEN
# =========================================================

RESET_TOKEN_MAX_AGE = 15 * 60


def get_reset_serializer():
    return URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"]
    )


# =========================================================
# AGENCY REGISTER
# =========================================================

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

    if (
        not agency_name
        or not email
        or not phone
        or not password
        or not address
        or not license_no
    ):
        return {
            "success": False,
            "message": "Required fields are missing"
        }, 400

    existing_agency = Agency.query.filter_by(email=email).first()

    if existing_agency:
        return {
            "success": False,
            "message": "Email already registered"
        }, 409

    existing_license = Agency.query.filter_by(
        license_no=license_no
    ).first()

    if existing_license:
        return {
            "success": False,
            "message": "License number already registered"
        }, 409

    hashed_password = generate_password_hash(password)

    agency = Agency(
        agency_name=agency_name,
        email=email,
        phone=phone,
        password=hashed_password,
        address=address,
        description=description,
        license_no=license_no,
        verified=False,
        status="Pending"
    )

    db.session.add(agency)
    db.session.commit()

    # =====================================================
    # SEND EMAILS
    # =====================================================

    # 1. Notify admin
    send_admin_agency_registration_email(agency)

    # 2. Notify agency
    send_agency_registration_received_email(agency)

    return {
        "success": True,
        "message": (
            "Agency registered successfully. "
            "Your account is pending admin verification."
        ),
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "phone": agency.phone,
            "address": agency.address,
            "description": agency.description,
            "license_no": agency.license_no,
            "profile_image": agency.profile_image,
            "verified": agency.verified,
            "status": agency.status,
            "created_at": agency.created_at
        }
    }, 201


# =========================================================
# AGENCY LOGIN
# =========================================================

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

    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required"
        }, 400

    agency = Agency.query.filter_by(email=email).first()

    if not agency:
        return {
            "success": False,
            "message": "Invalid email"
        }, 401

    if not check_password_hash(agency.password, password):
        return {
            "success": False,
            "message": "Invalid password"
        }, 401

    # =====================================================
    # CHECK AGENCY STATUS
    # =====================================================

    if agency.status == "Pending":
        return {
            "success": False,
            "message": (
                "Your agency account is pending admin verification"
            )
        }, 403

    if agency.status == "Rejected":
        return {
            "success": False,
            "message": (
                "Your agency registration has been rejected by the admin"
            )
        }, 403

    if not agency.verified:
        return {
            "success": False,
            "message": "Your agency account is not verified"
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
            "profile_image": agency.profile_image,
            "verified": agency.verified,
            "status": agency.status
        }
    }, 200


# =========================================================
# FORGOT PASSWORD
# =========================================================

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

    if not user:
        return {
            "success": True,
            "message": (
                "If the account exists, a password reset link "
                "has been generated."
            )
        }, 200

    serializer = get_reset_serializer()

    token_data = {
        "email": email,
        "role": role
    }

    token = serializer.dumps(
        token_data,
        salt="password-reset"
    )

    reset_link = (
        f"http://localhost:5173/reset-password?token={token}"
    )

    print("\n========================================")
    print("PASSWORD RESET LINK")
    print(reset_link)
    print("========================================\n")

    return {
        "success": True,
        "message": "Password reset link generated successfully.",
        "reset_link": reset_link
    }, 200