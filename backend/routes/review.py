from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from database import db
from models.review import Review
from models.booking import Booking
from models.package import Package
from models.agency import Agency
from utils.authorization import role_required


review_bp = Blueprint("review", __name__)


# =========================================================
# CREATE REVIEW
# Tourist can review only their completed booking
# =========================================================

@review_bp.route("/api/review", methods=["POST"])
@role_required("tourist")
def create_review():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    booking_id = data.get("booking_id")
    rating = data.get("rating")
    review_text = data.get("review")

    # -------------------------
    # Basic validation
    # -------------------------

    if not booking_id or rating is None:
        return {
            "success": False,
            "message": "Booking ID and rating are required"
        }, 400

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return {
            "success": False,
            "message": "Rating must be a number from 1 to 5"
        }, 400

    if rating < 1 or rating > 5:
        return {
            "success": False,
            "message": "Rating must be between 1 and 5"
        }, 400

    # -------------------------
    # Logged-in tourist
    # -------------------------

    tourist_id = int(get_jwt_identity())

    # -------------------------
    # Find booking
    # -------------------------

    booking = Booking.query.get(booking_id)

    if not booking:
        return {
            "success": False,
            "message": "Booking not found"
        }, 404

    # -------------------------
    # Make sure booking belongs
    # to logged-in tourist
    # -------------------------

    if booking.tourist_id != tourist_id:
        return {
            "success": False,
            "message": "You can only review your own booking"
        }, 403

    # -------------------------
    # Booking must be completed
    # -------------------------

    if booking.status != "Completed":
        return {
            "success": False,
            "message": "You can review only completed bookings"
        }, 400

    # -------------------------
    # Check duplicate review
    # -------------------------

    existing_review = Review.query.filter_by(
        booking_id=booking.booking_id
    ).first()

    if existing_review:
        return {
            "success": False,
            "message": "You have already reviewed this booking"
        }, 409

    # -------------------------
    # Get package
    # -------------------------

    package = Package.query.get(booking.package_id)

    if not package:
        return {
            "success": False,
            "message": "Package not found"
        }, 404

    # Agency comes from package
    agency_id = package.agency_id

    # -------------------------
    # Create review
    # -------------------------

    new_review = Review(
        tourist_id=tourist_id,
        agency_id=agency_id,
        booking_id=booking.booking_id,
        rating=rating,
        review=review_text.strip()
        if isinstance(review_text, str)
        else None
    )

    db.session.add(new_review)
    db.session.commit()

    return {
        "success": True,
        "message": "Review submitted successfully",
        "review": {
            "review_id": new_review.review_id,
            "tourist_id": new_review.tourist_id,
            "agency_id": new_review.agency_id,
            "booking_id": new_review.booking_id,
            "rating": new_review.rating,
            "review": new_review.review,
            "created_at": (
                new_review.created_at.isoformat()
                if new_review.created_at
                else None
            )
        }
    }, 201


# =========================================================
# GET AGENCY REVIEWS
# Public
# =========================================================

@review_bp.route(
    "/api/agency/<int:agency_id>/reviews",
    methods=["GET"]
)
def get_agency_reviews(agency_id):

    agency = Agency.query.get(agency_id)

    if not agency:
        return {
            "success": False,
            "message": "Agency not found"
        }, 404

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

    return {
        "success": True,
        "agency": {
            "agency_id": agency.agency_id,
            "agency_name": agency.agency_name
        },
        "average_rating": round(average_rating, 1),
        "total_reviews": total_reviews,
        "reviews": [
            {
                "review_id": review.review_id,
                "tourist_id": review.tourist_id,
                "tourist_name": (
                    review.tourist.full_name
                    if review.tourist
                    else None
                ),
                "agency_id": review.agency_id,
                "agency_name": (
                    review.agency.agency_name
                    if review.agency
                    else None
                ),
                "booking_id": review.booking_id,
                "rating": review.rating,
                "review": review.review,
                "created_at": (
                    review.created_at.isoformat()
                    if review.created_at
                    else None
                )
            }
            for review in reviews
        ]
    }, 200