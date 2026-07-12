<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Scripts live in `package.json`: `npm run dev` (Turbopack, port 3000), `npm run build`, `npm run start`, `npm run lint`. The update script already runs `npm install`.

### Backend / Supabase
- This app talks to a **hosted Supabase project** (ref `vzdpbdphltujkobhqint`). Docker is not available, so do not try to run a local Supabase stack.
- Credentials are injected as env vars: `Can_SUPABASE_URL`, `Can_SUPABASE_PUBLISHABLE_KEY`, `Can_SUPABASE_SECRET_KEY` (identical duplicates without the `Can_` prefix also exist).
- The app reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` from `.env.local`. Map them from the injected vars: URL←`Can_SUPABASE_URL`, ANON_KEY←`Can_SUPABASE_PUBLISHABLE_KEY` (new-style `sb_publishable_...` key works fine as the anon key), SERVICE_ROLE_KEY←`Can_SUPABASE_SECRET_KEY` (`sb_secret_...`), and `NEXT_PUBLIC_APP_URL=http://localhost:3000`. If `.env.local` is missing on a fresh VM, recreate it with that mapping.
- The DB schema (`supabase/migrations/`) is **already applied and seeded** on the hosted project (e.g. 8 `preview_content` rows). Do not re-run the migration against it unless you intend to change the shared project.

### Auth / testing gotcha
- Login is **magic-link (email OTP) only** — there is no password login page, and there is no local mailbox in this VM, so you cannot complete the UI login by waiting for an email.
- To get an authenticated session for testing without email, use the service-role key with the Supabase admin API: create/confirm a user (`auth.admin.createUser` with `email_confirm: true` and a password) and insert an `app_users` row with the desired role (`executive_admin` for admin access). Then establish a browser session via a short-lived server-side helper that calls `supabase.auth.signInWithPassword` using `@/lib/supabase/server` (the SSR client sets the auth cookies), or via `auth.admin.generateLink`. Remove any such temporary helper before committing.
- A test admin already exists in the hosted project: `cursor-admin@preservan-test.com` (role `executive_admin`).

### Notes
- The `middleware`→`proxy` deprecation warning at startup is benign.
