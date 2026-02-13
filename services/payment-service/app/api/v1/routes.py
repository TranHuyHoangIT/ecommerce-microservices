# Service: Payment Service
# Responsibility: Handle payment processing (mock), notify order-service
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.payment import PaymentService
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", tags=["payments"], summary="Create Payment", description="Create a new payment record", response_model=PaymentOut, status_code=201)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    return PaymentService.create_payment(db, payment)

@router.get("/{payment_id}", tags=["payments"], summary="Get Payment", description="Retrieve payment by ID", response_model=PaymentOut, status_code=200)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = PaymentService.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.get("/", tags=["payments"], summary="List Payments", description="List all payments", response_model=list[PaymentOut], status_code=200)
def get_payments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return PaymentService.get_payments(db, skip, limit)

@router.put("/{payment_id}", tags=["payments"], summary="Update Payment", description="Update payment status", response_model=PaymentOut, status_code=200)
def update_payment(payment_id: int, payment_update: PaymentUpdate, db: Session = Depends(get_db)):
    payment = PaymentService.update_payment(db, payment_id, payment_update)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.delete("/{payment_id}", tags=["payments"], summary="Delete Payment", description="Delete payment record", response_model=PaymentOut, status_code=200)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = PaymentService.delete_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
