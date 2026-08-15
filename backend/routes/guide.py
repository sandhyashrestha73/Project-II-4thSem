from flask import Blueprint, request

from database import db
from models.guide import Guide
from models.agency import Agency
from utils.authorization import role_required

guide_bp = Blueprint("guide", __name__)


@guide_bp.route("/api/guides", methods=["POST"])
@role_required("agency")
def create_guide():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    agency_id = data.get("agency_id")
    guide_name = data.get("guide_name")
    phone = data.get("phone")
    language = data.get("language")
    experience = data.get("experience", 0)

    # Check required fields
    if not agency_id or not guide_name or not phone or not language:
        return {
            "success": False,
            "message": "Agency ID, guide name, phone and language are required"
        }, 400

    # Check experience
    if experience < 0:
        return {
            "success": False,
            "message": "Experience cannot be negative"
        }, 400

    # Check whether agency exists
    agency = Agency.query.get(agency_id)

    if not agency:
        return {
            "success": False,
            "message": "Agency not found"
        }, 404

    # Create guide
    guide = Guide(
        agency_id=agency_id,
        guide_name=guide_name,
        phone=phone,
        language=language,
        experience=experience
    )

    db.session.add(guide)
    db.session.commit()

    return {
        "success": True,
        "message": "Guide created successfully",
        "guide": {
            "guide_id": guide.guide_id,
            "agency_id": guide.agency_id,
            "guide_name": guide.guide_name,
            "phone": guide.phone,
            "language": guide.language,
            "experience": guide.experience
        }
    }, 201



#get all guides
@guide_bp.route("/api/guides", methods=["GET"])
def get_guides():

    guides = Guide.query.all()

    return {
        "success": True,
        "guides": [
            {
                "guide_id": guide.guide_id,
                "agency_id": guide.agency_id,
                "guide_name": guide.guide_name,
                "phone": guide.phone,
                "language": guide.language,
                "experience": guide.experience
            }
            for guide in guides
        ]
    }, 200




#get one guides 
@guide_bp.route("/api/guides/<int:guide_id>", methods=["GET"])
def get_guide(guide_id):

    guide = Guide.query.get(guide_id)

    if not guide:
        return {
            "success": False,
            "message": "Guide not found"
        }, 404

    return {
        "success": True,
        "guide": {
            "guide_id": guide.guide_id,
            "agency_id": guide.agency_id,
            "guide_name": guide.guide_name,
            "phone": guide.phone,
            "language": guide.language,
            "experience": guide.experience
        }
    }, 200




@guide_bp.route("/api/guides/<int:guide_id>", methods=["PUT"])
@role_required("admin", "agency")
def update_guide(guide_id):

    guide = Guide.query.get(guide_id)

    if not guide:
        return {
            "success": False,
            "message": "Guide not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    if "guide_name" in data:
        guide.guide_name = data["guide_name"]

    if "phone" in data:
        guide.phone = data["phone"]

    if "language" in data:
        guide.language = data["language"]

    if "experience" in data:

        if data["experience"] < 0:
            return {
                "success": False,
                "message": "Experience cannot be negative"
            }, 400

        guide.experience = data["experience"]

    db.session.commit()

    return {
        "success": True,
        "message": "Guide updated successfully",
        "guide": {
            "guide_id": guide.guide_id,
            "agency_id": guide.agency_id,
            "guide_name": guide.guide_name,
            "phone": guide.phone,
            "language": guide.language,
            "experience": guide.experience
        }
    }, 200




@guide_bp.route("/api/guides/<int:guide_id>", methods=["DELETE"])
@role_required("admin", "agency")
def delete_guide(guide_id):

    guide = Guide.query.get(guide_id)

    if not guide:
        return {
            "success": False,
            "message": "Guide not found"
        }, 404

    db.session.delete(guide)
    db.session.commit()

    return {
        "success": True,
        "message": "Guide deleted successfully"
    }, 200


