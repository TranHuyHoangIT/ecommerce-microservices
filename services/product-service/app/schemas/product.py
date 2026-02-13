# Service: Product Service
# Responsibility: Pydantic schemas for product
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from pydantic import BaseModel
from typing import Optional, List, Dict

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    price: float
    stock: int
    category: Optional[str] = None
    brand: Optional[str] = None
    images: Optional[List[str]] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    sku: Optional[str] = None
    specifications: Optional[Dict[str, str]] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int
    class Config:
        from_attributes = True
