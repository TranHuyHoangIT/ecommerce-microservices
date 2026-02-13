# Service: API Gateway
# Responsibility: Route requests to appropriate microservices
# Architecture: FastAPI + httpx for service-to-service communication

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    AUTH_SERVICE_URL: str = "http://auth-service:8000"
    PRODUCT_SERVICE_URL: str = "http://product-service:8000"
    ORDER_SERVICE_URL: str = "http://order-service:8000"
    PAYMENT_SERVICE_URL: str = "http://payment-service:8000"
    
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    
    class Config:
        env_file = ".env"

settings = Settings()
