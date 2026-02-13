# Service: Payment Service
# Responsibility: Handle payment processing (mock), notify order-service
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import FastAPI
from app.api.v1.routes import router as payment_router
from app.db.session import engine, Base

app = FastAPI(
    title="Payment Service",
    description="Handles payment processing and notifies order-service.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    # Import all models before creating tables
    from app.models.payment import Payment
    Base.metadata.create_all(bind=engine)

app.include_router(payment_router, prefix="/api/v1/payments", tags=["payments"])

@app.get("/health", tags=["health"], summary="Health Check", description="Check health of Payment Service", response_model=dict, status_code=200)
def health_check():
    return {"status": "ok", "service": "payment-service"}
