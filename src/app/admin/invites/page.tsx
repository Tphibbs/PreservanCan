import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { InviteForm } from "@/components/InviteForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInvitesPage() {
  const { appUser } = await requireAdmin();
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("candidate_invites")
    .select("*")
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Invite Candidates</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ContentCard title="Create invite">
            <InviteForm />
          </ContentCard>
          <ContentCard title="Recent invites">
            <ul className="space-y-3 text-sm">
              {invites?.map((invite) => (
                <li key={invite.id} className="rounded-lg border border-zinc-200 p-3">
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-zinc-500">
                    {invite.status} · {invite.role}
                  </p>
                  {invite.status === "pending" && (
                    <p className="mt-1 break-all text-xs text-emerald-700">
                      {appUrl}/accept-invite?token={invite.invite_token}
                    </p>
                  )}
                </li>
              ))}
              {!invites?.length && <p className="text-zinc-500">No invites yet.</p>}
            </ul>
          </ContentCard>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
