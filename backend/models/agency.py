from database import db


class Agency(db.Model):
    __tablename__ = "agencies"

    agency_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    agency_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    license_no = db.Column(db.String(100), nullable=False, unique=True)
    verified = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )