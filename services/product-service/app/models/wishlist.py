# Service: Product Service
# Responsibility: Wishlist/Favorites model
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.db.session import Base

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product'),
    )
