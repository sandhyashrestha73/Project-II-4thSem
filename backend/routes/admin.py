from flask import Blueprint, current_app
from flask_mail import Message

from database import db
from models.agency import Agency
from utils.authorization import role_required

admin_bp = Blueprint("admin", __name__)


# =========================================================
# EMAIL HELPER - AGENCY APPROVED
# =========================================================

def send_agency_approved_email(agency):
    """
    Send approval notification to agency.
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
# EMAIL HELPER - AGENCY REJECTED
# =========================================================

def send_agency_rejected_email(agency):
    """
    Send rejection notification to agency.
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
# GET PENDING AGENCIES
# =========================================================

@admin_bp.route(
    "/api/admin/agencies/pending",
    methods=["GET"]
)
@role_required("admin")
def get_pending_agencies():

    agencies = Agency.query.filter_by(
        status="Pending"
    ).all()

    return {
        "success": True,
        "count": len(agencies),
        "agencies": [
            {
                "agency_id": agency.agency_id,
                "agency_name": agency.agency_name,
                "email": agency.email,
                "phone": agency.phone,
                "address": agency.address,
                "description": agency.description,
                "license_no": agency.license_no,
                "verified": agency.verified,
                "status": agency.status,
                "created_at": agency.created_at
            }
            for agency in agencies
        ]
    }, 200


# =========================================================
# APPROVE AGENCY
# =========================================================

@admin_bp.route(
    "/api/admin/agencies/<int:agency_id>/approve",
    methods=["PUT"]
)
@role_required("admin")
def approve_agency(agency_id):

    agency = Agency.query.get(agency_id)

    if not agency:
        return {
            "success": False,
            "message": "Agency not found"
        }, 404

    # Prevent approving an already approved agency
    if agency.status == "Approved" and agency.verified:
        return {
            "success": False,
            "message": "Agency is already approved"
        }, 400

    agency.verified = True
    agency.status = "Approved"

    db.session.commit()

    # Notify agency after successful approval
    send_agency_approved_email(agency)

    return {
        "success": True,
        "message": "Agency approved successfully",
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "verified": agency.verified,
            "status": agency.status
        }
    }, 200


# =========================================================
# REJECT AGENCY
# =========================================================

@admin_bp.route(
    "/api/admin/agencies/<int:agency_id>/reject",
    methods=["PUT"]
)
@role_required("admin")
def reject_agency(agency_id):

    agency = Agency.query.get(agency_id)

    if not agency:
        return {
            "success": False,
            "message": "Agency not found"
        }, 404

    # Prevent rejecting an already approved agency
    if agency.status == "Approved":
        return {
            "success": False,
            "message": "Approved agency cannot be rejected"
        }, 400

    agency.verified = False
    agency.status = "Rejected"

    db.session.commit()

    # Notify agency after rejection
    send_agency_rejected_email(agency)

    return {
        "success": True,
        "message": "Agency rejected successfully",
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "email": agency.email,
            "verified": agency.verified,
            "status": agency.status
        }
    }, 200