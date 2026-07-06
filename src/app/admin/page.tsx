import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { StatCard } from "@/components/Cards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const { appUser } = await requireAdmin();
  const supabase = await createClient();

  const [{ count: candidateCount }, { count: inviteCount }, { count: pendingInvites }] =
    await Promise.all([
      supabase.from("candidate_profiles").select("*", { count: "exact", head: true }),
      supabase.from("candidate_invites").select("*", { count: "exact", head: true }),
      supabase
        .from("candidate_invites")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Franchise Development Admin</h1>
        <p className="mt-2 text-zinc-600">Manage candidates, invites, content, and scorecards.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Candidates" value={candidateCount ?? 0} />
          <StatCard label="Total invites" value={inviteCount ?? 0} />
          <StatCard label="Pending invites" value={pendingInvites ?? 0} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { href: "/admin/candidates", title: "Candidates", desc: "View pipeline and candidate detail" },
            { href: "/admin/invites", title: "Invites", desc: "Create and copy invite links" },
            { href: "/admin/content", title: "Preview Content", desc: "Review candidate-facing modules" },
            { href: "/admin/scorecards", title: "Scorecards", desc: "Score and recommend candidates" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-emerald-300"
            >
              <h2 className="font-semibold text-zinc-900">{item.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
