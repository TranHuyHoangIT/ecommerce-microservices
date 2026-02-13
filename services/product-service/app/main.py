# Service: Product Service
# Responsibility: Handle product catalog, categories, inventory
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging
from app.db.session import engine, Base
from app.api.v1.routes import router as api_router
from app.api.v1.admin_routes import router as admin_router
from app.models.product import Product
from app.models.wishlist import Wishlist

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Product Service",
    description="Product microservice for E-Commerce platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    logger.info("=== Product Service Starting ===")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    logger.info("Product Service ready")

# Mount static files for uploaded images
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(api_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check():
    logger.info("Health check called")
    return {"status": "ok", "service": "product-service"}

@app.get("/health", tags=["Health"], summary="Health Check", description="Check health of product service", status_code=200)
def health_check():
    return {"status": "ok", "service": "product-service"}
