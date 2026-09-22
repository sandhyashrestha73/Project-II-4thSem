import os

from flask import Blueprint, request
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename

from database import db
from models.destination import Destination
from utils.authorization import role_required


destination_bp = Blueprint("destination", __name__)


# =========================
# IMAGE UPLOAD SETTINGS
# =========================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# =========================
# CREATE DESTINATION
# =========================

@destination_bp.route("/api/destination", methods=["POST"])
@role_required("admin")
def create_destination():

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

    filename = secure_filename(image_file.filename)

    # Same filename भए overwrite नहोस् भनेर unique filename
    base, extension = os.path.splitext(filename)

    counter = 1
    final_filename = filename

    while os.path.exists(os.path.join(UPLOAD_FOLDER, final_filename)):
        final_filename = f"{base}_{counter}{extension}"
        counter += 1

    image_file.save(
        os.path.join(UPLOAD_FOLDER, final_filename)
    )

    destination = Destination(
        name=name,
        district=district,
        description=description,
        image=f"/uploads/{final_filename}"
    )

    try:
        db.session.add(destination)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        # Database save नभए uploaded file हटाउने
        file_path = os.path.join(
            UPLOAD_FOLDER,
            final_filename
        )

        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "success": False,
            "message": "A destination with this name already exists"
        }, 409

    return {
        "success": True,
        "message": "Destination created successfully",
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "district": destination.district,
            "description": destination.description,
            "image": destination.image
        }
    }, 201


# =========================
# GET ALL DESTINATIONS
# =========================

@destination_bp.route("/api/destination", methods=["GET"])
def get_destinations():

    destinations = Destination.query.all()

    return {
        "success": True,
        "destinations": [
            {
                "destination_id": destination.destination_id,
                "name": destination.name,
                "district": destination.district,
                "description": destination.description,
                "image": destination.image
            }
            for destination in destinations
        ]
    }, 200


# =========================
# GET SINGLE DESTINATION
# =========================

@destination_bp.route("/api/destination/<int:destination_id>", methods=["GET"])
def get_destination(destination_id):

    destination = Destination.query.get(destination_id)

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
            "image": destination.image
        }
    }, 200


# =========================
# UPDATE DESTINATION
# =========================

@destination_bp.route("/api/destination/<int:destination_id>", methods=["PUT"])
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
        destination.name = name

    if district:
        destination.district = district

    if description:
        destination.description = description

    # New image selected भए मात्र update गर्ने
    if image_file:

        if not allowed_file(image_file.filename):
            return {
                "success": False,
                "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
            }, 400

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

        # पुरानो image delete गर्ने
        if destination.image:
            old_filename = destination.image.split("/")[-1]
            old_path = os.path.join(
                UPLOAD_FOLDER,
                old_filename
            )

            if os.path.exists(old_path):
                os.remove(old_path)

        destination.image = f"/uploads/{final_filename}"

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return {
            "success": False,
            "message": "A destination with this name already exists"
        }, 409

    return {
        "success": True,
        "message": "Destination updated successfully",
        "destination": {
            "destination_id": destination.destination_id,
            "name": destination.name,
            "district": destination.district,
            "description": destination.description,
            "image": destination.image
        }
    }, 200


# =========================
# DELETE DESTINATION
# =========================

@destination_bp.route("/api/destination/<int:destination_id>", methods=["DELETE"])
@role_required("admin")
def delete_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    try:
        # पुरानो image को path पहिले save गर्ने
        image_path = None

        if destination.image:
            old_filename = destination.image.split("/")[-1]
            image_path = os.path.join(
                UPLOAD_FOLDER,
                old_filename
            )

        db.session.delete(destination)
        db.session.commit()

        # Database बाट delete भएपछि मात्र image delete गर्ने
        if image_path and os.path.exists(image_path):
            os.remove(image_path)

        return {
            "success": True,
            "message": "Destination deleted successfully"
        }, 200

    except IntegrityError:
        db.session.rollback()

        return {
            "success": False,
            "message": "Cannot delete this destination because it is being used by one or more packages."
        }, 409