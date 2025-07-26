import uvicorn
from app.main import app

if __name__ == "__main__":
    print("Starting RAG Application...")
    print("API Documentation available at: http://localhost:8000/docs")
    print("Alternative docs at: http://localhost:8000/redoc")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )