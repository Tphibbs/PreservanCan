import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/types";

const PROFILE_FIELDS = [
  "full_name",
  "email",
  "phone",
  "territory_interest",
  "candidate_stage",
  "source",
  "financial_readiness",
  "assigned_rep",
  "next_step",
  "next_follow_up_date",
] as const;

const CRM_FIELDS = [
  "liquid_capital_range",
  "timeline_to_launch",
  "owner_role_preference",
  "sales_comfort_level",
  "technician_management_comfort",
  "why_preservan",
  "biggest_concern",
  "red_flags",
] as const;

function pick<T extends Record<string, unknown>>(source: T, keys: readonly string[]) {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in source) {
      const value = source[key];
      out[key] = value === "" ? null : value;
    }
  }
  return out;
}

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
  const { id, ...rest } = body as Record<string, unknown>;

  const profile = pick(rest, PROFILE_FIELDS);
  const crm = pick(rest, CRM_FIELDS);

  if (!id && !profile.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (typeof profile.email === "string") {
    profile.email = profile.email.toLowerCase().trim();
  }

  let candidateId = typeof id === "string" ? id : null;

  if (candidateId) {
    const { error } = await supabase
      .from("candidate_profiles")
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq("id", candidateId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { data, error } = await supabase
      .from("candidate_profiles")
      .insert({ ...profile })
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    candidateId = data.id;
  }

  // Upsert CRM detail row (admin-only table).
  const hasCrm = Object.keys(crm).length > 0;
  if (hasCrm) {
    const { data: existing } = await supabase
      .from("candidate_crm")
      .select("id")
      .eq("candidate_id", candidateId)
      .maybeSingle();

    const crmPayload = {
      candidate_id: candidateId,
      ...crm,
      updated_by: appUser.id,
      updated_at: new Date().toISOString(),
    };

    const { error: crmError } = existing
      ? await supabase.from("candidate_crm").update(crmPayload).eq("id", existing.id)
      : await supabase.from("candidate_crm").insert(crmPayload);

    if (crmError) {
      return NextResponse.json({ error: crmError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, id: candidateId });
}
