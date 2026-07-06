import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { AdminNoteForm } from "@/components/AdminNoteForm";
import { ScorecardForm } from "@/components/ScorecardForm";
import { createClient } from "@/lib/supabase/server";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { appUser } = await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!candidate) notFound();

  const [
    { data: responses },
    { data: activity },
    { data: notes },
    { data: scores },
  ] = await Promise.all([
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
    supabase
      .from("candidate_scores")
      .select("*")
      .eq("candidate_id", id)
      .maybeSingle(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">{candidate.full_name || candidate.email}</h1>
        <p className="mt-1 text-zinc-600">
          {candidate.email} · Stage: {candidate.candidate_stage.replace(/_/g, " ")}
        </p>

        <div className="mt-8 grid gap-6">
          <ContentCard title="Overview">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Territory interest</dt>
                <dd>{candidate.territory_interest || "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd>{candidate.phone || "—"}</dd>
              </div>
            </dl>
          </ContentCard>

          <ContentCard title="Activity timeline">
            <ul className="space-y-2 text-sm">
              {activity?.map((event) => (
                <li key={event.id} className="flex justify-between border-b border-zinc-100 py-2">
                  <span>{event.event_type.replace(/_/g, " ")}</span>
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
              {!responses?.length && <p className="text-zinc-500">No responses yet.</p>}
            </div>
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
            </ul>
          </ContentCard>

          <ContentCard title="Scorecard">
            <ScorecardForm candidateId={id} initial={scores ?? {}} />
          </ContentCard>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
