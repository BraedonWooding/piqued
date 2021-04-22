# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
from datetime import datetime, timedelta

from jwt import encode
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from src.settings import FORGET_PASSWORD_TOKEN_SECRET, SENDGRID_API_KEY

sg = SendGridAPIClient(SENDGRID_API_KEY)


def send_welcome_email(email):
    try:
        message = Mail(
            from_email=('no-reply@DOMAIN', 'Piqued'),
            to_emails=email)
        message.template_id = "d-fc2e4272586b44a3b3a129733afa821c"
        sg.send(message)
    except Exception as e:
        print(e)
        print(e.body)


def create_change_password_url(origin, userId):
    token = encode({"userId": userId, "exp": datetime.utcnow() + timedelta(minutes=15)},
                   FORGET_PASSWORD_TOKEN_SECRET, algorithm="HS256").decode("utf-8")
    return f"{origin}/change-password/{token}"


def send_forgot_password_email(origin, user):
    try:
        message = Mail(
            from_email=('no-reply@DOMAIN', 'Piqued'),
            to_emails=user.username)
        message.template_id = "SENDENGINE-TemplateId"
        message.dynamic_template_data = {
            "username": user.first_name,
            "action_url": create_change_password_url(origin, user.id),
            "homepage_url": origin,
        }
        sg.send(message)
    except Exception as e:
        print(e)
        print(e.body)
