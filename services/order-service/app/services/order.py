from sqlalchemy.orm import Session
from app.repositories.order import OrderRepository
from app.schemas.order import OrderCreate, OrderUpdate
from typing import List
from app.models.order import Order

class OrderService:
    @staticmethod
    def create_order(db: Session, order: OrderCreate) -> Order:
        return OrderRepository.create_order(db, order)

    @staticmethod
    def get_order(db: Session, order_id: int) -> Order:
        return OrderRepository.get_order(db, order_id)

    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        return OrderRepository.get_orders(db, skip, limit)

    @staticmethod
    def get_orders_by_user(db: Session, user_id: int) -> List[Order]:
        return OrderRepository.get_orders_by_user(db, user_id)

    @staticmethod
    def update_order(db: Session, order_id: int, order_update: OrderUpdate) -> Order:
        return OrderRepository.update_order(db, order_id, order_update)

    @staticmethod
    def delete_order(db: Session, order_id: int) -> Order:
        return OrderRepository.delete_order(db, order_id)
    
    @staticmethod
    def get_orders_by_status(db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Order]:
        return OrderRepository.get_orders_by_status(db, status, skip, limit)
    
    @staticmethod
    def cancel_order(db: Session, order_id: int, reason: str = None) -> Order:
        """Cancel an order"""
        order_update = OrderUpdate(status="cancelled")
        return OrderRepository.update_order(db, order_id, order_update)
    
    @staticmethod
    def refund_order(db: Session, order_id: int, amount: float = None) -> Order:
        """Process order refund"""
        # In a real-world scenario, this would integrate with payment gateway
        order = OrderRepository.get_order(db, order_id)
        if not order:
            return None
        
        # Update order status to cancelled and add refund info
        order_update = OrderUpdate(status="cancelled")
        return OrderRepository.update_order(db, order_id, order_update)
    
    @staticmethod
    def get_order_stats(db: Session) -> dict:
        """Get order statistics for admin dashboard"""
        orders = OrderRepository.get_orders(db, 0, 10000)
        
        total_orders = len(orders)
        total_revenue = sum(order.total for order in orders)
        
        status_counts = {}
        for order in orders:
            status = order.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "pending": status_counts.get("pending", 0),
            "confirmed": status_counts.get("confirmed", 0),
            "shipping": status_counts.get("shipping", 0),
            "delivered": status_counts.get("delivered", 0),
            "cancelled": status_counts.get("cancelled", 0),
            "status_breakdown": status_counts
        }

