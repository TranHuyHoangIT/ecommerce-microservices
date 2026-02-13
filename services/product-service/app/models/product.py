# Service: Product Service
# Responsibility: Product model for catalog
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy import Column, Integer, String, Float, Text, JSON
from app.db.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    category = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    images = Column(JSON, nullable=True)  # Array of image URLs
    rating = Column(Float, nullable=True, default=0.0)
    reviews_count = Column(Integer, nullable=True, default=0)
    sku = Column(String, nullable=True, unique=True)
    specifications = Column(JSON, nullable=True)  # Key-value pairs
