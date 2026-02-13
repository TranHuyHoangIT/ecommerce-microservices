# Service: Product Service
# Responsibility: Category business logic
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.models.category import Category
from typing import List

class CategoryService:
    """Service for category business logic"""
    
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)
    
    def get_all_categories(self, skip: int = 0, limit: int = 100) -> List[Category]:
        """Get all categories"""
        return self.repo.get_all(skip, limit)
    
    def get_category_by_id(self, category_id: int) -> Category:
        """Get category by ID"""
        category = self.repo.get_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        return category
    
    def create_category(self, category_in: CategoryCreate) -> Category:
        """Create new category"""
        # Check if category name already exists
        existing = self.repo.get_by_name(category_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
        
        return self.repo.create(category_in)
    
    def update_category(self, category_id: int, category_update: CategoryUpdate) -> Category:
        """Update category"""
        category = self.get_category_by_id(category_id)
        
        # Check name uniqueness if name is being updated
        if category_update.name and category_update.name != category.name:
            existing = self.repo.get_by_name(category_update.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category with this name already exists"
                )
        
        return self.repo.update(category, category_update)
    
    def delete_category(self, category_id: int) -> Category:
        """Delete category"""
        category = self.get_category_by_id(category_id)
        return self.repo.delete(category)
