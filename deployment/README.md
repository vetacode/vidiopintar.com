# PostgreSQL 17 Production Deployment

This directory contains Docker setup for running PostgreSQL 17 in production.

## Files

- `docker-compose.postgres.yml` - PostgreSQL 17 container configuration
- `start-postgres.sh` - Start PostgreSQL container
- `stop-postgres.sh` - Stop PostgreSQL container (with optional data removal)
- `postgres-logs.sh` - View container logs
- `connect-postgres.sh` - Connect to database via psql
- `postgres-init/` - Directory for initialization scripts

## Quick Start

### 1. Update Your Environment

Make sure your `.env` file has the correct settings:

```env
DB_USER=your_username
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
```

### 2. Start PostgreSQL 17

```bash
cd deployment
./start-postgres.sh
```

This will:
- Start PostgreSQL 17 container
- Wait for database to be ready
- Show connection details

### 3. Restore Your Data

```bash
# Go to backup directory and restore
cd ../backup
./docker-restore.sh
```

### 4. Connect to Database

```bash
cd deployment
./connect-postgres.sh
```

## Container Features

- **PostgreSQL 17 Alpine** - Latest PostgreSQL version
- **Optimized Configuration** - Production-ready settings
- **Health Checks** - Automatic health monitoring
- **Persistent Data** - Data survives container restarts
- **Custom Init Scripts** - Place `.sql` files in `postgres-init/`

## Performance Settings

The container includes optimized PostgreSQL settings:

- `max_connections=200`
- `shared_buffers=256MB`
- `effective_cache_size=1GB`
- `work_mem=4MB`
- Parallel processing optimizations

## Data Management

### Backup Data
```bash
cd backup
./docker-backup.sh
```

### Stop Container (Keep Data)
```bash
cd deployment
./stop-postgres.sh
# Answer 'N' when asked about removing volumes
```

### Stop Container (Remove Data)
```bash
cd deployment
./stop-postgres.sh
# Answer 'y' when asked about removing volumes
```

### View Logs
```bash
cd deployment
./postgres-logs.sh
```

## Migration Workflow

1. **Start new PostgreSQL 17 container**:
   ```bash
   cd deployment
   ./start-postgres.sh
   ```

2. **Restore from Neon backup**:
   ```bash
   cd ../backup
   ./docker-restore.sh
   ```

3. **Update application to use new database**:
   - Your `.env` should already point to `localhost:5432`
   - Restart your application

4. **Verify data**:
   ```bash
   cd deployment
   ./connect-postgres.sh
   ```

## Production Considerations

- **Security**: Change default passwords
- **Backups**: Set up regular automated backups
- **Monitoring**: Monitor container health and performance
- **SSL**: Configure SSL for production connections
- **Firewall**: Restrict database access to application servers only

## Troubleshooting

### Container won't start
```bash
cd deployment
./postgres-logs.sh
```

### Database connection issues
```bash
docker-compose -f docker-compose.postgres.yml ps
docker-compose -f docker-compose.postgres.yml exec postgres pg_isready -U $DB_USER
```

### Reset everything
```bash
./stop-postgres.sh  # Answer 'y' to remove volumes
./start-postgres.sh
```