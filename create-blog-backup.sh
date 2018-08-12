#!/usr/bin/env bash
timestamp="$(date +"%Y%m%d_%H%M%S")"
blog_backup_name=$timestamp"_blog_backup.tar.gz"
bucket_name="s3://de.nilslutz.www.backup"

# Stop the service
echo "Stopping the service..."
docker-compose stop
sleep 0.5

# Create compressed archive from data volumes
echo "Creating the archives from data volumes..."
echo "Processing data volume: nginx_data..."
docker run -v nilslutzde_nginx_data:/volume -v ${PWD}/backup:/backup --rm scorb/docker-volume-backup backup nginx_data_backup
sleep 0.5
echo "Processing data volume: mariadb_data..."
docker run -v nilslutzde_mariadb_data:/volume -v ${PWD}/backup:/backup --rm scorb/docker-volume-backup backup mariadb_data_backup
sleep 0.5
echo "Processing data volume: ghost_data..."
docker run -v nilslutzde_ghost_data:/volume -v ${PWD}/backup:/backup --rm scorb/docker-volume-backup backup ghost_data_backup
sleep 0.5
echo "Compressing all archives to one backup file..."
tar -zcPf ${PWD}/$blog_backup_name ${PWD}/backup
sleep 0.5

# Start the service
echo "Starting the service again..."
docker-compose start
sleep 0.5

# Copy backup to S3 bucket
echo "Copy the backup to S3 bucket..."
aws s3 cp $blog_backup_name $bucket_name
sleep 0.5

# Remove local copy of backup
echo "Remove the local copy of backup..."
rm -rf "${PWD}/$blog_backup_name"
rm -rf "${PWD}/backup/nginx_data_backup.tar.gz"
rm -rf "${PWD}/backup/mariadb_data_backup.tar.gz"
rm -rf "${PWD}/backup/ghost_data_backup.tar.gz"

echo "Done!"
