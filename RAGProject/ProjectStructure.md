## Project Structure

rag_app/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── logging.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── document.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── document.py
│   │   └── query.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── embedding_service.py
│   │   ├── pinecone_service.py
│   │   ├── llm_service.py
│   │   └── rag_service.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── documents.py
│   │   └── query.py
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
├── requirements.txt
├── .env.example
├── README.md
└── alembic/
    └── versions/