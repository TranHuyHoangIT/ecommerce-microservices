# Service: Payment Service
# Responsibility: Handle payment processing (mock), notify order-service
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentUpdate

class PaymentRepository:
    """Repository for Payment model DB operations."""
    @staticmethod
    def create_payment(db: Session, payment: PaymentCreate) -> Payment:
        db_payment = Payment(**payment.dict())
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment

    @staticmethod
    def get_payment(db: Session, payment_id: int) -> Payment:
        return db.query(Payment).filter(Payment.id == payment_id).first()

    @staticmethod
    def get_payments(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Payment).offset(skip).limit(limit).all()

    @staticmethod
    def update_payment(db: Session, payment_id: int, payment_update: PaymentUpdate) -> Payment:
        db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if db_payment:
            for key, value in payment_update.dict(exclude_unset=True).items():
                setattr(db_payment, key, value)
            db.commit()
            db.refresh(db_payment)
        return db_payment

    @staticmethod
    def delete_payment(db: Session, payment_id: int):
        db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if db_payment:
            db.delete(db_payment)
            db.commit()
        return db_payment
