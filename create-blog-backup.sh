#!/usr/bin/env bash
timestamp="$(date +"%Y%m%d_%H%M%S")"
blog_backup_name=$timestamp"_blog_backup.tar.gz"

# Clean up backup directory
rm -rf "backup/*"

# Stop the service
docker-compose down

# Create compressed archive from data volumes
docker run -v nginx_data:/volume -v ${PWD}/backup:/backup --rm scorb/docker-volume-backup backup nginx_data_backup
docker run -v mariadb_data:/volume -v ${PWD}/backup:/backup --rm scorb/docker-volume-backup backup mariadb_data_backup
docker run -v ghost_data:/volume -v ${PWD}/backup:/backup --rm scorb/docker-volume-backup backup ghost_data_backup
tar -zcf $blog_backup_name "backend"

# Start the service
docker-compose up -d

# Copy backup to S3 bucket
aws s3 cp $timestamp"_blog_backup.tar.gz" "s3://de.nilslutz.www.backup"
