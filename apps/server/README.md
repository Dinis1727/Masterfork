# Masterfork Server

This directory contains the database schema and tooling configured with [Prisma](https://www.prisma.io/).

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Run database migrations

   ```bash
   npx prisma migrate dev
   ```

3. Seed the database with sample products

   ```bash
   npx prisma db seed
   ```

The default database is a local SQLite file located at `apps/server/dev.db`. Update the `DATABASE_URL` value in `.env` if you prefer another provider.
