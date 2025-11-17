# Running with Docker Compose

This guide explains how to run the BrightStar Care Analytics Dashboard using Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your actual values:
   - `API_BEARER_TOKEN` - Your secure bearer token for PDF generation endpoints
   - `N8N_API_URL` - Your N8N webhook URL

2. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Open your browser and navigate to: `http://localhost:5002`
   - Default credentials:
     - Username: `bsadmin`
     - Password: `bspass2025?`

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

## Configuration

### Environment Variables

The application now uses environment variables instead of `config.json` for configuration. You need to create a `.env` file based on `.env.example`:

**Required variables (in `.env` file):**
- `API_BEARER_TOKEN` - Bearer token for authenticating PDF generation API endpoints
- `N8N_API_URL` - N8N webhook URL for data integration

**System variables (in `docker-compose.yml`):**
- `NODE_ENV=production` - Sets the application to production mode
- `USE_SECURE_COOKIES=false` - Allows cookies to work over HTTP (set to `true` if using HTTPS)

**Important:** Never commit the `.env` file to version control. It's already included in `.gitignore`.

### Port Mapping

The application runs on port 5000 inside the container and is mapped to the host's port 5002:
- Container: `5000`
- Host: `5002`

To change the host port, edit the `ports` section in `docker-compose.yml`.

## Development vs Production

### Production (Docker Compose)
- Uses the multi-stage Dockerfile
- Optimized build with production dependencies only
- Runs `npm start` to serve the built application

### Development (Local)
- Run `npm install` and `npm run dev`
- Uses hot-reloading with Vite
- Includes development dependencies

## Health Check

The Docker container includes a health check that:
- Runs every 30 seconds
- Checks if the server responds on port 5000
- Allows 3 retries before marking as unhealthy
- Has a 5-second startup grace period

## Commands

### Build only (without starting)
```bash
docker-compose build
```

### Start in detached mode (background)
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild and start
```bash
docker-compose up --build --force-recreate
```

### Stop and remove containers
```bash
docker-compose down
```

## Troubleshooting

### Port already in use
If port 5000 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3000:5000"  # Change 3000 to any available port
```

### Build fails
1. Make sure you have the latest Docker version
2. Clear Docker cache: `docker-compose build --no-cache`
3. Check that all source files are present

### Container starts but app doesn't work
1. Check logs: `docker-compose logs`
2. Verify the health check: `docker ps` (should show "healthy" status)
3. Make sure `USE_SECURE_COOKIES=false` if not using HTTPS

## Notes

- The application uses in-memory session storage (MemoryStore)
- Sessions will be lost when the container restarts
- For persistent sessions, consider using a database-backed session store
