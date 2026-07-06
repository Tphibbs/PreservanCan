import { requireRole } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";
import { createClient } from "@/lib/supabase/server";

export default async function QuestionnairePage() {
  const { appUser } = await requireRole(["candidate"]);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id, candidate_stage")
    .eq("user_id", appUser.id)
    .maybeSingle();

  const { data: existing } = profile
    ? await supabase
        .from("candidate_questionnaire_responses")
        .select("question_key, response")
        .eq("candidate_id", profile.id)
    : { data: [] };

  const initialResponses: Record<string, string> = {};
  existing?.forEach((r) => {
    initialResponses[r.question_key] = r.response;
  });

  if (profile && profile.candidate_stage === "active") {
    await supabase
      .from("candidate_profiles")
      .update({ candidate_stage: "questionnaire_started" })
      .eq("id", profile.id);

    await supabase.from("candidate_activity_events").insert({
      candidate_id: profile.id,
      event_type: "started_questionnaire",
      event_metadata: {},
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Readiness Questionnaire</h1>
        <p className="mt-2 text-zinc-600">
          Help our franchise development team understand your goals, experience, and readiness.
        </p>
        <div className="mt-8">
          <ContentCard title="Your responses">
            <QuestionnaireForm key={profile?.id ?? "new"} initialResponses={initialResponses} />
          </ContentCard>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
