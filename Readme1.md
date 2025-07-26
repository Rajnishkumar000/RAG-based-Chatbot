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







# 🤖 RAG Application with FastAPI, Pinecone, and LangChain

<div align="center">

![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=flat&logo=pinecone)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=flat&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens)

*A comprehensive Retrieval-Augmented Generation (RAG) application built with FastAPI, featuring document storage, vector search using Pinecone, and LLM-powered question answering.*

</div>

---

## 🌟 Features

<table>
<tr>
<td width="50%">

### 🔐 **Security & Authentication**
- JWT-based authentication
- Password hashing with bcrypt
- User-specific document isolation
- Input validation with Pydantic

</td>
<td width="50%">

### 📄 **Document Management**
- Upload and store documents
- Metadata management
- Document versioning
- User-specific document access

</td>
</tr>
<tr>
<td width="50%">

### 🔍 **Advanced Search**
- Vector-based semantic search
- Pinecone integration
- Contextual retrieval
- Similarity scoring

</td>
<td width="50%">

### 🤖 **AI-Powered Q&A**
- RAG pipeline implementation
- LLM integration with Groq
- Context-aware responses
- Multi-document querying

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Purpose |
|----------|------------|---------|
| **Backend** | FastAPI, Python 3.11+ | High-performance async API |
| **Database** | SQLite + SQLAlchemy | User and document metadata |
| **Vector DB** | Pinecone | Semantic search and embeddings |
| **Embeddings** | Hugging Face Transformers | Text vectorization |
| **LLM** | Groq API | Question answering |
| **Authentication** | JWT + bcrypt | Secure user management |
| **Logging** | Loguru | Structured application logging |

</div>

---

## 📸 Application Screenshots

### 🎯 Authentication & User Management
<div align="center">
<table>
<tr>
<td align="center" width="33%">
<h4>🔐 User Registration</h4>
<br>
<i>📷 [Photo 1: User Registration Interface]</i>
<br><br>
<em>Secure user registration with email validation and password strength requirements</em>
</td>
<td align="center" width="33%">
<h4>🚪 Login Portal</h4>
<br>
<i>📷 [Photo 2: Login Interface]</i>
<br><br>
<em>JWT-based authentication system with token management</em>
</td>
<td align="center" width="33%">
<h4>👤 User Dashboard</h4>
<br>
<i>📷 [Photo 3: User Dashboard]</i>
<br><br>
<em>Personalized dashboard showing user documents and activity</em>
</td>
</tr>
</table>
</div>

### 📄 Document Management System
<div align="center">
<table>
<tr>
<td align="center" width="50%">
<h4>📤 Document Upload</h4>
<br>
<i>📷 [Photo 4: Document Upload Interface]</i>
<br><br>
<em>Drag-and-drop document upload with progress tracking and format validation</em>
</td>
<td align="center" width="50%">
<h4>📋 Document Library</h4>
<br>
<i>📷 [Photo 5: Document Management]</i>
<br><br>
<em>Comprehensive document library with search, filter, and organization features</em>
</td>
</tr>
</table>
</div>

### 🗄️ Database Management
<div align="center">
<table>
<tr>
<td align="center" width="50%">
<h4>🔍 SQLite Database</h4>
<br>
<i>📷 [Photo 6: SQLite Database View]</i>
<br><br>
<em>SQLite database showing user tables, document metadata, and relationships</em>
</td>
<td align="center" width="50%">
<h4>🌲 Pinecone Vector Database</h4>
<br>
<i>📷 [Photo 7: Pinecone Dashboard]</i>
<br><br>
<em>Pinecone vector database with embeddings, indexes, and vector statistics</em>
</td>
</tr>
</table>
</div>

### 🤖 RAG Query System
<div align="center">
<table>
<tr>
<td align="center" width="50%">
<h4>💬 Question Interface</h4>
<br>
<i>📷 [Photo 8: Query Interface]</i>
<br><br>
<em>Interactive query interface with context selection and parameter tuning</em>
</td>
<td align="center" width="50%">
<h4>📊 AI Response & Analytics</h4>
<br>
<i>📷 [Photo 9: Response Dashboard]</i>
<br><br>
<em>AI-generated responses with source attribution, confidence scores, and analytics</em>
</td>
</tr>
</table>
</div>

---

## 🚀 Quick Start

### Prerequisites
```bash
✅ Python 3.11 or higher
✅ Pinecone account and API key
✅ Groq API key
✅ Git
```

### 1️⃣ Installation
```bash
# Clone the repository
git clone <repository-url>
cd rag_app

# Create virtual environment
python -m venv venv12
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2️⃣ Environment Setup
Create a `.env` file:
```env
# Database Configuration
DATABASE_URL=sqlite:///./rag_app.db

# JWT Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp-free
PINECONE_INDEX_NAME=rag-documents

# Groq LLM API
GROQ_API_KEY=your-groq-api-key

# Optional: Hugging Face
HUGGINGFACE_API_TOKEN=your-huggingface-token

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### 3️⃣ Launch Application
```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the provided script
python run_docs.py
```

---

## 📋 API Documentation

<div align="center">

### 🌐 Access Points
| Service | URL | Description |
|---------|-----|-------------|
| **Swagger UI** | `http://localhost:8000/docs` | Interactive API documentation |
| **ReDoc** | `http://localhost:8000/redoc` | Clean API documentation |
| **OpenAPI** | `http://localhost:8000/openapi.json` | API specification |

</div>

### 🔗 API Endpoints

#### 🔐 Authentication
```http
POST /api/v1/auth/register    # Create new user account
POST /api/v1/auth/login       # Authenticate and get token
```

#### 📄 Document Management
```http
POST   /api/v1/documents/           # Create new document
GET    /api/v1/documents/           # List user documents
GET    /api/v1/documents/{id}       # Get specific document
DELETE /api/v1/documents/{id}       # Delete document
POST   /api/v1/documents/upload     # Upload document file
```

#### 🔍 Query & Search
```http
POST /api/v1/query/        # RAG-powered question answering
POST /api/v1/query/search  # Semantic document search
```

---

## 🏗️ Project Architecture

```
rag_app/
├── 📁 app/
│   ├── 📄 __init__.py
│   ├── 🚀 main.py                 # FastAPI application entry point
│   │
│   ├── 📁 config/                 # Configuration management
│   │   ├── 📄 __init__.py
│   │   └── ⚙️ settings.py         # Environment and app settings
│   │
│   ├── 📁 core/                   # Core application utilities
│   │   ├── 📄 __init__.py
│   │   ├── 🔐 auth.py             # JWT authentication logic
│   │   ├── 🗄️ database.py         # Database connection and session
│   │   └── 📝 logging.py          # Structured logging configuration
│   │
│   ├── 📁 models/                 # SQLAlchemy database models
│   │   ├── 📄 __init__.py
│   │   ├── 👤 user.py             # User model and relationships
│   │   └── 📄 document.py         # Document model and metadata
│   │
│   ├── 📁 schemas/                # Pydantic data validation schemas
│   │   ├── 📄 __init__.py
│   │   ├── 🔐 auth.py             # Authentication request/response schemas
│   │   ├── 📄 document.py         # Document CRUD schemas
│   │   └── 🔍 query.py            # Query and search schemas
│   │
│   ├── 📁 services/               # Business logic and external services
│   │   ├── 📄 __init__.py
│   │   ├── 🔐 auth_service.py     # User authentication service
│   │   ├── 🧠 embedding_service.py # Text embedding generation
│   │   ├── 🌲 pinecone_service.py # Vector database operations
│   │   ├── 🤖 llm_service.py      # Language model integration
│   │   └── 🔄 rag_service.py      # RAG pipeline orchestration
│   │
│   ├── 📁 api/                    # API route handlers
│   │   ├── 📄 __init__.py
│   │   ├── 🔐 auth.py             # Authentication endpoints
│   │   ├── 📄 documents.py        # Document management endpoints
│   │   └── 🔍 query.py            # Query and search endpoints
│   │
│   └── 📁 utils/                  # Helper utilities and tools
│       ├── 📄 __init__.py
│       └── 🛠️ helpers.py          # Common utility functions
│
├── 📋 requirements.txt            # Python dependencies
├── 🔧 .env.example               # Environment variables template
└── 📖 README.md                  # Project documentation
```

---

## 🔄 Application Flow

### 🎯 **Phase 1: User Authentication & Setup**
```mermaid
graph LR
    A[👤 User Registration] --> B[🔐 Password Hashing]
    B --> C[💾 Store in SQLite]
    C --> D[🎫 JWT Token Generation]
    D --> E[✅ Authenticated Session]
```

### 📄 **Phase 2: Document Processing Pipeline**
```mermaid
graph TD
    A[📤 Document Upload] --> B[📝 Text Extraction]
    B --> C[✂️ Text Chunking]
    C --> D[🧠 Generate Embeddings]
    D --> E[🌲 Store in Pinecone]
    E --> F[💾 Metadata in SQLite]
    F --> G[✅ Document Ready]
```

### 🔍 **Phase 3: RAG Query Processing**
```mermaid
graph TD
    A[❓ User Query] --> B[🧠 Query Embedding]
    B --> C[🔍 Vector Search in Pinecone]
    C --> D[📊 Retrieve Top-K Similar Chunks]
    D --> E[📝 Context Assembly]
    E --> F[🤖 LLM Generation with Context]
    F --> G[📋 Structured Response]
    G --> H[📊 Response + Sources]
```

### 🏗️ **Complete System Architecture Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   👤 Frontend    │    │  🚀 FastAPI      │    │  🗄️ Data Layer   │
│                 │    │                 │    │                 │
│ • User Interface│◄──►│ • Authentication│◄──►│ • SQLite DB     │
│ • Query Input   │    │ • API Endpoints │    │ • User Data     │
│ • Results View  │    │ • Request       │    │ • Document Meta │
│                 │    │   Validation    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  🧠 ML Services  │    │  🔄 RAG Engine   │    │  🌲 Vector DB    │
│                 │    │                 │    │                 │
│ • Embedding     │◄──►│ • Query         │◄──►│ • Pinecone      │
│   Generation    │    │   Processing    │    │ • Vector Search │
│ • Text          │    │ • Context       │    │ • Embeddings    │
│   Processing    │    │   Retrieval     │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  🤖 LLM Service  │
                       │                 │
                       │ • Groq API      │
                       │ • Response      │
                       │   Generation    │
                       │ • Context       │
                       │   Integration   │
                       └─────────────────┘
```

---

## 🔧 Configuration & Customization

### 🧠 Embedding Model Configuration
```python
# Default: sentence-transformers/all-MiniLM-L6-v2
# Change in app/config/settings.py
embedding_model: str = "sentence-transformers/your-preferred-model"
```

### 🌲 Pinecone Index Settings
- **Dimension**: 384 (for all-MiniLM-L6-v2)
- **Metric**: cosine similarity
- **Environment**: Configurable via environment variables

### 🤖 LLM Model Selection
```python
# Default: llama3-8b-8192
# Modify in app/services/llm_service.py
```

---

## 🛡️ Security Features

<div align="center">
<table>
<tr>
<td width="50%">

### 🔐 **Authentication Security**
- JWT token-based authentication
- bcrypt password hashing
- Token expiration management
- Secure session handling

</td>
<td width="50%">

### 🛡️ **Data Protection**
- User-specific document isolation
- Input validation with Pydantic
- CORS configuration
- SQL injection prevention

</td>
</tr>
</table>
</div>

---

## 📊 Monitoring & Logging

### 📝 Structured Logging with Loguru
- **Console Output**: Colored, formatted logs
- **File Rotation**: 10MB files, 30-day retention
- **Log Levels**: Configurable (DEBUG, INFO, WARNING, ERROR)
- **Automatic Directory Creation**: `logs/` folder management

### 🔍 Error Handling
- Comprehensive exception handling
- Structured error responses
- Detailed debugging information
- User-friendly error messages

---

## 🚀 Deployment

### 🐳 Docker Deployment
```bash
# Build the Docker image
docker build -t rag-app .

# Run with docker-compose
docker-compose up -d
```

### 🔒 Production Security Checklist
- [ ] Generate secure `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

---

## 🐛 Troubleshooting

<details>
<summary><b>🌲 Pinecone Connection Issues</b></summary>

- Verify API key and environment settings
- Check index name configuration
- Ensure Pinecone plan limits aren't exceeded
- Validate network connectivity

</details>

<details>
<summary><b>🧠 Embedding Model Problems</b></summary>

- First run downloads model (may take time)
- Ensure sufficient disk space (2-3GB)
- Check internet connection for downloads
- Verify model compatibility

</details>

<details>
<summary><b>🗄️ Database Issues</b></summary>

- Check SQLite file permissions
- Verify `DATABASE_URL` format
- Run database migrations if needed
- Ensure disk space availability

</details>

<details>
<summary><b>🔐 Authentication Problems</b></summary>

- Verify JWT secret key configuration
- Check token expiration settings
- Ensure proper header format: `Authorization: Bearer <token>`
- Validate user credentials

</details>

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. ✨ **Make** your changes
4. 🧪 **Add** tests if applicable
5. 📝 **Commit** your changes (`git commit -m 'Add some amazing feature'`)
6. 🚀 **Push** to the branch (`git push origin feature/amazing-feature`)
7. 🎯 **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Community

<div align="center">

### 🆘 Getting Help

| Resource | Description |
|----------|-------------|
| 📖 **Documentation** | Check the API docs at `/docs` |
| 🐛 **Issues** | Report bugs in GitHub Issues |
| 💡 **Discussions** | Join community discussions |
| 📧 **Email** | Contact for enterprise support |

### 🌟 Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub!

</div>

---

<div align="center">

**Built with ❤️ by the RAG App Team**

*Empowering intelligent document interactions through advanced AI*

</div>