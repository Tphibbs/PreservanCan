import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { createClient } from "@/lib/supabase/server";

export default async function AdminScorecardsPage() {
  const { appUser } = await requireAdmin();
  const supabase = await createClient();

  const { data: candidates } = await supabase
    .from("candidate_profiles")
    .select("id, full_name, email, candidate_stage")
    .order("created_at", { ascending: false });

  const { data: scores } = await supabase.from("candidate_scores").select("*");

  const scoreMap = new Map(scores?.map((s) => [s.candidate_id, s]));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Scorecards</h1>
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Recommendation</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {candidates?.map((c) => {
                const score = scoreMap.get(c.id);
                return (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3">
                      <div>{c.full_name || "—"}</div>
                      <div className="text-zinc-500">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{c.candidate_stage.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">{score?.overall_recommendation || "—"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/candidates/${c.id}`} className="text-emerald-700 underline">
                        Edit scorecard
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
