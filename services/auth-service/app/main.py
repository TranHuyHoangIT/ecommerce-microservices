# Service: Auth Service
# Responsibility: Handle user registration, login, JWT authentication
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.core.config import settings
from app.db.session import engine, Base
from app.models.user import User  # Ensure all models are imported
from app.api.v1.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Auth Service",
    description="Authentication microservice for E-Commerce platform",
    version="1.0.0"
)

# CORS middleware - Allow all origins since requests go through API Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def on_startup():
    logger.info("=== Auth Service Starting ===")
    logger.info(f"Database URL: {settings.DATABASE_URL[:20]}...")  # Log only prefix for security
    logger.info(f"JWT Algorithm: {settings.JWT_ALGORITHM}")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    logger.info("Auth Service ready")

app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"], summary="Health Check", description="Check service health status", status_code=200)
def health_check():
    logger.info("Health check called")
    return {"status": "ok", "service": "auth-service"}
