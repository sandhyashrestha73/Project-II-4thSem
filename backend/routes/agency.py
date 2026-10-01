import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename

from database import db
from models.agency import Agency
from models.review import Review
from utils.authorization import role_required


agency_bp = Blueprint(
    "agency",
    __name__,
    url_prefix="/api/agency"
)


# =========================================================
# UPLOAD CONFIGURATION
# =========================================================

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


def delete_profile_image(image_path):

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
# UPLOAD / UPDATE AGENCY PROFILE IMAGE
#
# Agency can upload/update its own profile picture/logo.
# =========================================================

@agency_bp.route(
    "/profile-image",
    methods=["PUT"]
)
@role_required("agency")
def update_agency_profile_image():

    agency_id = int(get_jwt_identity())

    agency = Agency.query.get(agency_id)

    if not agency:
        return jsonify({
            "success": False,
            "message": "Agency not found"
        }), 404

    image_file = request.files.get("image")

    if not image_file:
        return jsonify({
            "success": False,
            "message": "Profile image is required"
        }), 400

    if not allowed_file(image_file.filename):
        return jsonify({
            "success": False,
            "message": (
                "Only PNG, JPG, JPEG and WEBP "
                "images are allowed"
            )
        }), 400

    new_image = save_profile_image(image_file)

    if not new_image:
        return jsonify({
            "success": False,
            "message": "Failed to save profile image"
        }), 400

    # Keep old image path before replacing it
    old_image = agency.profile_image

    # Save new image path in database
    agency.profile_image = new_image

    db.session.commit()

    # Delete old image after database update
    delete_profile_image(old_image)

    return jsonify({
        "success": True,
        "message": "Agency profile image updated successfully",
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "profile_image": agency.profile_image
        }
    }), 200


# =========================================================
# GET VERIFIED AGENCIES
# Public API
#
# Used by:
# - Home page verified agencies section
# - View All Agencies page
# =========================================================

@agency_bp.route(
    "/verified",
    methods=["GET"]
)
def get_verified_agencies():

    agencies = (
        Agency.query
        .filter(
            Agency.verified.is_(True),
            Agency.status == "Approved"
        )
        .order_by(
            Agency.created_at.desc()
        )
        .all()
    )

    result = []

    for agency in agencies:

        reviews = Review.query.filter_by(
            agency_id=agency.agency_id
        ).all()

        total_reviews = len(reviews)

        average_rating = (
            sum(review.rating for review in reviews)
            / total_reviews
            if total_reviews > 0
            else 0
        )

        result.append({
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name,
            "address": agency.address,
            "description": agency.description,
            "phone": agency.phone,
            "email": agency.email,

            # Profile image
            "profile_image": agency.profile_image,

            "verified": agency.verified,

            # Rating
            "average_rating": round(average_rating, 1),
            "total_reviews": total_reviews,

            # Recently Added
            "created_at": (
                agency.created_at.isoformat()
                if agency.created_at
                else None
            )
        })

    return jsonify(result), 200


# =========================================================
# GET SINGLE VERIFIED AGENCY
# Public Agency Profile
# =========================================================

@agency_bp.route(
    "/<int:agency_id>",
    methods=["GET"]
)
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

    # Get agency reviews
    reviews = Review.query.filter_by(
        agency_id=agency_id
    ).order_by(
        Review.created_at.desc()
    ).all()

    total_reviews = len(reviews)

    average_rating = (
        sum(review.rating for review in reviews)
        / total_reviews
        if total_reviews > 0
        else 0
    )

    return jsonify({
        "agency_id": agency.agency_id,
        "agency_name": agency.agency_name,
        "email": agency.email,
        "phone": agency.phone,
        "address": agency.address,
        "description": agency.description,
        "license_no": agency.license_no,

        # Profile image
        "profile_image": agency.profile_image,

        "verified": agency.verified,
        "status": agency.status,

        # Rating
        "average_rating": round(average_rating, 1),
        "total_reviews": total_reviews,

        "created_at": (
            agency.created_at.isoformat()
            if agency.created_at
            else None
        )
    }), 200

