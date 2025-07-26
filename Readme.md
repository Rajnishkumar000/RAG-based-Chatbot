# RAG Application with FastAPI, Pinecone, and LangChain

A comprehensive Retrieval-Augmented Generation (RAG) application built with FastAPI, featuring document storage, vector search using Pinecone, and LLM-powered question answering.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📄 **Document Management** - Upload, store, and manage documents
- 🔍 **Vector Search** - Advanced semantic search using Pinecone
- 🤖 **RAG Pipeline** - Question answering with context retrieval
- 📊 **SQLite Database** - User and document metadata storage
- 🚀 **FastAPI** - High-performance async API framework
- 📝 **Comprehensive Logging** - Structured logging with Loguru
- 🏗️ **Clean Architecture** - Well-organized, maintainable codebase

## Tech Stack

- **Backend**: FastAPI, Python 3.11+
- **Database**: SQLite with SQLAlchemy ORM
- **Vector DB**: Pinecone
- **Embeddings**: Hugging Face Sentence Transformers
- **LLM**: Groq API
- **Authentication**: JWT with bcrypt
- **Logging**: Loguru

## Prerequisites

- Python 3.11 or higher
- Pinecone account and API key
- Groq API key
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag_app
```

### 2. Create Virtual Environment

```bash
python -m venv venv12
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=sqlite:///./rag_app.db

# JWT Configuration
SECRET_KEY=Nosecret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp-free
PINECONE_INDEX_NAME=rag-documents

# Groq API
GROQ_API_KEY=your-groq-api-key

# Hugging Face (Optional)
HUGGINGFACE_API_TOKEN=your-huggingface-token

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### 5. Initialize Database

The database will be automatically created when you first run the application.

### 6. Run the Application

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the provided script
python run_docs.py
```

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token

### Documents
- `POST /api/v1/documents/` - Create a new document
- `GET /api/v1/documents/` - List all user documents
- `GET /api/v1/documents/{id}` - Get specific document
- `DELETE /api/v1/documents/{id}` - Delete document
- `POST /api/v1/documents/upload` - Upload document file

### Query
- `POST /api/v1/query/` - Query documents using RAG
- `POST /api/v1/query/search` - Search documents without generating answer

## Usage Examples

### 1. Register a User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "securepassword"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### 3. Add a Document

```bash
curl -X POST "http://localhost:8000/api/v1/documents/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Document",
    "content": "This is a sample document content for testing RAG functionality."
  }'
```

### 4. Query Documents

```bash
curl -X POST "http://localhost:8000/api/v1/query/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is this document about?",
    "top_k": 5
  }'
```

## Configuration

### Embedding Model

The default embedding model is `sentence-transformers/all-MiniLM-L6-v2`. You can change this in `app/config/settings.py`:

```python
embedding_model: str = "sentence-transformers/your-preferred-model"
```

### Pinecone Index

The application will automatically create a Pinecone index with:
- Dimension: 384 (for all-MiniLM-L6-v2)
- Metric: cosine
- Name: Configurable via `PINECONE_INDEX_NAME`

### LLM Model

The default Groq model is `llama3-8b-8192`. You can change this in `app/services/llm_service.py`.

## Project Structure

```
rag_app/
├── app/
│   ├── api/              # API route handlers
│   ├── config/           # Configuration settings
│   ├── core/             # Core utilities (auth, database, logging)
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   └── utils/            # Helper utilities
├── logs/                 # Application logs
├── alembic/              # Database migrations
└── requirements.txt      # Python dependencies
```

## Logging

The application uses structured logging with Loguru:

- Console output with colored formatting
- File logging with rotation (10MB files, 30-day retention)
- Configurable log levels
- Automatic log directory creation

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- User-specific document isolation
- Input validation with Pydantic
- CORS configuration

## Error Handling

- Comprehensive exception handling
- Structured error responses
- Detailed logging for debugging
- User-friendly error messages

## Development

### Database Migrations

```bash
# Initialize Alembic (if needed)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Testing

Create test files in a `tests/` directory and run with pytest:

```bash
pip install pytest pytest-asyncio httpx
pytest
```

## Deployment

### Using Docker

```bash
# Build the image
docker build -t rag-app .

# Run with docker-compose
docker-compose up -d
```

### Environment Variables for Production

Ensure you set secure values for:
- `SECRET_KEY` - Use a cryptographically secure random key
- Database URLs for production databases
- API keys for external services
- CORS origins for your frontend domain

## Troubleshooting

### Common Issues

1. **Pinecone Connection Errors**
   - Verify API key and environment
   - Check index name configuration
   - Ensure proper Pinecone plan limits

2. **Embedding Model Loading**
   - First run downloads the model (may take time)
   - Ensure sufficient disk space
   - Check internet connection for model download

3. **Database Issues**
   - Check file permissions for SQLite
   - Verify DATABASE_URL format
   - Run database migrations if needed

4. **Authentication Problems**
   - Verify JWT secret key configuration
   - Check token expiration settings
   - Ensure proper header format: `Authorization: Bearer <token>`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository