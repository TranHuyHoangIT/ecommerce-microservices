# Service: Product Service
# Responsibility: Wishlist repository for DB operations
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.models.wishlist import Wishlist
from app.models.product import Product
from typing import List

class WishlistRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_to_wishlist(self, user_id: int, product_id: int) -> Wishlist:
        # Check if already exists
        existing = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        ).first()
        
        if existing:
            return existing
        
        wishlist_item = Wishlist(user_id=user_id, product_id=product_id)
        self.db.add(wishlist_item)
        self.db.commit()
        self.db.refresh(wishlist_item)
        return wishlist_item

    def remove_from_wishlist(self, user_id: int, product_id: int) -> bool:
        wishlist_item = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        ).first()
        
        if not wishlist_item:
            return False
        
        self.db.delete(wishlist_item)
        self.db.commit()
        return True

    def get_user_wishlist(self, user_id: int) -> List[Wishlist]:
        return self.db.query(Wishlist).filter(Wishlist.user_id == user_id).all()

    def get_user_wishlist_with_products(self, user_id: int):
        return self.db.query(Wishlist, Product).join(
            Product, Wishlist.product_id == Product.id
        ).filter(Wishlist.user_id == user_id).all()

    def is_in_wishlist(self, user_id: int, product_id: int) -> bool:
        return self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        ).first() is not None
