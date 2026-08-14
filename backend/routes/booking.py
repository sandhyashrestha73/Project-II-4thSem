from flask import Blueprint, request

from database import db
from models.booking import Booking

booking_bp = Blueprint("booking", __name__)


# CREATE BOOKING
@booking_bp.route("/api/booking", methods=["POST"])
def create_booking():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    tourist_id = data.get("tourist_id")
    package_id = data.get("package_id")
    travel_date = data.get("travel_date")
    persons = data.get("persons")
    total_amount = data.get("total_amount")
    status = data.get("status", "Pending")

    if not tourist_id or not package_id or not travel_date or persons is None or total_amount is None:
        return {
            "success": False,
            "message": "Tourist ID, package ID, travel date, persons and total amount are required"
        }, 400

    if status not in ["Pending", "Confirmed", "Cancelled"]:
        return {
            "success": False,
            "message": "Invalid booking status"
        }, 400

    if persons <= 0:
        return {
            "success": False,
            "message": "Persons must be greater than 0"
        }, 400

    if total_amount < 0:
        return {
            "success": False,
            "message": "Total amount cannot be negative"
        }, 400

    booking = Booking(
        tourist_id=tourist_id,
        package_id=package_id,
        travel_date=travel_date,
        persons=persons,
        total_amount=total_amount,
        status=status
    )

    db.session.add(booking)
    db.session.commit()

    return {
        "success": True,
        "message": "Booking created successfully",
        "booking": {
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status
        }
    }, 201


# GET ALL BOOKINGS
@booking_bp.route("/api/booking", methods=["GET"])
def get_bookings():

    bookings = Booking.query.all()

    return {
        "success": True,
        "bookings": [
            {
                "booking_id": booking.booking_id,
                "tourist_id": booking.tourist_id,
                "package_id": booking.package_id,
                "booking_date": booking.booking_date,
                "travel_date": booking.travel_date,
                "persons": booking.persons,
                "total_amount": booking.total_amount,
                "status": booking.status
            }
            for booking in bookings
        ]
    }, 200


# GET SINGLE BOOKING
@booking_bp.route("/api/booking/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):

    booking = Booking.query.get(booking_id)

    if not booking:
        return {
            "success": False,
            "message": "Booking not found"
        }, 404

    return {
        "success": True,
        "booking": {
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status
        }
    }, 200


# UPDATE BOOKING
@booking_bp.route("/api/booking/<int:booking_id>", methods=["PUT"])
def update_booking(booking_id):

    booking = Booking.query.get(booking_id)

    if not booking:
        return {
            "success": False,
            "message": "Booking not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    if "tourist_id" in data:
        booking.tourist_id = data["tourist_id"]

    if "package_id" in data:
        booking.package_id = data["package_id"]

    if "travel_date" in data:
        booking.travel_date = data["travel_date"]

    if "persons" in data:
        if data["persons"] <= 0:
            return {
                "success": False,
                "message": "Persons must be greater than 0"
            }, 400

        booking.persons = data["persons"]

    if "total_amount" in data:
        if data["total_amount"] < 0:
            return {
                "success": False,
                "message": "Total amount cannot be negative"
            }, 400

        booking.total_amount = data["total_amount"]

    if "status" in data:

        if data["status"] not in ["Pending", "Confirmed", "Cancelled"]:
            return {
                "success": False,
                "message": "Invalid booking status"
            }, 400

        booking.status = data["status"]

    db.session.commit()

    return {
        "success": True,
        "message": "Booking updated successfully",
        "booking": {
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status
        }
    }, 200


# DELETE BOOKING
@booking_bp.route("/api/booking/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):

    booking = Booking.query.get(booking_id)

    if not booking:
        return {
            "success": False,
            "message": "Booking not found"
        }, 404

    db.session.delete(booking)
    db.session.commit()

    return {
        "success": True,
        "message": "Booking deleted successfully"
    }, 200