#!/usr/bin/env bash
set -euo pipefail

# Simple Postgres backup for docker-compose deployment.
# Usage: ./scripts/backup_postgres.sh

TS=$(date +"%Y%m%d_%H%M%S")
OUT_DIR=${OUT_DIR:-"./backups"}
DB_CONTAINER=${DB_CONTAINER:-"aura_postgres"}
DB_NAME=${DB_NAME:-"retinal_system"}
DB_USER=${DB_USER:-"postgres"}

mkdir -p "${OUT_DIR}"

echo "Creating backup ..."
docker exec -t "${DB_CONTAINER}" pg_dump -U "${DB_USER}" "${DB_NAME}" > "${OUT_DIR}/${DB_NAME}_${TS}.sql"
echo "Done: ${OUT_DIR}/${DB_NAME}_${TS}.sql"
