# Service: Auth Service
# Responsibility: User repository for DB operations
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from passlib.context import CryptContext
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

class UserRepository:
    """Repository for user database operations."""
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, user_in: UserCreate) -> User:
        hashed_password = get_password_hash(user_in.password)
        db_user = User(email=user_in.email, hashed_password=hashed_password, full_name=user_in.full_name)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user: User, user_update: UserUpdate) -> User:
        """Update user profile information"""
        if user_update.full_name is not None:
            user.full_name = user_update.full_name
        if user_update.phone is not None:
            user.phone = user_update.phone
        if user_update.email is not None:
            user.email = user_update.email
        if user_update.role is not None:
            user.role = user_update.role
        
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, user: User, new_password: str) -> User:
        """Change user password"""
        user.hashed_password = get_password_hash(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users (admin only)"""
        return self.db.query(User).offset(skip).limit(limit).all()

    def update_user_role(self, user: User, new_role: str) -> User:
        """Update user role (admin only)"""
        user.role = new_role
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user_status(self, user: User, is_active: bool) -> User:
        """Block/unblock user (admin only)"""
        user.is_active = is_active
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int) -> bool:
        """Delete user from database"""
        user = self.get_by_id(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False
