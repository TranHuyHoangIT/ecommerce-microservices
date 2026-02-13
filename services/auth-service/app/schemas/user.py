# Service: Auth Service
# Responsibility: Pydantic schemas for user
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "customer"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None

class ChangePassword(BaseModel):
    """Schema for changing user password"""
    current_password: str
    new_password: str

class UserRead(UserBase):
    id: int
    role: str
    phone: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    """Schema for updating user role (admin only)"""
    role: str

class UserBlockUpdate(BaseModel):
    """Schema for blocking/unblocking user (admin only)"""
    is_active: bool

class AdminCreateUser(BaseModel):
    """Schema for admin creating new user"""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str  # customer or staff only

class AdminCreateUserResponse(BaseModel):
    """Response for admin user creation"""
    user: UserRead
    temp_password: str
    email_sent: bool
    message: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
