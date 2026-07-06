import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/types";

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

  if (!appUser || !isAdminRole(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { candidate_id, ...scores } = body;

  if (!candidate_id) {
    return NextResponse.json({ error: "candidate_id required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("candidate_scores")
    .select("id")
    .eq("candidate_id", candidate_id)
    .maybeSingle();

  const payload = {
    candidate_id,
    ...scores,
    created_by: appUser.id,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("candidate_scores").update(payload).eq("id", existing.id)
    : await supabase.from("candidate_scores").insert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
