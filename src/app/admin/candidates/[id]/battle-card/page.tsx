import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { PrintButton } from "@/components/PrintButton";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { scoreTotals, discoveryReadinessPercent } from "@/lib/sales";
import type {
  CandidateCrm,
  CandidateProfile,
  CandidateScores,
  DiscoveryReadiness,
} from "@/lib/types";

export default async function BattleCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidateData } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!candidateData) notFound();
  const candidate = candidateData as CandidateProfile;

  const [{ data: crmData }, { data: scoresData }, { data: readinessData }] =
    await Promise.all([
      supabase.from("candidate_crm").select("*").eq("candidate_id", id).maybeSingle(),
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
  const totals = scoreTotals(scores);
  const readyPct = discoveryReadinessPercent(readiness);

  const talkingPoints = buildTalkingPoints(crm);
  const questions = buildQuestions(crm, candidate);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/admin/candidates/${id}`} className="text-sm text-emerald-700 underline">
            ← Back to candidate
          </Link>
          <PrintButton />
        </div>

        <header className="mt-6 border-b border-zinc-300 pb-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Candidate Battle Card
          </p>
          <h1 className="text-2xl font-bold">
            {candidate.full_name || candidate.email}
          </h1>
          <p className="text-sm text-zinc-600">
            {candidate.email}
            {candidate.phone ? ` · ${candidate.phone}` : ""}
            {candidate.assigned_rep ? ` · Rep: ${candidate.assigned_rep}` : ""}
          </p>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Row label="Stage" value={candidate.candidate_stage.replace(/_/g, " ")} />
          <Row label="Territory" value={candidate.territory_interest} />
          <Row label="Liquid capital" value={crm?.liquid_capital_range} />
          <Row label="Timeline" value={crm?.timeline_to_launch} />
          <Row label="Owner role" value={crm?.owner_role_preference?.replace(/_/g, " ")} />
          <Row label="Sales comfort" value={crm?.sales_comfort_level} />
          <Row
            label="Fit score"
            value={totals.count ? `${totals.total}/${totals.max}` : "Not scored"}
          />
          <Row label="Discovery readiness" value={`${readyPct}%`} />
        </div>

        <Section title="Motivation">
          <p>{crm?.why_preservan || "Not documented."}</p>
        </Section>

        <Section title="Biggest concern">
          <p>{crm?.biggest_concern || "Not documented."}</p>
        </Section>

        <Section title="Red flags (internal)">
          <p className={crm?.red_flags ? "text-red-700" : ""}>
            {crm?.red_flags || "None documented."}
          </p>
        </Section>

        <Section title="Best talking points">
          <ul className="list-disc space-y-1 pl-5">
            {talkingPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Section>

        <Section title="Questions to ask on the next call">
          <ul className="list-disc space-y-1 pl-5">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Section>

        <Section title="Recommended next step">
          <p>
            {scores?.recommended_next_action ||
              candidate.next_step ||
              "Confirm fit and set the next conversation."}
          </p>
          {candidate.next_follow_up_date && (
            <p className="mt-1 text-sm text-zinc-600">
              Follow-up date: {candidate.next_follow_up_date}
            </p>
          )}
        </Section>

        {scores?.admin_summary && (
          <Section title="Admin summary">
            <p>{scores.admin_summary}</p>
          </Section>
        )}

        <footer className="mt-10 border-t border-zinc-300 pt-4 text-xs text-zinc-500">
          {LEGAL_DISCLAIMER} Internal use only — do not share with the candidate.
        </footer>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
        {title}
      </h2>
      <div className="mt-2 text-sm leading-relaxed text-zinc-800">{children}</div>
    </section>
  );
}

function buildTalkingPoints(crm: CandidateCrm | null): string[] {
  const points: string[] = [];
  if (crm?.why_preservan) {
    points.push(`Reinforce their motivation: ${crm.why_preservan}`);
  }
  points.push(
    "Frame the owner role: leads local sales, builds the team, owns the customer experience — with system support behind them."
  );
  points.push(
    "Emphasize structure and support (training, playbooks, Connect Center) rather than doing it all alone."
  );
  if (crm?.owner_role_preference === "semi_absentee" || crm?.owner_role_preference === "investor_only") {
    points.push(
      "Be candid that early stages reward hands-on ownership; align expectations on involvement."
    );
  }
  if (crm?.biggest_concern) {
    points.push(`Address their concern directly and honestly: ${crm.biggest_concern}`);
  }
  points.push(
    "Avoid any earnings or performance claims; defer financial-performance questions to the FDD."
  );
  return points;
}

function buildQuestions(
  crm: CandidateCrm | null,
  candidate: CandidateProfile
): string[] {
  const questions: string[] = [];
  questions.push("How involved do you want to be day-to-day in the first year?");
  if (!crm?.liquid_capital_range) {
    questions.push("How are you thinking about the investment and your available capital?");
  }
  if (!candidate.territory_interest) {
    questions.push("Which market or territory are you most focused on?");
  }
  questions.push("What would make this a clear yes for you — and what's still open?");
  if (crm?.biggest_concern) {
    questions.push(`Let's dig into ${crm.biggest_concern} — what would resolve it for you?`);
  }
  questions.push("What does your ideal timeline to launch look like?");
  return questions;
}
