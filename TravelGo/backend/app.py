import os
import json
import uuid
import jwt
import bcrypt
import boto3
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

# =====================================================
# CONFIG
# =====================================================

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "travelgo-secret-change-in-prod")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")

    USERS_TABLE = os.getenv("USERS_TABLE", "TravelGo_Users")
    TRANSPORT_TABLE = os.getenv("TRANSPORT_TABLE", "TravelGo_TransportListings")
    HOTELS_TABLE = os.getenv("HOTELS_TABLE", "TravelGo_Hotels")
    BOOKINGS_TABLE = os.getenv("BOOKINGS_TABLE", "TravelGo_Bookings")

    SNS_BOOKING_TOPIC_ARN = os.getenv("SNS_BOOKING_TOPIC_ARN", "")
    SNS_CANCEL_TOPIC_ARN = os.getenv("SNS_CANCEL_TOPIC_ARN", "")

    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    ).split(",")

# =====================================================
# AUTH UTILITIES
# =====================================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def generate_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split(" ")[1]

        try:
            payload = decode_token(token)
            request.current_user_id = payload["sub"]
            request.current_user_email = payload["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated

# =====================================================
# AWS SERVICES
# =====================================================

def get_dynamodb():
    kwargs = {"region_name": Config.AWS_REGION}

    if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = Config.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = Config.AWS_SECRET_ACCESS_KEY

    return boto3.resource("dynamodb", **kwargs)

def get_sns_client():
    kwargs = {"region_name": Config.AWS_REGION}

    if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = Config.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = Config.AWS_SECRET_ACCESS_KEY

    return boto3.client("sns", **kwargs)

# =====================================================
# USER SERVICES
# =====================================================

def create_user(name, email, password):

    db = get_dynamodb()
    table = db.Table(Config.USERS_TABLE)

    resp = table.scan(FilterExpression=Attr("Email").eq(email))

    if resp.get("Items"):
        raise ValueError("Email already registered")

    user_id = str(uuid.uuid4())

    item = {
        "UserID": user_id,
        "Name": name,
        "Email": email,
        "PasswordHash": hash_password(password),
        "CreatedAt": datetime.utcnow().isoformat(),
    }

    table.put_item(Item=item)

    return item

def get_user_by_email(email):

    db = get_dynamodb()
    table = db.Table(Config.USERS_TABLE)

    resp = table.scan(FilterExpression=Attr("Email").eq(email))
    items = resp.get("Items", [])

    return items[0] if items else None

def get_user_by_id(user_id):

    db = get_dynamodb()
    table = db.Table(Config.USERS_TABLE)

    resp = table.get_item(Key={"UserID": user_id})

    return resp.get("Item")

# =====================================================
# SEARCH SERVICES
# =====================================================

def search_transport(transport_type=None, route=None, date=None, max_price=None):

    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)

    filter_expr = None

    def add(expr, new):
        return new if expr is None else expr & new

    if transport_type:
        filter_expr = add(filter_expr, Attr("TransportType").eq(transport_type))

    if route:
        filter_expr = add(filter_expr, Attr("Route").contains(route))

    if date:
        filter_expr = add(filter_expr, Attr("Date").eq(date))

    if max_price:
        filter_expr = add(filter_expr, Attr("Price").lte(float(max_price)))

    kwargs = {}

    if filter_expr:
        kwargs["FilterExpression"] = filter_expr

    resp = table.scan(**kwargs)

    return resp.get("Items", [])

def get_transport_by_id(transport_id):

    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)

    resp = table.get_item(Key={"TransportID": transport_id})

    return resp.get("Item")

def search_hotels(location=None, category=None, max_price=None):

    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)

    filter_expr = None

    def add(expr, new):
        return new if expr is None else expr & new

    if location:
        filter_expr = add(filter_expr, Attr("Location").contains(location))

    if category:
        filter_expr = add(filter_expr, Attr("Category").eq(category))

    if max_price:
        filter_expr = add(filter_expr, Attr("Price").lte(float(max_price)))

    kwargs = {}

    if filter_expr:
        kwargs["FilterExpression"] = filter_expr

    resp = table.scan(**kwargs)

    return resp.get("Items", [])

def get_hotel_by_id(hotel_id):

    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)

    resp = table.get_item(Key={"HotelID": hotel_id})

    return resp.get("Item")

# =====================================================
# BOOKING SERVICES
# =====================================================

def create_booking(user_id, item_type, item_id, seats=1, extra=None):

    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)

    booking_id = str(uuid.uuid4())

    item = {
        "BookingID": booking_id,
        "UserID": user_id,
        "ItemType": item_type,
        "ItemID": item_id,
        "Seats": seats,
        "BookingDate": datetime.utcnow().isoformat(),
        "Status": "Confirmed",
        **(extra or {}),
    }

    table.put_item(Item=item)

    return item

def get_bookings_by_user(user_id):

    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)

    resp = table.scan(FilterExpression=Attr("UserID").eq(user_id))

    return resp.get("Items", [])

def get_booking_by_id(booking_id):

    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)

    resp = table.get_item(Key={"BookingID": booking_id})

    return resp.get("Item")

# =====================================================
# SNS NOTIFICATIONS
# =====================================================

def send_booking_confirmation(booking, user):

    if not Config.SNS_BOOKING_TOPIC_ARN:
        return

    sns = get_sns_client()

    message = {
        "event": "BOOKING_CONFIRMED",
        "bookingId": booking.get("BookingID"),
        "userName": user.get("Name"),
        "userEmail": user.get("Email"),
    }

    sns.publish(
        TopicArn=Config.SNS_BOOKING_TOPIC_ARN,
        Subject="TravelGo Booking Confirmed",
        Message=json.dumps(message),
    )

def send_cancellation_notification(booking, user):

    if not Config.SNS_CANCEL_TOPIC_ARN:
        return

    sns = get_sns_client()

    message = {
        "event": "BOOKING_CANCELLED",
        "bookingId": booking.get("BookingID"),
        "userName": user.get("Name"),
    }

    sns.publish(
        TopicArn=Config.SNS_CANCEL_TOPIC_ARN,
        Subject="TravelGo Booking Cancelled",
        Message=json.dumps(message),
    )

# =====================================================
# FLASK APP
# =====================================================

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

# =====================================================
# AUTH ROUTES
# =====================================================

@app.route("/api/auth/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    try:
        user = create_user(name, email, password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    token = generate_token(user["UserID"], user["Email"])

    return jsonify({"token": token, "user": user})

@app.route("/api/auth/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if not user or not check_password(password, user["PasswordHash"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user["UserID"], user["Email"])

    return jsonify({"token": token})

@app.route("/api/auth/me")
@token_required
def me():

    user = get_user_by_id(request.current_user_id)

    return jsonify(user)

# =====================================================
# SEARCH ROUTES
# =====================================================

@app.route("/api/search/transport")
def transport_search():

    results = search_transport(
        transport_type=request.args.get("type"),
        route=request.args.get("route"),
        date=request.args.get("date"),
        max_price=request.args.get("max_price"),
    )

    return jsonify(results)

@app.route("/api/search/hotels")
def hotel_search():

    results = search_hotels(
        location=request.args.get("location"),
        category=request.args.get("category"),
        max_price=request.args.get("max_price"),
    )

    return jsonify(results)

# =====================================================
# BOOKING ROUTES
# =====================================================

@app.route("/api/book", methods=["POST"])
@token_required
def book():

    data = request.json

    booking = create_booking(
        user_id=request.current_user_id,
        item_type=data["itemType"],
        item_id=data["itemId"],
        seats=data.get("seats", 1),
    )

    user = get_user_by_id(request.current_user_id)

    send_booking_confirmation(booking, user)

    return jsonify(booking)

@app.route("/api/bookings")
@token_required
def bookings():

    results = get_bookings_by_user(request.current_user_id)

    return jsonify(results)

# =====================================================
# HEALTH
# =====================================================

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "TravelGo API"})

# =====================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)