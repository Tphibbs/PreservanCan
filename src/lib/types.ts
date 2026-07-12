export type UserRole =
  | "candidate"
  | "broker_preview"
  | "franchise_dev_admin"
  | "executive_admin";

export type CandidateStage =
  | "invited"
  | "active"
  | "questionnaire_started"
  | "questionnaire_completed"
  | "discovery_ready"
  | "validation"
  | "awarded"
  | "paused"
  | "disqualified";

export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type AssignmentStatus = "not_started" | "in_progress" | "completed";

export type OverallRecommendation =
  | "strong_fit"
  | "nurture"
  | "needs_diligence"
  | "pause"
  | "disqualify";

export type OwnerRolePreference =
  | "owner_operator"
  | "semi_absentee"
  | "investor_only"
  | "unsure";

export interface AppUser {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  territory_interest: string | null;
  candidate_stage: CandidateStage;
  source: string | null;
  financial_readiness: string | null;
  notes_summary: string | null;
  assigned_rep: string | null;
  next_step: string | null;
  next_follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

/** Admin-only sales CRM detail. Never exposed to candidate role (RLS admin-only). */
export interface CandidateCrm {
  id: string;
  candidate_id: string;
  liquid_capital_range: string | null;
  timeline_to_launch: string | null;
  owner_role_preference: OwnerRolePreference | null;
  sales_comfort_level: string | null;
  technician_management_comfort: string | null;
  why_preservan: string | null;
  biggest_concern: string | null;
  red_flags: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateScores {
  id: string;
  candidate_id: string;
  financial_readiness_score: number | null;
  owner_operator_fit_score: number | null;
  coachability_score: number | null;
  sales_comfort_score: number | null;
  operations_fit_score: number | null;
  territory_fit_score: number | null;
  portal_engagement_score: number | null;
  validation_maturity_score: number | null;
  overall_recommendation: OverallRecommendation | null;
  recommended_next_action: string | null;
  admin_summary: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryReadiness {
  id: string;
  candidate_id: string;
  initial_qualification_complete: boolean;
  financial_screen_complete: boolean;
  owner_role_discussed: boolean;
  territory_review_complete: boolean;
  fdd_sent_or_ready: boolean;
  validation_prep_complete: boolean;
  key_concerns_documented: boolean;
  leadership_call_complete: boolean;
  award_recommendation_ready: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateInvite {
  id: string;
  email: string;
  full_name: string;
  invite_token: string;
  role: UserRole;
  status: InviteStatus;
  territory_interest: string | null;
  expires_at: string;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface PreviewContent {
  id: string;
  title: string;
  slug: string;
  category: string;
  body: string;
  video_url: string | null;
  sort_order: number;
  is_active: boolean;
  audience: string;
}

export interface QuestionnaireQuestion {
  key: string;
  text: string;
  type: "text" | "textarea" | "select";
  options?: string[];
}

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  {
    key: "why_preservan",
    text: "Why are you interested in Preservan?",
    type: "textarea",
  },
  {
    key: "owner_experience",
    text: "Describe your business or leadership experience.",
    type: "textarea",
  },
  {
    key: "financial_readiness",
    text: "How would you describe your financial readiness for franchise ownership?",
    type: "select",
    options: [
      "Fully prepared",
      "Mostly prepared, need minor planning",
      "Still evaluating options",
      "Not ready yet",
    ],
  },
  {
    key: "territory_preference",
    text: "What territory or market are you most interested in?",
    type: "text",
  },
  {
    key: "timeline",
    text: "What is your ideal timeline to launch if awarded?",
    type: "select",
    options: [
      "0-3 months",
      "3-6 months",
      "6-12 months",
      "12+ months",
    ],
  },
  {
    key: "validation_questions",
    text: "What questions do you want answered during validation / Discovery Day?",
    type: "textarea",
  },
];

export const ADMIN_ROLES: UserRole[] = [
  "franchise_dev_admin",
  "executive_admin",
];

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "franchise_dev_admin" || role === "executive_admin";
}

export function isCandidateRole(role: UserRole | null | undefined): boolean {
  return role === "candidate";
}
