# Service: Auth Service
# Responsibility: User business logic
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy.orm import Session
import logging
from app.repositories.user import UserRepository, verify_password
from app.schemas.user import UserCreate, UserLogin, UserUpdate, ChangePassword
from app.models.user import User
from app.core.security import create_access_token
from app.schemas.user import Token
from app.core.email import email_service
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class UserService:
    """Service for user business logic."""
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, user_in: UserCreate) -> User:
        if self.repo.get_by_email(user_in.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        return self.repo.create(user_in)

    def authenticate(self, user_in: UserLogin) -> Token:
        logger.info(f"Authenticating user: {user_in.email}")
        user = self.repo.get_by_email(user_in.email)
        
        if not user:
            logger.warning(f"User not found: {user_in.email}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        logger.info(f"User found: {user.id}, checking password...")
        if not verify_password(user_in.password, user.hashed_password):
            logger.warning(f"Invalid password for user: {user_in.email}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        logger.info(f"Password verified, creating token...")
        access_token = create_access_token(data={"sub": user.email, "role": user.role})
        logger.info(f"Token created successfully for user: {user.id}")
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            role=user.role,
            user_id=user.id,
            full_name=user.full_name
        )

    def update_profile(self, user_id: int, user_update: UserUpdate) -> User:
        """Update user profile information"""
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return self.repo.update(user, user_update)

    def change_password(self, user_id: int, password_data: ChangePassword) -> User:
        """Change user password"""
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        # Verify current password
        if not verify_password(password_data.current_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")
        
        # Validate new password
        if len(password_data.new_password) < 6:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters")
        
        return self.repo.change_password(user, password_data.new_password)

    def get_all_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users (admin only)"""
        return self.repo.get_all_users(skip, limit)

    def update_user_role(self, user_id: int, new_role: str) -> User:
        """Update user role (admin only)"""
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        if new_role not in ["admin", "staff", "customer"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
        
        return self.repo.update_user_role(user, new_role)

    def update_user_status(self, user_id: int, is_active: bool) -> User:
        """Block/unblock user (admin only)"""
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        return self.repo.update_user_status(user, is_active)
    
    def create_user_by_admin(self, user_data: dict) -> dict:
        """
        Create user by admin and send welcome email with password
        Only allows creating customer and staff roles
        
        Returns dict with user info and password for admin reference
        """
        # Validation
        if user_data.get('role') not in ['customer', 'staff']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Admin can only create customer or staff accounts"
            )
        
        # Check if email exists
        if self.repo.get_by_email(user_data['email']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate temporary password
        temp_password = email_service.generate_temp_password()
        
        # Create user with temp password
        user_create = UserCreate(
            email=user_data['email'],
            password=temp_password,
            full_name=user_data.get('full_name', ''),
            phone=user_data.get('phone'),
            role=user_data['role']
        )
        
        user = self.repo.create(user_create)
        
        # Send welcome email
        email_sent = email_service.send_welcome_email(
            to_email=user.email,
            full_name=user.full_name or user.email,
            temp_password=temp_password,
            role=user.role
        )
        
        return {
            "user": user,
            "temp_password": temp_password,
            "email_sent": email_sent
        }
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user (admin only)"""
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent deleting admin accounts
        if user.role == 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete admin accounts"
            )
        
        return self.repo.delete_user(user_id)
    
    def update_user_by_admin(self, user_id: int, user_data: dict) -> User:
        """
        Update user info by admin
        Can update email, full_name, phone, and role (customer/staff only)
        """
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent editing admin accounts
        if user.role == 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot edit admin accounts"
            )
        
        # Validate role if provided
        if 'role' in user_data and user_data['role'] not in ['customer', 'staff']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only set role to customer or staff"
            )
        
        # Check email uniqueness if email is being changed
        if 'email' in user_data and user_data['email'] != user.email:
            existing_user = self.repo.get_by_email(user_data['email'])
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Update user
        user_update = UserUpdate(**user_data)
        return self.repo.update(user, user_update)
