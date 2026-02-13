# Service: Payment Service
# Responsibility: Handle payment processing (mock), notify order-service
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.repositories.payment import PaymentRepository
from app.schemas.payment import PaymentCreate, PaymentUpdate

class PaymentService:
    """Business logic for payment processing."""
    @staticmethod
    def create_payment(db: Session, payment: PaymentCreate):
        return PaymentRepository.create_payment(db, payment)

    @staticmethod
    def get_payment(db: Session, payment_id: int):
        return PaymentRepository.get_payment(db, payment_id)

    @staticmethod
    def get_payments(db: Session, skip: int = 0, limit: int = 100):
        return PaymentRepository.get_payments(db, skip, limit)

    @staticmethod
    def update_payment(db: Session, payment_id: int, payment_update: PaymentUpdate):
        return PaymentRepository.update_payment(db, payment_id, payment_update)

    @staticmethod
    def delete_payment(db: Session, payment_id: int):
        return PaymentRepository.delete_payment(db, payment_id)
