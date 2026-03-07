import boto3
import bcrypt
import uuid
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from config import Config


def get_dynamodb():
    """Return a DynamoDB resource using config credentials."""
    kwargs = {"region_name": Config.AWS_REGION}
    if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = Config.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = Config.AWS_SECRET_ACCESS_KEY
    return boto3.resource("dynamodb", **kwargs)


# ─────────────────────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────────────────────

def create_user(name: str, email: str, password: str) -> dict:
    """Register a new user. Returns the created user or raises on duplicate."""
    db = get_dynamodb()
    table = db.Table(Config.USERS_TABLE)

    # Check duplicate email
    resp = table.scan(FilterExpression=Attr("Email").eq(email))
    if resp.get("Items"):
        raise ValueError("Email already registered")

    user_id = str(uuid.uuid4())
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    item = {
        "UserID": user_id,
        "Name": name,
        "Email": email,
        "PasswordHash": hashed,
        "CreatedAt": datetime.utcnow().isoformat(),
    }
    table.put_item(Item=item)
    return {k: v for k, v in item.items() if k != "PasswordHash"}


def get_user_by_email(email: str) -> dict | None:
    """Fetch a single user by email."""
    db = get_dynamodb()
    table = db.Table(Config.USERS_TABLE)
    resp = table.scan(FilterExpression=Attr("Email").eq(email))
    items = resp.get("Items", [])
    return items[0] if items else None


def get_user_by_id(user_id: str) -> dict | None:
    db = get_dynamodb()
    table = db.Table(Config.USERS_TABLE)
    resp = table.get_item(Key={"UserID": user_id})
    return resp.get("Item")


# ─────────────────────────────────────────────────────────────
# TRANSPORT LISTINGS
# ─────────────────────────────────────────────────────────────

def search_transport(transport_type: str = None, route: str = None,
                     date: str = None, max_price: float = None) -> list:
    """Search transport listings with optional filters."""
    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)

    filter_expr = None

    def _add(expr, new):
        return new if expr is None else expr & new

    if transport_type:
        filter_expr = _add(filter_expr, Attr("TransportType").eq(transport_type))
    if route:
        filter_expr = _add(filter_expr, Attr("Route").contains(route))
    if date:
        filter_expr = _add(filter_expr, Attr("Date").eq(date))
    if max_price:
        filter_expr = _add(filter_expr, Attr("Price").lte(float(max_price)))

    kwargs = {}
    if filter_expr:
        kwargs["FilterExpression"] = filter_expr

    resp = table.scan(**kwargs)
    return resp.get("Items", [])


def get_transport_by_id(transport_id: str) -> dict | None:
    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)
    resp = table.get_item(Key={"TransportID": transport_id})
    return resp.get("Item")


def update_transport_seats(transport_id: str, delta: int):
    """Increment (+) or decrement (–) available seats atomically."""
    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)
    table.update_item(
        Key={"TransportID": transport_id},
        UpdateExpression="SET SeatsAvailable = SeatsAvailable + :d",
        ExpressionAttributeValues={":d": delta},
    )


# ─────────────────────────────────────────────────────────────
# HOTELS
# ─────────────────────────────────────────────────────────────

def search_hotels(location: str = None, category: str = None,
                  max_price: float = None, date: str = None) -> list:
    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)

    filter_expr = None

    def _add(expr, new):
        return new if expr is None else expr & new

    if location:
        filter_expr = _add(filter_expr, Attr("Location").contains(location))
    if category:
        filter_expr = _add(filter_expr, Attr("Category").eq(category))
    if max_price:
        filter_expr = _add(filter_expr, Attr("Price").lte(float(max_price)))

    kwargs = {}
    if filter_expr:
        kwargs["FilterExpression"] = filter_expr

    resp = table.scan(**kwargs)
    return resp.get("Items", [])


def get_hotel_by_id(hotel_id: str) -> dict | None:
    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)
    resp = table.get_item(Key={"HotelID": hotel_id})
    return resp.get("Item")


def update_hotel_rooms(hotel_id: str, delta: int):
    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)
    table.update_item(
        Key={"HotelID": hotel_id},
        UpdateExpression="SET RoomsAvailable = RoomsAvailable + :d",
        ExpressionAttributeValues={":d": delta},
    )


# ─────────────────────────────────────────────────────────────
# BOOKINGS
# ─────────────────────────────────────────────────────────────

def create_booking(user_id: str, item_type: str, item_id: str,
                   seats: int = 1, extra: dict = None) -> dict:
    """Create a booking record and decrement availability."""
    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)

    booking_id = str(uuid.uuid4())
    item = {
        "BookingID": booking_id,
        "UserID": user_id,
        "ItemType": item_type,       # "Transport" | "Hotel"
        "ItemID": item_id,
        "Seats": seats,
        "BookingDate": datetime.utcnow().isoformat(),
        "Status": "Confirmed",
        **(extra or {}),
    }
    table.put_item(Item=item)

    # Update availability
    if item_type == "Transport":
        update_transport_seats(item_id, -seats)
    else:
        update_hotel_rooms(item_id, -1)

    return item


def get_bookings_by_user(user_id: str) -> list:
    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)
    resp = table.scan(FilterExpression=Attr("UserID").eq(user_id))
    return resp.get("Items", [])


def get_booking_by_id(booking_id: str) -> dict | None:
    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)
    resp = table.get_item(Key={"BookingID": booking_id})
    return resp.get("Item")


def cancel_booking(booking_id: str, user_id: str) -> dict:
    """Mark booking as Cancelled and restore availability."""
    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)

    booking = get_booking_by_id(booking_id)
    if not booking:
        raise ValueError("Booking not found")
    if booking["UserID"] != user_id:
        raise PermissionError("Not authorized to cancel this booking")
    if booking["Status"] == "Cancelled":
        raise ValueError("Booking already cancelled")

    table.update_item(
        Key={"BookingID": booking_id},
        UpdateExpression="SET #s = :s",
        ExpressionAttributeNames={"#s": "Status"},
        ExpressionAttributeValues={":s": "Cancelled"},
    )

    # Restore availability
    seats = int(booking.get("Seats", 1))
    if booking["ItemType"] == "Transport":
        update_transport_seats(booking["ItemID"], seats)
    else:
        update_hotel_rooms(booking["ItemID"], 1)

    booking["Status"] = "Cancelled"
    return booking


# ─────────────────────────────────────────────────────────────
# TABLE SEEDING  (run once to populate demo data)
# ─────────────────────────────────────────────────────────────

def seed_transport():
    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)
    listings = [
        {"TransportID": str(uuid.uuid4()), "TransportType": "Bus",    "Route": "New York → Boston",       "Date": "2025-08-15", "Price": "25.00",  "SeatsAvailable": 40, "DepartureTime": "08:00", "ArrivalTime": "12:30", "Operator": "Greyhound"},
        {"TransportID": str(uuid.uuid4()), "TransportType": "Bus",    "Route": "Boston → New York",        "Date": "2025-08-16", "Price": "25.00",  "SeatsAvailable": 35, "DepartureTime": "09:00", "ArrivalTime": "13:30", "Operator": "Greyhound"},
        {"TransportID": str(uuid.uuid4()), "TransportType": "Train",  "Route": "New York → Washington DC", "Date": "2025-08-15", "Price": "89.00",  "SeatsAvailable": 120,"DepartureTime": "07:00", "ArrivalTime": "09:45", "Operator": "Amtrak"},
        {"TransportID": str(uuid.uuid4()), "TransportType": "Train",  "Route": "Chicago → Detroit",        "Date": "2025-08-17", "Price": "55.00",  "SeatsAvailable": 80, "DepartureTime": "06:30", "ArrivalTime": "10:00", "Operator": "Amtrak"},
        {"TransportID": str(uuid.uuid4()), "TransportType": "Flight", "Route": "JFK → LAX",                "Date": "2025-08-15", "Price": "210.00", "SeatsAvailable": 180,"DepartureTime": "10:00", "ArrivalTime": "13:30", "Operator": "Delta"},
        {"TransportID": str(uuid.uuid4()), "TransportType": "Flight", "Route": "LAX → JFK",                "Date": "2025-08-16", "Price": "220.00", "SeatsAvailable": 150,"DepartureTime": "11:00", "ArrivalTime": "19:30", "Operator": "United"},
        {"TransportID": str(uuid.uuid4()), "TransportType": "Flight", "Route": "ORD → MIA",                "Date": "2025-08-18", "Price": "175.00", "SeatsAvailable": 200,"DepartureTime": "14:00", "ArrivalTime": "17:45", "Operator": "American"},
    ]
    for item in listings:
        table.put_item(Item=item)
    print(f"Seeded {len(listings)} transport listings.")


def seed_hotels():
    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)
    hotels = [
        {"HotelID": str(uuid.uuid4()), "Name": "The Grand Plaza",     "Category": "Luxury",  "Location": "New York",      "Price": "320.00", "RoomsAvailable": 20, "Rating": "4.8", "Amenities": "Pool, Spa, Gym, Restaurant"},
        {"HotelID": str(uuid.uuid4()), "Name": "Budget Inn NYC",      "Category": "Budget",  "Location": "New York",      "Price": "79.00",  "RoomsAvailable": 50, "Rating": "3.5", "Amenities": "WiFi, Parking"},
        {"HotelID": str(uuid.uuid4()), "Name": "Family Suites Boston","Category": "Family",  "Location": "Boston",        "Price": "145.00", "RoomsAvailable": 30, "Rating": "4.2", "Amenities": "Pool, Kids Club, Restaurant"},
        {"HotelID": str(uuid.uuid4()), "Name": "LA Luxury Resort",    "Category": "Luxury",  "Location": "Los Angeles",   "Price": "450.00", "RoomsAvailable": 15, "Rating": "4.9", "Amenities": "Private Beach, Spa, Rooftop Bar"},
        {"HotelID": str(uuid.uuid4()), "Name": "Chicago Central",     "Category": "Budget",  "Location": "Chicago",       "Price": "95.00",  "RoomsAvailable": 60, "Rating": "3.8", "Amenities": "WiFi, Breakfast"},
        {"HotelID": str(uuid.uuid4()), "Name": "Miami Family Beach",  "Category": "Family",  "Location": "Miami",         "Price": "195.00", "RoomsAvailable": 25, "Rating": "4.5", "Amenities": "Beach Access, Pool, Kids Menu"},
        {"HotelID": str(uuid.uuid4()), "Name": "DC Executive Suites", "Category": "Luxury",  "Location": "Washington DC", "Price": "385.00", "RoomsAvailable": 18, "Rating": "4.7", "Amenities": "Business Center, Concierge, Spa"},
    ]
    for item in hotels:
        table.put_item(Item=item)
    print(f"Seeded {len(hotels)} hotels.")
