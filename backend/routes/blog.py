import os

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename

from database import db
from models.blog import Blog
from utils.authorization import role_required


blog_bp = Blueprint("blog", __name__)


# =========================================================
# UPLOAD CONFIGURATION
# =========================================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "uploads"
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


def save_image(image_file):

    if not image_file or not image_file.filename:
        return None

    if not allowed_file(image_file.filename):
        return None

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )

    filename = secure_filename(
        image_file.filename
    )

    base, extension = os.path.splitext(
        filename
    )

    counter = 1
    final_filename = filename

    while os.path.exists(
        os.path.join(
            UPLOAD_FOLDER,
            final_filename
        )
    ):
        final_filename = (
            f"{base}_{counter}{extension}"
        )
        counter += 1

    image_file.save(
        os.path.join(
            UPLOAD_FOLDER,
            final_filename
        )
    )

    return f"/uploads/{final_filename}"


def delete_image(image_path):

    if not image_path:
        return

    filename = image_path.split("/")[-1]

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if os.path.exists(file_path):
        os.remove(file_path)


# =========================================================
# CREATE BLOG
# =========================================================

@blog_bp.route("/api/blog", methods=["POST"])
@role_required("agency")
def create_blog():

    agency_id = int(get_jwt_identity())

    title = request.form.get("title")
    content = request.form.get("content")

    image_file = request.files.get("image")

    if not title or not content:
        return {
            "success": False,
            "message": "Title and content are required"
        }, 400

    image = None

    if image_file:
        image = save_image(image_file)

        if not image:
            return {
                "success": False,
                "message": (
                    "Only PNG, JPG, JPEG and WEBP "
                    "images are allowed"
                )
            }, 400

    blog = Blog(
        agency_id=agency_id,
        title=title,
        content=content,
        image=image
    )

    db.session.add(blog)
    db.session.commit()

    return {
        "success": True,
        "message": "Blog created successfully",
        "blog": {
            "blog_id": blog.blog_id,
            "agency_id": blog.agency_id,
            "title": blog.title,
            "content": blog.content,
            "image": blog.image,
            "created_at": blog.created_at
        }
    }, 201


# =========================================================
# GET ALL BLOGS
# =========================================================

@blog_bp.route("/api/blog", methods=["GET"])
def get_blogs():

    blogs = Blog.query.all()

    return {
        "success": True,
        "blogs": [
            {
                "blog_id": blog.blog_id,
                "agency_id": blog.agency_id,
                "title": blog.title,
                "content": blog.content,
                "image": blog.image,
                "created_at": blog.created_at
            }
            for blog in blogs
        ]
    }, 200


# =========================================================
# GET SINGLE BLOG
# =========================================================

@blog_bp.route("/api/blog/<int:blog_id>", methods=["GET"])
def get_blog(blog_id):

    blog = Blog.query.get(blog_id)

    if not blog:
        return {
            "success": False,
            "message": "Blog not found"
        }, 404

    return {
        "success": True,
        "blog": {
            "blog_id": blog.blog_id,
            "agency_id": blog.agency_id,
            "title": blog.title,
            "content": blog.content,
            "image": blog.image,
            "created_at": blog.created_at
        }
    }, 200


# =========================================================
# UPDATE BLOG
# =========================================================

@blog_bp.route("/api/blog/<int:blog_id>", methods=["PUT"])
@role_required("admin", "agency")
def update_blog(blog_id):

    blog = Blog.query.get(blog_id)

    if not blog:
        return {
            "success": False,
            "message": "Blog not found"
        }, 404

    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    # Agency can update only its own blog
    if role == "agency" and blog.agency_id != user_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    title = request.form.get("title")
    content = request.form.get("content")

    image_file = request.files.get("image")

    if title:
        blog.title = title

    if content:
        blog.content = content

    # Replace image if new image selected
    if image_file:

        new_image = save_image(
            image_file
        )

        if not new_image:
            return {
                "success": False,
                "message": (
                    "Only PNG, JPG, JPEG and WEBP "
                    "images are allowed"
                )
            }, 400

        old_image = blog.image

        blog.image = new_image

        delete_image(old_image)

    db.session.commit()

    return {
        "success": True,
        "message": "Blog updated successfully",
        "blog": {
            "blog_id": blog.blog_id,
            "agency_id": blog.agency_id,
            "title": blog.title,
            "content": blog.content,
            "image": blog.image,
            "created_at": blog.created_at
        }
    }, 200


# =========================================================
# DELETE BLOG
# =========================================================

@blog_bp.route("/api/blog/<int:blog_id>", methods=["DELETE"])
@role_required("admin", "agency")
def delete_blog(blog_id):

    blog = Blog.query.get(blog_id)

    if not blog:
        return {
            "success": False,
            "message": "Blog not found"
        }, 404

    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    # Agency can delete only its own blog
    if role == "agency" and blog.agency_id != user_id:
        return {
            "success": False,
            "message": "Access denied"
        }, 403

    old_image = blog.image

    db.session.delete(blog)
    db.session.commit()

    delete_image(old_image)

    return {
        "success": True,
        "message": "Blog deleted successfully"
    }, 200