# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=epsilon.settings

# Set working directory
WORKDIR /epsilon

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirement files first for caching
COPY requirements.txt requirements_websocket.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -r requirements_websocket.txt

# Copy project files
COPY . .

# Collect static files (ignore errors if Django isn't fully ready yet)
RUN mkdir -p staticfiles && \
    python manage.py collectstatic --noinput || true

# ✅ Ensure directory exists before chown
RUN mkdir -p /epsilon && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /epsilon

# Switch to non-root user
USER appuser

# Expose Railway default port
EXPOSE 8080

# Run migrations & start server using Daphne (async-ready)
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8080 epsilon.asgi:application"]
