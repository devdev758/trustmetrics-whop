# Prisma Database Schema

This directory contains the Prisma schema and migrations for TrustMetrics.

## Setup

1. Set up your Supabase project and get your database credentials
2. Copy `.env.example` to `.env` and fill in your database credentials:
   - `DATABASE_URL` - Your Supabase PostgreSQL connection string
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

3. Generate the Prisma Client:
   ```bash
   npm run db:generate
   ```

4. Push the schema to your database (for development):
   ```bash
   npm run db:push
   ```

   Or create a migration (for production):
   ```bash
   npm run db:migrate
   ```

## Database Scripts

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (no migration files)
- `npm run db:migrate` - Create and apply migrations

## Models

### Creator
Stores creator/merchant information from Whop.

### Metric
Stores time-series metrics for each creator, including engagement, retention, and trust scores.
