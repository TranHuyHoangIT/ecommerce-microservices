# Service: Order Service
# Responsibility: Analytics for admin dashboard  
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.order import Order, OrderItem
from typing import Dict, List
from datetime import datetime, timedelta

class AnalyticsService:
    """Service for analytics and statistics"""
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict:
        """Get dashboard statistics"""
        # Total orders
        total_orders = db.query(Order).count()
        
        # Total revenue
        total_revenue = db.query(func.sum(Order.total)).scalar() or 0
        
        # Count products (total order items)
        total_products = db.query(func.count(OrderItem.id)).scalar() or 0
        
        # Count unique users
        total_users = db.query(func.count(func.distinct(Order.user_id))).scalar() or 0
        
        # Orders by status
        pending = db.query(Order).filter(Order.status == "pending").count()
        confirmed = db.query(Order).filter(Order.status == "confirmed").count()
        shipping = db.query(Order).filter(Order.status == "shipping").count()
        delivered = db.query(Order).filter(Order.status == "delivered").count()
        cancelled = db.query(Order).filter(Order.status == "cancelled").count()
        
        return {
            "totalOrders": total_orders,
            "totalRevenue": float(total_revenue),
            "totalProducts": total_products,
            "totalUsers": total_users,
            "pending": pending,
            "confirmed": confirmed,
            "shipping": shipping,
            "delivered": delivered,
            "cancelled": cancelled,
        }
    
    @staticmethod
    def get_revenue_by_period(db: Session, period: str = "daily", days: int = 30) -> List[Dict]:
        """Get revenue data grouped by period"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        if period == "daily":
            # Group by date
            results = db.query(
                func.date(Order.created_at).label("date"),
                func.sum(Order.total).label("revenue"),
                func.count(Order.id).label("order_count")
            ).filter(
                Order.created_at >= cutoff_date
            ).group_by(
                func.date(Order.created_at)
            ).order_by(
                func.date(Order.created_at)
            ).all()
            
            return [
                {
                    "date": str(r.date),
                    "revenue": float(r.revenue or 0),
                    "order_count": r.order_count
                }
                for r in results
            ]
        
        return []
    
    @staticmethod
    def get_top_products(db: Session, limit: int = 10) -> List[Dict]:
        """Get top selling products"""
        results = db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_quantity"),
            func.sum(OrderItem.price * OrderItem.quantity).label("total_revenue")
        ).group_by(
            OrderItem.product_id,
            OrderItem.product_name
        ).order_by(
            desc("total_quantity")
        ).limit(limit).all()
        
        return [
            {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "total_quantity": r.total_quantity,
                "total_revenue": float(r.total_revenue or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def get_orders_by_status(db: Session) -> Dict:
        """Get order counts by status"""
        results = db.query(
            Order.status,
            func.count(Order.id).label("count")
        ).group_by(Order.status).all()
        
        status_breakdown = {r.status: r.count for r in results}
        
        return {
            "pending": status_breakdown.get("pending", 0),
            "confirmed": status_breakdown.get("confirmed", 0),
            "shipping": status_breakdown.get("shipping", 0),
            "delivered": status_breakdown.get("delivered", 0),
            "cancelled": status_breakdown.get("cancelled", 0),
            "status_breakdown": status_breakdown
        }
        
        return [
            {
                "status": r.status,
                "count": r.count
            }
            for r in results
        ]
