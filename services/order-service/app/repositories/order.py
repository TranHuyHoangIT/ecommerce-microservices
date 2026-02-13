from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate
from typing import List
import uuid

class OrderRepository:
    @staticmethod
    def create_order(db: Session, order: OrderCreate) -> Order:
        # Generate unique order number
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate total
        total = sum(item.price * item.quantity for item in order.items)
        
        # Create order
        db_order = Order(
            order_number=order_number,
            user_id=order.user_id,
            user_name=order.user_name,
            user_email=order.user_email,
            total=total,
            shipping_address=order.shipping_address,
            payment_method=order.payment_method,
            status="pending"
        )
        db.add(db_order)
        db.flush()  # Get order id without committing
        
        # Create order items
        for item in order.items:
            db_item = OrderItem(
                order_id=db_order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                price=item.price,
                image=item.image
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def get_order(db: Session, order_id: int) -> Order:
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        return db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_orders_by_user(db: Session, user_id: int) -> List[Order]:
        return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

    @staticmethod
    def update_order(db: Session, order_id: int, order_update: OrderUpdate) -> Order:
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if db_order:
            for key, value in order_update.model_dump(exclude_unset=True).items():
                setattr(db_order, key, value)
            db.commit()
            db.refresh(db_order)
        return db_order

    @staticmethod
    def delete_order(db: Session, order_id: int):
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if db_order:
            db.delete(db_order)
            db.commit()
        return db_order
    
    @staticmethod
    def get_orders_by_status(db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get all orders filtered by status"""
        return db.query(Order).filter(Order.status == status).offset(skip).limit(limit).all()


