# PreservanCan

Franchise candidate preview and qualification portal for Preservan franchise prospects.

**Separate from Preservan Hub.** No operational franchisee, Jobber, HubSpot, support ticket, or live KPI data.

## Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Supabase Auth (magic link)
- Supabase Postgres + RLS
- Vercel deployment

## Roles

| Role | Access |
|------|--------|
| `candidate` | Own profile, preview content, questionnaire |
| `broker_preview` | Limited preview content |
| `franchise_dev_admin` | Candidates, invites, notes, scores |
| `executive_admin` | Full admin access |

## Local setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in Supabase credentials from [Supabase Dashboard](https://supabase.com/dashboard/project/vzdpbdphltujkobhqint/settings/api):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for invite acceptance)
- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)

4. Database migrations are in `supabase/migrations/`. If setting up a fresh project, run the SQL in the Supabase SQL editor or via Supabase CLI.

5. Start the dev server:

```bash
npm run dev
```

## Bootstrap first admin

1. Create an invite at `/admin/invites` won't work until you have an admin. Bootstrap manually:

**Option A — SQL (after first magic-link login):**

```sql
-- Find your auth user id in Supabase Auth, then:
INSERT INTO app_users (auth_user_id, email, full_name, role)
VALUES ('YOUR_AUTH_USER_UUID', 'you@preservan.com', 'Your Name', 'executive_admin');
```

**Option B — Invite flow with service role:**

1. Temporarily insert an admin invite via Supabase SQL using service role context
2. Or use Supabase dashboard Table Editor to insert `app_users` row linked to your auth user

3. Sign in via magic link at `/login`
4. Go to `/admin/invites` and create candidate invites

## Candidate workflow

1. Admin creates invite → copies link
2. Candidate opens `/accept-invite?token=...`
3. Candidate signs in with magic link (same email as invite)
4. App creates profile + assignments
5. Candidate reviews modules and completes questionnaire
6. Admin reviews activity, notes, and scorecard

## Routes

### Public
- `/` — Homepage
- `/login` — Magic link login
- `/accept-invite` — Invite acceptance

### Candidate
- `/dashboard`, `/start-here`, `/owner-role`, `/operating-system`
- `/training-preview`, `/connect-center`, `/sample-dashboard`
- `/validation-prep`, `/questionnaire`, `/next-steps`

### Admin
- `/admin`, `/admin/candidates`, `/admin/candidates/[id]`
- `/admin/invites`, `/admin/content`, `/admin/scorecards`

## Vercel deployment

1. Import repo to Vercel
2. Add all env vars from `.env.example`
3. Set `NEXT_PUBLIC_APP_URL` to production URL (e.g. `https://can.preservan.com`)
4. In Supabase Auth → URL Configuration, add:
   - Site URL: your production URL
   - Redirect URLs: `https://your-domain.com/auth/callback`

## Supabase project

- **Project name:** PreservanCan
- **Project ref:** `vzdpbdphltujkobhqint`
- **Region:** us-west-2

## Security

See `SECURITY_CHECKLIST.md` and `PRODUCTION_CHECKLIST.md`.

**Phase 2** (RLS hardening audit) is documented in `PHASE2.md`.

## Legal disclaimers

All candidate-facing pages include FDD disclaimer footer. Sample dashboard uses static demo data only.
