from database import db


class Booking(db.Model):
    __tablename__ = "bookings"

    booking_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    tourist_id = db.Column(
        db.Integer,
        db.ForeignKey("tourists.tourist_id"),
        nullable=False
    )

    package_id = db.Column(
        db.Integer,
        db.ForeignKey("packages.package_id"),
        nullable=False
    )

    booking_date = db.Column(
        db.Date,
        nullable=False,
        server_default=db.func.current_date()
    )

    travel_date = db.Column(db.Date, nullable=False)

    persons = db.Column(db.Integer, nullable=False)

    total_amount = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    status = db.Column(
        db.Enum("Pending", "Confirmed", "Cancelled"),
        nullable=False,
        default="Pending"
    )