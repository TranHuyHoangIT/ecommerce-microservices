# Service: Payment Service
# Responsibility: Handle payment processing (mock), notify order-service
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from pydantic import BaseModel
from typing import Optional
import datetime

class PaymentBase(BaseModel):
    order_id: int
    user_id: int
    amount: float
    status: Optional[str] = "pending"

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str]

class PaymentOut(PaymentBase):
    id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True
