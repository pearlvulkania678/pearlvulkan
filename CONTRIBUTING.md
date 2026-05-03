# Pearl Vulkan — Developer Guide

## Stack

- **Frontend** — React + Vite (`artifacts/pearl-vulkan`)
- **API** — Express + Drizzle ORM (`artifacts/api-server`)
- **Database** — PostgreSQL (Replit-managed, accessed via `DATABASE_URL`)
- **Package manager** — pnpm workspaces

---

## Running the project

The project runs on Replit. Open it and the three workflows start automatically:

| Workflow | What it does |
|---|---|
| `artifacts/api-server: API Server` | Express API on `/api` |
| `artifacts/pearl-vulkan: web` | Vite dev server on `/` |
| `artifacts/mockup-sandbox: Component Preview Server` | UI sandbox (development only) |

All traffic is routed through a shared reverse proxy — never call service ports directly.

---

## Admin panel

Available at `/admin`. Passphrase required (stored as an environment secret — ask the project owner).

From the admin you can manage all site content: tracks, poems, gallery, touch items, sense items, start page settings, and social links.

---

## Database

Schema is managed by Drizzle migrations in `lib/db/src/schema/`.

### Back up content to the repo

Run after any significant admin session to keep `database/seed.sql` current:

```bash
bash scripts/dump-db.sh
git add database/seed.sql
git commit -m "chore: refresh db seed"
git push
```

### Restore content from backup

Use this to recover from data loss or seed a fresh database after running migrations:

```bash
bash scripts/restore-db.sh
```

---

## Deploying

The site is deployed via Replit's publish feature. After publishing, it is live at a `.replit.app` domain (or a custom domain if configured).

Uploaded files (images, audio) are stored in `artifacts/pearl-vulkan/public/uploads/` and are tracked in git, so they deploy with the code.

---

## Typecheck

```bash
pnpm run typecheck
```

Run this before publishing to catch any TypeScript errors across all packages.
