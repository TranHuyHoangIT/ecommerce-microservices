from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import router as order_router
from app.api.v1.admin_routes import router as admin_router
from app.db.session import engine, Base
from app.models.order import Order, OrderItem

app = FastAPI(
    title="Order Service",
    description="Handles order management.",
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
    Base.metadata.create_all(bind=engine)

app.include_router(order_router, prefix="/api/v1", tags=["orders"])
app.include_router(admin_router, prefix="/api/v1")

@app.get("/health", tags=["health"], summary="Health Check", description="Check health of Order Service", response_model=dict, status_code=200)
def health_check():
    return {"status": "ok", "service": "order-service"}
