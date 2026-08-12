from flask import Flask
from flask_cors import CORS

from config import Config
from database import db

app = Flask(__name__)

app.config.from_object(Config)

CORS(app)
db.init_app(app)



@app.route("/")
def home():
    return "Welcome to TourEase Nepal"
    


if __name__ == "__main__":
    app.run(debug=True)