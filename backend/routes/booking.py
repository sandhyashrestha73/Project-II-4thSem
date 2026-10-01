from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from zoneinfo import ZoneInfo

from database import db
from models.booking import Booking
from models.tourists import Tourist
from utils.authorization import role_required
from models.review import Review

booking_bp = Blueprint("booking", __name__)


# =========================================================
# CREATE BOOKING
# =========================================================

@booking_bp.route("/api/booking", methods=["POST"])
@role_required("tourist")
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

    if (
        not tourist_id
        or not package_id
        or not travel_date
        or persons is None
        or total_amount is None
    ):
        return {
            "success": False,
            "message": (
                "Tourist ID, package ID, travel date, "
                "persons and total amount are required"
            )
        }, 400

    if status not in [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ]:
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

    # =====================================================
    # CURRENT NEPAL DATE + TIME
    # =====================================================

    nepal_time = datetime.now(
        ZoneInfo("Asia/Kathmandu")
    )

    booking = Booking(
        tourist_id=tourist_id,
        package_id=package_id,
        booking_date=nepal_time,
        travel_date=travel_date,
        persons=persons,
        total_amount=total_amount,
        status=status
    )

    db.session.add(booking)
    db.session.commit()

    tourist = Tourist.query.get(booking.tourist_id)

    return {
        "success": True,
        "message": "Booking created successfully",
        "booking": {
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "tourist_name": (
                tourist.full_name
                if tourist
                else "Unknown Tourist"
            ),
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status
        }
    }, 201


# =========================================================
# GET ALL BOOKINGS
# =========================================================

@booking_bp.route("/api/booking", methods=["GET"])
@role_required("tourist", "agency", "admin")
def get_bookings():

    bookings = Booking.query.all()

    booking_list = []

    for booking in bookings:

        tourist = Tourist.query.get(
            booking.tourist_id
        )

        # Check whether this booking already has a review
        review = Review.query.filter_by(
            booking_id=booking.booking_id
        ).first()

        booking_list.append({
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "tourist_name": (
                tourist.full_name
                if tourist
                else "Unknown Tourist"
            ),
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status,

            # True = already reviewed
            # False = not reviewed yet
            "has_review": review is not None
        })

    return {
        "success": True,
        "bookings": booking_list
    }, 200


# =========================================================
# GET SINGLE BOOKING
# =========================================================

@booking_bp.route(
    "/api/booking/<int:booking_id>",
    methods=["GET"]
)
@role_required("tourist", "agency", "admin")
def get_booking(booking_id):

    booking = Booking.query.get(booking_id)

    if not booking:
        return {
            "success": False,
            "message": "Booking not found"
        }, 404

    tourist = Tourist.query.get(
        booking.tourist_id
    )

    # Check whether this booking already has a review
    review = Review.query.filter_by(
        booking_id=booking.booking_id
    ).first()

    return {
        "success": True,
        "booking": {
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "tourist_name": (
                tourist.full_name
                if tourist
                else "Unknown Tourist"
            ),
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status,

            # True = already reviewed
            # False = not reviewed yet
            "has_review": review is not None
        }
    }, 200


# =========================================================
# UPDATE BOOKING
# =========================================================

@booking_bp.route(
    "/api/booking/<int:booking_id>",
    methods=["PUT"]
)
@role_required("tourist", "agency", "admin")
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

        if data["status"] not in [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ]:
            return {
                "success": False,
                "message": "Invalid booking status"
            }, 400

        booking.status = data["status"]

    db.session.commit()

    tourist = Tourist.query.get(
        booking.tourist_id
    )

    return {
        "success": True,
        "message": "Booking updated successfully",
        "booking": {
            "booking_id": booking.booking_id,
            "tourist_id": booking.tourist_id,
            "tourist_name": (
                tourist.full_name
                if tourist
                else "Unknown Tourist"
            ),
            "package_id": booking.package_id,
            "booking_date": booking.booking_date,
            "travel_date": booking.travel_date,
            "persons": booking.persons,
            "total_amount": booking.total_amount,
            "status": booking.status
        }
    }, 200


# =========================================================
# DELETE BOOKING
# =========================================================

@booking_bp.route(
    "/api/booking/<int:booking_id>",
    methods=["DELETE"]
)
@role_required("admin")
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


# =========================================================
# CANCEL BOOKING
# =========================================================

@booking_bp.route(
    "/api/booking/<int:booking_id>/cancel",
    methods=["PUT"]
)
@role_required("tourist")
def cancel_booking(booking_id):

    booking = Booking.query.get(booking_id)

    if not booking:
        return {
            "success": False,
            "message": "Booking not found"
        }, 404

    # Get logged-in tourist ID from JWT
    tourist_id = int(get_jwt_identity())

    # Make sure the booking belongs to this tourist
    if booking.tourist_id != tourist_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    # Check current status
    if booking.status == "Cancelled":
        return {
            "success": False,
            "message": "Booking is already cancelled"
        }, 400

    booking.status = "Cancelled"

    db.session.commit()

    return {
        "success": True,
        "message": "Booking cancelled successfully",
        "booking": {
            "booking_id": booking.booking_id,
            "status": booking.status
        }
    }, 200