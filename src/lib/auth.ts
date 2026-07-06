import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, UserRole } from "@/lib/types";
import { isAdminRole } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("app_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data as AppUser | null;
}

export async function requireAuth(redirectTo = "/login") {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
  return user;
}

export async function requireAppUser() {
  const authUser = await requireAuth();
  const appUser = await getAppUser();
  if (!appUser) redirect("/accept-invite");
  return { authUser, appUser };
}

export async function requireAdmin() {
  const { authUser, appUser } = await requireAppUser();
  if (!isAdminRole(appUser.role)) redirect("/dashboard");
  return { authUser, appUser };
}

export async function requireRole(allowed: UserRole[]) {
  const { authUser, appUser } = await requireAppUser();
  if (!allowed.includes(appUser.role)) redirect("/dashboard");
  return { authUser, appUser };
}

export async function getCandidateProfile() {
  const supabase = await createClient();
  const appUser = await getAppUser();
  if (!appUser) return null;

  const { data } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", appUser.id)
    .maybeSingle();

  return data;
}

export async function logActivity(
  candidateId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  await supabase.from("candidate_activity_events").insert({
    candidate_id: candidateId,
    event_type: eventType,
    event_metadata: metadata,
  });
}
