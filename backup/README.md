# Database Backup and Restore Scripts

This directory contains simplified scripts for backing up and restoring PostgreSQL databases using environment-specific configurations.

## Unified Scripts (Recommended)

- `docker-backup-unified.sh` - Unified backup script for both Neon and Docker PostgreSQL
- `docker-restore-unified.sh` - Unified restore script for Docker PostgreSQL

## Legacy Scripts (Still Available)

- `backup-db.sh` - Basic backup using pg_dump directly
- `restore-db.sh` - Basic restore using pg_restore directly
- `docker-backup.sh` - Neon-specific backup (uses `.env.db.neon`)
- `docker-restore.sh` - Docker-specific restore (uses `.env.db.docker`)
- `docker-backup-local.sh` - Docker-specific backup (uses `.env.db.docker`)

## Environment Configuration

The unified scripts use dedicated environment files:

**`.env.db.neon`** - Neon PostgreSQL credentials
```env
DB_HOST=your-project-name.pooler.region.aws.neon.tech
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_NAME="your_neon_database?sslmode=require"
```

**`.env.db.docker`** - Local Docker PostgreSQL credentials
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

## Usage Examples

### Backup Operations
```bash
# Backup from Neon PostgreSQL
./docker-backup-unified.sh neon

# Backup from local Docker PostgreSQL  
./docker-backup-unified.sh docker

# Interactive selection
./docker-backup-unified.sh
```

### Restore Operations
```bash
# Restore latest backup to Docker PostgreSQL
./docker-restore-unified.sh docker

# Restore specific backup file
./docker-restore-unified.sh docker db_backup_neon_20240101_120000.dump

# Interactive mode
./docker-restore-unified.sh
```

## Backup File Management

- Backups stored in `./data/` directory
- Naming convention: `db_backup_{env}_{timestamp}.dump`
- Latest backups: `latest_{env}_backup.dump` symlinks
- Automatic cleanup of backups older than 7 days

## File Structure

```
backup/
├── docker-backup-unified.sh    # Unified backup (NEW)
├── docker-restore-unified.sh   # Unified restore (NEW)
├── docker-backup.sh           # Neon backup (legacy)
├── docker-restore.sh          # Docker restore (legacy)
├── docker-backup-local.sh     # Docker backup (legacy)
├── backup-db.sh               # Basic backup
├── restore-db.sh              # Basic restore
├── docker-compose.backup.yml  # Docker configuration
├── Dockerfile.backup          # Container definition
└── data/                      # Backup storage
    ├── db_backup_neon_*.dump  # Neon backups
    ├── db_backup_docker_*.dump # Docker backups
    ├── latest_neon_backup.dump # Latest Neon backup
    └── latest_docker_backup.dump # Latest Docker backup
```

## Migration Integration

The migration scripts use these unified scripts:
- `../migrate-to-local-postgres.sh` - Uses `docker-backup-unified.sh neon`
- `../rollback-to-neon.sh` - Uses `docker-backup-unified.sh docker`

## Migration Commands

Instead of calling backup scripts directly, use the main migration scripts:
```bash
# Full migration with backup
../migrate-to-local-postgres.sh

# Rollback to Neon  
../rollback-to-neon.sh

# Manual backup only
./docker-backup-unified.sh neon
```

## Troubleshooting

### Environment Issues
- Verify `.env.db.neon` and `.env.db.docker` exist and are correct
- Check which environment is active: `cat ../.env`

### Connection Issues
- For Neon: Verify credentials and network connectivity
- For Docker: Ensure PostgreSQL container is running (`docker ps`)

### Backup/Restore Failures
- Check disk space in `./data/` directory
- Verify Docker and Docker Compose are installed
- Review error messages for specific issues