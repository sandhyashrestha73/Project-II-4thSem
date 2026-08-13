from app import app
from database import db
from models.admin import Admin
from werkzeug.security import generate_password_hash


with app.app_context():

    admin = Admin(
        username="admin",
        email="admin@tourease.com",
        password=generate_password_hash("admin123")
    )

    db.session.add(admin)
    db.session.commit()

    print("Admin created successfully!")