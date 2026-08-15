
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

