# GSS custom backend

Node + Express + Postgres. Hand-written auth (bcrypt + JWT in an httpOnly
cookie) — no third-party auth provider.

## Setup

1. Get a Postgres database. Any works: a local install, or a free hosted one
   (Neon, Render, Railway all have a free tier — pick whichever, you just
   need a connection string).
2. `cp .env.example .env` and fill in `DATABASE_URL` and `JWT_SECRET`
   (generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. `npm install`
4. `npm run db:migrate` — applies `schema.sql`.
5. `npm run seed:staff -- you@gss-shipping.com 'a-strong-password'` — creates
   the first staff login. There's no public "become staff" flow by design;
   further staff accounts are created from inside `/team` once one exists.
6. `npm run dev` — starts the API on `http://localhost:4000`.

Then point the frontend at it: in the repo root, set in `.env.local`:

```
VITE_BACKEND=custom
VITE_API_URL=http://localhost:4000
```

`CORS_ORIGIN` in `server/.env` must match wherever the frontend is actually
running (default Vite dev port is 5173) or the browser will block every
request as a CORS failure — this bit us once during setup, worth
double-checking first if login "just doesn't do anything."

## Notes

- Sessions are an httpOnly, sameSite=lax cookie — not readable from JS,
  survives a real page reload (not just in-memory React state).
- `DATE` columns are read back as raw `'YYYY-MM-DD'` strings (see
  `src/db.ts`) — letting `pg`'s default JS `Date` parsing round-trip through
  `toISOString()` shifts the date by a day in timezones ahead of UTC.
- Deploying: any Node host works (Render/Fly.io/Railway free tiers). Set the
  same env vars, run `db:migrate` once against the production database, then
  `npm run build && npm start`.
