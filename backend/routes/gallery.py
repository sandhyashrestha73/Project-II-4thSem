import os

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename

from database import db
from models.gallery import Gallery
from models.agency import Agency
from utils.authorization import role_required


gallery_bp = Blueprint("gallery", __name__)


# =========================================================
# UPLOAD CONFIGURATION
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

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )

    filename = secure_filename(
        image_file.filename
    )

    base, extension = os.path.splitext(
        filename
    )

    counter = 1
    final_filename = filename

    while os.path.exists(
        os.path.join(
            UPLOAD_FOLDER,
            final_filename
        )
    ):
        final_filename = (
            f"{base}_{counter}{extension}"
        )
        counter += 1

    image_file.save(
        os.path.join(
            UPLOAD_FOLDER,
            final_filename
        )
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
# CREATE IMAGE
# =========================================================

@gallery_bp.route("/api/gallery", methods=["POST"])
@role_required("agency")
def create_gallery():

    title = request.form.get("title")
    agency_id = request.form.get("agency_id")
    image_file = request.files.get("image")

    if not agency_id or not title:
        return {
            "success": False,
            "message": "Agency ID and title are required"
        }, 400

    if not image_file:
        return {
            "success": False,
            "message": "Gallery image is required"
        }, 400

    if not allowed_file(image_file.filename):
        return {
            "success": False,
            "message": (
                "Only PNG, JPG, JPEG and WEBP "
                "images are allowed"
            )
        }, 400

    image = save_image(image_file)

    if not image:
        return {
            "success": False,
            "message": "Failed to save gallery image"
        }, 400

    gallery = Gallery(
        agency_id=agency_id,
        title=title,
        image=image
    )

    db.session.add(gallery)
    db.session.commit()

    return {
        "success": True,
        "message": "Gallery image added successfully",
        "gallery": {
            "image_id": gallery.image_id,
            "agency_id": gallery.agency_id,
            "agency_name": get_agency_name(gallery.agency_id),
            "title": gallery.title,
            "image": gallery.image,
            "uploaded_at": gallery.uploaded_at
        }
    }, 201


# =========================================================
# GET ALL IMAGES
# =========================================================

@gallery_bp.route("/api/gallery", methods=["GET"])
def get_gallery():

    galleries = Gallery.query.all()

    return {
        "success": True,
        "gallery": [
            {
                "image_id": gallery.image_id,
                "agency_id": gallery.agency_id,
                "agency_name": get_agency_name(gallery.agency_id),
                "title": gallery.title,
                "image": gallery.image,
                "uploaded_at": gallery.uploaded_at
            }
            for gallery in galleries
        ]
    }, 200


# =========================================================
# GET SINGLE IMAGE
# =========================================================

@gallery_bp.route(
    "/api/gallery/<int:image_id>",
    methods=["GET"]
)
def get_gallery_image(image_id):

    gallery = Gallery.query.get(image_id)

    if not gallery:
        return {
            "success": False,
            "message": "Gallery image not found"
        }, 404

    return {
        "success": True,
        "gallery": {
            "image_id": gallery.image_id,
            "agency_id": gallery.agency_id,
            "agency_name": get_agency_name(gallery.agency_id),
            "title": gallery.title,
            "image": gallery.image,
            "uploaded_at": gallery.uploaded_at
        }
    }, 200


# =========================================================
# UPDATE IMAGE
# =========================================================

@gallery_bp.route(
    "/api/gallery/<int:image_id>",
    methods=["PUT"]
)
@role_required("admin", "agency")
def update_gallery(image_id):

    gallery = Gallery.query.get(image_id)

    if not gallery:
        return {
            "success": False,
            "message": "Gallery image not found"
        }, 404

    title = request.form.get("title")
    image_file = request.files.get("image")

    if title:
        gallery.title = title

    if image_file:

        new_image = save_image(image_file)

        if not new_image:
            return {
                "success": False,
                "message": (
                    "Only PNG, JPG, JPEG and WEBP "
                    "images are allowed"
                )
            }, 400

        old_image = gallery.image

        gallery.image = new_image

        delete_image(old_image)

    db.session.commit()

    return {
        "success": True,
        "message": "Gallery image updated successfully",
        "gallery": {
            "image_id": gallery.image_id,
            "agency_id": gallery.agency_id,
            "agency_name": get_agency_name(gallery.agency_id),
            "title": gallery.title,
            "image": gallery.image,
            "uploaded_at": gallery.uploaded_at
        }
    }, 200


# =========================================================
# DELETE IMAGE
# =========================================================

@gallery_bp.route(
    "/api/gallery/<int:image_id>",
    methods=["DELETE"]
)
@role_required("admin", "agency")
def delete_gallery(image_id):

    gallery = Gallery.query.get(image_id)

    if not gallery:
        return {
            "success": False,
            "message": "Gallery image not found"
        }, 404

    image_path = gallery.image

    db.session.delete(gallery)
    db.session.commit()

    delete_image(image_path)

    return {
        "success": True,
        "message": "Gallery image deleted successfully"
    }, 200