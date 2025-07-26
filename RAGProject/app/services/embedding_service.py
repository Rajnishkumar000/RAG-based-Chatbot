# app/services/embedding_service.py
from sentence_transformers import SentenceTransformer
from typing import List
from loguru import logger
from app.config.settings import settings

class EmbeddingService:
    def __init__(self):
        self.model_name = settings.embedding_model
        self.model = None
        self._load_model()
    
    def _load_model(self):
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded embedding model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def embed_text(self, text: str) -> List[float]:
        """Generate embeddings for a single text"""
        try:
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        try:
            embeddings = self.model.encode(texts)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise



