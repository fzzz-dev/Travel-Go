import boto3
import json
from config import Config


def get_sns_client():

    return boto3.client(
        "sns",
        region_name=Config.AWS_REGION
    )


def send_booking_confirmation(booking, user):

    if not Config.SNS_BOOKING_TOPIC_ARN:
        return

    sns = get_sns_client()

    message = {
        "event": "BOOKING_CONFIRMED",
        "bookingId": booking["BookingID"],
        "userName": user.get("Name"),
        "userEmail": user.get("Email"),
    }

    sns.publish(
        TopicArn=Config.SNS_BOOKING_TOPIC_ARN,
        Subject="TravelGo Booking Confirmed",
        Message=json.dumps(message)
    )


def send_cancellation_notification(booking, user):

    if not Config.SNS_CANCEL_TOPIC_ARN:
        return

    sns = get_sns_client()

    message = {
        "event": "BOOKING_CANCELLED",
        "bookingId": booking["BookingID"],
        "userName": user.get("Name"),
    }

    sns.publish(
        TopicArn=Config.SNS_CANCEL_TOPIC_ARN,
        Subject="TravelGo Booking Cancelled",
        Message=json.dumps(message)
    )