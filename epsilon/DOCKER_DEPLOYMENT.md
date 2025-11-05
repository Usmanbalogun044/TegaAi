# Docker Deployment Guide for Epsilon

This guide explains how to deploy the Epsilon Django application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. Navigate to the epsilon directory:
   ```bash
   cd epsilon
   ```

2. Build and start the application:
   ```bash
   docker compose up -d
   ```

3. Access the application at `http://localhost:8000`

4. To view logs:
   ```bash
   docker compose logs -f
   ```

5. To stop the application:
   ```bash
   docker compose down
   ```

### Option 2: Using Docker directly

1. Navigate to the epsilon directory:
   ```bash
   cd epsilon
   ```

2. Build the Docker image:
   ```bash
   docker build -t epsilon-app .
   ```

3. Run the container:
   ```bash
   docker run -d -p 8000:8000 --name epsilon-web epsilon-app
   ```

4. Access the application at `http://localhost:8000`

5. To view logs:
   ```bash
   docker logs -f epsilon-web
   ```

6. To stop the container:
   ```bash
   docker stop epsilon-web
   docker rm epsilon-web
   ```

## Environment Variables

You can customize the deployment by setting environment variables:

- `DEBUG`: Set to `False` for production (default: `True`)
- `SECRET_KEY`: Django secret key (should be changed in production)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DATABASE_URL`: Database connection string (default: SQLite)

Example with environment variables:
```bash
docker run -d -p 8000:8000 \
  -e DEBUG=False \
  -e SECRET_KEY=your-secret-key-here \
  -e ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com \
  --name epsilon-web epsilon-app
```

## Production Deployment

For production deployment, consider the following:

1. **Security**:
   - Change the `SECRET_KEY` in `epsilon/settings.py` or set it via environment variable
   - Set `DEBUG=False`
   - Configure `ALLOWED_HOSTS` properly
   - Use HTTPS (configure reverse proxy like Nginx)

2. **Database**:
   - Consider using PostgreSQL instead of SQLite for production
   - Set the `DATABASE_URL` environment variable
   - Example: `DATABASE_URL=postgres://user:password@host:5432/dbname`

3. **Static Files**:
   - Ensure static files are properly collected
   - Consider using a CDN or separate static file server

4. **WebSocket Support**:
   - The application uses Daphne for WebSocket support
   - Ensure your reverse proxy supports WebSocket connections

## Deploying to Cloud Platforms

### Docker Hub

1. Tag your image:
   ```bash
   docker tag epsilon-app your-dockerhub-username/epsilon-app:latest
   ```

2. Push to Docker Hub:
   ```bash
   docker push your-dockerhub-username/epsilon-app:latest
   ```

### AWS, Azure, GCP

The Docker image can be deployed to any cloud platform that supports Docker containers:
- AWS: ECS, EKS, or Elastic Beanstalk
- Azure: Container Instances or Kubernetes Service
- GCP: Cloud Run or Kubernetes Engine

## Troubleshooting

### Port already in use
If port 8000 is already in use, map to a different port:
```bash
docker run -d -p 8080:8000 --name epsilon-web epsilon-app
```

### Database migrations
Migrations are run automatically when the container starts. To run migrations manually:
```bash
docker exec epsilon-web python manage.py migrate
```

### Collecting static files
Static files are collected automatically during build. To re-collect:
```bash
docker exec epsilon-web python manage.py collectstatic --noinput
```

### Container logs
To view detailed logs:
```bash
docker logs epsilon-web
# or with docker compose
docker compose logs web
```

## Development with Docker

For development with live code reloading, use volume mounting:
```bash
docker run -d -p 8000:8000 \
  -v $(pwd):/app \
  -e DEBUG=True \
  --name epsilon-dev epsilon-app
```

## Support

For issues or questions, please open an issue in the GitHub repository.
