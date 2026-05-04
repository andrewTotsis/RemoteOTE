# RemoteOTE

> RepVue × Yelp, but for remote sales jobs. Honest reviews, scam alerts, and a forum for reps to compare notes before signing.

Live: deploy to Vercel — instructions below.

## Stack

- **Next.js 15** (App Router, React 19) + TypeScript
- **Tailwind CSS** for styling
- **Prisma + Postgres** — works with Vercel Postgres, Neon, Supabase, Railway, anywhere
- **iron-session** for cookie auth (no third-party identity provider required)
- **bcryptjs** for password hashing

## What's in it

- **Company profiles** with star-rating breakdowns: pay accuracy / lead quality / management / legitimacy / culture
- **Reviews** — anonymous by default, structured ratings + freeform body
- **Forum** — general threads or threads attached to a company
- **Scam alerts** page filters companies the community has tagged with red flags (`fake-ote`, `pay-to-play`, `1099-misclassification`, `mlm`, `no-leads`, etc.)
- **Auth** — email/password signup + login + session
- **Seed data** — sample companies, reviews, and threads to demo the UI

## Local development

You need Node 20+ and a Postgres database (e.g. a free [Neon](https://neon.tech) project takes 30 seconds to spin up).

```bash
# 1. install
npm install

# 2. configure env
cp .env.example .env
# edit .env: set DATABASE_URL and SESSION_SECRET

# 3. push schema and seed
npm run db:push
npm run db:seed

# 4. dev
npm run dev
```

Visit http://localhost:3000.

Seed accounts (password is `password123` for all):
- `andy@example.com` (ClosingAndy)
- `sam@example.com` (QuotaCarrier)
- `lin@example.com` (PipelineLin)

## Deploying to Vercel

1. **Push this repo to GitHub** (already done if you cloned from `andrewTotsis/RemoteOTE`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Add a Postgres database — easiest path is to click **Storage → Create → Postgres** in your Vercel project, which auto-injects `DATABASE_URL`.
   - Or paste a Neon / Supabase / Railway connection string into a new env var called `DATABASE_URL`.
4. Add a `SESSION_SECRET` env var — any random 32+ character string (`openssl rand -base64 48` works).
5. Deploy. Vercel runs `prisma generate && next build` automatically (see the `build` script).
6. After first deploy, push the schema and seed the database:
   ```bash
   # locally, with the production DATABASE_URL in .env
   npm run db:push
   npm run db:seed   # optional — only if you want demo data in prod
   ```

## Project structure

```
src/
  app/                 # Next.js App Router
    page.tsx                # home
    companies/              # list / detail / new
    reviews/new/            # write a review
    forum/                  # threads list / detail / new
    scam-alerts/            # red-flag companies
    login, signup, account  # auth
    api/auth/logout         # POST logout endpoint
  components/Stars.tsx
  lib/
    prisma.ts        # Prisma singleton
    session.ts       # iron-session helpers
    ratings.ts       # review aggregate math
    slug.ts          # slug + tag helpers
prisma/
  schema.prisma      # User, Company, Review, Thread, Post, Vote
  seed.ts            # demo data
```

## Schema highlights

- `Company` stores tag fields (`roleTypes`, `compModel`, `redFlags`) as pipe-separated strings — keeps things portable across Postgres providers and avoids array-type quirks.
- `Review` has five 1–5 ratings: `ratingPay`, `ratingLeads`, `ratingMgmt`, `ratingLegit`, `ratingCulture`. The home page and company page average them on the fly.
- `Thread` can be attached to a `Company` (company-scoped discussion) or stand alone (general forum).
- `Vote` is wired in the schema for future up/down voting; the UI doesn't expose it yet.

## License

MIT — do whatever helps reps avoid bad jobs.
