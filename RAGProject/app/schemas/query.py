# app/schemas/query.py
from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    
class QueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[dict]
    
class SearchResult(BaseModel):
    document_id: int
    title: str
    content: str
    score: float