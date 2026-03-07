from flask import Blueprint, request, jsonify
from services.dynamodb_service import create_user, get_user_by_email, get_user_by_id
from models.auth import check_password, generate_token, token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    try:
        user = create_user(name, email, password)

    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    token = generate_token(user["UserID"], user["Email"])

    return jsonify({
        "token": token,
        "user": user
    })


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if not user or not check_password(password, user["PasswordHash"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["UserID"], user["Email"])

    return jsonify({"token": token})


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():

    user = get_user_by_id(request.current_user_id)

    return jsonify(user)