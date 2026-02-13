# Service: Product Service
# Responsibility: Pydantic schemas for wishlist
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from pydantic import BaseModel
from app.schemas.product import ProductRead

class WishlistBase(BaseModel):
    user_id: int
    product_id: int

class WishlistCreate(BaseModel):
    product_id: int

class WishlistRead(BaseModel):
    id: int
    user_id: int
    product_id: int
    
    class Config:
        from_attributes = True

class WishlistWithProduct(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: ProductRead
    
    class Config:
        from_attributes = True
