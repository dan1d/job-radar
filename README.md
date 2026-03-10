# Job Radar

Remote job aggregator with AI-powered proposal generation. Fetches jobs from multiple free APIs, filters by category and location, and generates tailored proposals using Claude.

## Features

- **Multi-source aggregation** — RemoteOK, Remotive, Jobicy, Himalayas
- **AI proposals** — Claude-powered proposal generation with customizable templates
- **Location filtering** — Block specific countries/regions, show only worldwide/remote
- **Category management** — Custom search queries and proposal templates per category
- **Applied tracking** — Mark jobs as applied, hide/show applied jobs
- **Manual jobs** — Paste jobs from any source (Upwork, LinkedIn, etc.)
- **Admin dashboard** — Configure API keys, categories, cache, and blocked locations from the UI
- **SQLite database** — Zero-config local storage, optional Turso for cloud deployment
- **Source filtering** — Toggle between job sources with one click

## Quick Start

```bash
git clone https://github.com/dan1d/job-radar.git
cd job-radar
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database auto-creates on first request.

### Set up AI proposals

1. Go to [/admin/settings](http://localhost:3000/admin/settings)
2. Enter your Anthropic API key
3. Click "Test API Key" to verify
4. Use "AI Generate" on any job card to create a tailored proposal

## Deploy to Vercel

Job Radar supports [Turso](https://turso.tech) (free tier) for cloud SQLite:

```bash
# Create a Turso database
turso db create job-radar
turso db tokens create job-radar

# Set environment variables in Vercel
TURSO_DATABASE_URL=libsql://job-radar-<your-org>.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

Then deploy:

```bash
vercel
```

Without Turso env vars, it falls back to a local SQLite file (works for local dev).

## Tech Stack

- **Framework** — Next.js 16, React 19, TypeScript (strict)
- **UI** — Tailwind CSS 4, shadcn/ui v4 (@base-ui/react)
- **Database** — SQLite via @libsql/client + drizzle-orm
- **AI** — @anthropic-ai/sdk (Claude)
- **Testing** — Vitest, Testing Library (55 tests)

## Project Structure

```
src/
  app/
    page.tsx              # Main job dashboard
    admin/                # Admin dashboard (settings, categories, applied, manual jobs)
    api/
      jobs/route.ts       # Multi-source job aggregation with caching
      jobs/applied/       # Applied job tracking
      jobs/manual/        # Manual job CRUD
      generate/           # AI proposal generation
      categories/         # Category CRUD
      admin/settings/     # Settings API
  lib/
    db/                   # SQLite schema, connection, seed
    settings.ts           # Key-value settings (API keys, config)
    store.ts              # Category persistence
    filter.ts             # Client-side job filtering
    types.ts              # TypeScript interfaces
```

## Admin Dashboard

Navigate to [/admin](http://localhost:3000/admin) to:

- **Settings** — API key, AI model, cache TTL, blocked locations
- **Categories** — Add/edit/delete job categories with search queries and proposal templates
- **Applied Jobs** — View and manage applied jobs
- **Manual Jobs** — Add and manage manually entered jobs

## License

MIT
