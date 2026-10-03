import hashlib
import json
import os

from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity, get_jwt, jwt_required
from werkzeug.utils import secure_filename

from database import db
from models.package import Package
from models.agency import Agency
from models.review import Review
from models.destination import Destination
from utils.authorization import role_required
from services.package_comparison import compare_packages
from services.gemini_service import (
    generate_comparison_summary,
    AIServiceError,
)

package_bp = Blueprint("package", __name__)


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
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_image(image_file):
    """Save uploaded image and return its URL path."""

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
    """Delete physical image from uploads folder."""

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
# AGENCY NAME HELPER
# =========================================================

def get_agency_name(agency_id):
    """Return agency name from agency ID."""

    if not agency_id:
        return None

    agency = Agency.query.get(agency_id)

    if not agency:
        return None

    return agency.agency_name


# =========================================================
# PACKAGE RATING HELPER
# =========================================================

def get_package_rating(package_id):
    """
    Calculate average rating and total reviews
    for a specific package.
    """

    reviews = Review.query.filter_by(
        package_id=package_id
    ).all()

    total_reviews = len(reviews)

    average_rating = (
        sum(review.rating for review in reviews)
        / total_reviews
        if total_reviews > 0
        else 0
    )

    return round(average_rating, 1), total_reviews


# =========================================================
# CREATE PACKAGE
# =========================================================

@package_bp.route("/api/package", methods=["POST"])
@role_required("agency")
def create_package():

    agency_id = int(get_jwt_identity())

    destination_id = request.form.get("destination_id")
    package_name = request.form.get("package_name")
    description = request.form.get("description")
    duration = request.form.get("duration")
    price = request.form.get("price")

    image_file = request.files.get("image")

    if (
        not destination_id
        or not package_name
        or not description
        or not duration
        or price is None
    ):
        return {
            "success": False,
            "message": (
                "Destination ID, package name, description, "
                "duration and price are required"
            )
        }, 400

    image = None

    if image_file:
        image = save_image(image_file)

        if not image:
            return {
                "success": False,
                "message": (
                    "Only PNG, JPG, JPEG and WEBP "
                    "images are allowed"
                )
            }, 400

    package = Package(
        agency_id=agency_id,
        destination_id=destination_id,
        package_name=package_name,
        description=description,
        duration=duration,
        price=price,
        image=image
    )

    db.session.add(package)
    db.session.commit()

    average_rating, total_reviews = get_package_rating(
        package.package_id
    )

    return {
        "success": True,
        "message": "Package created successfully",
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "agency_name": get_agency_name(package.agency_id),
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image,
            "average_rating": average_rating,
            "total_reviews": total_reviews
        }
    }, 201


# =========================================================
# GET ALL PACKAGES
# =========================================================

@package_bp.route("/api/package", methods=["GET"])
def get_packages():

    packages = Package.query.all()

    package_list = []

    for package in packages:

        average_rating, total_reviews = get_package_rating(
            package.package_id
        )

        package_list.append({
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "agency_name": get_agency_name(package.agency_id),
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image,
            "average_rating": average_rating,
            "total_reviews": total_reviews
        })

    return {
        "success": True,
        "packages": package_list
    }, 200


# =========================================================
# GET SINGLE PACKAGE
# =========================================================

@package_bp.route("/api/package/<int:package_id>", methods=["GET"])
def get_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    average_rating, total_reviews = get_package_rating(
        package.package_id
    )

    return {
        "success": True,
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "agency_name": get_agency_name(package.agency_id),
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image,
            "average_rating": average_rating,
            "total_reviews": total_reviews
        }
    }, 200


# =========================================================
# UPDATE PACKAGE
# =========================================================

@package_bp.route("/api/package/<int:package_id>", methods=["PUT"])
@role_required("admin", "agency")
def update_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    # Agency can update only its own package
    if role == "agency" and package.agency_id != user_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    destination_id = request.form.get("destination_id")
    package_name = request.form.get("package_name")
    description = request.form.get("description")
    duration = request.form.get("duration")
    price = request.form.get("price")

    image_file = request.files.get("image")

    if destination_id:
        package.destination_id = destination_id

    if package_name:
        package.package_name = package_name

    if description:
        package.description = description

    if duration:
        package.duration = duration

    if price is not None:
        package.price = price

    # Admin can change agency if needed
    if role == "admin":

        agency_id = request.form.get("agency_id")

        if agency_id:
            package.agency_id = agency_id

    # Replace image if a new image was selected
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

        old_image = package.image

        package.image = new_image

        # Delete old physical image
        delete_image(old_image)

    db.session.commit()

    average_rating, total_reviews = get_package_rating(
        package.package_id
    )

    return {
        "success": True,
        "message": "Package updated successfully",
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "agency_name": get_agency_name(package.agency_id),
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image,
            "average_rating": average_rating,
            "total_reviews": total_reviews
        }
    }, 200


# =========================================================
# DELETE PACKAGE
# =========================================================

@package_bp.route("/api/package/<int:package_id>", methods=["DELETE"])
@role_required("admin", "agency")
def delete_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    # Agency can delete only its own package
    if role == "agency" and package.agency_id != user_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    old_image = package.image

    db.session.delete(package)
    db.session.commit()

    # Delete physical image
    delete_image(old_image)

    return {
        "success": True,
        "message": "Package deleted successfully"
    }, 200


# =========================================================
# AI PACKAGE COMPARISON
# =========================================================

# Simple in-memory cache: same two packages + same data = same summary.
_AI_CACHE = {}
_AI_CACHE_MAX = 200


def package_to_ai_data(package):
    """Collect trusted package data from the database."""

    average_rating, total_reviews = get_package_rating(package.package_id)
    destination = Destination.query.get(package.destination_id)

    try:
        price = float(package.price)
    except (TypeError, ValueError):
        price = None

    return {
        "package_id": package.package_id,
        "package_name": package.package_name,
        "agency_name": get_agency_name(package.agency_id),
        "destination": getattr(destination, "name", None),
        "duration": package.duration,
        "price": price,
        "description": package.description,
        "average_rating": average_rating,
        "total_reviews": total_reviews,
    }


def _valid_id(value):
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


@package_bp.route("/api/package/compare/ai", methods=["POST"])
@jwt_required()
def compare_packages_ai():

    data = request.get_json(silent=True) or {}
    id_1 = data.get("package_id_1")
    id_2 = data.get("package_id_2")

    if not _valid_id(id_1) or not _valid_id(id_2):
        return {
            "success": False,
            "message": "Two valid package IDs are required"
        }, 400

    if id_1 == id_2:
        return {
            "success": False,
            "message": "Please choose two different packages"
        }, 400

    package_1 = Package.query.get(id_1)
    package_2 = Package.query.get(id_2)

    if not package_1 or not package_2:
        return {
            "success": False,
            "message": "One or both packages were not found"
        }, 404

    package_a = package_to_ai_data(package_1)
    package_b = package_to_ai_data(package_2)

    # Python calculates the facts
    comparison = compare_packages(package_a, package_b)

    # Cache key: IDs + a hash of the data that goes to the AI
    data_hash = hashlib.sha256(
        json.dumps(
            [package_a, package_b], sort_keys=True, default=str
        ).encode("utf-8")
    ).hexdigest()
    cache_key = (id_1, id_2, data_hash)

    if cache_key in _AI_CACHE:
        return {
            "success": True,
            "cached": True,
            "comparison": comparison,
            "ai_summary": _AI_CACHE[cache_key]
        }, 200

    try:
        summary = generate_comparison_summary(
            package_a, package_b, comparison
        )
    except AIServiceError as error:
        current_app.logger.error("AI comparison failed: %s", error)
        return {
            "success": False,
            "message": "AI comparison is temporarily unavailable."
        }, 503

    if len(_AI_CACHE) >= _AI_CACHE_MAX:
        _AI_CACHE.clear()
    _AI_CACHE[cache_key] = summary

    return {
        "success": True,
        "cached": False,
        "comparison": comparison,
        "ai_summary": summary
    }, 200