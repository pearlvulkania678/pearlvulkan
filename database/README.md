# Database

`seed.sql` — a data-only dump of the PostgreSQL database (all content, sequences).
It does **not** include schema (schema is managed by Drizzle migrations in `lib/db`).

## Restore

```bash
psql "$DATABASE_URL" < database/seed.sql
```

Run this after running Drizzle migrations if you need to restore content to a fresh database.
