from fastapi import APIRouter, Depends
from app.core.security import get_current_user, require_admin

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "llm-goat-backend"}
