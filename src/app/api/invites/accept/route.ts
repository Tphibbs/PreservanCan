import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("candidate_invites")
    .select("*")
    .eq("invite_token", token)
    .maybeSingle();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "Invite already used or revoked" }, { status: 400 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    await admin
      .from("candidate_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }

  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Sign in with the email address that received the invite" },
      { status: 403 }
    );
  }

  const { data: existingUser } = await admin
    .from("app_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  let appUserId = existingUser?.id;

  if (!existingUser) {
    const { data: newUser, error: userError } = await admin
      .from("app_users")
      .insert({
        auth_user_id: user.id,
        email: invite.email.toLowerCase(),
        full_name: invite.full_name,
        role: invite.role,
      })
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    appUserId = newUser.id;
  }

  if (invite.role === "candidate") {
    const { data: existingProfile } = await admin
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", appUserId!)
      .maybeSingle();

    if (!existingProfile) {
      const { data: profile, error: profileError } = await admin
        .from("candidate_profiles")
        .insert({
          user_id: appUserId!,
          email: invite.email.toLowerCase(),
          full_name: invite.full_name,
          territory_interest: invite.territory_interest,
          candidate_stage: "active",
        })
        .select()
        .single();

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      const { data: content } = await admin
        .from("preview_content")
        .select("id")
        .eq("is_active", true);

      if (content?.length) {
        await admin.from("candidate_assignments").insert(
          content.map((item) => ({
            candidate_id: profile.id,
            content_id: item.id,
            status: "not_started",
          }))
        );
      }

      await admin.from("candidate_activity_events").insert({
        candidate_id: profile.id,
        event_type: "invite_accepted",
        event_metadata: { invite_id: invite.id },
      });
    }
  }

  await admin
    .from("candidate_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ success: true });
}
