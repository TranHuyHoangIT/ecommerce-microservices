# Service: Product Service
# Responsibility: Admin-only API endpoints for product management
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from app.services.product import ProductService
from app.services.category import CategoryService
from app.db.session import SessionLocal
import os
import uuid
from pathlib import Path

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Image upload directory
UPLOAD_DIR = Path("uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/admin/products", response_model=ProductRead, tags=["Admin - Products"], 
             summary="Create product (Admin)", description="Create a new product (Admin only)", 
             status_code=status.HTTP_201_CREATED)
def admin_create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product (Admin only)"""
    return ProductService(db).create_product(product_in)

@router.put("/admin/products/{product_id}", response_model=ProductRead, tags=["Admin - Products"],
            summary="Update product (Admin)", description="Update product by ID (Admin only)",
            status_code=status.HTTP_200_OK)
def admin_update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Update product (Admin only)"""
    product = ProductService(db).update_product(product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/admin/products/{product_id}", response_model=ProductRead, tags=["Admin - Products"],
               summary="Delete product (Admin)", description="Delete product by ID (Admin only)",
               status_code=status.HTTP_200_OK)
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete product (Admin only)"""
    product = ProductService(db).delete_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/admin/products/upload-image", tags=["Admin - Products"],
             summary="Upload product image", description="Upload product image (Admin only)",
             status_code=status.HTTP_200_OK)
async def upload_product_image(file: UploadFile = File(...)):
    """Upload product image and return URL"""
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Return URL accessible through API Gateway at localhost:8080
        image_url = f"http://localhost:8080/uploads/products/{unique_filename}"
        return {"image_url": image_url, "filename": unique_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.put("/admin/products/{product_id}/stock", response_model=ProductRead, tags=["Admin - Products"],
            summary="Update product stock", description="Update product inventory/stock (Admin only)",
            status_code=status.HTTP_200_OK)
def update_product_stock(product_id: int, stock: int, db: Session = Depends(get_db)):
    """Update product stock (Admin only)"""
    product = ProductService(db).update_product(product_id, ProductUpdate(stock=stock))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Category Management (Admin)
@router.post("/admin/categories", response_model=CategoryRead, tags=["Admin - Categories"],
             summary="Create category (Admin)", description="Create a new category (Admin only)",
             status_code=status.HTTP_201_CREATED)
def admin_create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category (Admin only)"""
    return CategoryService(db).create_category(category_in)

@router.put("/admin/categories/{category_id}", response_model=CategoryRead, tags=["Admin - Categories"],
            summary="Update category (Admin)", description="Update category (Admin only)",
            status_code=status.HTTP_200_OK)
def admin_update_category(category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_db)):
    """Update category (Admin only)"""
    return CategoryService(db).update_category(category_id, category_in)

@router.delete("/admin/categories/{category_id}", response_model=CategoryRead, tags=["Admin - Categories"],
               summary="Delete category (Admin)", description="Delete category (Admin only)",
               status_code=status.HTTP_200_OK)
def admin_delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete category (Admin only)"""
    return CategoryService(db).delete_category(category_id)

@router.get("/admin/products/stats", tags=["Admin - Products"],
            summary="Get product statistics", description="Get product inventory statistics (Admin only)",
            status_code=status.HTTP_200_OK)
def get_product_stats(db: Session = Depends(get_db)):
    """Get product statistics (Admin only)"""
    return ProductService(db).get_product_stats()
