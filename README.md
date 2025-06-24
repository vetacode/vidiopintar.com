# Vidiopintar.com

## Docker Setup

All Docker configuration files are located in the `/deployment` folder.

### Development

**Option 1: Use Neon Database (Recommended)**
```bash
# Install dependencies
npm install

# Run Next.js locally (connects to your Neon database)
npm run dev
```

**Option 2: Use Local Database**
```bash
# Install dependencies
npm install

# Start local PostgreSQL for development
./deployment/dev-db.sh

# Run Next.js locally
npm run dev
```

### Production Testing

Test the production setup locally:

```bash
# Build and test locally
docker build -f deployment/Dockerfile -t vidiopintar .
docker run -p 3000:3000 --env-file .env vidiopintar
```

### Environment Variables

Copy your `.env` file and update with your actual values:

```bash
# For Neon Database (Production)
DATABASE_URL=postgresql://your_user:your_password@your_host/your_db?sslmode=require

# For Local Development Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vidiopintar

# Keep your other environment variables
OPENAI_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
# ... other vars
```

### Database Migration

Run database migrations:

```bash
# Run locally
npm run db:push
```

The application will be available at http://localhost:3000

---

## CI/CD Deployment

This project uses GitHub Actions for automated deployment to VPS with a simple Docker approach.

### Deployment Files Structure

```
deployment/
├── Dockerfile          # Multi-stage Docker build
├── deploy.sh           # Simple deployment script
├── .env.production     # Environment variables template  
├── dev-db.sh          # Local PostgreSQL for development
├── .dockerignore      # Docker build exclusions
└── README.md          # Deployment documentation
```

### GitHub Secrets Setup

Configure these secrets in your GitHub repository settings:

```
VPS_HOST=your-vps-ip-address
VPS_USERNAME=your-vps-username  
VPS_SSH_KEY=your-private-ssh-key
VPS_PORT=22 (optional, defaults to 22)
```

### VPS Setup

1. **Create project directory on VPS:**
```bash
sudo mkdir -p /opt/vidiopintar
sudo chown $USER:$USER /opt/vidiopintar
cd /opt/vidiopintar
```

2. **Install Docker on VPS:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Initial setup (first deployment only):**
```bash
# Copy deployment files manually for first setup
scp deployment/deploy.sh deployment/.env.production user@your-vps:/opt/vidiopintar/

# On VPS, setup environment variables
cd /opt/vidiopintar
cp .env.production .env
nano .env  # Update with your actual values
```

### Deployment Process

The CI/CD pipeline automatically:

1. **Build**: Creates Docker image on push/merge to main
2. **Push**: Uploads image to GitHub Container Registry  
3. **Deploy**: 
   - Copy deployment files to VPS
   - SSH to VPS
   - Run automated deployment script
   - Perform health checks

### Manual Deployment

You can also deploy manually on the VPS:

```bash
cd /opt/vidiopintar
./deploy.sh
```

### Monitoring

- **Container Status**: `docker ps | grep vidiopintar`
- **Logs**: `docker logs vidiopintar-app -f`
- **Health**: `curl http://localhost:3000/api/health`

### Benefits

✅ **Simple**: No Docker Compose complexity  
✅ **Fast**: Single container deployment  
✅ **Clean**: Uses your existing Neon database  
✅ **Reliable**: Fewer moving parts  
✅ **Easy to understand**: Pure Docker commands