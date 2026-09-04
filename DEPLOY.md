# Deploy notes

## Client portal / internal tool (auth)

The site ships with a login-gated client portal (`/portal`) and internal
staff tool (`/team`) on top of the public marketing pages. Which backend
powers them is picked **at build time** via `VITE_BACKEND` (Vite inlines env
vars into the bundle — this can't be switched at runtime, only rebuilt):

| `VITE_BACKEND` | What it needs | Setup |
|---|---|---|
| unset / `mock` | nothing | Default. In-memory, resets on reload — for local UI work only, never deploy this. |
| `custom` | a running instance of `server/` (Node/Express + Postgres, hand-written auth) | `server/README.md` |
| `supabase` | a Supabase project | `supabase/README.md` |

Set the chosen mode in `.env.local` before running `npm run build` for a
real deployment — e.g. for Supabase:

```
VITE_BACKEND=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Each backend adapter is its own lazy-loaded chunk (`src/api/index.ts`), so
building with one selected doesn't ship the other's code (or Supabase's
client library) to visitors.

## Build

```
npm install
npm run build   # tsc -b && vite build -> dist/
```

`dist/` is a static SPA: `index.html` plus a `models/` folder (the GLB) and
hashed `assets/*.js` / font files. Any static host works. Client-side routes
(`/services`, `/fleet`, `/about`, `/contact`) need an SPA fallback to
`index.html` for direct loads/refreshes — `vite preview` does this
automatically; configure the equivalent on your host (see below).

## Cache headers

Vite content-hashes every built asset (`index-abc123.js`,
`oswald-latin-600-normal-xyz.woff2`, …), so those are safe to cache
`immutable` forever — a content change always produces a new filename.
`index.html` is the one file that must always revalidate, since it's the
unhashed entry point and its own `<style>` block plus script tags point at
that build's hashed filenames.

| Files | Cache-Control | Why |
|---|---|---|
| `index.html` | `no-cache` | Entry point, unhashed filename — must always revalidate. |
| `assets/*` (JS, CSS is inlined into index.html, fonts) | `public, max-age=31536000, immutable` | Filename changes whenever content does; safe to cache for a year. |
| `models/*.glb` | `public, max-age=31536000, immutable` | Same reasoning — rename the file if you ever replace the model. |
| `favicon*.ico/png`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | `public, max-age=604800` | Change rarely; a stale icon for a while is low-risk. |
| `robots.txt`, `sitemap.xml` | *(none present yet — see TODO below)* | |

### Netlify — `public/_headers`

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/models/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache
```

Netlify also needs an SPA redirect — `public/_redirects`:

```
/*  /index.html  200
```

### Vercel — `vercel.json`

```json
{
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/models/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/index.html", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Nginx (self-hosted)

```nginx
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location /models/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location = /index.html { add_header Cache-Control "no-cache"; }
location / { try_files $uri /index.html; }
```

## Deploying the custom backend (only if `VITE_BACKEND=custom`)

`server/` is a separate Node process — it doesn't ship as part of the static
`dist/` build above. Deploy it to any Node host with a free tier (Render,
Fly.io, Railway), set its env vars (see `server/.env.example`), point
`CORS_ORIGIN` at wherever the static frontend actually lives, run
`npm run db:migrate` once against the production database, then
`npm run seed:staff -- you@gss-shipping.com 'a-strong-password'`.

## TODO before launch

- `robots.txt` / `sitemap.xml` — the old site's copies referenced its own
  vanilla page structure and no longer apply; regenerate for the 5 real
  routes once the domain/deploy target is final.
- `og-image` — the old site's Open Graph image and any `<meta>` tags for
  social sharing were dropped in the rewrite; add real ones (ideally a
  render of the 3D hero) before sharing links publicly.
