from flask import Blueprint, request, jsonify
from models.auth import token_required
from services.dynamodb_service import (
    create_booking,
    get_bookings_by_user,
    get_booking_by_id,
)
from services.sns_service import (
    send_booking_confirmation,
    send_cancellation_notification,
)
from services.dynamodb_service import get_user_by_id

booking_bp = Blueprint("booking", __name__)


@booking_bp.route("/book", methods=["POST"])
@token_required
def book():

    data = request.get_json()

    booking = create_booking(
        user_id=request.current_user_id,
        item_type=data["itemType"],
        item_id=data["itemId"],
        seats=data.get("seats", 1),
    )

    user = get_user_by_id(request.current_user_id)

    send_booking_confirmation(booking, user)

    return jsonify({"booking": booking})


@booking_bp.route("/bookings")
@token_required
def bookings():

    bookings = get_bookings_by_user(request.current_user_id)

    return jsonify({
        "bookings": bookings,
        "count": len(bookings)
    })