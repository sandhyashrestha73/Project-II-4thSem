from database import db


class Guide(db.Model):
    __tablename__ = "guides"

    guide_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    agency_id = db.Column(
        db.Integer,
        db.ForeignKey("agencies.agency_id"),
        nullable=False
    )
    guide_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    language = db.Column(db.String(100), nullable=False)
    experience = db.Column(db.Integer, nullable=False, default=0)