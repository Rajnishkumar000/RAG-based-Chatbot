# # app/schemas/auth.py
# from pydantic import BaseModel, EmailStr
# from datetime import datetime
# from typing import Optional

# class UserCreate(BaseModel):
#     email: EmailStr
#     username: str
#     password: str

# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str

# class UserResponse(BaseModel):
#     id: int
#     email: str
#     username: str
#     is_active: bool
#     created_at: datetime
    
#     class Config:
#         from_attributes = True

# class Token(BaseModel):
#     access_token: str
#     token_type: str = "bearer"

# class TokenData(BaseModel):
#     user_id: Optional[str] = None



from pydantic import BaseModel, EmailStr,ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
