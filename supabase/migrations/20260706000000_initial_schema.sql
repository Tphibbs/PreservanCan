-- PreservanCan initial schema with RLS

CREATE TYPE public.user_role AS ENUM (
  'candidate',
  'broker_preview',
  'franchise_dev_admin',
  'executive_admin'
);

CREATE TYPE public.invite_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

CREATE TYPE public.candidate_stage AS ENUM (
  'invited',
  'active',
  'questionnaire_started',
  'questionnaire_completed',
  'discovery_ready',
  'validation',
  'awarded',
  'paused',
  'disqualified'
);

CREATE TYPE public.assignment_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

CREATE TYPE public.overall_recommendation AS ENUM (
  'strong_fit',
  'nurture',
  'pause',
  'disqualify'
);

CREATE TYPE public.preview_category AS ENUM (
  'start_here',
  'owner_role',
  'operating_system',
  'training',
  'connect_center',
  'sample_dashboard',
  'validation',
  'next_steps'
);

CREATE TYPE public.preview_audience AS ENUM (
  'candidate',
  'broker_preview',
  'all'
);

-- Tables
CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'candidate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidate_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  invite_token text NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'candidate',
  status public.invite_status NOT NULL DEFAULT 'pending',
  territory_interest text,
  expires_at timestamptz NOT NULL,
  invited_by uuid REFERENCES public.app_users(id),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  territory_interest text,
  candidate_stage public.candidate_stage NOT NULL DEFAULT 'invited',
  source text,
  financial_readiness text,
  notes_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.preview_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category public.preview_category NOT NULL,
  body text NOT NULL DEFAULT '',
  video_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  audience public.preview_audience NOT NULL DEFAULT 'candidate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidate_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.preview_content(id) ON DELETE CASCADE,
  status public.assignment_status NOT NULL DEFAULT 'not_started',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (candidate_id, content_id)
);

CREATE TABLE public.candidate_questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  question_text text NOT NULL,
  response text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, question_key)
);

CREATE TABLE public.candidate_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.app_users(id),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.candidate_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  financial_readiness_score int CHECK (financial_readiness_score BETWEEN 1 AND 5),
  owner_operator_fit_score int CHECK (owner_operator_fit_score BETWEEN 1 AND 5),
  coachability_score int CHECK (coachability_score BETWEEN 1 AND 5),
  sales_comfort_score int CHECK (sales_comfort_score BETWEEN 1 AND 5),
  operations_fit_score int CHECK (operations_fit_score BETWEEN 1 AND 5),
  territory_fit_score int CHECK (territory_fit_score BETWEEN 1 AND 5),
  portal_engagement_score int CHECK (portal_engagement_score BETWEEN 1 AND 5),
  validation_maturity_score int CHECK (validation_maturity_score BETWEEN 1 AND 5),
  overall_recommendation public.overall_recommendation,
  admin_summary text,
  created_by uuid NOT NULL REFERENCES public.app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_users_auth_user_id ON public.app_users(auth_user_id);
CREATE INDEX idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
CREATE INDEX idx_candidate_invites_token ON public.candidate_invites(invite_token);
CREATE INDEX idx_candidate_assignments_candidate ON public.candidate_assignments(candidate_id);
CREATE INDEX idx_candidate_activity_candidate ON public.candidate_activity_events(candidate_id);

-- Helper functions (after tables)
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_users
    WHERE auth_user_id = auth.uid()
      AND role IN ('franchise_dev_admin', 'executive_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_candidate_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.id
  FROM public.candidate_profiles cp
  JOIN public.app_users au ON au.id = cp.user_id
  WHERE au.auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preview_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_scores ENABLE ROW LEVEL SECURITY;

-- app_users policies
CREATE POLICY "Users read own app_user row"
  ON public.app_users FOR SELECT
  USING (auth_user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Users update own limited fields"
  ON public.app_users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins manage app_users"
  ON public.app_users FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Users insert own app_user on signup"
  ON public.app_users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- candidate_invites: admin only (token validation uses service role server-side)
CREATE POLICY "Admins manage invites"
  ON public.candidate_invites FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- candidate_profiles
CREATE POLICY "Candidates read own profile"
  ON public.candidate_profiles FOR SELECT
  USING (
    user_id = public.current_app_user_id()
    OR public.is_admin_user()
  );

CREATE POLICY "Candidates update own profile"
  ON public.candidate_profiles FOR UPDATE
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());

CREATE POLICY "Admins manage candidate profiles"
  ON public.candidate_profiles FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Candidates insert own profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (user_id = public.current_app_user_id());

-- preview_content
CREATE POLICY "Authenticated users read preview content"
  ON public.preview_content FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND (
      audience = 'all'
      OR (audience = 'candidate' AND public.current_user_role() IN ('candidate', 'franchise_dev_admin', 'executive_admin'))
      OR (audience = 'broker_preview' AND public.current_user_role() IN ('broker_preview', 'franchise_dev_admin', 'executive_admin'))
      OR public.is_admin_user()
    )
  );

CREATE POLICY "Admins manage preview content"
  ON public.preview_content FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- candidate_assignments
CREATE POLICY "Candidates read own assignments"
  ON public.candidate_assignments FOR SELECT
  USING (
    candidate_id = public.current_candidate_profile_id()
    OR public.is_admin_user()
  );

CREATE POLICY "Candidates update own assignments"
  ON public.candidate_assignments FOR UPDATE
  USING (candidate_id = public.current_candidate_profile_id())
  WITH CHECK (candidate_id = public.current_candidate_profile_id());

CREATE POLICY "Admins manage assignments"
  ON public.candidate_assignments FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- questionnaire: candidates only (not broker_preview)
CREATE POLICY "Candidates read own questionnaire"
  ON public.candidate_questionnaire_responses FOR SELECT
  USING (
    (
      candidate_id = public.current_candidate_profile_id()
      AND public.current_user_role() = 'candidate'
    )
    OR public.is_admin_user()
  );

CREATE POLICY "Candidates write own questionnaire"
  ON public.candidate_questionnaire_responses FOR INSERT
  WITH CHECK (
    candidate_id = public.current_candidate_profile_id()
    AND public.current_user_role() = 'candidate'
  );

CREATE POLICY "Candidates update own questionnaire"
  ON public.candidate_questionnaire_responses FOR UPDATE
  USING (
    candidate_id = public.current_candidate_profile_id()
    AND public.current_user_role() = 'candidate'
  )
  WITH CHECK (
    candidate_id = public.current_candidate_profile_id()
    AND public.current_user_role() = 'candidate'
  );

CREATE POLICY "Admins manage questionnaire responses"
  ON public.candidate_questionnaire_responses FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- activity events
CREATE POLICY "Candidates read own activity"
  ON public.candidate_activity_events FOR SELECT
  USING (
    candidate_id = public.current_candidate_profile_id()
    OR public.is_admin_user()
  );

CREATE POLICY "Candidates insert own activity"
  ON public.candidate_activity_events FOR INSERT
  WITH CHECK (
    candidate_id = public.current_candidate_profile_id()
    AND public.current_user_role() IN ('candidate', 'broker_preview')
  );

CREATE POLICY "Admins manage activity"
  ON public.candidate_activity_events FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- candidate_notes: admin only
CREATE POLICY "Admins manage notes"
  ON public.candidate_notes FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- candidate_scores: admin only
CREATE POLICY "Admins manage scores"
  ON public.candidate_scores FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Seed preview content
INSERT INTO public.preview_content (title, slug, category, body, sort_order, audience) VALUES
('Welcome to PreservanCan', 'start-here', 'start_here',
 'Welcome to the Preservan Franchise Preview Center. This invite-only portal helps qualified candidates understand the Preservan operating system, owner role, training model, Connect Center support, and validation process before Discovery Day.', 1, 'candidate'),
('Owner Role Overview', 'owner-role', 'owner_role',
 'As a Preservan franchise owner, you lead local operations, sales conversations, team accountability, and customer experience. You are not expected to do everything alone — the Preservan system provides training, playbooks, Connect Center support, and operational dashboards.', 2, 'candidate'),
('Preservan Operating System', 'operating-system', 'operating_system',
 'Preservan combines proven restoration processes, centralized Connect Center support, training systems, and accountability dashboards. Owners focus on growth, team leadership, and local market execution while the system handles repeatable operational workflows.', 3, 'candidate'),
('Training Preview', 'training-preview', 'training',
 'Training covers owner onboarding, sales fundamentals, operations workflows, team management, and ongoing skill development. Full training unlocks after franchise award — this preview shows the structure and commitment level.', 4, 'candidate'),
('Connect Center Preview', 'connect-center', 'connect_center',
 'The Connect Center supports franchisees with centralized call handling, appointment scheduling, and customer communication workflows. This reduces owner overhead and creates consistent customer experience across locations.', 5, 'candidate'),
('Sample Dashboard', 'sample-dashboard', 'sample_dashboard',
 'Preview dashboards illustrate how owners track activity, pipeline, and operational metrics. All data shown in the sample dashboard is demo data only.', 6, 'candidate'),
('Validation Prep', 'validation-prep', 'validation',
 'Validation helps candidates confirm market fit, financial readiness, and operational commitment. Use this section to prepare questions and materials for your Discovery Day conversation.', 7, 'candidate'),
('Next Steps', 'next-steps', 'next_steps',
 'Complete your readiness questionnaire, review all preview modules, and prepare for your franchise development conversation. Your franchise development team will guide next steps based on mutual fit.', 8, 'candidate');
