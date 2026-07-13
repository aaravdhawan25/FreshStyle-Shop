# Avex Barber Lounge

A native booking system for Avex Barber Lounge, built with Next.js (App Router), Tailwind CSS, Prisma, and NextAuth.

## Architecture

- **Framework**: Next.js 16 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with a custom dark/gold barbershop theme
- **Database**: PostgreSQL via Prisma ORM (tested against a live Supabase Postgres instance)
- **Auth**: NextAuth v5 (Credentials provider, JWT sessions, Prisma adapter) with `Role` = `CLIENT` | `ADMIN` | `BARBER`
- **Route protection**: `src/proxy.ts` (Next 16's renamed middleware) gates `/dashboard/*` to `ADMIN`, `/portal/*` to `BARBER`, `/appointments/*` to any signed-in user, and redirects signed-in users away from `/login` and `/register`

### Data model (`prisma/schema.prisma`)

- `User` — auth identity + role
- `Barber` — staff profile, linked 1:1 to a `User`, many-to-many with `Service`
- `Service` — name, duration, price
- `Availability` — recurring weekly working hours per barber
- `TimeOff` — one-off vacation/closure blocks per barber
- `Appointment` — links `Client` (User), `Barber`, `Service`, start/end time, status. A unique constraint on `(barberId, startTime)` prevents double-booking at the database level, backing up the application-level availability check in `src/lib/availability.ts`.

### Booking flow

1. `GET /api/availability?barberId=&serviceId=&date=` computes open slots by combining the barber's weekly `Availability`, existing `Appointment`s, and `TimeOff` blocks (`src/lib/availability.ts`).
2. The client-side wizard (`src/app/book/booking-wizard.tsx`) walks the user through service → barber → date/time → confirm.
3. `POST /api/appointments` requires an authenticated session, re-validates the slot server-side, and relies on the DB unique constraint as a final race-condition guard.

### Admin dashboard and barber portal

`/dashboard` (admin-only) shows shop-wide today's schedule, revenue, and cancellations; `/dashboard/appointments` lists and lets admins update any appointment's status; `/dashboard/barbers` lets admins add or remove barbers. `/portal` (barber-only) shows a barber's own schedule, stats, and lets them update the status of their own appointments.

## Local setup

1. Install dependencies: `npm install`
2. Set environment variables in `.env` (see `.env.example`):
   - `DATABASE_URL` — Postgres connection string
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
3. Apply the schema and seed data:
   ```bash
   npx prisma migrate deploy   # applies prisma/migrations
   npm run db:seed             # creates admin/barber/client test accounts + services
   ```
4. Run the dev server: `npm run dev`

### Connecting to the test Supabase project

A live Supabase project (`fresh-style-barbershop`, ref `lntfqjvwevfygwntwmhp`) already has this schema applied and seeded, used to validate the data model end-to-end (auth hashing, availability calculation, double-booking rejection, RLS defaults). To point your local app at it:

1. **Get the database password** — I can't retrieve or reset this myself (Supabase doesn't expose it through any API, and directly changing it via SQL is blocked for the `postgres` superuser). Get it yourself:
   - Go to [supabase.com/dashboard/project/lntfqjvwevfygwntwmhp/settings/database](https://supabase.com/dashboard/project/lntfqjvwevfygwntwmhp/settings/database)
   - Log in with whatever account you used for Supabase (this project is under your org `Aarav Dhawan`)
   - Under **Connection string**, click **Reset database password** if you never saved the original — this generates a new one and shows it to you once. Copy it immediately.
2. Paste that password into `DATABASE_URL` in `.env`, replacing `[YOUR-PASSWORD]`.
3. Baseline the existing migration instead of re-running it:
   ```bash
   npx prisma migrate resolve --applied 20260705134700_init
   ```
4. `npx prisma generate` and `npm run dev`.

Seeded accounts (password shown is the plaintext used to seed):
- Admin: `admin@avexbarberlounge.com` / `Admin123!`
- Barbers: `tyler@avexbarberlounge.com`, `luke@avexbarberlounge.com`, `coors@avexbarberlounge.com`, `vinny@avexbarberlounge.com`, `maine@avexbarberlounge.com`, `nash@avexbarberlounge.com`, `chance@avexbarberlounge.com` — all `Barber123!`
- Client: `client@example.com` / `Client123!`

For a brand-new database, skip the baseline step and just run `npx prisma migrate deploy && npm run db:seed`.

## Deploying to Vercel

This is a standard Next.js app — no `vercel.json` needed. Two things are already wired up for it:

- `postinstall: prisma generate` in `package.json`, so the Prisma client is regenerated on every Vercel build (Vercel doesn't cache `node_modules` between builds by default).
- `trustHost: true` in `src/auth.ts`, so NextAuth accepts requests from your Vercel domain (including preview deployment URLs) without an `UntrustedHost` error.

Steps:

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In the [Vercel dashboard](https://vercel.com/new), import the repo. Framework preset auto-detects as Next.js.
3. Add environment variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — **use the pooled connection string**, not the direct one. Vercel serverless functions open a new DB connection per invocation, and Supabase's direct connection (port 5432) has a low connection limit that fills up fast. In the Supabase dashboard's "Connect" panel, copy the **Transaction pooler** string (port `6543`) and append `?pgbouncer=true` if it isn't already there.
   - `AUTH_SECRET` — same value as local, or generate a fresh one with `openssl rand -base64 32` (recommended for production so it differs from your dev secret).
   - `NEXTAUTH_URL` — your production URL, e.g. `https://your-app.vercel.app` (or your custom domain).
4. Deploy. Run `npx prisma migrate deploy` against the production `DATABASE_URL` once (from your machine, or a one-off Vercel build step) before the first real traffic, so the schema exists before the app queries it.
5. Seed production data if needed: `npm run db:seed` with `DATABASE_URL` pointed at the production database — or just create real barbers/services through the database directly instead of using the demo seed script, since that script is meant for dev/test data.
