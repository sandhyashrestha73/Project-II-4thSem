from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager


from config import Config
from database import db


from models.tourists import Tourist
from models.agency import Agency
from models.guide import Guide
from models.destination import Destination
from models.package import Package
from models.booking import Booking
from models.blog import Blog
from models.gallery import Gallery
from models.admin import Admin


from routes.auth import auth_bp
from routes.guide import guide_bp
from routes.destination import destination_bp
from routes.package import package_bp
from routes.booking import booking_bp
from routes.blog import blog_bp
from routes.gallery import gallery_bp
app = Flask(__name__)

app.config.from_object(Config)
JWTManager(app)


CORS(app)
db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(guide_bp)
app.register_blueprint(destination_bp)
app.register_blueprint(package_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(blog_bp)
app.register_blueprint(gallery_bp)

@app.route("/")
def home():
    return "Welcome to TourEase Nepal"
    

@app.route("/api/test-db")
def test_db():
    try:
        db.session.execute(db.text("SELECT 1"))
        return {
                "success": True,
                "message": "Database connection successful!"
            }  
        
    except Exception as e:
        return {
             "success": False,
            "error": str(e)
        }, 500
    



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)