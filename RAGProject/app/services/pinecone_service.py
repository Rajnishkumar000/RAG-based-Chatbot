# # app/services/pinecone_service.py
# import pinecone
# from typing import List, Dict, Any
# from loguru import logger
# from app.config.settings import settings
# import uuid

# class PineconeService:
#     def __init__(self):
#         self.api_key = settings.pinecone_api_key
#         self.environment = settings.pinecone_environment
#         self.index_name = settings.pinecone_index_name
#         self.index = None
#         self._initialize()
    
#     def _initialize(self):
#         try:
#             pinecone.init(
#                 api_key=self.api_key,
#                 environment=self.environment
#             )
            
#             # Create index if it doesn't exist
#             if self.index_name not in pinecone.list_indexes():
#                 pinecone.create_index(
#                     name=self.index_name,
#                     dimension=384,  # Dimension for all-MiniLM-L6-v2
#                     metric="cosine"
#                 )
#                 logger.info(f"Created Pinecone index: {self.index_name}")
            
#             self.index = pinecone.Index(self.index_name)
#             logger.info(f"Connected to Pinecone index: {self.index_name}")
#         except Exception as e:
#             logger.error(f"Failed to initialize Pinecone: {e}")
#             raise
    
#     def upsert_document(self, document_id: str, embedding: List[float], metadata: Dict[str, Any]) -> str:
#         """Store document embedding in Pinecone"""
#         try:
#             vector_id = f"doc_{document_id}_{uuid.uuid4().hex[:8]}"
#             self.index.upsert([
#                 {
#                     "id": vector_id,
#                     "values": embedding,
#                     "metadata": metadata
#                 }
#             ])
#             logger.info(f"Upserted document to Pinecone: {vector_id}")
#             return vector_id
#         except Exception as e:
#             logger.error(f"Failed to upsert document: {e}")
#             raise
    
#     def search(self, query_embedding: List[float], top_k: int = 5, filter_dict: Dict = None) -> List[Dict]:
#         """Search for similar documents"""
#         try:
#             results = self.index.query(
#                 vector=query_embedding,
#                 top_k=top_k,
#                 include_metadata=True,
#                 filter=filter_dict
#             )
#             return results.matches
#         except Exception as e:
#             logger.error(f"Failed to search Pinecone: {e}")
#             raise
    
#     def delete_document(self, vector_id: str):
#         """Delete document from Pinecone"""
#         try:
#             self.index.delete(ids=[vector_id])
#             logger.info(f"Deleted document from Pinecone: {vector_id}")
#         except Exception as e:
#             logger.error(f"Failed to delete document: {e}")
#             raise





# app/services/pinecone_service.py
from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any, Optional
from loguru import logger
from app.config.settings import settings
import uuid
import time

class PineconeService:
    def __init__(self):
        self.api_key = settings.pinecone_api_key
        self.index_name = settings.pinecone_index_name
        self.pc = None
        self.index = None
        self._initialize()
    
    def _initialize(self):
        try:
            # Initialize Pinecone client (modern API)
            self.pc = Pinecone(api_key=self.api_key)
            logger.info("Pinecone client initialized successfully")
            
            # Get list of existing indexes
            existing_indexes = self.pc.list_indexes()
            existing_index_names = [idx['name'] for idx in existing_indexes]
            
            logger.info(f"Existing indexes: {existing_index_names}")
            
            if self.index_name not in existing_index_names:
                logger.info(f"Creating new index: {self.index_name}")
                
                # Create index with serverless specification
                self.pc.create_index(
                    name=self.index_name,
                    dimension=384,  # Dimension for all-MiniLM-L6-v2
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud=getattr(settings, 'pinecone_cloud', 'aws'),
                        region=getattr(settings, 'pinecone_region', 'us-east-1')
                    )
                )
                logger.info(f"Created Pinecone serverless index: {self.index_name}")
                
                # Wait for index to be ready
                logger.info("Waiting for index to be ready...")
                while not self.pc.describe_index(self.index_name).status['ready']:
                    time.sleep(1)
                logger.info("Index is ready!")
            else:
                logger.info(f"Using existing index: {self.index_name}")
            
            # Connect to the index
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Connected to Pinecone index: {self.index_name}")
            
            # Test the connection with index stats
            try:
                stats = self.index.describe_index_stats()
                logger.info(f"Index stats: Total vectors: {stats.get('total_vector_count', 0)}")
            except Exception as e:
                logger.warning(f"Could not get index stats: {e}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {e}")
            logger.error("Make sure your PINECONE_API_KEY is correct and you have the latest pinecone-client installed")
            # Don't raise the exception - allow graceful degradation
            self.pc = None
            self.index = None
    
    def is_available(self) -> bool:
        """Check if Pinecone service is available"""
        return self.index is not None
    
    def upsert_document(self, document_id: str, embedding: List[float], metadata: Dict[str, Any]) -> str:
        """Store document embedding in Pinecone"""
        if not self.is_available():
            raise RuntimeError("Pinecone service is not available")
            
        try:
            vector_id = f"doc_{document_id}_{uuid.uuid4().hex[:8]}"
            
            self.index.upsert([
                {
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                }
            ])
            logger.info(f"Upserted document to Pinecone: {vector_id}")
            return vector_id
        except Exception as e:
            logger.error(f"Failed to upsert document: {e}")
            raise
    
    def search(self, query_embedding: List[float], top_k: int = 5, filter_dict: Optional[Dict] = None) -> List[Dict]:
        """Search for similar documents"""
        if not self.is_available():
            raise RuntimeError("Pinecone service is not available")
            
        try:
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            logger.info(f"Found {len(results.matches)} similar documents")
            return results.matches
        except Exception as e:
            logger.error(f"Failed to search Pinecone: {e}")
            raise
    
    def delete_document(self, vector_id: str):
        """Delete document from Pinecone"""
        if not self.is_available():
            raise RuntimeError("Pinecone service is not available")
            
        try:
            self.index.delete(ids=[vector_id])
            logger.info(f"Deleted document from Pinecone: {vector_id}")
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            raise