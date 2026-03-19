"""
RedTeam AI — FastAPI Backend
Main application file with all routes, middleware, and CORS configuration.
"""

import os
import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    SignupRequest, LoginRequest, AuthResponse,
    RedTeamRequest, RedTeamResponse, AttackResult,
    SessionSummary, SessionDetail
)
from auth import signup_user, login_user, verify_jwt
from database import (
    insert_session, insert_attacks, get_user_sessions,
    get_session_by_id, get_attacks_by_session, delete_session_by_id,
    get_attack_count_for_session
)
from redteam import run_redteam, generate_target_prompt
from rate_limiter import redteam_limiter

load_dotenv()

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")

# ── FastAPI App ─────────────────────────────────────────

app = FastAPI(
    title="RedTeam AI",
    description="LLM Red-Teaming Assistant API",
    version="1.0.0",
)

# ── CORS ────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth Dependency ─────────────────────────────────────

async def get_current_user(request: Request) -> dict:
    """Extract and verify JWT from httpOnly cookie."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_jwt(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


# ── Health Check ────────────────────────────────────────

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "RedTeam AI API"}


# ══════════════════════════════════════════════════════════
# AUTH ROUTES
# ══════════════════════════════════════════════════════════

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    try:
        user = signup_user(req.email, req.password)
        return AuthResponse(message="Account created successfully", email=user["email"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred during signup")


@app.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest, response: Response):
    try:
        result = login_user(req.email, req.password)
        # Set JWT as httpOnly cookie
        response.set_cookie(
            key="access_token",
            value=result["token"],
            httponly=True,
            secure=True,
            samesite="none",
            max_age=86400,  # 24 hours
            path="/",
        )
        return AuthResponse(message="Login successful", email=result["email"])
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred during login")


@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return {"message": "Logged out successfully"}


# ══════════════════════════════════════════════════════════
# RED TEAM ROUTES
# ══════════════════════════════════════════════════════════

@app.post("/redteam/run", response_model=RedTeamResponse)
async def redteam_run(req: RedTeamRequest, user: dict = Depends(get_current_user)):
    user_id = user["sub"]

    # Rate limit check
    if not redteam_limiter.is_allowed(user_id):
        remaining_seconds = redteam_limiter.reset_time(user_id)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {int(remaining_seconds)} seconds. Max 10 runs per hour."
        )

    try:
        # Call the AI model
        attacks = await run_redteam(
            target_system_prompt=req.target_system_prompt,
            attack_category=req.attack_category.value,
            intensity=req.intensity.value,
            model=req.model.value,
        )

        # Create session in DB
        session_id = str(uuid.uuid4())
        insert_session(
            session_id=session_id,
            user_id=user_id,
            target_system_prompt=req.target_system_prompt,
            attack_category=req.attack_category.value,
            intensity=req.intensity.value,
            model_used=req.model.value,
        )

        # Save attacks to DB
        insert_attacks(session_id, attacks)

        return RedTeamResponse(
            session_id=session_id,
            attacks=[AttackResult(**a) for a in attacks],
            model_used=req.model.value,
            attack_category=req.attack_category.value,
            intensity=req.intensity.value,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Red team analysis failed: {str(e)}")


@app.get("/redteam/generate-target")
async def redteam_generate_target(topic: Optional[str] = None, user: dict = Depends(get_current_user)):
    try:
        prompt = await generate_target_prompt(topic)
        return {"prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate prompt: {str(e)}")


@app.get("/redteam/history")
async def redteam_history(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    sessions = get_user_sessions(user_id)

    result = []
    for s in sessions:
        attack_count = get_attack_count_for_session(s["id"])
        result.append(SessionSummary(
            id=s["id"],
            target_system_prompt=s["target_system_prompt"],
            attack_category=s["attack_category"],
            intensity=s["intensity"],
            model_used=s["model_used"],
            created_at=s["created_at"],
            attack_count=attack_count,
        ))

    return result


@app.get("/redteam/session/{session_id}")
async def redteam_session_detail(session_id: str, user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    session = get_session_by_id(session_id, user_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    attacks_data = get_attacks_by_session(session_id)
    attacks = [AttackResult(
        technique=a["technique"],
        category=a["category"],
        risk=a["risk"],
        attack_prompt=a["attack_prompt"],
        goal=a["goal"],
        mitigation=a["mitigation"],
    ) for a in attacks_data]

    return SessionDetail(
        id=session["id"],
        target_system_prompt=session["target_system_prompt"],
        attack_category=session["attack_category"],
        intensity=session["intensity"],
        model_used=session["model_used"],
        created_at=session["created_at"],
        attacks=attacks,
    )


@app.delete("/redteam/session/{session_id}")
async def redteam_delete_session(session_id: str, user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    deleted = delete_session_by_id(session_id, user_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"message": "Session deleted successfully"}
