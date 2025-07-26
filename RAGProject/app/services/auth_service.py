# from sqlalchemy.orm import Session
# from app.models.user import User
# from app.schemas.auth import UserCreate
# from app.core.auth import get_password_hash, verify_password, create_access_token
# from loguru import logger
# from fastapi import HTTPException, status
# from datetime import timedelta
# from app.config.settings import settings

# class AuthService:
#     @staticmethod
#     def create_user(user_data: UserCreate, db: Session) -> User:
#         """Create a new user"""
#         try:
#             # Check if user already exists
#             existing_user = db.query(User).filter(
#                 (User.email == user_data.email) | (User.username == user_data.username)
#             ).first()
            
#             if existing_user:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="User with this email or username already exists"
#                 )
            
#             # Create new user
#             hashed_password = get_password_hash(user_data.password)
#             db_user = User(
#                 email=user_data.email,
#                 username=user_data.username,
#                 hashed_password=hashed_password
#             )
            
#             db.add(db_user)
#             db.commit()
#             db.refresh(db_user)
            
#             logger.info(f"Created new user: {user_data.username}")
#             return db_user
            
#         except HTTPException:
#             raise
#         except Exception as e:
#             logger.error(f"Failed to create user: {e}")
#             db.rollback()
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail="Failed to create user"
#             )
    
#     @staticmethod
#     def authenticate_user(email: str, password: str, db: Session) -> User:
#         """Authenticate user credentials"""
#         user = db.query(User).filter(User.email == email).first()
#         if not user or not verify_password(password, user.hashed_password):
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Incorrect email or password"
#             )
#         return user
    
#     @staticmethod
#     def create_access_token_for_user(user: User) -> str:
#         """Create access token for user"""
#         access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
#         access_token = create_access_token(
#             data={"sub": str(user.id)}, expires_delta=access_token_expires
#         )
#         return access_token

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate
from app.core.auth import get_password_hash, verify_password, create_access_token
from loguru import logger
from fastapi import HTTPException, status
from datetime import timedelta
from app.config.settings import settings

class AuthService:
    @staticmethod
    def create_user(user_data: UserCreate, db: Session) -> User:
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Created user: {user_data.username}")
        return db_user

    @staticmethod
    def authenticate_user(username: str, password: str, db: Session) -> User:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        return user

    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        expires = timedelta(minutes=settings.access_token_expire_minutes)
        return create_access_token(data={"sub": str(user.id)}, expires_delta=expires)
