# Service: Auth Service
# Responsibility: Seed sample users for development
# Architecture: FastAPI + SQLAlchemy + PostgreSQL

from app.db.session import SessionLocal
from app.models.user import User
from app.repositories.user import get_password_hash
from app.db.session import engine, Base
Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()
    # Admin account
    admin = User(
        email="admin@admin.com",
        hashed_password=get_password_hash("999999999"),
        full_name="Admin",
        role="admin"
    )
    if not db.query(User).filter_by(email=admin.email).first():
        db.add(admin)
    
    # Demo users
    users = [
        User(email="staff@example.com", hashed_password=get_password_hash("password"), full_name="Staff User", role="staff"),
        User(email="staff@staff.com", hashed_password=get_password_hash("123456789"), full_name="Staff User", role="staff"),
        User(email="customer@example.com", hashed_password=get_password_hash("password"), full_name="Customer User", role="customer"),
        User(email="customer@customer.com", hashed_password=get_password_hash("123456789"), full_name="Customer User", role="customer"),
    ]
    for user in users:
        if not db.query(User).filter_by(email=user.email).first():
            db.add(user)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_users()
