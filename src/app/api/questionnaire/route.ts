import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!appUser || appUser.role !== "candidate") {
    return NextResponse.json({ error: "Only candidates can submit questionnaire" }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", appUser.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
  }

  const { responses } = await request.json();

  if (!Array.isArray(responses)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const item of responses) {
    await supabase.from("candidate_questionnaire_responses").upsert(
      {
        candidate_id: profile.id,
        question_key: item.question_key,
        question_text: item.question_text,
        response: item.response,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id,question_key" }
    );
  }

  await supabase
    .from("candidate_profiles")
    .update({ candidate_stage: "questionnaire_completed", updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  await supabase.from("candidate_activity_events").insert({
    candidate_id: profile.id,
    event_type: "completed_questionnaire",
    event_metadata: {},
  });

  return NextResponse.json({ success: true });
}
