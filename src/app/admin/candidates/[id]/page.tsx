import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard, Badge } from "@/components/Cards";
import { AdminNoteForm } from "@/components/AdminNoteForm";
import { ScorecardForm } from "@/components/ScorecardForm";
import { CandidateForm } from "@/components/CandidateForm";
import { DiscoveryChecklist } from "@/components/DiscoveryChecklist";
import { FollowUpGenerator } from "@/components/FollowUpGenerator";
import { createClient } from "@/lib/supabase/server";
import {
  discoveryReadinessPercent,
  RECOMMENDATION_BADGE,
  scoreTotals,
} from "@/lib/sales";
import type {
  CandidateCrm,
  CandidateProfile,
  CandidateScores,
  DiscoveryReadiness,
} from "@/lib/types";

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { appUser } = await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidateData } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!candidateData) notFound();
  const candidate = candidateData as CandidateProfile;

  const [
    { data: crmData },
    { data: responses },
    { data: activity },
    { data: notes },
    { data: scoresData },
    { data: readinessData },
  ] = await Promise.all([
    supabase.from("candidate_crm").select("*").eq("candidate_id", id).maybeSingle(),
    supabase
      .from("candidate_questionnaire_responses")
      .select("*")
      .eq("candidate_id", id)
      .order("question_key"),
    supabase
      .from("candidate_activity_events")
      .select("*")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("candidate_notes")
      .select("*")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("candidate_scores").select("*").eq("candidate_id", id).maybeSingle(),
    supabase
      .from("candidate_discovery_readiness")
      .select("*")
      .eq("candidate_id", id)
      .maybeSingle(),
  ]);

  const crm = (crmData ?? null) as CandidateCrm | null;
  const scores = (scoresData ?? null) as CandidateScores | null;
  const readiness = (readinessData ?? null) as DiscoveryReadiness | null;
  const rec = scores?.overall_recommendation ?? null;
  const totals = scoreTotals(scores);
  const readyPct = discoveryReadinessPercent(readiness);

  const formInitial: Record<string, string> = {
    full_name: str(candidate.full_name),
    email: str(candidate.email),
    phone: str(candidate.phone),
    territory_interest: str(candidate.territory_interest),
    source: str(candidate.source),
    candidate_stage: str(candidate.candidate_stage),
    financial_readiness: str(candidate.financial_readiness),
    assigned_rep: str(candidate.assigned_rep),
    next_step: str(candidate.next_step),
    next_follow_up_date: str(candidate.next_follow_up_date),
    liquid_capital_range: str(crm?.liquid_capital_range),
    timeline_to_launch: str(crm?.timeline_to_launch),
    owner_role_preference: str(crm?.owner_role_preference),
    sales_comfort_level: str(crm?.sales_comfort_level),
    technician_management_comfort: str(crm?.technician_management_comfort),
    why_preservan: str(crm?.why_preservan),
    biggest_concern: str(crm?.biggest_concern),
    red_flags: str(crm?.red_flags),
  };

  const scoreInitial: Record<string, string | number | null> = scores
    ? {
        financial_readiness_score: scores.financial_readiness_score,
        owner_operator_fit_score: scores.owner_operator_fit_score,
        coachability_score: scores.coachability_score,
        sales_comfort_score: scores.sales_comfort_score,
        operations_fit_score: scores.operations_fit_score,
        territory_fit_score: scores.territory_fit_score,
        portal_engagement_score: scores.portal_engagement_score,
        validation_maturity_score: scores.validation_maturity_score,
        overall_recommendation: scores.overall_recommendation,
        recommended_next_action: scores.recommended_next_action,
        admin_summary: scores.admin_summary,
      }
    : {};

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {candidate.full_name || candidate.email}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-zinc-600">
              <span>{candidate.email}</span>
              <Badge>{candidate.candidate_stage.replace(/_/g, " ")}</Badge>
              {rec && (
                <Badge className={RECOMMENDATION_BADGE[rec]}>
                  {rec.replace(/_/g, " ")}
                </Badge>
              )}
            </p>
          </div>
          <Link
            href={`/admin/candidates/${id}/battle-card`}
            className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Battle card
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          <ContentCard title="Call-prep snapshot">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Field label="Territory" value={candidate.territory_interest} />
              <Field label="Assigned rep" value={candidate.assigned_rep} />
              <Field label="Phone" value={candidate.phone} />
              <Field label="Source" value={candidate.source} />
              <Field label="Liquid capital" value={crm?.liquid_capital_range} />
              <Field label="Timeline" value={crm?.timeline_to_launch} />
              <Field
                label="Owner role"
                value={crm?.owner_role_preference?.replace(/_/g, " ")}
              />
              <Field label="Sales comfort" value={crm?.sales_comfort_level} />
              <Field label="Motivation" value={crm?.why_preservan} full />
              <Field label="Biggest concern" value={crm?.biggest_concern} full />
              <Field label="Red flags (internal)" value={crm?.red_flags} full danger />
              <Field label="Next step" value={candidate.next_step} full />
              <Field label="Next follow-up" value={candidate.next_follow_up_date} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-zinc-100 pt-4 text-sm">
              <span>
                <span className="text-zinc-500">Fit score: </span>
                <span className="font-semibold text-zinc-900">
                  {totals.count ? `${totals.total}/${totals.max}` : "Not scored"}
                </span>
              </span>
              <span>
                <span className="text-zinc-500">Discovery readiness: </span>
                <span className="font-semibold text-zinc-900">{readyPct}%</span>
              </span>
            </div>
          </ContentCard>

          <ContentCard title="Candidate record">
            <CandidateForm mode="edit" candidateId={id} initial={formInitial} />
          </ContentCard>

          <ContentCard title="Fit scorecard">
            <ScorecardForm candidateId={id} initial={scoreInitial} />
          </ContentCard>

          <ContentCard title="Discovery Day readiness">
            <DiscoveryChecklist
              candidateId={id}
              initial={(readiness ?? {}) as unknown as Record<string, boolean>}
            />
          </ContentCard>

          <ContentCard title="Follow-up draft generator">
            <FollowUpGenerator
              context={{
                fullName: candidate.full_name,
                territory: candidate.territory_interest,
                biggestConcern: crm?.biggest_concern ?? null,
                whyPreservan: crm?.why_preservan ?? null,
                nextStep: candidate.next_step,
                rep: candidate.assigned_rep,
              }}
            />
          </ContentCard>

          <ContentCard title="Admin notes">
            <AdminNoteForm candidateId={id} />
            <ul className="mt-4 space-y-3 text-sm">
              {notes?.map((n) => (
                <li key={n.id} className="rounded-lg border border-zinc-200 p-3">
                  <p>{n.note}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
              {!notes?.length && <p className="text-zinc-500">No notes yet.</p>}
            </ul>
          </ContentCard>

          <ContentCard title="Activity timeline">
            <ul className="space-y-2 text-sm">
              {activity?.map((event) => (
                <li
                  key={event.id}
                  className="flex justify-between border-b border-zinc-100 py-2"
                >
                  <span className="capitalize">
                    {event.event_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-zinc-500">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
              {!activity?.length && <p className="text-zinc-500">No activity yet.</p>}
            </ul>
          </ContentCard>

          <ContentCard title="Questionnaire responses">
            <div className="space-y-4 text-sm">
              {responses?.map((r) => (
                <div key={r.id}>
                  <p className="font-medium text-zinc-800">{r.question_text}</p>
                  <p className="mt-1 text-zinc-600">{r.response || "—"}</p>
                </div>
              ))}
              {!responses?.length && (
                <p className="text-zinc-500">
                  No portal questionnaire responses (candidate may not have a portal
                  account).
                </p>
              )}
            </div>
          </ContentCard>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

function Field({
  label,
  value,
  full = false,
  danger = false,
}: {
  label: string;
  value: string | null | undefined;
  full?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-zinc-500">{label}</dt>
      <dd className={danger && value ? "text-red-700" : "text-zinc-800"}>
        {value || "—"}
      </dd>
    </div>
  );
}
