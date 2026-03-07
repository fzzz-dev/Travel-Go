"""
Run this script ONCE to create all required DynamoDB tables and seed demo data.
Usage: python setup_tables.py
"""
import boto3
import time
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from config import Config

def get_client():
    kwargs = {"region_name": Config.AWS_REGION}
    if Config.AWS_ACCESS_KEY_ID:
        kwargs["aws_access_key_id"] = Config.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = Config.AWS_SECRET_ACCESS_KEY
    return boto3.client("dynamodb", **kwargs)


TABLES = [
    {
        "TableName": Config.USERS_TABLE,
        "KeySchema": [{"AttributeName": "UserID", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "UserID", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": Config.TRANSPORT_TABLE,
        "KeySchema": [{"AttributeName": "TransportID", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "TransportID", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": Config.HOTELS_TABLE,
        "KeySchema": [{"AttributeName": "HotelID", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "HotelID", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
    {
        "TableName": Config.BOOKINGS_TABLE,
        "KeySchema": [{"AttributeName": "BookingID", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "BookingID", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
]


def create_tables():
    client = get_client()
    existing = [t["TableName"] for t in client.list_tables()["TableNames"]]

    for table_def in TABLES:
        name = table_def["TableName"]
        if name in existing:
            print(f"  ✓ Table '{name}' already exists – skipping.")
        else:
            print(f"  → Creating table '{name}' …")
            client.create_table(**table_def)
            # Wait until active
            waiter = client.get_waiter("table_exists")
            waiter.wait(TableName=name)
            print(f"  ✓ Table '{name}' created.")


def seed():
    from services.dynamodb_service import seed_transport, seed_hotels
    print("\nSeeding demo data …")
    seed_transport()
    seed_hotels()
    print("Done.")


if __name__ == "__main__":
    print("=== TravelGo – DynamoDB Setup ===\n")
    print("Creating tables …")
    create_tables()
    seed_choice = input("\nSeed demo data? [y/N] ").strip().lower()
    if seed_choice == "y":
        seed()
    print("\n✓ Setup complete.")
