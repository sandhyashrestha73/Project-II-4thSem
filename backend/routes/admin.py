
from flask import Blueprint

from database import db
from models.agency import Agency
from utils.authorization import role_required

admin_bp = Blueprint("admin", __name__)


# =========================
# GET PENDING AGENCIES
# =========================
@admin_bp.route("/api/admin/agencies/pending", methods=["GET"])
@role_required("admin")
def get_pending_agencies():

    agencies = Agency.query.filter_by(status="Pending").all()

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


# =========================
# APPROVE AGENCY
# =========================
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

    agency.verified = True
    agency.status = "Approved"

    db.session.commit()

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


# =========================
# REJECT AGENCY
# =========================
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

    agency.verified = False
    agency.status = "Rejected"

    db.session.commit()

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

