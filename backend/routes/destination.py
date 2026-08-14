from flask import Blueprint, request

from database import db
from models.destination import Destination

destination_bp = Blueprint("destination", __name__)


@destination_bp.route("/api/destination", methods=["POST"])
def create_destination():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400
    
    name = data.get("name")
    district = data.get("district")
    description = data.get("description")
    image = data.get("image")

    if not name or not district or not description or not image:
        return{
             "success": False,
             "message": "Destination name , district, description and image are required"
        }, 400

    destination = Destination(
            
            name=name,
            district = district,
            description = description,
            image = image
        )
    
    db.session.add(destination)
    db.session.commit()
    
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



@destination_bp.route("/api/destination/<int:destination_id>", methods=["PUT"])
def update_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    if "name" in data:
        destination.name = data["name"]

    if "district" in data:
        destination.district = data["district"]

    if "description" in data:
        destination.description = data["description"]

    if "image" in data:
        destination.image = data["image"]

    db.session.commit()

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



@destination_bp.route("/api/destination/<int:destination_id>", methods=["DELETE"])
def delete_destination(destination_id):

    destination = Destination.query.get(destination_id)

    if not destination:
        return {
            "success": False,
            "message": "Destination not found"
        }, 404

    db.session.delete(destination)
    db.session.commit()

    return {
        "success": True,
        "message": "Destination deleted successfully"
    }, 200