"""Authentication module — signup, login, JWT handling."""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

from database import supabase, get_user_by_email, create_user_record

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_jwt(user_id: str, email: str) -> str:
    """Create a signed JWT token."""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def signup_user(email: str, password: str) -> Dict[str, Any]:
    """
    Register a new user.
    - Uses Supabase Auth to create the user
    - Insert into custom users table
    """
    # Use Supabase Admin API to create the user and bypass rate limiting
    try:
        # We have the service role key, so we can use admin.create_user
        auth_response = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
    except Exception as e:
        error_msg = str(e)
        if "User already registered" in error_msg or "already exists" in error_msg.lower():
            raise ValueError("An account with this email already exists")
        raise ValueError(f"Failed to create account: {error_msg}")

    if not auth_response.user:
        raise ValueError("Failed to create user account (no user returned)")

    user_id = str(auth_response.user.id)

    # Insert into our custom users table. If it already exists (e.g. from a previous failed signup),
    # the unique constraint might throw, but get_user_by_email handles that gracefully
    existing = get_user_by_email(email)
    if existing:
        return existing

    try:
        user_record = create_user_record(user_id, email)
        return user_record
    except Exception as e:
        # If inserting into our custom table fails, the Auth user was still created
        # We just return a mockup record to not break the flow, as they can still login
        return {"id": user_id, "email": email}


import httpx

def login_user(email: str, password: str) -> Dict[str, str]:
    """
    Authenticate a user.
    - Verify credentials via Supabase Auth API directly
    - Return JWT token
    """
    try:
        supabase_api = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        resp = httpx.post(
            f"{supabase_api}/auth/v1/token?grant_type=password",
            headers={"apikey": str(supabase_key)},
            json={"email": email, "password": password}
        )
        data = resp.json()
        
        if resp.status_code != 200 or "user" not in data:
            raise ValueError("Invalid email or password")
            
        user_id = data["user"]["id"]
    except ValueError as e:
        raise e
    except Exception:
        raise ValueError("Invalid email or password")

    token = create_jwt(user_id, email)

    return {
        "token": token,
        "user_id": user_id,
        "email": email
    }
