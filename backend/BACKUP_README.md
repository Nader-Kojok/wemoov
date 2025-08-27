# 🗄️ WeMoov Database Backup System

This document explains how to backup and restore your WeMoov Prisma Accelerate database.

## 📋 Overview

The backup system provides:
- **Automated backups** using PostgreSQL's `pg_dump`
- **Easy restore** functionality with interactive selection
- **Backup management** with file listing and metadata
- **Safety checks** and confirmations for restore operations

## 🚀 Quick Start

### Creating a Backup

```bash
# Navigate to backend directory
cd backend

# Create a backup
npm run backup
```

### Restoring from Backup

```bash
# Navigate to backend directory
cd backend

# Restore from backup (interactive)
npm run restore
```

## 📁 File Structure

```
backend/
├── backups/                          # Backup files directory
│   ├── wemoov-backup-2025-01-15_14-30-25.bak
│   └── wemoov-backup-2025-01-14_09-15-42.bak
├── scripts/
│   ├── backup-database.js            # Backup script
│   └── restore-database.js           # Restore script
└── .env                              # Contains DIRECT_DATABASE_URL
```

## 🔧 Configuration

### Environment Variables

Make sure your `.env` file contains:

```env
# Your Prisma Accelerate URL (for application use)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# Direct PostgreSQL URL (for backups)
DIRECT_DATABASE_URL="postgres://user:password@host:port/database?sslmode=require"
```

### Prerequisites

- **Node.js** 16+ installed
- **PostgreSQL CLI tools** installed:
  ```bash
  brew install postgresql@17
  ```

## 📖 Detailed Usage

### Backup Command

```bash
npm run backup
```

**What it does:**
- Connects to your database using `DIRECT_DATABASE_URL`
- Creates a compressed backup file (`.bak` format)
- Stores backup in `backend/backups/` directory
- Shows backup size and creation time
- Lists recent backups

**Backup file naming:**
```
wemoov-backup-YYYY-MM-DD_HH-MM-SS.bak
```

### Restore Command

```bash
npm run restore
```

**What it does:**
- Lists all available backup files
- Prompts you to select which backup to restore
- **⚠️ WARNING:** Replaces ALL current database data
- Asks for confirmation before proceeding
- Restores the selected backup

**Interactive process:**
1. Shows list of available backups
2. Enter backup number to restore
3. Confirm with "yes" to proceed
4. Database is restored

### Help Commands

```bash
# Show backup help
node scripts/backup-database.js --help

# Show restore help
node scripts/restore-database.js --help

# List available backups
node scripts/restore-database.js --list
```

## 🛡️ Safety Features

### Backup Safety
- ✅ Non-destructive operation
- ✅ Creates timestamped files
- ✅ Shows backup size and metadata
- ✅ Automatic directory creation

### Restore Safety
- ⚠️ **Destructive operation** - replaces all data
- ✅ Interactive backup selection
- ✅ Double confirmation required
- ✅ Clear warnings displayed
- ✅ Validation of backup files

## 📊 Backup Management

### Viewing Backups

```bash
# List all backups with details
ls -la backend/backups/

# Or use the built-in lister
node scripts/restore-database.js --list
```

### Cleaning Old Backups

```bash
# Remove backups older than 30 days (manual)
find backend/backups/ -name "*.bak" -mtime +30 -delete

# Or remove specific backup
rm backend/backups/wemoov-backup-2025-01-01_12-00-00.bak
```

## 🔍 Troubleshooting

### Common Issues

**1. "pg_dump: command not found"**
```bash
# Install PostgreSQL tools
brew install postgresql@17

# Verify installation
which pg_dump
```

**2. "DIRECT_DATABASE_URL not found"**
- Check your `.env` file contains `DIRECT_DATABASE_URL`
- Make sure you're running from the `backend/` directory
- Verify the URL format is correct

**3. "Connection refused"**
- Verify your database is accessible
- Check firewall/network settings
- Confirm database credentials are correct

**4. "Permission denied"**
- Check write permissions in `backend/backups/` directory
- Verify database user has backup/restore permissions

### Getting Help

```bash
# Test database connection
psql "$DIRECT_DATABASE_URL" -c "SELECT version();"

# Check backup directory
ls -la backend/backups/

# Verify environment variables
echo $DIRECT_DATABASE_URL
```

## 📅 Recommended Backup Schedule

### Development
- **Before major changes:** Manual backup
- **Daily:** Automated backup (optional)

### Production
- **Daily:** Automated backup
- **Before deployments:** Manual backup
- **Weekly:** Full backup with longer retention

### Automation Example

```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * cd /path/to/wemoov/backend && npm run backup
```

## 🔐 Security Notes

- **Never commit** backup files to version control
- **Secure storage** for production backups
- **Encrypt backups** for sensitive data
- **Regular testing** of restore procedures
- **Access control** for backup directories

## 📈 Best Practices

1. **Test restores regularly** to ensure backups work
2. **Keep multiple backup versions** (daily, weekly, monthly)
3. **Monitor backup sizes** for unusual changes
4. **Document restore procedures** for your team
5. **Automate backups** for production environments
6. **Store backups offsite** for disaster recovery

---

## 🆘 Emergency Recovery

If you need to quickly restore your database:

```bash
# 1. Navigate to backend
cd backend

# 2. List available backups
npm run restore -- --list

# 3. Restore latest backup
npm run restore
# Select backup #1 (most recent)
# Type "yes" to confirm

# 4. Regenerate Prisma client
npm run db:generate

# 5. Restart your application
npm run dev
```

---

**Need help?** Check the troubleshooting section or contact your development team.