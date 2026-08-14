from flask import Blueprint, request

from database import db
from models.blog import Blog

blog_bp = Blueprint("blog", __name__)


# CREATE BLOG
@blog_bp.route("/api/blog", methods=["POST"])
def create_blog():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    agency_id = data.get("agency_id")
    title = data.get("title")
    content = data.get("content")
    image = data.get("image")

    if not agency_id or not title or not content:
        return {
            "success": False,
            "message": "Agency ID, title and content are required"
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


# GET ALL BLOGS
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


# GET SINGLE BLOG
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


# UPDATE BLOG
@blog_bp.route("/api/blog/<int:blog_id>", methods=["PUT"])
def update_blog(blog_id):

    blog = Blog.query.get(blog_id)

    if not blog:
        return {
            "success": False,
            "message": "Blog not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided"
        }, 400

    if "agency_id" in data:
        blog.agency_id = data["agency_id"]

    if "title" in data:
        blog.title = data["title"]

    if "content" in data:
        blog.content = data["content"]

    if "image" in data:
        blog.image = data["image"]

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


# DELETE BLOG
@blog_bp.route("/api/blog/<int:blog_id>", methods=["DELETE"])
def delete_blog(blog_id):

    blog = Blog.query.get(blog_id)

    if not blog:
        return {
            "success": False,
            "message": "Blog not found"
        }, 404

    db.session.delete(blog)
    db.session.commit()

    return {
        "success": True,
        "message": "Blog deleted successfully"
    }, 200