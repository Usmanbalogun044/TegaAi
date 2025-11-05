# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=epsilon.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements.txt requirements_websocket.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt && \
    pip install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements_websocket.txt

# Copy project files
COPY . .

# Create staticfiles directory
RUN mkdir -p staticfiles

# Collect static files (may fail if static files not fully configured, which is OK)
RUN python manage.py collectstatic --noinput || true
RUN python manage.py makemigration
RUn python manage.py migrate

# Create a non-root user to run the application
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port 8000
EXPOSE 8000

# Run migrations and start Daphne server for WebSocket support
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 epsilon.asgi:application"]
