# Service: Product Service
# Responsibility: Category repository
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.models.category import Category  
from app.schemas.category import CategoryCreate, CategoryUpdate
from typing import Optional, List

class CategoryRepository:
    """Repository for category database operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Category]:
        """Get all categories"""
        return self.db.query(Category).offset(skip).limit(limit).all()
    
    def get_by_id(self, category_id: int) -> Optional[Category]:
        """Get category by ID"""
        return self.db.query(Category).filter(Category.id == category_id).first()
    
    def get_by_name(self, name: str) -> Optional[Category]:
        """Get category by name"""
        return self.db.query(Category).filter(Category.name == name).first()
    
    def create(self, category_in: CategoryCreate) -> Category:
        """Create new category"""
        db_category = Category(**category_in.dict())
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        return db_category
    
    def update(self, category: Category, category_update: CategoryUpdate) -> Category:
        """Update category"""
        update_data = category_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        self.db.commit()
        self.db.refresh(category)
        return category
    
    def delete(self, category: Category) -> Category:
        """Delete category"""
        self.db.delete(category)
        self.db.commit()
        return category
