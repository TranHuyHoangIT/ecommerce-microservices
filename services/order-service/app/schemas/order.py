from pydantic import BaseModel
from typing import Optional, List
import datetime

class OrderItemBase(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float
    image: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    id: int
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    shipping_address: str
    payment_method: str

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    shipping_address: Optional[str] = None
    note: Optional[str] = None

class OrderRead(OrderBase):
    id: int
    order_number: str
    total: float
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True

# Legacy schema for backward compatibility
class OrderOut(OrderRead):
    pass

