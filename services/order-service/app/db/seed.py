# Service: Order Service
# Responsibility: Seed initial data for order_db
# Architecture: FastAPI + SQLAlchemy + PostgreSQL
from app.db.session import SessionLocal
from app.models.order import Order, OrderItem
from app.db.session import engine, Base
import datetime

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Example: Add a sample order with items if none exists
        if not db.query(Order).first():
            # Create order
            order = Order(
                order_number=f"ORD-{datetime.datetime.utcnow().strftime('%Y%m%d')}-001",
                user_id=1,
                total=150.0,
                status="pending",
                shipping_address="123 Main Street, Hanoi, Vietnam",
                payment_method="credit_card"
            )
            db.add(order)
            db.flush()  # Get the order ID
            
            # Create order items
            item1 = OrderItem(
                order_id=order.id,
                product_id=1,
                product_name="Sample Product 1",
                quantity=2,
                price=50.0,
                image="sample1.jpg"
            )
            item2 = OrderItem(
                order_id=order.id,
                product_id=2,
                product_name="Sample Product 2",
                quantity=1,
                price=50.0,
                image="sample2.jpg"
            )
            db.add(item1)
            db.add(item2)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
