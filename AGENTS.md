<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single Next.js 16 (App Router) app — no separate backend service. Standard scripts live in `package.json`: `npm run dev` (server on `http://localhost:3000`), `npm run build`, `npm run lint`.

- **Env vars:** the app needs `.env.local` (gitignored). The startup update script auto-creates it from injected Supabase secrets when missing. Mapping: `NEXT_PUBLIC_SUPABASE_URL`←`SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`←`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`←`SUPABASE_SECRET_KEY`, plus `NEXT_PUBLIC_APP_URL=http://localhost:3000`. Keys are new-style Supabase `sb_publishable_…`/`sb_secret_…` (they work as anon/service-role).
- **Database:** the app uses the shared **remote** Supabase project (ref `vzdpbdphltujkobhqint`); `supabase/migrations/*` are already applied and seed data exists there. There is no local Supabase stack / `config.toml`, so do not run `supabase start`.
- **Auth gotcha (non-obvious):** login is magic-link only and the login page instantiates the browser Supabase client *inside the submit handler*, so `detectSessionInUrl` never runs on load — pasting a magic-link/hash-token URL will NOT log you in. For local testing without email delivery: use the service-role key to create+confirm an auth user and an `app_users` row, set a password via the admin API, then sign in through a cookie-capturing `@supabase/ssr` server client and inject the resulting `sb-vzdpbdphltujkobhqint-auth-token` cookie into the browser. Cookies on `localhost` are shared across ports, so serving a one-line cookie-setter page on another port and then loading `:3000` works.
- **Test admin account:** `admin+hello@preservan.com` (role `executive_admin`) already exists in the remote project for authenticated-flow testing.
