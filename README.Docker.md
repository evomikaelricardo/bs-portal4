# Docker Deployment Guide

## Quick Start

### Using Docker

1. **Build the Docker image:**
   ```bash
   docker build -t interview-evaluation-system .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 interview-evaluation-system
   ```

3. **Access the application:**
   Open your browser at `http://localhost:5000`

### Using Docker Compose

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your actual values for API_BEARER_TOKEN and N8N_API_URL
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Rebuild after changes:**
   ```bash
   docker-compose up -d --build
   ```

## Production Deployment

### Environment Variables

The application requires the following environment variables for Docker deployment:

- `API_BEARER_TOKEN` - Bearer token for PDF generation API endpoints
- `N8N_API_URL` - N8N webhook URL for data integration

**Setup:**
1. Copy `.env.example` to `.env`
2. Edit `.env` with your actual values
3. Never commit `.env` to version control (already in `.gitignore`)

For local development without Docker, you can still use `config.json` as a fallback.

### Port Configuration

The application runs on port 5000 by default. To use a different port:

```bash
docker run -p 8080:5000 interview-evaluation-system
```

Or in docker-compose.yml:
```yaml
ports:
  - "8080:5000"
```

### Health Check

The container includes a health check that verifies the application is responding on port 5000.

Check health status:
```bash
docker ps
# Look for the health status in the STATUS column
```

### Multi-Stage Build

This Dockerfile uses multi-stage builds to:
- Keep the final image size small
- Only include production dependencies
- Separate build and runtime environments

### Storage Notes

⚠️ **Important:** This application uses in-memory storage. Data will be lost when the container restarts.

For persistent storage across container restarts, consider:
1. Implementing a database backend
2. Using Docker volumes for file-based storage
3. Exporting PDFs to external storage

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs <container-id>

# Check if port is already in use
lsof -i :5000  # On Mac/Linux
netstat -ano | findstr :5000  # On Windows
```

### Build fails
```bash
# Clear build cache and rebuild
docker build --no-cache -t interview-evaluation-system .
```

### Container is running but app is not accessible
```bash
# Verify container is listening on correct port
docker exec <container-id> netstat -tuln | grep 5000
```

## Development vs Production

### Development (Local)
```bash
npm install
npm run dev
```

### Production (Docker)
```bash
docker-compose up -d
```

## Image Size Optimization

Current optimizations:
- ✅ Multi-stage build
- ✅ Alpine Linux base image
- ✅ Production dependencies only
- ✅ .dockerignore to exclude unnecessary files

Expected final image size: ~300-400MB

## Security Considerations

1. **Run as non-root user** (TODO): Add USER directive in Dockerfile
2. **Update dependencies regularly**: Run `npm audit` and fix vulnerabilities
3. **Use specific version tags**: Currently using node:20-alpine
4. **Scan for vulnerabilities**: Use `docker scan interview-evaluation-system`

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t interview-evaluation-system .
      - name: Run tests
        run: docker run interview-evaluation-system npm test
```
