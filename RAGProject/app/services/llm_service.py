# app/services/llm_service.py
from groq import Groq
from loguru import logger
from app.config.settings import settings
from typing import List, Dict

class LLMService:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama3-8b-8192"  # You can change this to other Groq models
    
    def generate_answer(self, query: str, context_docs: List[Dict]) -> str:
        """Generate answer using retrieved context"""
        try:
            # Prepare context from retrieved documents
            context = "\n\n".join([
                f"Document: {doc['metadata']['title']}\nContent: {doc['metadata']['content'][:500]}..."
                for doc in context_docs
            ])
            
            prompt = f"""Based on the following context documents, answer the user's question. If the answer cannot be found in the context, say so clearly.

Context:
{context}

Question: {query}

Answer:"""

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.1,
                max_tokens=1024,
            )
            
            answer = chat_completion.choices[0].message.content
            logger.info(f"Generated answer for query: {query[:50]}...")
            return answer
            
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            raise