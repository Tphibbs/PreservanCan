import { createClient } from "@/lib/supabase/server";
import { requireAppUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { StatCard } from "@/components/Cards";
import Link from "next/link";
import { isAdminRole } from "@/lib/types";

export default async function DashboardPage() {
  const { appUser } = await requireAppUser();

  if (isAdminRole(appUser.role)) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <AppHeader email={appUser.email} role={appUser.role} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome, Admin</h1>
          <p className="mt-2 text-zinc-600">Use the admin navigation to manage candidates and invites.</p>
          <Link href="/admin" className="mt-4 inline-block text-emerald-700 underline">
            Go to Admin Dashboard
          </Link>
        </main>
        <LegalFooter />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", appUser.id)
    .maybeSingle();

  const { data: assignments } = profile
    ? await supabase
        .from("candidate_assignments")
        .select("status")
        .eq("candidate_id", profile.id)
    : { data: [] };

  const completed = assignments?.filter((a) => a.status === "completed").length ?? 0;
  const total = assignments?.length ?? 0;

  const { data: responses } = profile
    ? await supabase
        .from("candidate_questionnaire_responses")
        .select("id")
        .eq("candidate_id", profile.id)
    : { data: [] };

  const questionnaireStatus =
    profile?.candidate_stage === "questionnaire_completed"
      ? "Completed"
      : (responses?.length ?? 0) > 0
        ? "In progress"
        : "Not started";

  if (profile) {
    await supabase.from("candidate_activity_events").insert({
      candidate_id: profile.id,
      event_type: "login",
      event_metadata: {},
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-zinc-600">
          Your Preservan franchise preview portal. Review modules, complete your questionnaire, and
          prepare for Discovery Day.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Modules completed" value={`${completed} / ${total}`} />
          <StatCard label="Questionnaire" value={questionnaireStatus} />
          <StatCard
            label="Candidate stage"
            value={profile?.candidate_stage?.replace(/_/g, " ") ?? "—"}
          />
          <StatCard
            label="Next step"
            value={questionnaireStatus === "Completed" ? "Review next steps" : "Complete questionnaire"}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { href: "/start-here", title: "Start Here", desc: "Orientation and portal overview" },
            { href: "/questionnaire", title: "Readiness Questionnaire", desc: "Tell us about your goals and readiness" },
            { href: "/sample-dashboard", title: "Sample Dashboard", desc: "Preview owner dashboards (demo data)" },
            { href: "/validation-prep", title: "Validation Prep", desc: "Prepare for Discovery Day" },
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
