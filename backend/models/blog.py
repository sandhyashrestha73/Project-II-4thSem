from database import db


class Blog(db.Model):
    __tablename__ = "blogs"

    blog_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    agency_id = db.Column(
        db.Integer,
        db.ForeignKey("agencies.agency_id"),
        nullable=False
    )

    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(255))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )