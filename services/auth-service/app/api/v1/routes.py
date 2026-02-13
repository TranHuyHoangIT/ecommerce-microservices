# Service: Auth Service
# Responsibility: API endpoints for authentication
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app.schemas.user import UserCreate, UserRead, UserLogin, Token, UserUpdate, ChangePassword, UserRoleUpdate, UserBlockUpdate, AdminCreateUser, AdminCreateUserResponse
from app.services.user import UserService
from app.db.session import SessionLocal
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/auth/register", response_model=UserRead, tags=["Auth"], summary="Register user", description="Register a new user", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.register(user_in)
    return user

@router.post("/auth/login", response_model=Token, tags=["Auth"], summary="User login", description="Authenticate user and return JWT token", status_code=status.HTTP_200_OK)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    service = UserService(db)
    user_in = UserLogin(email=form_data.username, password=form_data.password)
    return service.authenticate(user_in)

@router.get("/users/me", response_model=UserRead, tags=["Users"], summary="Get current user", description="Get current authenticated user profile")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile"""
    return current_user

@router.put("/users/me", response_model=UserRead, tags=["Users"], summary="Update profile", description="Update current user's profile information", status_code=status.HTTP_200_OK)
async def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update current user's profile"""
    service = UserService(db)
    updated_user = service.update_profile(current_user.id, user_update)
    return updated_user

@router.post("/users/me/change-password", response_model=UserRead, tags=["Users"], summary="Change password", description="Change current user's password", status_code=status.HTTP_200_OK)
async def change_password(password_data: ChangePassword, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Change current user's password"""
    service = UserService(db)
    updated_user = service.change_password(current_user.id, password_data)
    return updated_user

# Admin routes
@router.get("/admin/users", response_model=List[UserRead], tags=["Admin"], summary="Get all users", description="Get all users (admin only)", status_code=status.HTTP_200_OK)
async def get_all_users(
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user), 
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    service = UserService(db)
    return service.get_all_users(skip, limit)

@router.put("/admin/users/{user_id}/role", response_model=UserRead, tags=["Admin"], summary="Update user role", description="Update user role (admin only)", status_code=status.HTTP_200_OK)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user role (admin only)"""
    service = UserService(db)
    return service.update_user_role(user_id, role_update.role)

@router.put("/admin/users/{user_id}/status", response_model=UserRead, tags=["Admin"], summary="Block/unblock user", description="Block or unblock user (admin only)", status_code=status.HTTP_200_OK)
async def update_user_status(
    user_id: int,
    status_update: UserBlockUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Block/unblock user (admin only)"""
    service = UserService(db)
    return service.update_user_status(user_id, status_update.is_active)

@router.post("/admin/users", response_model=AdminCreateUserResponse, tags=["Admin"], summary="Create new user", description="Admin creates new customer or staff user (admin only)", status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(
    user_data: AdminCreateUser,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create new user and send welcome email with password (admin only)"""
    service = UserService(db)
    result = service.create_user_by_admin(user_data.dict())
    
    return AdminCreateUserResponse(
        user=result["user"],
        temp_password=result["temp_password"],
        email_sent=result["email_sent"],
        message=f"User created successfully. {'Email sent to user.' if result['email_sent'] else 'Failed to send email.'}"
    )

@router.delete("/admin/users/{user_id}", tags=["Admin"], summary="Delete user", description="Delete user account (admin only)", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    service = UserService(db)
    success = service.delete_user(user_id)
    return {"message": "User deleted successfully", "success": success}

@router.put("/admin/users/{user_id}", response_model=UserRead, tags=["Admin"], summary="Update user", description="Update user information (admin only)", status_code=status.HTTP_200_OK)
async def update_user_by_admin(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user info (admin only)"""
    service = UserService(db)
    return service.update_user_by_admin(user_id, user_update.dict(exclude_unset=True))
