from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
from datetime import timedelta

from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    OTPSerializer,
    RequestOTPSerializer,
    ResetPasswordSerializer,
    UserSerializer
)
from common.responses import success_response, failure_response

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = User.objects.filter(email=request.data.get('email')).first()
            user_data = UserSerializer(user).data if user else {}
            if user:
                user_data['userId'] = str(user.id)
                user_data['fullName'] = f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0]
            
            data = {
                'tokens': serializer.validated_data,
                'user': user_data,
                'userId': str(user.id) if user else "",
                'fullName': (f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0]) if user else ""
            }
            return success_response(data=data, message="Login successful")
        except Exception as e:
            return failure_response(errors=serializer.errors if hasattr(serializer, 'errors') else {"detail": str(e)}, message="Authentication failed")

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return success_response(data=serializer.validated_data, message="Token refreshed successfully")
        except Exception as e:
            return failure_response(errors=serializer.errors if hasattr(serializer, 'errors') else {"detail": str(e)}, message="Token refresh failed")

class UserRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate verification OTP
            otp = str(random.randint(100000, 999999))
            user.otp_code = otp
            user.otp_expires_at = timezone.now() + timedelta(minutes=10)
            user.save()

            user_data = UserSerializer(user).data
            # In a real system, send email/sms here.
            # We add otp inside success response for easier mock testing/UI integration.
            user_data['test_otp'] = otp
            user_data['userId'] = str(user.id)
            user_data['fullName'] = f"{user.first_name} {user.last_name}".strip() or user.email.split('@')[0]
            
            return success_response(
                data=user_data,
                message="User registered successfully. Please verify your account with the OTP sent to your email.",
                status_code=status.HTTP_201_CREATED
            )
        return failure_response(errors=serializer.errors, message="Registration failed")

class RequestOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                otp = str(random.randint(100000, 999999))
                user.otp_code = otp
                user.otp_expires_at = timezone.now() + timedelta(minutes=10)
                user.save()
                return success_response(data={'test_otp': otp}, message="OTP generated successfully")
            return failure_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND)
        return failure_response(errors=serializer.errors, message="Invalid request data")

class VerifyOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            user = User.objects.filter(email=email).first()
            if not user:
                return failure_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND)
            
            if user.otp_code == otp and user.otp_expires_at > timezone.now():
                user.is_verified = True
                user.otp_code = None
                user.otp_expires_at = None
                user.save()
                return success_response(message="Account verified successfully")
            return failure_response(message="Invalid or expired OTP code")
        return failure_response(errors=serializer.errors, message="Validation error")

class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            user = User.objects.filter(email=email).first()
            if not user:
                return failure_response(message="User not found", status_code=status.HTTP_444_NOT_FOUND)
            
            if user.otp_code == otp and user.otp_expires_at > timezone.now():
                user.set_password(new_password)
                user.otp_code = None
                user.otp_expires_at = None
                user.save()
                return success_response(message="Password reset successfully")
            return failure_response(message="Invalid or expired OTP code")
        return failure_response(errors=serializer.errors, message="Validation error")

class UserMeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return success_response(data=serializer.data, message="User profile fetched")

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(data=serializer.data, message="User profile updated")
        return failure_response(errors=serializer.errors, message="Failed to update profile")
