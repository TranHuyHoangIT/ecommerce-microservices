# Service: Product Service
# Responsibility: API endpoints for product
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import logging
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead
from app.schemas.wishlist import WishlistCreate, WishlistRead
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from app.services.product import ProductService
from app.services.wishlist import WishlistService
from app.services.category import CategoryService
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/products", response_model=List[ProductRead], tags=["Products"], summary="List products", description="Get all products", status_code=status.HTTP_200_OK)
def list_products(db: Session = Depends(get_db)):
    logger.info("=== List Products Request ===")
    products = ProductService(db).get_products()
    logger.info(f"Returning {len(products)} products")
    return products

@router.get("/products/search", response_model=List[ProductRead], tags=["Products"], summary="Search products", description="Search products by name, description, category, or brand", status_code=status.HTTP_200_OK)
def search_products(q: str = Query(..., description="Search query"), db: Session = Depends(get_db)):
    return ProductService(db).search_products(q)

@router.get("/products/category/{category}", response_model=List[ProductRead], tags=["Products"], summary="Get products by category", description="Get all products in a category", status_code=status.HTTP_200_OK)
def get_products_by_category(category: str, db: Session = Depends(get_db)):
    return ProductService(db).get_products_by_category(category)

@router.get("/products/{product_id}", response_model=ProductRead, tags=["Products"], summary="Get product", description="Get product by ID", status_code=status.HTTP_200_OK)
def get_product(product_id: int, db: Session = Depends(get_db)):
    logger.info(f"=== Get Product Request: {product_id} ===")
    product = ProductService(db).get_product(product_id)
    if not product:
        logger.warning(f"Product not found: {product_id}")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"Product found: {product.name}")
    return product

@router.get("/products/{product_id}/related", response_model=List[ProductRead], tags=["Products"], summary="Get related products", description="Get related products based on category", status_code=status.HTTP_200_OK)
def get_related_products(product_id: int, limit: int = Query(4, ge=1, le=20), db: Session = Depends(get_db)):
    return ProductService(db).get_related_products(product_id, limit)

@router.post("/products", response_model=ProductRead, tags=["Products"], summary="Create product", description="Create a new product", status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    return ProductService(db).create_product(product_in)

@router.put("/products/{product_id}", response_model=ProductRead, tags=["Products"], summary="Update product", description="Update product by ID", status_code=status.HTTP_200_OK)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    product = ProductService(db).update_product(product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/products/{product_id}", response_model=ProductRead, tags=["Products"], summary="Delete product", description="Delete product by ID", status_code=status.HTTP_200_OK)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = ProductService(db).delete_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Wishlist/Favorites endpoints
@router.post("/wishlist", response_model=WishlistRead, tags=["Wishlist"], summary="Add to wishlist", description="Add a product to user's wishlist", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(user_id: int, wishlist_in: WishlistCreate, db: Session = Depends(get_db)):
    return WishlistService(db).add_to_wishlist(user_id, wishlist_in.product_id)

@router.delete("/wishlist/{user_id}/{product_id}", tags=["Wishlist"], summary="Remove from wishlist", description="Remove a product from user's wishlist", status_code=status.HTTP_200_OK)
def remove_from_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):
    success = WishlistService(db).remove_from_wishlist(user_id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"message": "Removed from wishlist"}

@router.get("/wishlist/{user_id}", tags=["Wishlist"], summary="Get user wishlist", description="Get all products in user's wishlist", status_code=status.HTTP_200_OK)
def get_user_wishlist(user_id: int, db: Session = Depends(get_db)):
    return WishlistService(db).get_user_wishlist_with_products(user_id)

@router.get("/wishlist/{user_id}/check/{product_id}", tags=["Wishlist"], summary="Check if in wishlist", description="Check if a product is in user's wishlist", status_code=status.HTTP_200_OK)
def check_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):
    is_in_wishlist = WishlistService(db).is_in_wishlist(user_id, product_id)
    return {"is_in_wishlist": is_in_wishlist}

# Category Management endpoints (Admin only)
@router.get("/categories", response_model=List[CategoryRead], tags=["Categories"], summary="List categories", description="Get all product categories", status_code=status.HTTP_200_OK)
def list_categories(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db)):
    return CategoryService(db).get_all_categories(skip, limit)

@router.get("/categories/{category_id}", response_model=CategoryRead, tags=["Categories"], summary="Get category", description="Get category by ID", status_code=status.HTTP_200_OK)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return CategoryService(db).get_category_by_id(category_id)

@router.post("/categories", response_model=CategoryRead, tags=["Categories"], summary="Create category", description="Create a new product category (Admin only)", status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService(db).create_category(category_in)

@router.put("/categories/{category_id}", response_model=CategoryRead, tags=["Categories"], summary="Update category", description="Update category by ID (Admin only)", status_code=status.HTTP_200_OK)
def update_category(category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_db)):
    return CategoryService(db).update_category(category_id, category_in)

@router.delete("/categories/{category_id}", response_model=CategoryRead, tags=["Categories"], summary="Delete category", description="Delete category by ID (Admin only)", status_code=status.HTTP_200_OK)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    return CategoryService(db).delete_category(category_id)

