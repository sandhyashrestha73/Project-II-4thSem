'''
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt

from database import db
from models.package import Package
from utils.authorization import role_required

package_bp = Blueprint("package", __name__)


# CREATE PACKAGE
@package_bp.route("/api/package", methods=["POST"])
@role_required("agency")
def create_package():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    # Get agency ID from JWT instead of trusting request data
    agency_id = int(get_jwt_identity())

    destination_id = data.get("destination_id")
    package_name = data.get("package_name")
    description = data.get("description")
    duration = data.get("duration")
    price = data.get("price")
    image = data.get("image")

    if not destination_id or not package_name or not description or not duration or price is None:
        return {
            "success": False,
            "message": "Destination ID, package name, description, duration and price are required"
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

    return {
        "success": True,
        "message": "Package created successfully",
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image
        }
    }, 201


# GET ALL PACKAGES
@package_bp.route("/api/package", methods=["GET"])
def get_packages():

    packages = Package.query.all()

    return {
        "success": True,
        "packages": [
            {
                "package_id": package.package_id,
                "agency_id": package.agency_id,
                "destination_id": package.destination_id,
                "package_name": package.package_name,
                "description": package.description,
                "duration": package.duration,
                "price": package.price,
                "image": package.image
            }
            for package in packages
        ]
    }, 200


# GET SINGLE PACKAGE
@package_bp.route("/api/package/<int:package_id>", methods=["GET"])
def get_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    return {
        "success": True,
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image
        }
    }, 200


# UPDATE PACKAGE
@package_bp.route("/api/package/<int:package_id>", methods=["PUT"])
@role_required("admin", "agency")
def update_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    # Get role and identity from JWT
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    # Agency can update only its own package
    if role == "agency" and package.agency_id != user_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    # Agency ID cannot be changed by agency
    # Admin can change it if needed
    if role == "admin" and "agency_id" in data:
        package.agency_id = data["agency_id"]

    if "destination_id" in data:
        package.destination_id = data["destination_id"]

    if "package_name" in data:
        package.package_name = data["package_name"]

    if "description" in data:
        package.description = data["description"]

    if "duration" in data:
        package.duration = data["duration"]

    if "price" in data:
        package.price = data["price"]

    if "image" in data:
        package.image = data["image"]

    db.session.commit()

    return {
        "success": True,
        "message": "Package updated successfully",
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image
        }
    }, 200


# DELETE PACKAGE
@package_bp.route("/api/package/<int:package_id>", methods=["DELETE"])
@role_required("admin", "agency")
def delete_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    # Get role and identity from JWT
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    # Agency can delete only its own package
    if role == "agency" and package.agency_id != user_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    db.session.delete(package)
    db.session.commit()

    return {
        "success": True,
        "message": "Package deleted successfully"
    }, 200

'''



import os

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename

from database import db
from models.package import Package
from utils.authorization import role_required


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

    return {
        "success": True,
        "message": "Package created successfully",
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image
        }
    }, 201


# =========================================================
# GET ALL PACKAGES
# =========================================================

@package_bp.route("/api/package", methods=["GET"])
def get_packages():

    packages = Package.query.all()

    return {
        "success": True,
        "packages": [
            {
                "package_id": package.package_id,
                "agency_id": package.agency_id,
                "destination_id": package.destination_id,
                "package_name": package.package_name,
                "description": package.description,
                "duration": package.duration,
                "price": package.price,
                "image": package.image
            }
            for package in packages
        ]
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

    return {
        "success": True,
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image
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

    return {
        "success": True,
        "message": "Package updated successfully",
        "package": {
            "package_id": package.package_id,
            "agency_id": package.agency_id,
            "destination_id": package.destination_id,
            "package_name": package.package_name,
            "description": package.description,
            "duration": package.duration,
            "price": package.price,
            "image": package.image
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