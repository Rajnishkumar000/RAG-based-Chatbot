# app/utils/helpers.py
import hashlib
import uuid
from typing import Dict, Any
import json

def generate_unique_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())

def hash_text(text: str) -> str:
    """Generate SHA-256 hash of text"""
    return hashlib.sha256(text.encode()).hexdigest()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
        
        if start >= len(text):
            break
    
    return chunks

def safe_json_loads(json_str: str, default: Dict[str, Any] = None) -> Dict[str, Any]:
    """Safely load JSON with default fallback"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default or {}

def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to specified length"""
    return text[:max_length] + "..." if len(text) > max_length else text