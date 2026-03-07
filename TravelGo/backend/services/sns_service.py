import boto3
import json
from config import Config


def get_sns_client():
    kwargs = {"region_name": Config.AWS_REGION}
    if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = Config.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = Config.AWS_SECRET_ACCESS_KEY
    return boto3.client("sns", **kwargs)


def send_booking_confirmation(booking: dict, user: dict):
    """
    Publish a booking-confirmed notification to SNS.
    Falls back silently if SNS is not configured (dev mode).
    """
    if not Config.SNS_BOOKING_TOPIC_ARN:
        print("[SNS] No booking topic ARN configured – skipping notification.")
        return

    try:
        sns = get_sns_client()
        message = {
            "event": "BOOKING_CONFIRMED",
            "bookingId": booking.get("BookingID"),
            "userId": booking.get("UserID"),
            "userName": user.get("Name", "Valued Customer"),
            "userEmail": user.get("Email", ""),
            "itemType": booking.get("ItemType"),
            "itemId": booking.get("ItemID"),
            "seats": booking.get("Seats", 1),
            "bookingDate": booking.get("BookingDate"),
            "status": booking.get("Status"),
        }
        sns.publish(
            TopicArn=Config.SNS_BOOKING_TOPIC_ARN,
            Subject="TravelGo – Booking Confirmed 🎉",
            Message=json.dumps(message, indent=2),
            MessageAttributes={
                "event": {
                    "DataType": "String",
                    "StringValue": "BOOKING_CONFIRMED",
                }
            },
        )
        print(f"[SNS] Booking confirmation sent for {booking['BookingID']}")
    except Exception as e:
        print(f"[SNS] Failed to send booking confirmation: {e}")


def send_cancellation_notification(booking: dict, user: dict):
    """
    Publish a booking-cancelled notification to SNS.
    """
    topic_arn = Config.SNS_CANCEL_TOPIC_ARN or Config.SNS_BOOKING_TOPIC_ARN
    if not topic_arn:
        print("[SNS] No cancel topic ARN configured – skipping notification.")
        return

    try:
        sns = get_sns_client()
        message = {
            "event": "BOOKING_CANCELLED",
            "bookingId": booking.get("BookingID"),
            "userId": booking.get("UserID"),
            "userName": user.get("Name", "Valued Customer"),
            "userEmail": user.get("Email", ""),
            "itemType": booking.get("ItemType"),
            "itemId": booking.get("ItemID"),
            "cancelledAt": booking.get("BookingDate"),
        }
        sns.publish(
            TopicArn=topic_arn,
            Subject="TravelGo – Booking Cancelled",
            Message=json.dumps(message, indent=2),
            MessageAttributes={
                "event": {
                    "DataType": "String",
                    "StringValue": "BOOKING_CANCELLED",
                }
            },
        )
        print(f"[SNS] Cancellation notification sent for {booking['BookingID']}")
    except Exception as e:
        print(f"[SNS] Failed to send cancellation notification: {e}")
