from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.query import QueryRequest, QueryResponse, SearchResult
from app.services.rag_service import RAGService
from loguru import logger

router = APIRouter(prefix="/query", tags=["Query"])
rag_service = RAGService()

@router.post("/", response_model=QueryResponse)
async def query_documents(
    query_request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Query documents using RAG"""
    try:
        response = rag_service.query(
            query_request.query,
            current_user.id,
            query_request.top_k
        )
        
        logger.info(f"Processed query for user {current_user.username}: {query_request.query[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Failed to process query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process query"
        )

@router.post("/search", response_model=List[SearchResult])
async def search_documents(
    query_request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search documents without generating an answer"""
    try:
        results = rag_service.search_documents(
            query_request.query,
            current_user.id,
            query_request.top_k
        )
        
        logger.info(f"Searched documents for user {current_user.username}")
        return results
        
    except Exception as e:
        logger.error(f"Failed to search documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search documents"
        )
    