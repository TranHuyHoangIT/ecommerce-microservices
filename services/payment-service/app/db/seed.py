# Service: Payment Service
# Responsibility: Seed initial data for payment_db
# Architecture: FastAPI + SQLAlchemy + PostgreSQL
from app.db.session import SessionLocal
from app.models.payment import Payment
from app.db.session import engine, Base
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Example: Add a sample payment if none exists
        if not db.query(Payment).first():
            payment = Payment(order_id=1, user_id=1, amount=100.0, status="pending")
            db.add(payment)
            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
