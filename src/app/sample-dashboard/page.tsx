import { requireAppUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { DEMO_DATA_DISCLAIMER } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const demoMetrics = [
  { label: "Weekly leads (demo)", value: "24" },
  { label: "Jobs scheduled (demo)", value: "11" },
  { label: "Close rate (demo)", value: "42%" },
  { label: "Avg. ticket (demo)", value: "$3,850" },
];

export default async function SampleDashboardPage() {
  const { appUser } = await requireAppUser();
  const supabase = await createClient();

  if (appUser.role === "candidate") {
    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", appUser.id)
      .maybeSingle();

    if (profile) {
      await supabase.from("candidate_activity_events").insert({
        candidate_id: profile.id,
        event_type: "viewed_sample_dashboard",
        event_metadata: {},
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {DEMO_DATA_DISCLAIMER}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Sample Owner Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          This preview shows how Preservan owners may track activity and pipeline. All figures below
          are static demo data.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <ContentCard title="Demo pipeline snapshot">
            <ul className="space-y-2 text-sm">
              <li>Inspection scheduled — Demo Customer A</li>
              <li>Estimate sent — Demo Customer B</li>
              <li>Job booked — Demo Customer C</li>
              <li>Follow-up needed — Demo Customer D</li>
            </ul>
          </ContentCard>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
