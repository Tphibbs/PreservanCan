-- Sales Command Center pivot: CRM detail, discovery readiness, scorecard extension.
-- All new tables are admin-only (RLS) so candidate/broker roles can never read them.

-- 1) Extend fit-category enum
ALTER TYPE public.overall_recommendation ADD VALUE IF NOT EXISTS 'needs_diligence';

-- 2) Owner role preference enum
DO $$ BEGIN
  CREATE TYPE public.owner_role_preference AS ENUM ('owner_operator', 'semi_absentee', 'investor_only', 'unsure');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Allow sales-team-created candidates without an auth account, add workflow fields
ALTER TABLE public.candidate_profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS assigned_rep text;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS next_step text;
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS next_follow_up_date date;

-- 4) Admin-only CRM detail table (never candidate-readable)
CREATE TABLE IF NOT EXISTS public.candidate_crm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid UNIQUE NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  liquid_capital_range text,
  timeline_to_launch text,
  owner_role_preference public.owner_role_preference,
  sales_comfort_level text,
  technician_management_comfort text,
  why_preservan text,
  biggest_concern text,
  red_flags text,
  updated_by uuid REFERENCES public.app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Discovery Day readiness checklist (admin-only)
CREATE TABLE IF NOT EXISTS public.candidate_discovery_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid UNIQUE NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  initial_qualification_complete boolean NOT NULL DEFAULT false,
  financial_screen_complete boolean NOT NULL DEFAULT false,
  owner_role_discussed boolean NOT NULL DEFAULT false,
  territory_review_complete boolean NOT NULL DEFAULT false,
  fdd_sent_or_ready boolean NOT NULL DEFAULT false,
  validation_prep_complete boolean NOT NULL DEFAULT false,
  key_concerns_documented boolean NOT NULL DEFAULT false,
  leadership_call_complete boolean NOT NULL DEFAULT false,
  award_recommendation_ready boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES public.app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Scorecard: recommended next action
ALTER TABLE public.candidate_scores ADD COLUMN IF NOT EXISTS recommended_next_action text;

-- 7) RLS: admin-only on new tables
ALTER TABLE public.candidate_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_discovery_readiness ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage candidate crm" ON public.candidate_crm;
CREATE POLICY "Admins manage candidate crm"
  ON public.candidate_crm FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Admins manage discovery readiness" ON public.candidate_discovery_readiness;
CREATE POLICY "Admins manage discovery readiness"
  ON public.candidate_discovery_readiness FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE INDEX IF NOT EXISTS idx_candidate_crm_candidate ON public.candidate_crm(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_discovery_candidate ON public.candidate_discovery_readiness(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_follow_up ON public.candidate_profiles(next_follow_up_date);
