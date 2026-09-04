# GSS Supabase backend

Auth + Postgres, no server process to run — the frontend talks to Supabase
directly. Row Level Security (not frontend code) enforces who sees what.

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. **Turn off email confirmation** so signup logs you straight in (matches
   the custom backend's behaviour): Authentication → Providers → Email →
   disable "Confirm email". (Leave it on if you'd rather require email
   verification — `signUp` will then return before a session exists, which
   the adapter surfaces as "check your inbox" rather than logging in.)
3. SQL Editor → New query → paste all of `supabase/schema.sql` → Run. This
   creates `companies`, `profiles`, `shipments`, the auto-profile trigger,
   and every RLS policy.
4. Project Settings → API → copy the Project URL and the `anon` public key.
5. **Create the first staff account**: sign up once through the app's
   `/signup` form (creates a `client` profile), then in the Supabase table
   editor open `profiles` and change that row's `role` to `staff` and
   `company_id` to null. Further staff accounts can be added from `/team`
   once this one exists — no direct table editing needed after this.

In the repo root, set in `.env.local`:

```
VITE_BACKEND=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Why RLS, not frontend checks

Every access rule (`clients read own shipments`, `staff read all shipments`,
etc.) lives in `schema.sql` as a Postgres policy, checked on every query
regardless of what the frontend does — a bug in React code can't leak
another client's shipments. Verified directly against Postgres as the
non-owner `authenticated` role (the same role Supabase's client library
actually queries as) rather than trusting the SQL by inspection alone.

## `inviteStaff` implementation note

Supabase's admin user-creation API needs the service-role key, which must
never reach the browser. `inviteStaff` instead opens a second, throwaway
Supabase client to run `auth.signUp` (so it doesn't replace the calling
staff member's own session), then uses the staff member's real session to
`UPDATE` that new row's `profiles.role` to `'staff'` — allowed by the
"staff update any profile" policy.
