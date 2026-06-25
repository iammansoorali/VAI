from fastapi import APIRouter, Depends
from app.core.security import require_admin

router = APIRouter()

@router.get("/stats")
async def get_stats(admin: dict = Depends(require_admin)):
    return {"message": "Admin stats endpoint", "admin": admin["username"]}

@router.post("/reset/{challenge_id}")
async def reset_challenge(challenge_id: str, admin: dict = Depends(require_admin)):
    return {"message": f"Challenge {challenge_id} reset", "by": admin["username"]}
