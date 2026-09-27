from flask import Blueprint, jsonify
from models.agency import Agency

agency_bp = Blueprint("agency", __name__, url_prefix="/api/agency")


# =========================================================
# GET VERIFIED AGENCIES
# Public API - Home page मा verified agencies देखाउन
# =========================================================
@agency_bp.route("/verified", methods=["GET"])
def get_verified_agencies():
    agencies = Agency.query.filter_by(
        verified=True,
        status="Approved"
    ).order_by(
        Agency.created_at.desc()
    ).all()

    return jsonify([
        {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "address": agency.address,
            "description": agency.description,
            "phone": agency.phone,
            "email": agency.email,
            "verified": agency.verified
        }
        for agency in agencies
    ]), 200


# =========================================================
# GET SINGLE VERIFIED AGENCY
# Public profile page
# =========================================================
@agency_bp.route("/<int:agency_id>", methods=["GET"])
def get_agency_profile(agency_id):
    agency = Agency.query.filter_by(
        agency_id=agency_id,
        verified=True,
        status="Approved"
    ).first()

    if not agency:
        return jsonify({
            "message": "Verified agency not found"
        }), 404

    return jsonify({
        "agency_id": agency.agency_id,
        "agency_name": agency.agency_name,
        "email": agency.email,
        "phone": agency.phone,
        "address": agency.address,
        "description": agency.description,
        "license_no": agency.license_no,
        "verified": agency.verified,
        "status": agency.status,
        "created_at": agency.created_at.isoformat()
        if agency.created_at else None
    }), 200