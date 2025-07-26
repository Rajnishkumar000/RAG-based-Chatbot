# app/services/rag_service.py
from typing import List, Dict
from loguru import logger
from app.services.embedding_service import EmbeddingService
from app.services.pinecone_service import PineconeService
from app.services.llm_service import LLMService
from app.schemas.query import QueryResponse, SearchResult
from sqlalchemy.orm import Session
from app.models.document import Document

class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.pinecone_service = PineconeService()
        self.llm_service = LLMService()
    
    def add_document(self, document: Document, db: Session) -> str:
        """Add a document to the RAG system"""
        try:
            # Generate embedding
            embedding = self.embedding_service.embed_text(document.content)
            
            # Prepare metadata
            metadata = {
                "document_id": document.id,
                "title": document.title,
                "content": document.content,
                "owner_id": document.owner_id
            }
            
            # Store in Pinecone
            pinecone_id = self.pinecone_service.upsert_document(
                str(document.id), embedding, metadata
            )
            
            # Update document with Pinecone ID
            document.pinecone_id = pinecone_id
            db.commit()
            
            logger.info(f"Added document to RAG system: {document.title}")
            return pinecone_id
            
        except Exception as e:
            logger.error(f"Failed to add document to RAG: {e}")
            db.rollback()
            raise
    
    def search_documents(self, query: str, user_id: int, top_k: int = 5) -> List[SearchResult]:
        """Search for relevant documents"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.embed_text(query)
            
            # Search in Pinecone with user filter
            results = self.pinecone_service.search(
                query_embedding, 
                top_k=top_k,
                filter_dict={"owner_id": user_id}
            )
            
            # Convert to SearchResult objects
            search_results = []
            for result in results:
                search_results.append(SearchResult(
                    document_id=result.metadata["document_id"],
                    title=result.metadata["title"],
                    content=result.metadata["content"][:200] + "...",
                    score=result.score
                ))
            
            logger.info(f"Found {len(search_results)} relevant documents")
            return search_results
            
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            raise
    
    def query(self, query: str, user_id: int, top_k: int = 5) -> QueryResponse:
        """Perform RAG query - retrieve and generate"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.embed_text(query)
            
            # Search for relevant documents
            retrieved_docs = self.pinecone_service.search(
                query_embedding,
                top_k=top_k,
                filter_dict={"owner_id": user_id}
            )
            
            if not retrieved_docs:
                return QueryResponse(
                    query=query,
                    answer="I couldn't find any relevant documents to answer your question.",
                    sources=[]
                )
            
            # Generate answer using LLM
            answer = self.llm_service.generate_answer(query, retrieved_docs)
            
            # Prepare sources
            sources = [
                {
                    "document_id": doc.metadata["document_id"],
                    "title": doc.metadata["title"],
                    "score": doc.score
                }
                for doc in retrieved_docs
            ]
            
            logger.info(f"Generated RAG response for query: {query[:50]}...")
            
            return QueryResponse(
                query=query,
                answer=answer,
                sources=sources
            )
            
        except Exception as e:
            logger.error(f"Failed to process RAG query: {e}")
            raise
    
    def delete_document(self, document: Document, db: Session):
        """Remove document from RAG system"""
        try:
            # Delete from Pinecone
            if document.pinecone_id:
                self.pinecone_service.delete_document(document.pinecone_id)
            
            # Delete from database
            db.delete(document)
            db.commit()
            
            logger.info(f"Deleted document from RAG system: {document.title}")
            
        except Exception as e:
            logger.error(f"Failed to delete document from RAG: {e}")
            db.rollback()
            raise
