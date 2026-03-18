# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

Seed scripts (run with tsx):
```bash
npx tsx scripts/seed-admin.ts   # Create default admin user
npx tsx scripts/check-admin.ts  # Verify admin user exists
```

## Architecture

**Tropico-web** is a Next.js App Router application for managing a cooperative/membership organization. The UI and code comments are in Spanish.

### Route Structure

Two route groups define the top-level split:
- `src/app/(auth)/` — Public routes: login, password recovery, set password
- `src/app/(dashboard)/` — Protected routes: requires auth. Admin-only routes live under `(dashboard)/admin/`

`src/middleware.ts` enforces auth and role-based access. It uses the service role client to check roles and redirects accordingly.

### Supabase Clients

Three clients in `src/lib/supabase/`:
- `client.ts` — Browser (anon key, respects RLS) — use in client components
- `server.ts` — Server (anon key, for server components)
- `admin.ts` — Service role (bypasses RLS) — use only for admin operations

### Data Flow

- Server components fetch data directly via the server Supabase client
- Mutations go through Server Actions in `src/lib/actions/` (marked `"use server"`)
- Client components are explicitly marked `"use client"` and handle UI interactivity only

### Database

Core tables: `users` (linked to `auth.users`), `users_admin_data` (admin-only metadata), `posts`, `post_reads`, `categories`, `products`. All have Row Level Security enabled.

Migrations live in `supabase/migrations/`. Apply them via the Supabase dashboard or CLI.

### Member Management

The main feature is ABM Socios (`src/app/(dashboard)/admin/socios/`):
- Listing with filters (name, email, member number, active status)
- Create: invites member via Supabase magic link
- Edit: two sections — user data and admin-sensitive data (stored in `users_admin_data`)
- Admin can send password reset links to any member

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
