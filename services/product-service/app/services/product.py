# Service: Product Service
# Responsibility: Product business logic
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.product import Product
from typing import List, Optional

class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def get_product(self, product_id: int) -> Optional[Product]:
        return self.repo.get(product_id)

    def get_products(self) -> List[Product]:
        return self.repo.get_all()

    def create_product(self, product_in: ProductCreate) -> Product:
        return self.repo.create(product_in)

    def update_product(self, product_id: int, product_in: ProductUpdate) -> Optional[Product]:
        return self.repo.update(product_id, product_in)

    def delete_product(self, product_id: int) -> Optional[Product]:
        return self.repo.delete(product_id)
    
    def search_products(self, query: str) -> List[Product]:
        return self.repo.search(query)
    
    def get_products_by_category(self, category: str) -> List[Product]:
        return self.repo.get_by_category(category)
    
    def get_related_products(self, product_id: int, limit: int = 4) -> List[Product]:
        return self.repo.get_related_products(product_id, limit)
    
    def get_product_stats(self) -> dict:
        """Get product statistics for admin dashboard"""
        products = self.repo.get_all()
        total = len(products)
        in_stock = sum(1 for p in products if p.stock > 0)
        out_of_stock = total - in_stock
        low_stock = sum(1 for p in products if 0 < p.stock < 10)
        total_value = sum(p.price * p.stock for p in products)
        
        return {
            "total_products": total,
            "in_stock": in_stock,
            "out_of_stock": out_of_stock,
            "low_stock": low_stock,
            "total_inventory_value": round(total_value, 2)
        }
