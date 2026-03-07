from flask import Blueprint, request, jsonify
from services.dynamodb_service import (
    search_transport, get_transport_by_id,
    search_hotels, get_hotel_by_id,
)

search_bp = Blueprint("search", __name__)


@search_bp.route("/search/transport", methods=["GET"])
def search_transport_route():
    transport_type = request.args.get("type")          # Bus | Train | Flight
    route = request.args.get("route")
    date = request.args.get("date")
    max_price = request.args.get("max_price")

    results = search_transport(
        transport_type=transport_type,
        route=route,
        date=date,
        max_price=float(max_price) if max_price else None,
    )
    return jsonify({"results": results, "count": len(results)}), 200


@search_bp.route("/search/transport/<transport_id>", methods=["GET"])
def get_transport(transport_id):
    item = get_transport_by_id(transport_id)
    if not item:
        return jsonify({"error": "Transport not found"}), 404
    return jsonify(item), 200


@search_bp.route("/search/hotels", methods=["GET"])
def search_hotels_route():
    location = request.args.get("location")
    category = request.args.get("category")       # Luxury | Budget | Family
    max_price = request.args.get("max_price")
    date = request.args.get("date")

    results = search_hotels(
        location=location,
        category=category,
        max_price=float(max_price) if max_price else None,
        date=date,
    )
    return jsonify({"results": results, "count": len(results)}), 200


@search_bp.route("/search/hotels/<hotel_id>", methods=["GET"])
def get_hotel(hotel_id):
    item = get_hotel_by_id(hotel_id)
    if not item:
        return jsonify({"error": "Hotel not found"}), 404
    return jsonify(item), 200
