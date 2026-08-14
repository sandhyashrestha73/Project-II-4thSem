from flask import Blueprint, request

from database import db
from models.gallery import Gallery

gallery_bp = Blueprint("gallery", __name__)


# CREATE IMAGE
@gallery_bp.route("/api/gallery", methods=["POST"])
def create_gallery():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    agency_id = data.get("agency_id")
    title = data.get("title")
    image = data.get("image")

    if not agency_id or not title or not image:
        return {
            "success": False,
            "message": "Agency ID, title and image are required"
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
            "title": gallery.title,
            "image": gallery.image,
            "uploaded_at": gallery.uploaded_at
        }
    }, 201


# GET ALL IMAGES
@gallery_bp.route("/api/gallery", methods=["GET"])
def get_gallery():

    galleries = Gallery.query.all()

    return {
        "success": True,
        "gallery": [
            {
                "image_id": gallery.image_id,
                "agency_id": gallery.agency_id,
                "title": gallery.title,
                "image": gallery.image,
                "uploaded_at": gallery.uploaded_at
            }
            for gallery in galleries
        ]
    }, 200


# GET SINGLE IMAGE
@gallery_bp.route("/api/gallery/<int:image_id>", methods=["GET"])
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
            "title": gallery.title,
            "image": gallery.image,
            "uploaded_at": gallery.uploaded_at
        }
    }, 200


# UPDATE IMAGE
@gallery_bp.route("/api/gallery/<int:image_id>", methods=["PUT"])
def update_gallery(image_id):

    gallery = Gallery.query.get(image_id)

    if not gallery:
        return {
            "success": False,
            "message": "Gallery image not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    if "agency_id" in data:
        gallery.agency_id = data["agency_id"]

    if "title" in data:
        gallery.title = data["title"]

    if "image" in data:
        gallery.image = data["image"]

    db.session.commit()

    return {
        "success": True,
        "message": "Gallery image updated successfully",
        "gallery": {
            "image_id": gallery.image_id,
            "agency_id": gallery.agency_id,
            "title": gallery.title,
            "image": gallery.image,
            "uploaded_at": gallery.uploaded_at
        }
    }, 200


# DELETE IMAGE
@gallery_bp.route("/api/gallery/<int:image_id>", methods=["DELETE"])
def delete_gallery(image_id):

    gallery = Gallery.query.get(image_id)

    if not gallery:
        return {
            "success": False,
            "message": "Gallery image not found"
        }, 404

    db.session.delete(gallery)
    db.session.commit()

    return {
        "success": True,
        "message": "Gallery image deleted successfully"
    }, 200