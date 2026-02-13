# Service: Product Service
# Responsibility: Wishlist business logic
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.repositories.wishlist import WishlistRepository
from app.models.wishlist import Wishlist
from typing import List

class WishlistService:
    def __init__(self, db: Session):
        self.repo = WishlistRepository(db)

    def add_to_wishlist(self, user_id: int, product_id: int) -> Wishlist:
        return self.repo.add_to_wishlist(user_id, product_id)

    def remove_from_wishlist(self, user_id: int, product_id: int) -> bool:
        return self.repo.remove_from_wishlist(user_id, product_id)

    def get_user_wishlist(self, user_id: int) -> List:
        return self.repo.get_user_wishlist(user_id)

    def get_user_wishlist_with_products(self, user_id: int):
        results = self.repo.get_user_wishlist_with_products(user_id)
        # Transform to return list of products with wishlist id
        products = []
        for wishlist_item, product in results:
            product_dict = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "image": product.image,
                "price": product.price,
                "stock": product.stock,
                "category": product.category,
                "brand": product.brand,
                "images": product.images,
                "rating": product.rating,
                "reviews_count": product.reviews_count,
                "sku": product.sku,
                "specifications": product.specifications,
                "wishlist_id": wishlist_item.id
            }
            products.append(product_dict)
        return products

    def is_in_wishlist(self, user_id: int, product_id: int) -> bool:
        return self.repo.is_in_wishlist(user_id, product_id)
