# Service: Auth Service
# Responsibility: User model for authentication
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from sqlalchemy import Column, Integer, String, Enum, Boolean
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, default="customer", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
