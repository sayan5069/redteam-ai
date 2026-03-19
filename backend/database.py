"""Supabase database client and helper functions."""

import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── User operations ─────────────────────────────────────

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetch a user record by email."""
    result = supabase.table("users").select("*").eq("email", email).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None


def create_user_record(user_id: str, email: str) -> Dict[str, Any]:
    """Insert a user record into the users table."""
    result = supabase.table("users").insert({
        "id": user_id,
        "email": email,
        "created_at": datetime.utcnow().isoformat()
    }).execute()
    return result.data[0]


# ── Session operations ──────────────────────────────────

def insert_session(
    session_id: str,
    user_id: str,
    target_system_prompt: str,
    attack_category: str,
    intensity: str,
    model_used: str
) -> Dict[str, Any]:
    """Create a new red-team session."""
    result = supabase.table("sessions").insert({
        "id": session_id,
        "user_id": user_id,
        "target_system_prompt": target_system_prompt,
        "attack_category": attack_category,
        "intensity": intensity,
        "model_used": model_used,
        "created_at": datetime.utcnow().isoformat()
    }).execute()
    return result.data[0]


def get_user_sessions(user_id: str) -> List[Dict[str, Any]]:
    """Get all sessions for a user, ordered by most recent first."""
    result = (
        supabase.table("sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def get_session_by_id(session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific session (only if owned by the user)."""
    result = (
        supabase.table("sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user_id)
        .execute()
    )
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None


def delete_session_by_id(session_id: str, user_id: str) -> bool:
    """Delete a session and its attacks (only if owned by the user)."""
    session = get_session_by_id(session_id, user_id)
    if not session:
        return False
    supabase.table("attacks").delete().eq("session_id", session_id).execute()
    supabase.table("sessions").delete().eq("id", session_id).eq("user_id", user_id).execute()
    return True


# ── Attack operations ───────────────────────────────────

def insert_attacks(session_id: str, attacks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Insert multiple attack records for a session."""
    import uuid
    records = []
    for attack in attacks:
        records.append({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "technique": attack.get("technique", ""),
            "category": attack.get("category", ""),
            "risk": attack.get("risk", "MEDIUM"),
            "attack_prompt": attack.get("attack_prompt", ""),
            "goal": attack.get("goal", ""),
            "mitigation": attack.get("mitigation", ""),
            "created_at": datetime.utcnow().isoformat()
        })
    result = supabase.table("attacks").insert(records).execute()
    return result.data


def get_attacks_by_session(session_id: str) -> List[Dict[str, Any]]:
    """Get all attacks for a session."""
    result = (
        supabase.table("attacks")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def get_attack_count_for_session(session_id: str) -> int:
    """Get the count of attacks in a session."""
    result = (
        supabase.table("attacks")
        .select("id", count="exact")
        .eq("session_id", session_id)
        .execute()
    )
    return result.count or 0
