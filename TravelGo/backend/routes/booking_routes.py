from flask import Blueprint, request, jsonify
from services.dynamodb_service import (
    create_booking, get_bookings_by_user,
    get_booking_by_id, cancel_booking,
    get_transport_by_id, get_hotel_by_id, get_user_by_id,
)
from services.sns_service import send_booking_confirmation, send_cancellation_notification
from models.auth import token_required

booking_bp = Blueprint("booking", __name__)


@booking_bp.route("/book", methods=["POST"])
@token_required
def book():
    data = request.get_json(silent=True) or {}
    item_type = data.get("itemType")     # "Transport" | "Hotel"
    item_id = data.get("itemId")
    seats = int(data.get("seats", 1))
    selected_seats = data.get("selectedSeats", [])  # for bus seat selection

    if not item_type or not item_id:
        return jsonify({"error": "itemType and itemId are required"}), 400
    if item_type not in ("Transport", "Hotel"):
        return jsonify({"error": "itemType must be Transport or Hotel"}), 400

    # Validate item exists & has availability
    if item_type == "Transport":
        item = get_transport_by_id(item_id)
        if not item:
            return jsonify({"error": "Transport listing not found"}), 404
        available = int(item.get("SeatsAvailable", 0))
        if available < seats:
            return jsonify({"error": f"Only {available} seats available"}), 409
        extra = {
            "SelectedSeats": selected_seats,
            "TransportType": item.get("TransportType"),
            "Route": item.get("Route"),
            "Date": item.get("Date"),
            "Price": item.get("Price"),
        }
    else:
        item = get_hotel_by_id(item_id)
        if not item:
            return jsonify({"error": "Hotel not found"}), 404
        if int(item.get("RoomsAvailable", 0)) < 1:
            return jsonify({"error": "No rooms available"}), 409
        extra = {
            "HotelName": item.get("Name"),
            "Location": item.get("Location"),
            "Category": item.get("Category"),
            "Price": item.get("Price"),
            "CheckIn": data.get("checkIn"),
            "CheckOut": data.get("checkOut"),
        }
        seats = 1

    booking = create_booking(
        user_id=request.current_user_id,
        item_type=item_type,
        item_id=item_id,
        seats=seats,
        extra=extra,
    )

    # SNS notification (best-effort)
    user = get_user_by_id(request.current_user_id) or {}
    send_booking_confirmation(booking, user)

    return jsonify({"message": "Booking confirmed", "booking": booking}), 201


@booking_bp.route("/bookings", methods=["GET"])
@token_required
def list_bookings():
    bookings = get_bookings_by_user(request.current_user_id)
    # Sort newest first
    bookings.sort(key=lambda b: b.get("BookingDate", ""), reverse=True)
    return jsonify({"bookings": bookings, "count": len(bookings)}), 200


@booking_bp.route("/bookings/<booking_id>", methods=["GET"])
@token_required
def get_booking(booking_id):
    booking = get_booking_by_id(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking["UserID"] != request.current_user_id:
        return jsonify({"error": "Not authorized"}), 403
    return jsonify(booking), 200


@booking_bp.route("/cancel-booking/<booking_id>", methods=["DELETE"])
@token_required
def cancel(booking_id):
    try:
        booking = cancel_booking(booking_id, request.current_user_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    # SNS cancellation notification
    user = get_user_by_id(request.current_user_id) or {}
    send_cancellation_notification(booking, user)

    return jsonify({"message": "Booking cancelled", "booking": booking}), 200
