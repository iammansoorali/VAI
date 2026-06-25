FROM python:3.12-slim

# Security: run as non-root
RUN groupadd -r llmgoat && useradd -r -g llmgoat llmgoat

WORKDIR /app

# System deps needed for some wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy app source
COPY app/ ./app/

# Ownership
RUN chown -R llmgoat:llmgoat /app

USER llmgoat

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
