# Service: Order Service
# Responsibility: Admin-only API endpoints for order management
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import SessionLocal
from app.services.order import OrderService
from app.schemas.order import OrderRead, OrderUpdate

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/admin/orders", response_model=List[OrderRead], tags=["Admin - Orders"],
            summary="Get all orders (Admin)", description="Get all orders with filters (Admin only)",
            status_code=200)
def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all orders with optional status filter (Admin only)"""
    if status:
        return OrderService.get_orders_by_status(db, status, skip, limit)
    return OrderService.get_orders(db, skip, limit)

@router.put("/admin/orders/{order_id}/status", response_model=OrderRead, tags=["Admin - Orders"],
            summary="Update order status (Admin)", description="Update order status (Admin only)",
            status_code=200)
def update_order_status(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    """Update order status (Admin only)
    
    Valid statuses: pending, confirmed, shipping, delivered, cancelled
    """
    if order_update.status:
        valid_statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"]
        if order_update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    order = OrderService.update_order(db, order_id, order_update)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/admin/orders/{order_id}/cancel", response_model=OrderRead, tags=["Admin - Orders"],
             summary="Cancel order (Admin)", description="Cancel an order (Admin only)",
             status_code=200)
def cancel_order(order_id: int, reason: Optional[str] = None, db: Session = Depends(get_db)):
    """Cancel an order (Admin only)"""
    order = OrderService.cancel_order(db, order_id, reason)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/admin/orders/{order_id}/refund", response_model=OrderRead, tags=["Admin - Orders"],
             summary="Refund order (Admin)", description="Process order refund (Admin only)",
             status_code=200)
def refund_order(order_id: int, amount: Optional[float] = None, db: Session = Depends(get_db)):
    """Process order refund (Admin only)"""
    order = OrderService.refund_order(db, order_id, amount)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/admin/orders/stats", tags=["Admin - Orders"],
            summary="Get order statistics", description="Get order statistics (Admin only)",
            status_code=200)
def get_order_stats(db: Session = Depends(get_db)):
    """Get order statistics (Admin only)"""
    return OrderService.get_order_stats(db)
