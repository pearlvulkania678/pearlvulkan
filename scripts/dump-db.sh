#!/usr/bin/env bash
# Refresh database/seed.sql with current database content.
# Run from the project root: bash scripts/dump-db.sh

set -euo pipefail

OUT="database/seed.sql"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is not set." >&2
  exit 1
fi

echo "Dumping database to $OUT ..."

pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-acl \
  --data-only \
  --column-inserts \
  | grep -v '\\restrict' \
  > "$OUT"

echo "Done. $OUT updated ($(wc -l < "$OUT") lines)."
echo "Remember to commit and push: git add $OUT && git commit -m 'chore: refresh db seed'"
