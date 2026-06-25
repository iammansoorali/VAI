"""
LLM-GOAT Backend — FastAPI Application Entry Point
Vulnerable-by-Design AI Security Lab
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import structlog

from app.core.config import settings
from app.core.database import create_tables
from app.core.logging import setup_logging
from app.api.routes import auth, challenges, progress, admin, health

setup_logging()
logger = structlog.get_logger()

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("llm_goat_starting", version="1.0.0")
    await create_tables()
    logger.info("database_ready")
    yield
    logger.info("llm_goat_shutdown")


app = FastAPI(
    title="LLM-GOAT API",
    description="Vulnerable-by-Design AI Security Lab — Backend",
    version="1.0.0",
    lifespan=lifespan,
    # Hide docs in production
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT == "development" else None,
)

# ── Hardening Middleware ─────────────────────────────────

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "llmgoat-nginx", "*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── Security Headers Middleware ──────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = "no-store"
    return response


# ── Request Logging Middleware ───────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        ip=request.client.host if request.client else "unknown",
    )
    response = await call_next(request)
    logger.info("response", status=response.status_code, path=request.url.path)
    return response


# ── Routes ───────────────────────────────────────────────
app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse({"error": "Not found"}, status_code=404)


@app.exception_handler(500)
async def server_error(request: Request, exc):
    logger.error("server_error", error=str(exc))
    return JSONResponse({"error": "Internal server error"}, status_code=500)
