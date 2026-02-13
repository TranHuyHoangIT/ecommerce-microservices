# Service: Auth Service
# Responsibility: Handle user registration, login, JWT authentication
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.models.user import User  # Ensure all models are imported
from app.api.v1.routes import router as api_router

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
    Base.metadata.create_all(bind=engine)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"], summary="Health Check", description="Check service health status", status_code=200)
def health_check():
    return {"status": "ok", "service": "auth-service"}
