from database import db


class Package(db.Model):
    __tablename__ = "packages"

    package_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    agency_id = db.Column(
        db.Integer,
        db.ForeignKey("agencies.agency_id"),
        nullable=False
    )

    destination_id = db.Column(
        db.Integer,
        db.ForeignKey("destinations.destination_id"),
        nullable=False
    )

    package_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image = db.Column(db.String(255))