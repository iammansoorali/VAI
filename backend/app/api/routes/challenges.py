"""
Challenges API Router — All 21 challenges unified
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
import redis.asyncio as aioredis
import structlog

from app.core.security import get_current_user
from app.core.config import settings
from app.challenges.registry import list_challenges, get_challenge, Category
from app.challenges.llm01.handler import (
    build_vulnerable_messages as llm01_vuln,
    build_secure_messages as llm01_secure,
    check_flag_conditions as llm01_check,
    get_challenge_context as llm01_ctx,
    FLAGS as LLM01_FLAGS,
    detect_injection_attempt,
)
from app.challenges.all_handlers import CHALLENGE_HANDLERS
from app.services.llm_service import llm_service, TokenBudgetExceeded

router = APIRouter()
logger = structlog.get_logger()


# ── Models ───────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_history: list[dict] = Field(default=[], max_length=20)
    secure_mode: bool = False
    session_id: Optional[str] = None

class FlagSubmission(BaseModel):
    flag: str = Field(..., min_length=10, max_length=200)

class ChatResponse(BaseModel):
    response: str
    flags_earned: list[str] = []
    injection_detected: bool = False
    tokens_used: int = 0
    budget_remaining: int = 0
    secure_mode: bool = False
    mock: bool = False


# ── Redis dep ────────────────────────────────────────────────

async def get_redis():
    client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        yield client
    finally:
        await client.aclose()


# ── Persist flags helper ─────────────────────────────────────

async def persist_flags(redis, uid: str, challenge_id: str, flag_types: list, points_per_flag: int):
    for flag_type in flag_types:
        key = f"flag:{uid}:{challenge_id}:{flag_type}"
        if not await redis.exists(key):
            await redis.hset(key, mapping={
                "challenge_id": challenge_id,
                "flag_type": flag_type,
                "points": points_per_flag,
            })


# ── Generic chat handler ─────────────────────────────────────

async def handle_chat(challenge_id: str, body: ChatRequest,
                      current_user: dict, redis: aioredis.Redis) -> ChatResponse:
    handler = CHALLENGE_HANDLERS.get(challenge_id)
    if not handler or not handler["build"]:
        raise HTTPException(404, detail="Challenge handler not found")

    session_id = body.session_id or f"{current_user['user_id']}:{challenge_id}"
    challenge = get_challenge(challenge_id)
    points_per_flag = (challenge.points // max(len(handler["flags"]), 1)) if challenge and handler["flags"] else 100

    messages = handler["build"](body.conversation_history, body.message, body.secure_mode)

    try:
        result = await llm_service.chat(messages=messages, session_id=session_id, redis_client=redis)
    except TokenBudgetExceeded:
        raise HTTPException(429, detail="Token budget exceeded. Reload the page to reset.")

    response_text = result["content"]
    flags_earned_types = handler["check"](response_text) if handler["check"] else []
    flag_values = [handler["flags"][f] for f in flags_earned_types if f in handler["flags"]]

    if flags_earned_types:
        await persist_flags(redis, current_user["user_id"], challenge_id, flags_earned_types, points_per_flag)
        logger.warning("flag_triggered", challenge=challenge_id, user=current_user["user_id"], flags=flags_earned_types)

    return ChatResponse(
        response=response_text,
        flags_earned=flag_values,
        tokens_used=result["tokens_used"],
        budget_remaining=result["budget_remaining"],
        secure_mode=body.secure_mode,
        mock=result.get("mock", False),
    )


# ── List / detail endpoints ──────────────────────────────────

@router.get("/")
async def list_all_challenges(category: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    cat = Category(category) if category else None
    challenges = list_challenges(category=cat)
    return {"challenges": [
        {"id": c.id, "owasp_id": c.owasp_id, "title": c.title, "subtitle": c.subtitle,
         "difficulty": c.difficulty, "category": c.category, "tags": c.tags}
        for c in challenges
    ]}


@router.get("/{challenge_id}")
async def get_challenge_detail(challenge_id: str, current_user: dict = Depends(get_current_user)):
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(404, detail="Challenge not found")

    ctx = {}
    if challenge_id == "llm01-direct":
        ctx = llm01_ctx()
    elif challenge_id in CHALLENGE_HANDLERS and CHALLENGE_HANDLERS[challenge_id].get("context"):
        ctx = CHALLENGE_HANDLERS[challenge_id]["context"]

    return {
        "id": challenge.id, "owasp_id": challenge.owasp_id, "title": challenge.title,
        "subtitle": challenge.subtitle, "description": challenge.description,
        "objectives": challenge.objectives, "difficulty": challenge.difficulty,
        "category": challenge.category, "tags": challenge.tags,
        "hints_count": len(challenge.hints), **ctx,
    }


@router.get("/{challenge_id}/hints")
async def get_hints(challenge_id: str, hint_index: int = 0, current_user: dict = Depends(get_current_user)):
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(404, detail="Challenge not found")
    if hint_index >= len(challenge.hints):
        return {"hint": None, "message": "No more hints"}
    return {"hint": challenge.hints[hint_index], "hints_remaining": len(challenge.hints) - hint_index - 1}


# ── LLM01 chat (special handling for injection detection) ────

@router.post("/llm01-direct/chat", response_model=ChatResponse)
async def llm01_direct_chat(body: ChatRequest, current_user: dict = Depends(get_current_user),
                             redis: aioredis.Redis = Depends(get_redis)):
    session_id = body.session_id or f"{current_user['user_id']}:llm01-direct"
    injection_detected = False

    try:
        if body.secure_mode:
            messages = llm01_secure(body.conversation_history, body.message)
            if messages is None:
                injection_detected = True
                return ChatResponse(
                    response="⚠️ Injection attempt detected and blocked by input validation.",
                    injection_detected=True, secure_mode=True)
        else:
            messages = llm01_vuln(body.conversation_history, body.message)

        result = await llm_service.chat(messages=messages, session_id=session_id, redis_client=redis)
        response_text = result["content"]
        flags_earned = llm01_check(response_text)
        flag_strings = [LLM01_FLAGS[f] for f in flags_earned if f in LLM01_FLAGS]

        if flags_earned:
            await persist_flags(redis, current_user["user_id"], "llm01-direct", flags_earned,
                                points_per_flag=100 // max(len(LLM01_FLAGS), 1))
            logger.warning("flag_triggered", challenge="llm01-direct", user=current_user["user_id"], flags=flags_earned)

        return ChatResponse(response=response_text, flags_earned=flag_strings,
                            injection_detected=injection_detected,
                            tokens_used=result["tokens_used"], budget_remaining=result["budget_remaining"],
                            secure_mode=body.secure_mode, mock=result.get("mock", False))

    except TokenBudgetExceeded:
        raise HTTPException(429, detail="Token budget exceeded. Reload to reset.")


# ── Generic chat endpoint for all other challenges ───────────

@router.post("/{challenge_id}/chat", response_model=ChatResponse)
async def generic_chat(challenge_id: str, body: ChatRequest,
                       current_user: dict = Depends(get_current_user),
                       redis: aioredis.Redis = Depends(get_redis)):
    return await handle_chat(challenge_id, body, current_user, redis)


# ── Mark challenge complete (called when all objectives auto-detected) ──

@router.post("/{challenge_id}/complete")
async def mark_complete(challenge_id: str,
                        current_user: dict = Depends(get_current_user),
                        redis: aioredis.Redis = Depends(get_redis)):
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(404, detail="Challenge not found")

    uid = current_user["user_id"]
    key = f"completed:{uid}:{challenge_id}"
    already = await redis.exists(key)
    if not already:
        await redis.set(key, "1")
        logger.info("challenge_completed", user=uid, challenge=challenge_id)

    return {"completed": True, "already_had": bool(already)}


# ── Flag submission ──────────────────────────────────────────

@router.post("/{challenge_id}/submit-flag")
async def submit_flag(challenge_id: str, body: FlagSubmission,
                      current_user: dict = Depends(get_current_user),
                      redis: aioredis.Redis = Depends(get_redis)):
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(404, detail="Challenge not found")

    # Collect all valid flags for this challenge
    valid_flags: dict = {}
    if challenge_id == "llm01-direct":
        valid_flags = LLM01_FLAGS
    elif challenge_id in CHALLENGE_HANDLERS and CHALLENGE_HANDLERS[challenge_id].get("flags"):
        valid_flags = CHALLENGE_HANDLERS[challenge_id]["flags"]

    submitted = body.flag.strip()
    matched_key = next((k for k, v in valid_flags.items() if v == submitted), None)

    if not matched_key:
        attempt_key = f"flag_attempts:{current_user['user_id']}:{challenge_id}"
        attempts = await redis.incr(attempt_key)
        await redis.expire(attempt_key, 3600)
        if attempts > 20:
            raise HTTPException(429, detail="Too many incorrect submissions")
        return {"correct": False, "message": "Incorrect flag. Keep trying!"}

    uid = current_user["user_id"]
    flag_key = f"flag:{uid}:{challenge_id}:{matched_key}"
    already = await redis.exists(flag_key)

    if not already:
        await redis.hset(flag_key, mapping={
            "challenge_id": challenge_id, "flag_type": matched_key, "points": challenge.points,
        })
        logger.info("flag_captured", user=uid, challenge=challenge_id, flag_type=matched_key)

    return {
        "correct": True,
        "message": "🚩 Flag captured!" if not already else "🚩 Already captured!",
        "flag_type": matched_key,
    }
