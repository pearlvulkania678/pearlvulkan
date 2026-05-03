#!/usr/bin/env bash
# Restore database content from database/seed.sql.
# Use this to recover content after a wipe or on a fresh setup.
# Run from the project root: bash scripts/restore-db.sh

set -euo pipefail

SEED="database/seed.sql"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is not set." >&2
  exit 1
fi

if [ ! -f "$SEED" ]; then
  echo "Error: $SEED not found." >&2
  exit 1
fi

echo "Restoring database from $SEED ..."
echo "Warning: this will INSERT on top of existing data. If the database already has content, run migrations first or clear the tables manually."
echo ""
read -r -p "Continue? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

psql "$DATABASE_URL" < "$SEED"

echo "Done. Database restored from $SEED."
