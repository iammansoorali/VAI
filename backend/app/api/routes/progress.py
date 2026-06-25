from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.core.config import settings
import redis.asyncio as aioredis

router = APIRouter()

async def get_redis():
    client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        yield client
    finally:
        await client.aclose()

@router.get("/")
async def get_progress(
    current_user: dict = Depends(get_current_user),
    redis: aioredis.Redis = Depends(get_redis),
):
    uid = current_user["user_id"]

    # Source of truth: explicit completion markers set when all objectives
    # for a challenge are detected client-side and confirmed via /complete.
    completion_keys = await redis.keys(f"completed:{uid}:*")
    completed_challenges = [k.split(":", 2)[2] for k in completion_keys]

    return {
        "user": uid,
        "completed": completed_challenges,
        "total_completed": len(completed_challenges),
    }
