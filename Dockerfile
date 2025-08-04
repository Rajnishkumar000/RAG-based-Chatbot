# Multi-stage Dockerfile for Frontend + Backend

# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Dependencies (using multi-stage for better caching)
FROM python:3.11-slim as python-deps
WORKDIR /app

# Install only essential system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libmagic1 \
    file \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements and install Python packages
COPY RAGProject/requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 3: Final Production Image
FROM python:3.11-slim as production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libmagic1 \
    file \
    nginx \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

# Copy Python packages from previous stage
COPY --from=python-deps /root/.local /root/.local

# Copy built frontend from first stage
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Setup nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Serve React app \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy API requests to FastAPI backend \
    location /api/ { \
        proxy_pass http://127.0.0.1:8000/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/sites-available/default

# Set working directory for backend
WORKDIR /app

# Copy backend code
COPY RAGProject/ ./

# Make sure Python packages are in PATH
ENV PATH=/root/.local/bin:$PATH

# Create startup script
RUN echo '#!/bin/bash\n\
nginx -g "daemon off;" &\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
' > /start.sh && chmod +x /start.sh

# Expose ports
EXPOSE 80 8000

# Start both services
CMD ["/start.sh"]