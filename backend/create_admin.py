'''from app import app
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

    '''





from app import app
from database import db
from models.admin import Admin
from werkzeug.security import generate_password_hash
from getpass import getpass


with app.app_context():

    admin = Admin.query.first()

    if not admin:
        print("No admin account found.")
    else:
        new_email = input("Enter new admin email: ").strip()
        new_password = getpass("Enter new admin password: ")

        admin.email = new_email
        admin.password = generate_password_hash(new_password)

        db.session.commit()

        print("Admin credentials updated successfully!")

