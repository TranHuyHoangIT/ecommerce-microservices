# Service: Product Service
# Responsibility: Product repository for DB operations
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, product_id: int):
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_all(self):
        return self.db.query(Product).all()

    def create(self, product_in: ProductCreate):
        db_product = Product(**product_in.model_dump())
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def update(self, product_id: int, product_in: ProductUpdate):
        db_product = self.get(product_id)
        if not db_product:
            return None
        for field, value in product_in.model_dump(exclude_unset=True).items():
            setattr(db_product, field, value)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def delete(self, product_id: int):
        db_product = self.get(product_id)
        if not db_product:
            return None
        self.db.delete(db_product)
        self.db.commit()
        return db_product

    def search(self, query: str):
        """Search products by name, description, category, or brand"""
        search_term = f"%{query}%"
        return self.db.query(Product).filter(
            (Product.name.ilike(search_term)) |
            (Product.description.ilike(search_term)) |
            (Product.category.ilike(search_term)) |
            (Product.brand.ilike(search_term))
        ).all()
    
    def get_by_category(self, category: str):
        return self.db.query(Product).filter(Product.category == category).all()
    
    def get_related_products(self, product_id: int, limit: int = 4):
        """Get related products based on category"""
        product = self.get(product_id)
        if not product:
            return []
        
        return self.db.query(Product).filter(
            Product.category == product.category,
            Product.id != product_id
        ).limit(limit).all()
