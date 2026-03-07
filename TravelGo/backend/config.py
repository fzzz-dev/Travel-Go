import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "travelgo-secret-change-in-prod")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    # JWT
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    # AWS
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")

    # DynamoDB Table Names
    USERS_TABLE = os.getenv("USERS_TABLE", "TravelGo_Users")
    TRANSPORT_TABLE = os.getenv("TRANSPORT_TABLE", "TravelGo_TransportListings")
    HOTELS_TABLE = os.getenv("HOTELS_TABLE", "TravelGo_Hotels")
    BOOKINGS_TABLE = os.getenv("BOOKINGS_TABLE", "TravelGo_Bookings")

    # SNS
    SNS_BOOKING_TOPIC_ARN = os.getenv("SNS_BOOKING_TOPIC_ARN", "")
    SNS_CANCEL_TOPIC_ARN = os.getenv("SNS_CANCEL_TOPIC_ARN", "")

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
