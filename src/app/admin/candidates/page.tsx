import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCandidatesPage() {
  const { appUser } = await requireAdmin();
  const supabase = await createClient();

  const { data: candidates } = await supabase
    .from("candidate_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Candidates</h1>
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Territory</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {candidates?.map((c) => (
                <tr key={c.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">{c.full_name || "—"}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3 capitalize">{c.candidate_stage.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{c.territory_interest || "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/candidates/${c.id}`} className="text-emerald-700 underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!candidates?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No candidates yet. Create an invite to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
