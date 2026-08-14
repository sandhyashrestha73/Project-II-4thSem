from flask import Blueprint, request

from database import db
from models.package import Package

package_bp = Blueprint("package", __name__)


# CREATE PACKAGE
@package_bp.route("/api/package", methods=["POST"])
def create_package():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    agency_id = data.get("agency_id")
    destination_id = data.get("destination_id")
    package_name = data.get("package_name")
    description = data.get("description")
    duration = data.get("duration")
    price = data.get("price")
    image = data.get("image")

    if not agency_id or not destination_id or not package_name or not description or not duration or price is None:
        return {
            "success": False,
            "message": "Agency ID, destination ID, package name, description, duration and price are required"
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
def update_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    if "agency_id" in data:
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
def delete_package(package_id):

    package = Package.query.get(package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    db.session.delete(package)
    db.session.commit()

    return {
        "success": True,
        "message": "Package deleted successfully"
    }, 200