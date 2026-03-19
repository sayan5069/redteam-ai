"""Pydantic models for request/response validation."""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional
from enum import Enum
import bleach
import re


class AttackCategory(str, Enum):
    PROMPT_INJECTION = "prompt_injection"
    JAILBREAK = "jailbreak"
    DATA_EXTRACTION = "data_extraction"
    ROLE_CONFUSION = "role_confusion"
    INDIRECT_INJECTION = "indirect_injection"
    ALL = "all"


class Intensity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RiskLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ModelChoice(str, Enum):
    OPUS = "opus-4.6"
    SONNET = "sonnet-4.6"
    GEMINI = "gemini-2.5-pro"


# ── Auth Models ──────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class AuthResponse(BaseModel):
    message: str
    email: str


# ── Red Team Models ─────────────────────────────────────

class RedTeamRequest(BaseModel):
    target_system_prompt: str = Field(..., min_length=10, max_length=10000)
    attack_category: AttackCategory = AttackCategory.ALL
    intensity: Intensity = Intensity.HIGH
    model: ModelChoice = ModelChoice.OPUS

    @field_validator("target_system_prompt")
    @classmethod
    def sanitize_prompt(cls, v: str) -> str:
        return bleach.clean(v, tags=[], strip=True)


class AttackResult(BaseModel):
    technique: str
    category: str
    risk: RiskLevel
    attack_prompt: str
    goal: str
    mitigation: str


class RedTeamResponse(BaseModel):
    session_id: str
    attacks: List[AttackResult]
    model_used: str
    attack_category: str
    intensity: str


# ── Session / History Models ────────────────────────────

class SessionSummary(BaseModel):
    id: str
    target_system_prompt: str
    attack_category: str
    intensity: str
    model_used: str
    created_at: str
    attack_count: Optional[int] = 0


class SessionDetail(BaseModel):
    id: str
    target_system_prompt: str
    attack_category: str
    intensity: str
    model_used: str
    created_at: str
    attacks: List[AttackResult]
