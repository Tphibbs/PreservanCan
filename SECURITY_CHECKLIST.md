# Security Checklist — PreservanCan

Manual verification steps before inviting real franchise candidates.

## Authentication

- [ ] Logged-out user visiting `/dashboard` is redirected to `/login`
- [ ] Logged-out user visiting `/admin` is redirected to `/login`
- [ ] Magic link login works with production redirect URLs configured in Supabase

## Candidate isolation

- [ ] Candidate A cannot read Candidate B profile (test with two accounts)
- [ ] Candidate cannot access `/admin` routes (redirected to `/dashboard`)
- [ ] Candidate cannot read `candidate_notes` via Supabase client or API
- [ ] Candidate cannot read `candidate_scores` via Supabase client or API
- [ ] Candidate can only read own questionnaire responses

## Role separation

- [ ] `broker_preview` cannot submit questionnaire (`/api/questionnaire` returns 403)
- [ ] `franchise_dev_admin` can view all candidates at `/admin/candidates`
- [ ] `franchise_dev_admin` can create invites at `/admin/invites`
- [ ] `executive_admin` can view scorecards at `/admin/scorecards`

## Data isolation

- [ ] No queries to Preservan Hub operational tables
- [ ] No HubSpot, Jobber, support ticket, or live franchisee KPI integrations
- [ ] Sample dashboard at `/sample-dashboard` uses only static demo data
- [ ] Demo disclaimer visible on sample dashboard page

## Invite flow

- [ ] Expired invite token is rejected
- [ ] Invite email must match signed-in user email
- [ ] Revoked/accepted invite cannot be reused

## RLS (Supabase)

- [ ] RLS enabled on all 9 tables
- [ ] Run as candidate: `SELECT * FROM candidate_notes` returns 0 rows
- [ ] Run as candidate: `SELECT * FROM candidate_scores` returns 0 rows
- [ ] Run as admin: both tables return data

## API routes

- [ ] `/api/admin/invites` returns 401 without auth
- [ ] `/api/admin/invites` returns 403 for candidate role
- [ ] `/api/invites/accept` validates token server-side with service role
- [ ] `/api/questionnaire` returns 403 for non-candidate roles

## How to test RLS in Supabase SQL editor

Sign in as a test user in the app, then use their JWT in the SQL editor (or test via browser DevTools Supabase client):

```sql
-- Should return only the signed-in user's profile
SELECT * FROM candidate_profiles;

-- Should return empty for candidates
SELECT * FROM candidate_notes;
SELECT * FROM candidate_scores;
```

## Phase 2

After Phase 1 deployment, run the full audit in `PHASE2.md` with Opus/Sonnet thinking model.
