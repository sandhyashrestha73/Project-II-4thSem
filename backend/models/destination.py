from database import db


class Destination(db.Model):
    __tablename__ = "destinations"

    destination_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    name = db.Column(
        db.String(100),
        nullable=False,
        unique=True
    )

    district = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    image = db.Column(
        db.String(255)
    )

    # Who created this destination?
    # admin / agency
    created_by_type = db.Column(
        db.String(20),
        nullable=False,
        default="admin"
    )

    # If agency created the destination,
    # this stores the agency ID.
    created_by_agency_id = db.Column(
        db.Integer,
        db.ForeignKey("agencies.agency_id"),
        nullable=True
    )

    # Pending / Approved / Rejected
    status = db.Column(
        db.String(20),
        nullable=False,
        default="Approved"
    )

    # Relationship with Agency
    created_by_agency = db.relationship(
        "Agency",
        foreign_keys=[created_by_agency_id]
    )