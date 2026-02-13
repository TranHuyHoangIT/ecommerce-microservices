# Service: API Gateway
# Responsibility: Forward requests to backend microservices
# Architecture: FastAPI + httpx for reverse proxy

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
from app.core.config import settings
from app.core.auth import verify_token

app = FastAPI(
    title="API Gateway",
    description="Central gateway for E-Commerce Microservices",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service routing map
SERVICE_MAP = {
    "/api/v1/auth": settings.AUTH_SERVICE_URL,
    "/api/v1/users": settings.AUTH_SERVICE_URL,
    "/api/v1/admin/users": settings.AUTH_SERVICE_URL,
    "/api/v1/admin/products": settings.PRODUCT_SERVICE_URL,
    "/api/v1/admin/categories": settings.PRODUCT_SERVICE_URL,
    "/api/v1/admin/orders": settings.ORDER_SERVICE_URL,
    "/api/v1/cart": settings.ORDER_SERVICE_URL,
    "/api/v1/products": settings.PRODUCT_SERVICE_URL,
    "/api/v1/categories": settings.PRODUCT_SERVICE_URL,
    "/api/v1/wishlist": settings.PRODUCT_SERVICE_URL,
    "/api/v1/orders": settings.ORDER_SERVICE_URL,
    "/api/v1/analytics": settings.ORDER_SERVICE_URL,
    "/api/v1/payments": settings.PAYMENT_SERVICE_URL,
    "/uploads": settings.PRODUCT_SERVICE_URL,  # Static files for product images
}

# Public routes (no authentication required)
PUBLIC_ROUTES = [
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/products",
    "/api/v1/categories",
    "/uploads",  # Allow public access to uploaded images
]

def get_service_url(path: str) -> str:
    """Get target service URL based on request path"""
    for prefix, service_url in SERVICE_MAP.items():
        if path.startswith(prefix):
            return service_url
    raise HTTPException(status_code=404, detail="Service not found")

def is_public_route(path: str) -> bool:
    """Check if route requires authentication"""
    for public_path in PUBLIC_ROUTES:
        if path.startswith(public_path):
            return True
    return False

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "api-gateway"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"], tags=["Gateway"])
async def gateway(path: str, request: Request):
    """Forward all requests to appropriate microservice"""
    full_path = f"/{path}"
    
    # Check authentication for protected routes
    token_payload = None
    if not is_public_route(full_path):
        token_payload = await verify_token(request)
    
    # Get target service URL
    service_url = get_service_url(full_path)
    target_url = f"{service_url}/{path}"
    
    # Forward request
    async with httpx.AsyncClient() as client:
        try:
            # Prepare request headers - forward all headers including Authorization
            headers = {}
            for key, value in request.headers.items():
                if key.lower() != "host":
                    headers[key] = value
            
            # Get request body
            body = await request.body()
            
            # Forward request to target service
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Return response from target service
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
