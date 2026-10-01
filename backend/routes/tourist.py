import os

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename

from database import db
from models.tourists import Tourist
from utils.authorization import role_required


tourist_bp = Blueprint("tourist", __name__)


# ==========================================
# PROFILE IMAGE UPLOAD SETTINGS
# ==========================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


def save_profile_image(image_file):
    """
    Save tourist profile image inside backend/uploads/
    """

    if not image_file or not image_file.filename:
        return None

    if not allowed_file(image_file.filename):
        return None

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(image_file.filename)

    # Make filename unique
    import uuid

    extension = filename.rsplit(".", 1)[1].lower()

    final_filename = (
        f"tourist_{uuid.uuid4().hex}.{extension}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        final_filename
    )

    image_file.save(file_path)

    return f"/uploads/{final_filename}"


def delete_profile_image(image_path):
    """
    Delete old tourist profile image.
    """

    if not image_path:
        return

    filename = image_path.replace("/uploads/", "")

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass


# ==========================================
# UPDATE TOURIST PROFILE IMAGE
# ==========================================

@tourist_bp.route(
    "/api/tourist/profile-image",
    methods=["PUT"]
)
@role_required("tourist")
def update_tourist_profile_image():

    # Get logged-in tourist ID from JWT
    tourist_id = int(get_jwt_identity())

    tourist = Tourist.query.get(tourist_id)

    if not tourist:
        return jsonify({
            "success": False,
            "message": "Tourist not found"
        }), 404

    # Get uploaded image
    image_file = request.files.get("image")

    if not image_file:
        return jsonify({
            "success": False,
            "message": "Please select an image"
        }), 400

    if not image_file.filename:
        return jsonify({
            "success": False,
            "message": "Please select an image"
        }), 400

    # Check extension
    if not allowed_file(image_file.filename):
        return jsonify({
            "success": False,
            "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
        }), 400

    # Save new image
    new_image = save_profile_image(image_file)

    if not new_image:
        return jsonify({
            "success": False,
            "message": "Failed to save profile image"
        }), 500

    # Keep old image path
    old_image = tourist.profile_image

    # Update database
    tourist.profile_image = new_image

    try:
        db.session.commit()

        # Delete old image after successful database update
        delete_profile_image(old_image)

        return jsonify({
            "success": True,
            "message": "Profile image updated successfully",
            "tourist": {
                "tourist_id": tourist.tourist_id,
                "full_name": tourist.full_name,
                "email": tourist.email,
                "phone": tourist.phone,
                "profile_image": tourist.profile_image
            }
        }), 200

    except Exception as e:

        db.session.rollback()

        # Delete newly uploaded image if database update fails
        delete_profile_image(new_image)

        return jsonify({
            "success": False,
            "message": "Failed to update profile image",
            "error": str(e)
        }), 500

