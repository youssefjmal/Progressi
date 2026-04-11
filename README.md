# Progressi — AI Fitness Coach

A full-stack fitness tracking app built with Next.js 16, Supabase, and Groq AI. Tracks food, exercise, and weight with personalized AI coaching in English and French.

## Features

- **Food logging** — search a database of thousands of foods (including Tunisian cuisine), log meals by type (breakfast, lunch, dinner, snack), track daily calories
- **Exercise logging** — 300+ exercises across strength, cardio, martial arts, sports, and more with automatic calorie burn calculation (MET-based)
- **Weight tracking** — log weight history, visualize progress toward goal weight
- **AI coaching** — daily feedback on nutrition and exercise (10 calls/day), AI chat assistant (100 messages/day), powered by Groq (Llama 3)
- **Calorie education** — beginner-friendly explainer covering calorie budgets, deficits, surpluses, and macros
- **Dashboard** — daily summary of calories consumed/burned, net balance, and recent activity
- **Dark mode** — full dark/light theme support
- **i18n** — complete English and French translations
- **Admin panel** — user activity, AI usage stats, and live event feed (restricted to admin account)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| AI | Groq API — Llama 3.3 70B |
| UI | Radix UI + Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Language | TypeScript |

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon` key |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key |

> **Warning:** Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code. The service role key bypasses all Row Level Security.

### 3. Run database migrations

Open the **Supabase SQL Editor** and run each script in order:

| Script | Purpose |
|---|---|
| `scripts/001_create_profiles.sql` | User profiles table |
| `scripts/002_profile_trigger.sql` | Auto-create profile on sign-up |
| `scripts/003_create_food_logs.sql` | Food logging table |
| `scripts/004_create_weight_history.sql` | Weight history table |
| `scripts/005_create_foods.sql` | Foods catalog table |
| `scripts/006_seed_foods.sql` | Seed basic foods |
| `scripts/007_add_profile_targets.sql` | Add calorie/weight targets to profiles |
| `scripts/007_tunisian_foods.sql` | Tunisian food dataset |
| `scripts/008_create_exercise_logs.sql` | Exercise logging table |
| `scripts/009_add_foods_insert_policy.sql` | RLS policy for food inserts |
| `scripts/010_import_food_dataset.sql` | Extended food dataset |
| `scripts/011_food_dataset_bundle.sql` | Additional food data |
| `scripts/012_create_daily_wellness.sql` | Daily wellness goals table |
| `scripts/013_create_exercises.sql` | Exercise catalog table |
| `scripts/014_seed_exercises.sql` | Seed exercises |
| `scripts/015_exercise_catalog_bundle.sql` | Extended exercise catalog |
| `scripts/016_strength_progress_for_exercise_logs.sql` | Strength tracking fields |
| `scripts/017_add_calorie_target_to_profiles.sql` | Calorie target field |
| `scripts/018_fix_profiles_complete.sql` | Profile schema completeness fix |
| `scripts/019_pre_deploy_fixes.sql` | Pre-deploy fixes (weight_kg rename, foods unique constraint, indexes) |
| `scripts/020_ai_usage_admin.sql` | AI usage tracking table + admin email in profiles |
| `scripts/021_sports_expansion.sql` | 83 additional exercises (martial arts, sports, outdoor) |

> Scripts are safe to re-run — they use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING/UPDATE`.

### 4. Start the development server

```bash
npm run dev
```

App runs at [http://localhost:3002](http://localhost:3002).

## Project Structure

```
app/
  admin/          # Admin dashboard (restricted to admin account)
  api/
    admin/        # Admin API routes (stats, users, activity)
    ai-feedback/  # Daily AI nutrition/exercise feedback
    chat/         # AI chat streaming endpoint
    food-search/  # USDA food search proxy
    log-food/     # Food log write endpoint
    log-exercise/ # Exercise log write endpoint
  auth/           # Login, sign-up, callback pages
  calories/       # Calorie tracker + beginner guide
  chat/           # AI chat page
  dashboard/      # Main dashboard
  exercise/       # Exercise log + catalog
  food/           # Food search + log
  profile/        # User profile settings
  page.tsx        # Landing page

components/
  auth/           # Auth modal
  charts/         # Custom chart components
  navigation/     # Bottom nav, sidebar, top bar
  ui/             # shadcn/ui component library
  wellness/       # Daily goals panel

lib/
  supabase/
    admin.ts      # Service role client (server-only)
    client.ts     # Browser Supabase client
    server.ts     # Server-side Supabase client
  food-logging.ts # Food upsert logic
  health-metrics.ts
  i18n.ts         # EN/FR translations
  utils.ts        # Helpers incl. localDateString()

scripts/          # SQL migration files
```

## Rate Limits

AI usage is tracked per user per day in the `ai_usage` table:

| Feature | Limit |
|---|---|
| AI daily feedback | 10 calls/day |
| AI chat | 100 messages/day |

Limits are enforced server-side with atomic PostgreSQL increments (no Redis required).

## Admin Panel

Accessible at `/admin` — only for the account `jmelyoussef1@gmail.com`.

Shows:
- Total users, new this week, active today
- AI call counts (today and all-time)
- Per-user table: name, email, join date, last active, weight goal, AI usage
- Live activity feed: food logs, exercise logs, weight entries

Requires `SUPABASE_SERVICE_ROLE_KEY` to be set.

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push this repo to GitHub
2. Import the project in Vercel
3. Add all environment variables from `.env.local` in the Vercel project settings
4. Deploy

The `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` variable is only needed for local development and can be omitted in production.

## Available Scripts

```bash
npm run dev          # Start dev server on port 3002
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run import:foods # Import Tunisian food CSV into Supabase
```
