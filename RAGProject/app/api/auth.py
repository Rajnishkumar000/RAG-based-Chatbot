# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
# from app.services.auth_service import AuthService
# from loguru import logger

# router = APIRouter(prefix="/auth", tags=["Authentication"])

# @router.post("/register", response_model=UserResponse)
# async def register(user_data: UserCreate, db: Session = Depends(get_db)):
#     """Register a new user"""
#     try:
#         user = AuthService.create_user(user_data, db)
#         return UserResponse.from_orm(user)
#     except Exception as e:
#         logger.error(f"Registration failed: {e}")
#         raise

# @router.post("/login", response_model=Token)
# async def login(login_data: UserLogin, db: Session = Depends(get_db)):
#     """Login user and return access token"""
#     try:
#         user = AuthService.authenticate_user(login_data.email, login_data.password, db)
#         access_token = AuthService.create_access_token_for_user(user)
#         return Token(access_token=access_token)
#     except Exception as e:
#         logger.error(f"Login failed: {e}")
#         raise
from app.core.auth import get_current_user
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user = AuthService.create_user(user_data, db)
        return UserResponse.model_validate(user)
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user using username & password, return access token"""
    try:
        user = AuthService.authenticate_user(form_data.username, form_data.password, db)
        access_token = AuthService.create_access_token_for_user(user)
        return Token(access_token=access_token, token_type="bearer")
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)