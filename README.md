# TegaAi

Tega - Adaptive Learning Companion

## Quick Start with Docker

The easiest way to deploy the application is using Docker:

### Prerequisites
- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)

### Using Docker Compose (Recommended)

```bash
cd epsilon
docker compose up -d
```

The application will be available at `http://localhost:8000`

### Using Docker directly

```bash
cd epsilon
docker build -t epsilon-app .
docker run -d -p 8000:8000 --name epsilon-web epsilon-app
```

## Documentation

For detailed Docker deployment instructions, see [epsilon/DOCKER_DEPLOYMENT.md](epsilon/DOCKER_DEPLOYMENT.md)

## Development

The epsilon directory contains the Django application with WebSocket support using Channels and Daphne.