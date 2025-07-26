# app/schemas/document.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentCreate(BaseModel):
    title: str
    content: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    pinecone_id: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DocumentList(BaseModel):
    id: int
    title: str
    created_at: datetime
    
    class Config:
        from_attributes = True