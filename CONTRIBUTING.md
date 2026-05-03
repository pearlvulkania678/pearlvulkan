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

## Hosting & deployment

> **Important: GitHub Pages will not work for this project.**
>
> GitHub Pages only serves static HTML files. This site requires a live Node.js
> server and a PostgreSQL database — neither of which GitHub Pages can run.
> The correct platform is Replit.

### Publishing on Replit

1. Open the project on [replit.com](https://replit.com)
2. Click the **Publish** button in the top bar
3. Replit builds the app and assigns a public URL: `https://<your-app>.replit.app`
4. That URL works from any device, browser, or account — share it freely

Uploaded files (images, audio) are stored in `artifacts/pearl-vulkan/public/uploads/`
and are tracked in git, so they are included in every deployment automatically.

### Connecting a custom domain (e.g. pearlvulkan.com)

Once the site is published on Replit you can attach your own domain:

1. In the Replit project, go to **Deployments → Custom domains**
2. Enter your domain (e.g. `pearlvulkan.com` or `www.pearlvulkan.com`)
3. Replit will show you a DNS record to add — typically a `CNAME` pointing to your `.replit.app` address
4. Log in to your domain registrar (wherever you bought the domain — Namecheap, GoDaddy, Google Domains, etc.)
5. Go to **DNS settings** and add the `CNAME` record Replit gave you
6. Save and wait up to 24 hours for DNS to propagate (usually much faster)
7. Replit provisions an SSL certificate automatically — no extra steps needed

---

## Typecheck

```bash
pnpm run typecheck
```

Run this before publishing to catch any TypeScript errors across all packages.
