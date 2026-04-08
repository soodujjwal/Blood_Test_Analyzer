from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from typing import Optional
from app.models import UserRegister, UserLogin, TokenResponse, RefreshTokenRequest, User
from app.services import AuthService, MongoDBService
from fastapi import Request

router = APIRouter()
security = HTTPBearer()

def get_db(request: Request):
    return request.app.state.db if hasattr(request.app.state, 'db') else None

async def get_current_user(request: Request, credentials: Optional[HTTPAuthCredentials] = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    request.state.user_id = payload["sub"]
    request.state.email = payload["email"]
    return payload

@router.post("/signup", response_model=TokenResponse)
async def signup(request: UserRegister, req: Request):
    db = MongoDBService(req.app.state.db)
    
    # Check if user exists
    existing = await db.get_user_by_email(request.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Create user
    hashed_pwd = AuthService.hash_password(request.password)
    user_id = await db.create_user(request.email, request.full_name, hashed_pwd)
    
    # Create tokens
    tokens = AuthService.create_tokens(user_id, request.email)
    
    return TokenResponse(**tokens)

@router.post("/login", response_model=TokenResponse)
async def login(request: UserLogin, req: Request):
    db = MongoDBService(req.app.state.db)
    
    # Find user
    user = await db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Verify password
    if not AuthService.verify_password(request.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Create tokens
    tokens = AuthService.create_tokens(str(user["_id"]), request.email)
    
    return TokenResponse(**tokens)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshTokenRequest):
    payload = AuthService.verify_token(request.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    tokens = AuthService.create_tokens(payload["sub"], payload["email"])
    
    return TokenResponse(**tokens)

@router.get("/me", response_model=User)
async def get_current_user_info(req: Request, user: dict = Depends(get_current_user)):
    db = MongoDBService(req.app.state.db)
    user_data = await db.get_user_by_id(user["sub"])
    
    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return User(
        id=str(user_data["_id"]),
        email=user_data["email"],
        full_name=user_data["full_name"],
        created_at=user_data.get("created_at"),
        updated_at=user_data.get("updated_at")
    )
