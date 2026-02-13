# Service: Order Service
# Cart storage with in-memory implementation
# For production, should use database or Redis

from typing import Dict, List
from pydantic import BaseModel

class CartItem(BaseModel):
    id: str
    product_id: str
    quantity: int
    price: float
    name: str
    image: str

# In-memory cart storage (user_id -> cart items)
# In production, use Redis or database
cart_storage: Dict[str, List[CartItem]] = {}

def get_user_cart(user_id: str) -> List[CartItem]:
    """Get cart items for a user"""
    return cart_storage.get(user_id, [])

def add_item_to_cart(user_id: str, item: CartItem) -> CartItem:
    """Add item to user's cart"""
    if user_id not in cart_storage:
        cart_storage[user_id] = []
    
    # Check if item already exists
    for existing_item in cart_storage[user_id]:
        if existing_item.product_id == item.product_id:
            existing_item.quantity += item.quantity
            return existing_item
    
    # Add new item
    cart_storage[user_id].append(item)
    return item

def remove_item_from_cart(user_id: str, item_id: str) -> bool:
    """Remove item from cart"""
    if user_id not in cart_storage:
        return False
    
    cart_storage[user_id] = [item for item in cart_storage[user_id] if item.id != item_id]
    return True

def update_cart_item_quantity(user_id: str, item_id: str, quantity: int) -> bool:
    """Update cart item quantity"""
    if user_id not in cart_storage:
        return False
    
    for item in cart_storage[user_id]:
        if item.id == item_id:
            item.quantity = quantity
            return True
    return False

def clear_cart(user_id: str) -> None:
    """Clear user's cart"""
    if user_id in cart_storage:
        cart_storage[user_id] = []
