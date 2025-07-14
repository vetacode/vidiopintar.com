# Database Migration: Neon to Local PostgreSQL

This directory contains automated scripts for migrating your database from Neon PostgreSQL to local Docker PostgreSQL and back, using dedicated environment files for clean configuration management.

## Quick Start

### Migration to Local PostgreSQL
```bash
./migrate-to-local-postgres.sh
```

### Rollback to Neon
```bash
./rollback-to-neon.sh
```

## Scripts Overview

### 1. `migrate-to-local-postgres.sh`
**Purpose**: Automates migration from Neon to local PostgreSQL Docker container

**What it does**:
- ✅ Validates prerequisites (Docker, environment files)
- ✅ Switches to Docker PostgreSQL environment
- ✅ Creates fresh backup from Neon (optional)
- ✅ Starts PostgreSQL 17 container
- ✅ Restores data from backup
- ✅ Verifies migration success
- ✅ Tests application connection

**Safety features**:
- Confirmation prompts before destructive operations
- Separate environment files for clean configuration
- Comprehensive error handling
- Easy rollback with environment switching

### 2. `rollback-to-neon.sh`
**Purpose**: Rolls back from local PostgreSQL to Neon

**What it does**:
- ✅ Creates backup of local PostgreSQL data (optional)
- ✅ Stops PostgreSQL container
- ✅ Switches to Neon environment configuration
- ✅ Tests Neon connection
- ✅ Provides completion status

## Prerequisites

### Required Tools
- Docker and Docker Compose
- Bash shell
- Git (for version control)

### Required Files
- `.env.db.neon` file with Neon credentials
- `.env.db.docker` file with local PostgreSQL credentials
- `backup/` directory with backup scripts
- `deployment/` directory with PostgreSQL setup

## Migration Process Details

### Pre-Migration
1. **Environment Validation**: Checks all required tools and environment files
2. **Backup Validation**: Ensures backup files exist
3. **Environment Switch**: Copies `.env.db.docker` to `.env`

### Migration Steps
1. **Optional Neon Backup**: Creates fresh backup if existing backup is old
2. **Container Startup**: Starts optimized PostgreSQL 17 container
3. **Data Restoration**: Restores backup using PostgreSQL tools
4. **Verification**: Confirms database accessibility and table count
5. **Application Test**: Tests database connection from application

### Post-Migration
1. **Connection Details**: Shows new database connection information
2. **Useful Commands**: Lists helpful management commands
3. **Rollback Instructions**: Provides rollback procedure

## Environment Configuration

### Environment Files Structure

**`.env.db.docker` - Local PostgreSQL Configuration**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
NODE_ENV=dev
```

**`.env.db.neon` - Neon PostgreSQL Configuration**
```env
DB_HOST=your-project-name.pooler.region.aws.neon.tech
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_PORT=5432
DB_NAME="your_neon_database?sslmode=require"
DATABASE_URL=postgresql://your_neon_user:your_neon_password@your-project-name.pooler.region.aws.neon.tech/your_neon_database?sslmode=require
```

### Environment Switching
- **Migration**: Copies `.env.db.docker` → `.env`
- **Rollback**: Copies `.env.db.neon` → `.env`
- **Manual Switch**: `cp .env.db.{docker|neon} .env`

## Database Management Commands

### After Migration
```bash
# Connect to database
cd deployment && ./connect-postgres.sh

# View container logs
cd deployment && ./postgres-logs.sh

# Create backup from current environment
cd backup && ./docker-backup-unified.sh

# Stop database (keep data)
cd deployment && ./stop-postgres.sh

# Stop database (remove data)
cd deployment && ./stop-postgres.sh
# (answer 'y' when prompted)
```

## Troubleshooting

### Migration Fails
1. Check Docker is running: `docker ps`
2. Verify backup files exist: `ls backup/data/`
3. Check container logs: `cd deployment && ./postgres-logs.sh`
4. Try rollback: `./rollback-to-neon.sh`

### Application Connection Issues
1. Restart your application
2. Check `.env` configuration matches intended environment
3. Verify database is running: `docker ps`
4. Test connection: `cd deployment && ./connect-postgres.sh`
5. Check environment files: `.env.db.docker` or `.env.db.neon`

### Performance Issues
The PostgreSQL container is optimized for production with:
- 256MB shared buffers
- 1GB effective cache size
- 200 max connections
- Parallel processing enabled

## Safety Features

### Environment Management
- Dedicated environment files prevent configuration conflicts
- Easy switching between Neon and Docker environments
- Optional fresh Neon backup before migration
- Local PostgreSQL backup before rollback

### Confirmation Prompts
- Migration start confirmation
- Neon backup creation
- Rollback confirmation
- Container stop confirmation

### Error Handling
- Comprehensive error messages
- Line number reporting on failures
- Graceful cleanup on interruption
- Rollback instructions always provided

## File Structure

```
├── migrate-to-local-postgres.sh  # Main migration script
├── rollback-to-neon.sh          # Rollback script
├── MIGRATION_README.md           # This documentation
├── .env.db.neon                 # Neon environment configuration
├── .env.db.docker               # Docker environment configuration
├── backup/                       # Backup system
│   ├── docker-backup-unified.sh # Unified backup (NEW)
│   ├── docker-restore-unified.sh # Unified restore (NEW)
│   ├── docker-backup.sh         # Neon backup (legacy)
│   ├── docker-restore.sh        # Docker restore (legacy)
│   ├── docker-backup-local.sh   # Docker backup (legacy)
│   └── data/                     # Backup storage
└── deployment/                   # PostgreSQL deployment
    ├── docker-compose.postgres.yml
    ├── start-postgres.sh
    └── stop-postgres.sh
```

## Best Practices

### Before Migration
1. Ensure your application is not running
2. Create manual backup if needed
3. Review `.env.db.neon` and `.env.db.docker` configurations
4. Test in development environment first

### After Migration
1. Verify application functionality
2. Test all database operations
3. Monitor performance
4. Set up regular backup schedule

### Rollback Considerations
- Local PostgreSQL data is preserved during rollback
- Application restart required after rollback
- Verify `.env.db.neon` credentials are current and valid

## Performance Comparison

| Feature | Neon | Local PostgreSQL |
|---------|------|------------------|
| Latency | Network dependent | ~1ms |
| Scaling | Automatic | Manual |
| Backup | Automated | Manual scripts |
| Cost | Usage-based | Resource-based |
| SSL | Required | Optional |
| Maintenance | Managed | Self-managed |

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review container logs
3. Verify environment files (`.env.db.neon`, `.env.db.docker`)
4. Check which environment `.env` is currently using
5. Test individual components

The scripts provide detailed logging and error messages to help diagnose issues.