# Production Checklist — PreservanCan

## Environment

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (server-only, never expose to client)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain

## Supabase Auth

- [ ] Site URL configured in Supabase Auth settings
- [ ] Redirect URLs include `https://your-domain.com/auth/callback`
- [ ] Email templates reviewed (magic link)
- [ ] Email sender configured (Supabase default or custom SMTP)

## Database

- [ ] All migrations applied to PreservanCan Supabase project
- [ ] Preview content seeded
- [ ] First `executive_admin` bootstrapped

## Domain

- [ ] Vercel project connected to `can.preservan.com` (or chosen domain)
- [ ] SSL active

## Legal / sales

- [ ] FDD disclaimer visible on all candidate-facing pages
- [ ] Sample dashboard demo disclaimer visible
- [ ] Preview content reviewed by franchise development
- [ ] Franchise counsel review scheduled (recommended before broad rollout)

## QA

- [ ] Complete all items in `SECURITY_CHECKLIST.md`
- [ ] Internal test with fake candidate account
- [ ] Admin invite → accept → questionnaire → scorecard flow verified end-to-end

## Rollout stages

1. **Internal only** — franchise dev team tests with fake candidates
2. **Trusted beta** — 1–3 warm candidates
3. **Controlled production** — qualified leads only after security + legal sign-off

## Remaining gaps (Phase 1)

- Automated email for invites (manual copy/paste for now)
- Content editing UI (edit via Supabase dashboard for now)
- Automated access tests (manual checklist only)
- Audit logging beyond activity events

See `PHASE2.md` for the security hardening pass.
