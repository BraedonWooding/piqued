from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from jwt import decode
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from src.settings import FORGET_PASSWORD_TOKEN_SECRET
from util.email import send_forgot_password_email


# Create your views here.
@api_view(['POST'])
@permission_classes([])
def forgot_password(request):
    user = get_user_model().objects.get(username=request.data["email"])
    if user:
        send_forgot_password_email(request.headers["Origin"], user)
        return Response(True)
    else:
        return Response(False)


@api_view(['POST'])
@permission_classes([])
def change_password(request):
    try:
        decoded = decode(
            request.data["token"], FORGET_PASSWORD_TOKEN_SECRET,  algorithm="HS256")
        user = get_user_model().objects.get(id=decoded["userId"])
        if user:
            user.password = make_password(request.data["newPassword"])
            user.save()
            return Response(True)
        else:
            return Response({"error": "User does not exist."})
    except Exception as e:
        return Response({"error": str(e).replace("Signature", "Code")})
