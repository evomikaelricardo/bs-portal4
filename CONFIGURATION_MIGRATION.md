# Configuration Migration Guide

## Overview

This document explains the migration from `config.json` to environment variables for Docker deployment.

## What Changed

### Before (config.json only)
```json
{
  "apiBearerToken": "bs_8218ec78c92642b29a3fd91e4eb2cd9c",
  "n8nApiUrl": "https://n8n.evosmartlife.net/webhook/get-supabase-data"
}
```

### After (Environment Variables + Fallback)

**For Docker (docker-compose.yml):**
```yaml
environment:
  - API_BEARER_TOKEN=${API_BEARER_TOKEN}
  - N8N_API_URL=${N8N_API_URL}
```

**With .env file:**
```bash
API_BEARER_TOKEN=bs_8218ec78c92642b29a3fd91e4eb2cd9c
N8N_API_URL=https://n8n.evosmartlife.net/webhook/get-supabase-data
```

**For local development:**
- You can still use `config.json` (fallback)
- Or set environment variables in your shell/IDE

## How It Works

The application now tries to load configuration in this order:

1. **First**: Check for environment variables (`API_BEARER_TOKEN`, `N8N_API_URL`)
2. **Fallback**: If not found, read from `config.json`

This means:
- ✅ Docker users: Use `.env` file (secure, not committed to git)
- ✅ Replit users: Use `config.json` (already in `.gitignore`)
- ✅ Production: Use environment variables set by hosting platform
- ✅ CI/CD: Use secrets/environment variables

## Setup Instructions

### For Docker Users

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual values:**
   ```bash
   API_BEARER_TOKEN=your-actual-token-here
   N8N_API_URL=https://your-n8n-instance.com/webhook/endpoint
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

### For Local Development (Replit/Local Machine)

**Option 1: Keep using config.json (easiest)**
- No changes needed! Your existing `config.json` works as before
- Already in `.gitignore`, so it won't be committed

**Option 2: Use environment variables**
```bash
export API_BEARER_TOKEN="bs_8218ec78c92642b29a3fd91e4eb2cd9c"
export N8N_API_URL="https://n8n.evosmartlife.net/webhook/get-supabase-data"
npm run dev
```

## Security Benefits

### Before
- ❌ `config.json` might be accidentally committed
- ❌ Different configs for dev/staging/production required manual file swaps

### After
- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ Environment-specific configs without changing files
- ✅ Better for Docker and cloud deployments
- ✅ Follows 12-factor app principles

## Files Modified

1. **server/routes.ts** - Updated `loadConfig()` function to check environment variables first
2. **docker-compose.yml** - Added environment variable references
3. **.env.example** - Created template for environment variables
4. **DOCKER.md** - Updated with new setup instructions
5. **README.Docker.md** - Updated with environment variable documentation

## Troubleshooting

### "Config not found" error in Docker

Make sure you created the `.env` file:
```bash
cp .env.example .env
# Edit .env with your values
```

### "Config not found" error in local development

Either:
1. Make sure `config.json` exists in the project root, OR
2. Set environment variables before running

### Values not updating in Docker

Rebuild the container:
```bash
docker-compose down
docker-compose up --build
```

## Migration Checklist

- [x] Updated code to read from environment variables
- [x] Added fallback to `config.json` for backward compatibility
- [x] Created `.env.example` template
- [x] Updated `docker-compose.yml` with environment references
- [x] Updated documentation (DOCKER.md, README.Docker.md)
- [x] Verified `.env` and `config.json` are in `.gitignore`
- [x] Tested application still works in Replit (using config.json fallback)
- [x] Documented migration process

## Best Practices

1. **Never commit secrets** - `.env` and `config.json` are in `.gitignore`
2. **Use .env for Docker** - Clean separation of config from code
3. **Use config.json for quick local dev** - Simpler for rapid development
4. **Production**: Use platform environment variables (Heroku, AWS, etc.)
5. **CI/CD**: Use secrets management (GitHub Secrets, GitLab CI/CD variables)

## Questions?

If you encounter any issues with this migration, check:
1. Does `.env` file exist and have correct values?
2. Is `config.json` present for local development?
3. Are you using the latest code changes?
