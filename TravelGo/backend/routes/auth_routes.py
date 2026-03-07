from flask import Blueprint, request, jsonify
from services.dynamodb_service import create_user, get_user_by_email, get_user_by_id
from models.auth import check_password, generate_token, token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    try:
        user = create_user(name, email, password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    token = generate_token(user["UserID"], user["Email"])
    return jsonify({
        "message": "Registration successful",
        "token": token,
        "user": {"id": user["UserID"], "name": user["Name"], "email": user["Email"]},
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = get_user_by_email(email)
    if not user or not check_password(password, user.get("PasswordHash", "")):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["UserID"], user["Email"])
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": user["UserID"], "name": user["Name"], "email": user["Email"]},
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    user = get_user_by_id(request.current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user["UserID"],
        "name": user["Name"],
        "email": user["Email"],
        "createdAt": user.get("CreatedAt"),
    }), 200
