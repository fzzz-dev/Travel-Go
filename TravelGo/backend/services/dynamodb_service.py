import boto3
import uuid
import bcrypt
from datetime import datetime
from boto3.dynamodb.conditions import Attr
from config import Config


def get_dynamodb():

    return boto3.resource(
        "dynamodb",
        region_name=Config.AWS_REGION
    )


# USERS

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
        "PasswordHash": bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
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


# BOOKINGS

def create_booking(user_id, item_type, item_id, seats=1):

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
    }

    table.put_item(Item=item)

    return item


def get_bookings_by_user(user_id):

    db = get_dynamodb()
    table = db.Table(Config.BOOKINGS_TABLE)

    resp = table.scan(FilterExpression=Attr("UserID").eq(user_id))

    return resp.get("Items", [])


# SEARCH

def search_transport(transport_type=None, route=None, date=None, max_price=None):

    db = get_dynamodb()
    table = db.Table(Config.TRANSPORT_TABLE)

    resp = table.scan()

    return resp.get("Items", [])


def search_hotels(location=None, category=None, max_price=None):

    db = get_dynamodb()
    table = db.Table(Config.HOTELS_TABLE)

    resp = table.scan()

    return resp.get("Items", [])