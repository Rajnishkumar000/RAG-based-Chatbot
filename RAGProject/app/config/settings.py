# # app/config/settings.py



# app/config/settings.py
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./rag_app.db"
    
    # JWT
    secret_key: str = "NothingSecret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Pinecone - Modern API configuration
    pinecone_api_key: str
    pinecone_index_name: str = "rag-documents"
    
    # For serverless (recommended for new projects)
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"
    
    # Groq API
    groq_api_key: str
    
    # Hugging Face
    huggingface_api_token: Optional[str] = None
    
    # Embedding Model
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    # App
    app_name: str = "RAG Application"
    version: str = "1.0.0"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()