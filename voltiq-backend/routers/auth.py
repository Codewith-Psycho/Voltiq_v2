# routers/auth.py - Authentication (Dummy OTP/JWT)
"""
Dummy authentication for testing.
In production, integrate with real OTP provider.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import jwt
import time
import secrets
from config import settings
from db.supabase import supabase_client
from services.redis_client import redis_manager

router = APIRouter()


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user_id: str
    is_new_user: bool


# Dummy OTP storage (use Redis in production)
_otp_store = {}


@router.post('/send-otp')
async def send_otp(request: SendOTPRequest):
    """
    Send OTP to phone number (DUMMY - always succeeds).
    In production: integrate with MSG91, Twilio, etc.
    """
    phone = request.phone
    
    # Generate 6-digit OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store OTP (expires in 5 minutes)
    _otp_store[phone] = {
        'otp': otp,
        'expires': time.time() + 300
    }
    
    # For testing, return OTP in response (REMOVE IN PRODUCTION)
    return {
        'success': True,
        'message': f'OTP sent to {phone}',
        'debug_otp': otp  # Remove in production
    }


@router.post('/verify-otp', response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP and return JWT token.
    """
    phone = request.phone
    otp = request.otp
    
    # Check OTP
    stored = _otp_store.get(phone)
    
    # For testing: accept any 6-digit OTP or "123456"
    if otp == '123456':
        pass  # Accept test OTP
    elif not stored:
        raise HTTPException(status_code=400, detail='OTP not found. Request new OTP.')
    elif time.time() > stored['expires']:
        raise HTTPException(status_code=400, detail='OTP expired. Request new OTP.')
    elif stored['otp'] != otp:
        raise HTTPException(status_code=400, detail='Invalid OTP.')
    
    # Clear OTP after use
    if phone in _otp_store:
        del _otp_store[phone]
    
    # Check if user exists
    user = await supabase_client.get_user_by_phone(phone)
    is_new_user = user is None
    
    if is_new_user:
        # Create new user
        user = await supabase_client.create_user(phone)
    
    user_id = user['id']
    
    # Generate JWT token
    payload = {
        'user_id': user_id,
        'phone': phone,
        'exp': time.time() + (settings.JWT_EXPIRY_HOURS * 3600)
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    # Store session in Redis
    await redis_manager.set_session(token, user_id)
    
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        is_new_user=is_new_user
    )


@router.post('/logout')
async def logout(token: str):
    """Invalidate session token"""
    await redis_manager.delete_session(token)
    return {'success': True, 'message': 'Logged out'}


@router.get('/me')
async def get_current_user(token: str):
    """Get current user from token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get('user_id')
        
        user = await supabase_client.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')
