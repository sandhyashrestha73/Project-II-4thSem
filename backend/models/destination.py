from database import db


class Destination(db.Model):
    __tablename__ = "destinations"

    destination_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )
    name = db.Column(db.String(100), nullable=False, unique=True)
    district = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(255))