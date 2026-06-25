from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.core.security import hash_password, verify_password, create_access_token
import structlog

router = APIRouter()
logger = structlog.get_logger()

# In-memory user store for now (replace with DB in full version)
USERS: dict = {
    "admin": {
        "username": "admin",
        "password_hash": hash_password("llmgoat_admin"),
        "role": "admin",
    },
    "player": {
        "username": "player",
        "password_hash": hash_password("llmgoat"),
        "role": "user",
    },
}


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=200)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=200)


@router.post("/login")
async def login(body: LoginRequest):
    user = USERS.get(body.username)
    if not user or not verify_password(body.password, user["password_hash"]):
        logger.warning("login_failed", username=body.username)
        raise HTTPException(401, detail="Invalid credentials")

    token = create_access_token({
        "sub": body.username,
        "username": body.username,
        "role": user["role"],
    })
    logger.info("login_success", username=body.username)
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}


@router.post("/register")
async def register(body: RegisterRequest):
    if body.username in USERS:
        raise HTTPException(400, detail="Username already taken")
    USERS[body.username] = {
        "username": body.username,
        "password_hash": hash_password(body.password),
        "role": "user",
    }
    token = create_access_token({"sub": body.username, "username": body.username, "role": "user"})
    return {"access_token": token, "token_type": "bearer"}
