from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from app.db.session import SessionLocal
from app.services.order import OrderService
from app.services.analytics import AnalyticsService
from app.schemas.order import OrderCreate, OrderUpdate, OrderRead
from typing import List
from app.services.cart import (
    get_user_cart, 
    add_item_to_cart, 
    remove_item_from_cart, 
    update_cart_item_quantity,
    clear_cart,
    CartItem
)
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/orders", response_model=OrderRead, tags=["Orders"], summary="Create order", description="Create a new order", status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    logger.info(f"=== Create Order Request ===")
    logger.info(f"User ID: {order.user_id}")
    logger.info(f"Items count: {len(order.items)}")
    result = OrderService.create_order(db, order)
    logger.info(f"Order created: {result.id}")
    return result

@router.get("/orders/{order_id}", response_model=OrderRead, tags=["Orders"], summary="Get order", description="Get order by ID", status_code=200)
def get_order(order_id: int, db: Session = Depends(get_db)):
    logger.info(f"=== Get Order Request: {order_id} ===")
    order = OrderService.get_order(db, order_id)
    if not order:
        logger.warning(f"Order not found: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")
    logger.info(f"Order found: {order.id}, status: {order.status}")
    return order

@router.get("/orders", response_model=List[OrderRead], tags=["Orders"], summary="List all orders", description="Get all orders", status_code=200)
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return OrderService.get_orders(db, skip, limit)

@router.get("/orders/user/{user_id}", response_model=List[OrderRead], tags=["Orders"], summary="Get user orders", description="Get all orders for a specific user", status_code=200)
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    return OrderService.get_orders_by_user(db, user_id)

@router.put("/orders/{order_id}", response_model=OrderRead, tags=["Orders"], summary="Update order", description="Update order status or details", status_code=200)
def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    order = OrderService.update_order(db, order_id, order_update)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}/status", response_model=OrderRead, tags=["Orders"], summary="Update order status", description="Update order status (for staff)", status_code=200)
def update_order_status(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    """Update order status (Staff/Admin)
    
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

@router.delete("/orders/{order_id}", response_model=OrderRead, tags=["Orders"], summary="Delete order", description="Delete an order", status_code=200)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = OrderService.delete_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# Cart endpoints
@router.get("/cart", tags=["Cart"])
def get_cart():
    """Get current user's cart items"""
    # For now, use a fixed user_id. In production, extract from JWT token
    user_id = "default_user"
    cart_items = get_user_cart(user_id)
    return [item.dict() for item in cart_items]

@router.post("/cart", tags=["Cart"])
def add_to_cart(item: dict):
    """Add item to cart"""
    user_id = "default_user"
    
    # Create cart item with proper type conversion
    cart_item = CartItem(
        id=f"cart-{uuid.uuid4()}",
        product_id=str(item.get("product_id")),  # Convert to string
        quantity=item.get("quantity", 1),
        price=float(item.get("price", 100.0)),
        name=str(item.get("name", "Product")),
        image=str(item.get("image", "/placeholder.png"))
    )
    
    added_item = add_item_to_cart(user_id, cart_item)
    return added_item.dict()

@router.post("/cart/checkout", tags=["Cart"])
def checkout_cart():
    """Checkout cart"""
    user_id = "default_user"
    clear_cart(user_id)
    return {"message": "Checkout successful", "success": True}

@router.delete("/cart/{item_id}", tags=["Cart"])
def remove_cart_item(item_id: str):
    """Remove item from cart"""
    user_id = "default_user"
    success = remove_item_from_cart(user_id, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item removed", "success": True}

@router.put("/cart/{item_id}", tags=["Cart"])
def update_cart_item(item_id: str, item: dict):
    """Update cart item quantity"""
    user_id = "default_user"
    quantity = item.get("quantity", 1)
    success = update_cart_item_quantity(user_id, item_id, quantity)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item updated", "success": True}

# Analytics endpoints (admin only)
@router.get("/analytics/stats", tags=["Analytics"], summary="Get dashboard stats", description="Get overall statistics for admin dashboard", status_code=200)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    return AnalyticsService.get_dashboard_stats(db)

@router.get("/analytics/revenue", tags=["Analytics"], summary="Get revenue data", description="Get revenue data grouped by period", status_code=200)
def get_revenue_data(period: str = "daily", days: int = 30, db: Session = Depends(get_db)):
    """Get revenue data"""
    return AnalyticsService.get_revenue_by_period(db, period, days)

@router.get("/analytics/top-products", tags=["Analytics"], summary="Get top products", description="Get top selling products", status_code=200)
def get_top_products(limit: int = 10, db: Session = Depends(get_db)):
    """Get top selling products"""
    return AnalyticsService.get_top_products(db, limit)

@router.get("/analytics/orders-by-status", tags=["Analytics"], summary="Get orders by status", description="Get order counts grouped by status", status_code=200)
def get_orders_by_status(db: Session = Depends(get_db)):
    """Get orders by status"""
    return AnalyticsService.get_orders_by_status(db)
