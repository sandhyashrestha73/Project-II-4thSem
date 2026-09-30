import os

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename

from database import db
from models.destination import Destination
from models.agency import Agency
from utils.authorization import role_required


destination_bp = Blueprint("destination", __name__)


# =========================================================
# IMAGE UPLOAD SETTINGS
# =========================================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


def save_image(image_file):
    if not image_file or not image_file.filename:
        return None

    if not allowed_file(image_file.filename):
        return None

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(image_file.filename)

    base, extension = os.path.splitext(filename)

    counter = 1
    final_filename = filename

    while os.path.exists(
        os.path.join(UPLOAD_FOLDER, final_filename)
    ):
        final_filename = f"{base}_{counter}{extension}"
        counter += 1

    image_file.save(
        os.path.join(UPLOAD_FOLDER, final_filename)
    )

    return f"/uploads/{final_filename}"


def delete_image(image_path):
    if not image_path:
        return

    filename = image_path.split("/")[-1]

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if os.path.exists(file_path):
        os.remove(file_path)


# =========================================================
# GET AGENCY NAME
# =========================================================

def get_agency_name(agency_id):
    if not agency_id:
        return None

    agency = Agency.query.get(agency_id)

    if not agency:
        return None

    return agency.agency_name


# =========================================================
# CREATE DESTINATION
# ADMIN + AGENCY
# =========================================================

@destination_bp.route("/api/destination", methods=["POST"])
@role_required("admin", "agency")
def create_destination():

    claims = get_jwt()
    role = claims.get("role")

    name = request.form.get("name")
    district = request.form.get("district")
    description = request.form.get("description")

    image_file = request.files.get("image")

    if not name or not district or not description:
        return {
            "success": False,
            "message": "Destination name, district and description are required"
        }, 400

    if not image_file:
        return {
            "success": False,
            "message": "Destination image is required"
        }, 400

    if not allowed_file(image_file.filename):
        return {
            "success": False,
            "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
        }, 400

    image = save_image(image_file)

    if not image:
        return {
            "success": False,
            "message": "Failed to save destination image"
        }, 400

    # =====================================================
    # ADMIN
    # =====================================================

    if role == "admin":

        created_by_type = "admin"
        created_by_agency_id = None
        status = "Approved"

    # =====================================================
    # AGENCY
    # =====================================================

    else:

        agency_id = int(get_jwt_identity())

        created_by_type = "agency"
        created_by_agency_id = agency_id
        status = "Pending"

    destination = Destination(
        name=name.strip(),
        district=district.strip(),
        description=description.strip(),
        image=image,
        created_by_type=created_by_type,
        created_by_agency_id=created_by_agency_id,
        status=status
    )

    try:

        db.session.add(destination)
        db.session.commit()

    except IntegrityError:

        db.session.rollback()
        delete_image(image)

        return {
            "success": False,
            "message": "A destination with this name already exists"
        }, 409

    if role == "agency":

        message = (
            "Destination submitted successfully. "
            "Waiting for admin approval."
        )

    else:

        message = "Destination created successfully."

    return {
        "success": True,
        "message": message,
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "district": destination.district,
            "description": destination.description,
            "image": destination.image,
            "created_by_type": destination.created_by_type,
            "created_by_agency_id": destination.created_by_agency_id,
            "created_by_agency_name": get_agency_name(
                destination.created_by_agency_id
            ),
            "status": destination.status
        }
    }, 201


# =========================================================
# PUBLIC - APPROVED DESTINATIONS
# =========================================================

@destination_bp.route("/api/destination", methods=["GET"])
def get_destinations():

    destinations = Destination.query.filter_by(
        status="Approved"
    ).all()

    return {
        "success": True,
        "destinations": [
            {
                "destination_id": destination.destination_id,
                "name": destination.name,
                "district": destination.district,
                "description": destination.description,
                "image": destination.image,
                "created_by_type": destination.created_by_type,
                "created_by_agency_id": destination.created_by_agency_id,
                "created_by_agency_name": get_agency_name(
                    destination.created_by_agency_id
                ),
                "status": destination.status
            }
            for destination in destinations
        ]
    }, 200


# =========================================================
# PUBLIC - SINGLE APPROVED DESTINATION
# =========================================================

@destination_bp.route(
    "/api/destination/<int:destination_id>",
    methods=["GET"]
)
def get_destination(destination_id):

    destination = Destination.query.filter_by(
        destination_id=destination_id,
        status="Approved"
    ).first()

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    return {
        "success": True,
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "district": destination.district,
            "description": destination.description,
            "image": destination.image,
            "created_by_type": destination.created_by_type,
            "created_by_agency_id": destination.created_by_agency_id,
            "created_by_agency_name": get_agency_name(
                destination.created_by_agency_id
            ),
            "status": destination.status
        }
    }, 200


# =========================================================
# AGENCY - OWN DESTINATIONS
# Pending + Approved + Rejected
# =========================================================

@destination_bp.route(
    "/api/agency/destinations",
    methods=["GET"]
)
@role_required("agency")
def get_agency_destinations():

    agency_id = int(get_jwt_identity())

    destinations = Destination.query.filter_by(
        created_by_agency_id=agency_id
    ).order_by(
        Destination.destination_id.desc()
    ).all()

    return {
        "success": True,
        "destinations": [
            {
                "destination_id": destination.destination_id,
                "name": destination.name,
                "district": destination.district,
                "description": destination.description,
                "image": destination.image,
                "created_by_type": destination.created_by_type,
                "created_by_agency_id": destination.created_by_agency_id,
                "created_by_agency_name": get_agency_name(
                    destination.created_by_agency_id
                ),
                "status": destination.status
            }
            for destination in destinations
        ]
    }, 200


# =========================================================
# ADMIN - ALL DESTINATIONS
# =========================================================

@destination_bp.route(
    "/api/admin/destinations",
    methods=["GET"]
)
@role_required("admin")
def get_all_destinations():

    destinations = Destination.query.all()

    return {
        "success": True,
        "destinations": [
            {
                "destination_id": destination.destination_id,
                "name": destination.name,
                "district": destination.district,
                "description": destination.description,
                "image": destination.image,
                "created_by_type": destination.created_by_type,
                "created_by_agency_id": destination.created_by_agency_id,
                "created_by_agency_name": get_agency_name(
                    destination.created_by_agency_id
                ),
                "status": destination.status
            }
            for destination in destinations
        ]
    }, 200


# =========================================================
# ADMIN - PENDING DESTINATIONS
# =========================================================

@destination_bp.route(
    "/api/admin/destinations/pending",
    methods=["GET"]
)
@role_required("admin")
def get_pending_destinations():

    destinations = Destination.query.filter_by(
        status="Pending"
    ).all()

    return {
        "success": True,
        "count": len(destinations),
        "destinations": [
            {
                "destination_id": destination.destination_id,
                "name": destination.name,
                "district": destination.district,
                "description": destination.description,
                "image": destination.image,
                "created_by_type": destination.created_by_type,
                "created_by_agency_id": destination.created_by_agency_id,
                "created_by_agency_name": get_agency_name(
                    destination.created_by_agency_id
                ),
                "status": destination.status
            }
            for destination in destinations
        ]
    }, 200


# =========================================================
# ADMIN - APPROVE DESTINATION
# =========================================================

@destination_bp.route(
    "/api/admin/destinations/<int:destination_id>/approve",
    methods=["PUT"]
)
@role_required("admin")
def approve_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    destination.status = "Approved"

    db.session.commit()

    return {
        "success": True,
        "message": "Destination approved successfully",
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "status": destination.status
        }
    }, 200


# =========================================================
# ADMIN - REJECT DESTINATION
# =========================================================

@destination_bp.route(
    "/api/admin/destinations/<int:destination_id>/reject",
    methods=["PUT"]
)
@role_required("admin")
def reject_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    destination.status = "Rejected"

    db.session.commit()

    return {
        "success": True,
        "message": "Destination rejected successfully",
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "status": destination.status
        }
    }, 200


# =========================================================
# UPDATE DESTINATION
# ADMIN ONLY
# =========================================================

@destination_bp.route(
    "/api/destination/<int:destination_id>",
    methods=["PUT"]
)
@role_required("admin")
def update_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    name = request.form.get("name")
    district = request.form.get("district")
    description = request.form.get("description")

    image_file = request.files.get("image")

    if name:
        destination.name = name.strip()

    if district:
        destination.district = district.strip()

    if description:
        destination.description = description.strip()

    old_image = None

    if image_file:

        new_image = save_image(image_file)

        if not new_image:
            return {
                "success": False,
                "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
            }, 400

        old_image = destination.image
        destination.image = new_image

    try:

        db.session.commit()

    except IntegrityError:

        db.session.rollback()

        if image_file:
            delete_image(destination.image)

        return {
            "success": False,
            "message": "A destination with this name already exists"
        }, 409

    if old_image:
        delete_image(old_image)

    return {
        "success": True,
        "message": "Destination updated successfully",
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "district": destination.district,
            "description": destination.description,
            "image": destination.image,
            "created_by_type": destination.created_by_type,
            "created_by_agency_id": destination.created_by_agency_id,
            "created_by_agency_name": get_agency_name(
                destination.created_by_agency_id
            ),
            "status": destination.status
        }
    }, 200


# =========================================================
# DELETE DESTINATION
# ADMIN ONLY
# =========================================================

@destination_bp.route(
    "/api/destination/<int:destination_id>",
    methods=["DELETE"]
)
@role_required("admin")
def delete_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    image_path = destination.image

    try:

        db.session.delete(destination)
        db.session.commit()

    except IntegrityError:

        db.session.rollback()

        return {
            "success": False,
            "message": (
                "Cannot delete this destination because "
                "it is being used by one or more packages."
            )
        }, 409

    delete_image(image_path)

    return {
        "success": True,
        "message": "Destination deleted successfully"
    }, 200