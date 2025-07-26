# # app/services/embedding_service.py
# from sentence_transformers import SentenceTransformer
# from typing import List
# from loguru import logger
# from app.config.settings import settings

# class EmbeddingService:
#     def __init__(self):
#         self.model_name = settings.embedding_model
#         self.model = None
#         self._load_model()
    
#     def _load_model(self):
#         try:
#             self.model = SentenceTransformer(self.model_name)
#             logger.info(f"Loaded embedding model: {self.model_name}")
#         except Exception as e:
#             logger.error(f"Failed to load embedding model: {e}")
#             raise
    
#     def embed_text(self, text: str) -> List[float]:
#         """Generate embeddings for a single text"""
#         try:
#             embedding = self.model.encode(text)
#             return embedding.tolist()
#         except Exception as e:
#             logger.error(f"Failed to generate embedding: {e}")
#             raise
    
#     def embed_texts(self, texts: List[str]) -> List[List[float]]:
#         """Generate embeddings for multiple texts"""
#         try:
#             embeddings = self.model.encode(texts)
#             return [emb.tolist() for emb in embeddings]
#         except Exception as e:
#             logger.error(f"Failed to generate embeddings: {e}")
#             raise



# app/services/embedding_service.py
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Union
from loguru import logger
from app.config.settings import settings
import re

class EmbeddingService:
    def __init__(self):
        self.model_name = settings.embedding_model
        self.model = None
        self.max_chunk_size = 400  # Conservative token limit
        self.chunk_overlap = 50    # tokens overlap
        self.enable_chunking = True  # Flag to enable/disable chunking
        self._load_model()
    
    def _load_model(self):
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded embedding model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def _estimate_tokens(self, text: str) -> int:
        """Rough estimation of tokens (1 token ≈ 4 characters for English)"""
        return len(text.split())  # Simple word count approximation
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
        return text.strip()
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Simple sentence splitting (fallback if NLTK not available)"""
        # Split on sentence endings but keep them
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _chunk_text_simple(self, text: str) -> List[str]:
        """
        Simple chunking that splits text into manageable pieces
        This maintains backward compatibility while adding chunking benefits
        """
        if not self.enable_chunking:
            return [text]  # Return original text if chunking disabled
        
        # Clean the text
        cleaned_text = self._clean_text(text)
        
        # Check if text is small enough to not need chunking
        if self._estimate_tokens(cleaned_text) <= self.max_chunk_size:
            return [cleaned_text]
        
        # Split into sentences
        sentences = self._split_into_sentences(cleaned_text)
        
        if not sentences:
            # Fallback: split by words if sentence splitting fails
            words = cleaned_text.split()
            chunks = []
            for i in range(0, len(words), self.max_chunk_size - self.chunk_overlap):
                chunk = ' '.join(words[i:i + self.max_chunk_size])
                chunks.append(chunk)
            return chunks
        
        # Group sentences into chunks
        chunks = []
        current_chunk = ""
        current_tokens = 0
        
        for sentence in sentences:
            sentence_tokens = self._estimate_tokens(sentence)
            
            # If adding this sentence exceeds chunk size, save current chunk
            if current_tokens + sentence_tokens > self.max_chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                
                # Start new chunk with overlap from previous chunk
                words = current_chunk.split()
                overlap_words = words[-self.chunk_overlap:] if len(words) > self.chunk_overlap else words
                current_chunk = ' '.join(overlap_words) + " " + sentence
                current_tokens = self._estimate_tokens(current_chunk)
            else:
                # Add sentence to current chunk
                current_chunk += " " + sentence if current_chunk else sentence
                current_tokens += sentence_tokens
        
        # Add the last chunk if it has content
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        # Ensure we have at least one chunk
        if not chunks:
            chunks = [cleaned_text]
        
        logger.info(f"Split text into {len(chunks)} chunks")
        return chunks
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embeddings for a single text
        NOW WITH AUTOMATIC CHUNKING AND AVERAGING
        """
        try:
            # Check if we need to chunk this text
            chunks = self._chunk_text_simple(text)
            
            if len(chunks) == 1:
                # Single chunk - process normally
                embedding = self.model.encode(chunks[0])
                return embedding.tolist()
            else:
                # Multiple chunks - embed each and average
                logger.info(f"Text split into {len(chunks)} chunks, will average embeddings")
                chunk_embeddings = []
                
                for i, chunk in enumerate(chunks):
                    try:
                        chunk_embedding = self.model.encode(chunk)
                        chunk_embeddings.append(chunk_embedding)
                        logger.debug(f"Generated embedding for chunk {i+1}/{len(chunks)}")
                    except Exception as e:
                        logger.warning(f"Failed to embed chunk {i}: {e}")
                        continue
                
                if not chunk_embeddings:
                    raise Exception("Failed to generate embeddings for all chunks")
                
                # Average the embeddings
                import numpy as np
                averaged_embedding = np.mean(chunk_embeddings, axis=0)
                
                logger.info(f"Averaged embeddings from {len(chunk_embeddings)} chunks")
                return averaged_embedding.tolist()
                
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts
        NOW WITH AUTOMATIC CHUNKING FOR EACH TEXT
        """
        try:
            all_embeddings = []
            
            for i, text in enumerate(texts):
                try:
                    embedding = self.embed_text(text)  # This now handles chunking automatically
                    all_embeddings.append(embedding)
                    logger.debug(f"Generated embedding for text {i+1}/{len(texts)}")
                except Exception as e:
                    logger.error(f"Failed to generate embedding for text {i}: {e}")
                    # Add a zero embedding as placeholder to maintain list length
                    embedding_dim = 384  # Default for all-MiniLM-L6-v2
                    all_embeddings.append([0.0] * embedding_dim)
            
            logger.info(f"Generated embeddings for {len(all_embeddings)} texts")
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    # BONUS METHODS - These provide additional functionality without breaking existing code
    
    def embed_text_with_chunks(self, text: str) -> Dict[str, Any]:
        """
        BONUS: Get detailed chunking information
        Returns both the final embedding and chunk details
        """
        try:
            chunks = self._chunk_text_simple(text)
            
            chunk_details = []
            chunk_embeddings = []
            
            for i, chunk in enumerate(chunks):
                chunk_embedding = self.model.encode(chunk)
                chunk_embeddings.append(chunk_embedding)
                
                chunk_details.append({
                    'chunk_index': i,
                    'text': chunk,
                    'token_count': self._estimate_tokens(chunk),
                    'embedding': chunk_embedding.tolist()
                })
            
            # Calculate final embedding
            if len(chunk_embeddings) == 1:
                final_embedding = chunk_embeddings[0].tolist()
            else:
                import numpy as np
                final_embedding = np.mean(chunk_embeddings, axis=0).tolist()
            
            return {
                'final_embedding': final_embedding,
                'chunks': chunk_details,
                'total_chunks': len(chunks),
                'chunking_applied': len(chunks) > 1
            }
            
        except Exception as e:
            logger.error(f"Failed to generate embedding with chunk details: {e}")
            raise
    
    def get_chunking_stats(self, text: str) -> Dict[str, Any]:
        """
        BONUS: Get statistics about how text would be chunked
        Useful for debugging and optimization
        """
        try:
            chunks = self._chunk_text_simple(text)
            token_counts = [self._estimate_tokens(chunk) for chunk in chunks]
            
            return {
                'original_length': len(text),
                'original_tokens': self._estimate_tokens(text),
                'total_chunks': len(chunks),
                'avg_tokens_per_chunk': sum(token_counts) // len(token_counts) if token_counts else 0,
                'min_tokens': min(token_counts) if token_counts else 0,
                'max_tokens': max(token_counts) if token_counts else 0,
                'chunking_needed': len(chunks) > 1,
                'chunk_sizes': token_counts
            }
            
        except Exception as e:
            logger.error(f"Failed to get chunking stats: {e}")
            return {}
    
    def set_chunking_enabled(self, enabled: bool):
        """
        BONUS: Enable or disable chunking
        Useful for A/B testing or debugging
        """
        self.enable_chunking = enabled
        logger.info(f"Chunking {'enabled' if enabled else 'disabled'}")
    
    def configure_chunking(self, chunk_size: int = None, overlap: int = None):
        """
        BONUS: Configure chunking parameters
        """
        if chunk_size is not None:
            self.max_chunk_size = chunk_size
            logger.info(f"Chunk size set to {chunk_size}")
        
        if overlap is not None:
            self.chunk_overlap = overlap
            logger.info(f"Chunk overlap set to {overlap}")
