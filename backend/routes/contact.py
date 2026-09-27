from flask import Blueprint, request

from database import db
from models.contact_message import ContactMessage
from utils.authorization import role_required


contact_bp = Blueprint("contact", __name__)


# =====================================================
# SEND CONTACT MESSAGE
# =====================================================

@contact_bp.route("/api/contact", methods=["POST"])
def create_contact_message():

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No data provided."
        }, 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not subject or not message:
        return {
            "success": False,
            "message": "All fields are required."
        }, 400

    contact_message = ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message
    )

    db.session.add(contact_message)
    db.session.commit()

    return {
        "success": True,
        "message": "Your message has been sent successfully."
    }, 201


# =====================================================
# GET ALL CONTACT MESSAGES - ADMIN ONLY
# =====================================================

@contact_bp.route("/api/admin/contact-messages", methods=["GET"])
@role_required("admin")
def get_contact_messages():

    messages = ContactMessage.query.order_by(
        ContactMessage.created_at.desc()
    ).all()

    return {
        "success": True,
        "count": len(messages),
        "messages": [
            {
                "message_id": item.message_id,
                "name": item.name,
                "email": item.email,
                "subject": item.subject,
                "message": item.message,
                "created_at": item.created_at
            }
            for item in messages
        ]
    }, 200