from database import db


class Gallery(db.Model):
    __tablename__ = "gallery"

    image_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    agency_id = db.Column(
        db.Integer,
        db.ForeignKey("agencies.agency_id"),
        nullable=False
    )

    title = db.Column(db.String(150), nullable=False)
    image = db.Column(db.String(255), nullable=False)

    uploaded_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )