# Deployment Configuration

This folder contains deployment files for the Vidiopintar.com application using a simple Docker approach without Docker Compose.

## Files Overview

- **`Dockerfile`** - Multi-stage Docker build for production
- **`deploy.sh`** - Simple deployment script using `docker run`
- **`.env.production`** - Environment template for Neon database
- **`dev-db.sh`** - Local PostgreSQL for development
- **`.dockerignore`** - Files to exclude from Docker builds

## Local Development

### Option 1: Local Development with Neon Database
```bash
# Install dependencies
npm install

# Run Next.js locally (connects to your Neon database)
npm run dev
```

### Option 2: Local Development with Local Database
```bash
# Start local PostgreSQL for development
./deployment/dev-db.sh

# Update your .env to use local database
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vidiopintar

# Run Next.js locally
npm run dev
```

## Production Testing

Test the production setup locally:

```bash
# Build image
docker build -f deployment/Dockerfile -t vidiopintar .

# Run with your environment
docker run -p 3000:3000 --env-file .env vidiopintar
```

## VPS Deployment

### Setup VPS

1. **Create project directory:**
```bash
sudo mkdir -p /opt/vidiopintar
sudo chown $USER:$USER /opt/vidiopintar
```

2. **Install Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Copy deployment files:**
```bash
scp deployment/deploy.sh deployment/.env.production user@your-vps:/opt/vidiopintar/
```

4. **Setup environment on VPS:**
```bash
cd /opt/vidiopintar
cp .env.production .env
nano .env  # Update with your actual values
```

### Manual Deployment

```bash
cd /opt/vidiopintar
./deploy.sh
```

## Environment Variables

Update `.env.production` with your actual values:

```bash
# Neon Database (no local PostgreSQL needed)
DATABASE_URL=postgresql://your_user:your_password@your_host/your_db?sslmode=require

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Authentication
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=https://your-domain.com

# ... other environment variables
```

## Monitoring

- **Container Status**: `docker ps | grep vidiopintar`
- **Logs**: `docker logs vidiopintar-app -f`
- **Health**: `curl http://localhost:3000/api/health`

## Benefits of This Approach

✅ **Simple**: No Docker Compose complexity  
✅ **Fast**: Single container deployment  
✅ **Clean**: Uses your existing Neon database  
✅ **Reliable**: Fewer moving parts  
✅ **Easy to understand**: Pure Docker commands