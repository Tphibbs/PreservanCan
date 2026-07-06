import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { Badge } from "@/components/Cards";
import { createClient } from "@/lib/supabase/server";
import { RECOMMENDATION_BADGE } from "@/lib/sales";
import type { CandidateProfile, CandidateScores } from "@/lib/types";

const FILTERS: { key: string; label: string; test: (c: CandidateProfile, today: string) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  {
    key: "active",
    label: "Active",
    test: (c) => !["paused", "disqualified", "awarded"].includes(c.candidate_stage),
  },
  {
    key: "follow_up",
    label: "Needs follow-up",
    test: (c, today) => !!c.next_follow_up_date && c.next_follow_up_date <= today,
  },
  {
    key: "discovery",
    label: "Discovery ready",
    test: (c) => c.candidate_stage === "discovery_ready",
  },
  {
    key: "paused",
    label: "Paused / DQ",
    test: (c) => ["paused", "disqualified"].includes(c.candidate_stage),
  },
];

export default async function AdminCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { appUser } = await requireAdmin();
  const { filter = "all" } = await searchParams;
  const supabase = await createClient();

  const [{ data: candidates }, { data: scores }] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("candidate_scores").select("candidate_id, overall_recommendation"),
  ]);

  const profiles = (candidates ?? []) as CandidateProfile[];
  const scoreMap = new Map<string, Partial<CandidateScores>>(
    (scores ?? []).map((s) => [s.candidate_id, s])
  );
  const today = new Date().toISOString().slice(0, 10);

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const rows = profiles.filter((c) => activeFilter.test(c, today));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-900">Candidate CRM</h1>
          <Link
            href="/admin/candidates/new"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            + Add candidate
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/candidates?filter=${f.key}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                f.key === activeFilter.key
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Territory</th>
                <th className="px-4 py-3 font-medium">Rep</th>
                <th className="px-4 py-3 font-medium">Follow-up</th>
                <th className="px-4 py-3 font-medium">Fit</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const rec = scoreMap.get(c.id)?.overall_recommendation;
                const overdue = c.next_follow_up_date && c.next_follow_up_date <= today;
                return (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900">
                        {c.full_name || "—"}
                      </div>
                      <div className="text-zinc-500">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {c.candidate_stage.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">{c.territory_interest || "—"}</td>
                    <td className="px-4 py-3">{c.assigned_rep || "—"}</td>
                    <td className="px-4 py-3">
                      {c.next_follow_up_date ? (
                        <span className={overdue ? "font-medium text-red-600" : "text-zinc-700"}>
                          {c.next_follow_up_date}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {rec ? (
                        <Badge className={RECOMMENDATION_BADGE[rec]}>
                          {rec.replace(/_/g, " ")}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/candidates/${c.id}`}
                        className="text-emerald-700 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No candidates in this view. Add one to get started.
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
