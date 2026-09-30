from database import db


class Review(db.Model):
    __tablename__ = "reviews"

    review_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    tourist_id = db.Column(
        db.Integer,
        db.ForeignKey("tourists.tourist_id"),
        nullable=False
    )

    agency_id = db.Column(
        db.Integer,
        db.ForeignKey("agencies.agency_id"),
        nullable=False
    )

    booking_id = db.Column(
        db.Integer,
        db.ForeignKey("bookings.booking_id"),
        nullable=False,
        unique=True
    )

    rating = db.Column(
        db.Integer,
        nullable=False
    )

    review = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    tourist = db.relationship(
        "Tourist",
        backref="reviews"
    )

    agency = db.relationship(
        "Agency",
        backref="reviews"
    )

    booking = db.relationship(
        "Booking",
        backref="review",
        uselist=False
    )