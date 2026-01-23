#!/usr/bin/env bash
set -euo pipefail

# Restore Postgres backup.
# Usage: ./scripts/restore_postgres.sh ./backups/retinal_system_YYYYMMDD_HHMMSS.sql

FILE=${1:-""}
if [[ -z "${FILE}" || ! -f "${FILE}" ]]; then
  echo "Backup file not found."
  exit 1
fi

DB_CONTAINER=${DB_CONTAINER:-"aura_postgres"}
DB_NAME=${DB_NAME:-"retinal_system"}
DB_USER=${DB_USER:-"postgres"}

echo "Restoring backup ..."
cat "${FILE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
echo "Done."
