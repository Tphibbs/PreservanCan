# Phase 2 — Security Hardening Pass

**Status:** Queued (run after Phase 1 deploy)

Phase 1 delivers a working MVP with RLS policies, server-side route guards, and role separation. Phase 2 is a focused audit — no new features.

## When to run

- After Vercel env vars are set
- After first admin is bootstrapped
- Before inviting real franchise candidates

## Recommended model

Use **Opus or Sonnet (thinking)** for this pass. Composer is fine for Phase 1 scaffolding; Phase 2 needs careful permission reasoning.

## Prompt to use

```
Review PreservanCan for production readiness. Focus ONLY on security and RLS.

Confirm and fix:
1. Every table has RLS enabled.
2. candidate role can only read/update its own allowed records.
3. candidate role cannot read candidate_notes.
4. candidate role cannot read candidate_scores.
5. candidate role cannot access admin pages or admin API routes.
6. broker_preview cannot submit questionnaire responses.
7. franchise_dev_admin can view and manage candidate records.
8. executive_admin can view and manage all records.
9. logged-out users are redirected to login.
10. no route imports or queries Preservan Hub operational data.
11. no HubSpot, Jobber, support ticket, live KPI, or franchisee data is queried.
12. sample dashboard uses static demo data only.
13. invite token validation cannot be bypassed client-side.
14. service role key is never exposed to the browser.

Add comments to permission-sensitive code.
Update SECURITY_CHECKLIST.md with any new test steps.
Do not add new features.
```

## Expected outcomes

- RLS policy gaps fixed
- Route guard edge cases closed
- SECURITY_CHECKLIST.md updated with reproducible test steps
- Summary of remaining production gaps

## Phase 3 (optional, after Phase 2)

Polish candidate sales experience — copy, dashboard cards, premium feel. Use Composer. Do not change architecture or permissions.

```
Polish PreservanCan candidate-facing pages for franchise sales use.
Do not change architecture or permissions.
Improve homepage, dashboard, preview pages, questionnaire UX, and admin candidate detail.
Keep all disclaimers visible.
```

## Phase 2 success criteria

- [ ] All SECURITY_CHECKLIST items pass manually
- [ ] Supabase security advisors reviewed (`get_advisors` security type)
- [ ] No candidate path to admin data found
- [ ] Ready for trusted beta (1–3 warm candidates)
