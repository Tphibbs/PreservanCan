import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { StatCard, Badge } from "@/components/Cards";
import { createClient } from "@/lib/supabase/server";
import { discoveryReadinessPercent, RECOMMENDATION_BADGE } from "@/lib/sales";
import type {
  CandidateProfile,
  CandidateScores,
  DiscoveryReadiness,
} from "@/lib/types";

const ACTIVE_EXCLUDE = ["paused", "disqualified", "awarded"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CommandCenterPage() {
  const { appUser } = await requireAdmin();
  const supabase = await createClient();

  const [{ data: candidates }, { data: scores }, { data: readiness }, { data: activity }] =
    await Promise.all([
      supabase
        .from("candidate_profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("candidate_scores").select("*"),
      supabase.from("candidate_discovery_readiness").select("*"),
      supabase
        .from("candidate_activity_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const profiles = (candidates ?? []) as CandidateProfile[];
  const scoreMap = new Map<string, CandidateScores>(
    (scores ?? []).map((s) => [s.candidate_id, s as CandidateScores])
  );
  const readinessMap = new Map<string, DiscoveryReadiness>(
    (readiness ?? []).map((r) => [r.candidate_id, r as DiscoveryReadiness])
  );
  const today = todayISO();

  const active = profiles.filter((c) => !ACTIVE_EXCLUDE.includes(c.candidate_stage));
  const strongFit = profiles.filter(
    (c) => scoreMap.get(c.id)?.overall_recommendation === "strong_fit"
  );
  const needsFollowUp = profiles
    .filter((c) => c.next_follow_up_date && c.next_follow_up_date <= today)
    .sort((a, b) => (a.next_follow_up_date! < b.next_follow_up_date! ? -1 : 1));
  const discoveryReady = profiles.filter(
    (c) =>
      c.candidate_stage === "discovery_ready" ||
      discoveryReadinessPercent(readinessMap.get(c.id)) === 100
  );
  const pausedOrDq = profiles.filter((c) =>
    ["paused", "disqualified"].includes(c.candidate_stage)
  );
  const upcomingFollowUps = profiles
    .filter((c) => c.next_follow_up_date)
    .sort((a, b) => (a.next_follow_up_date! < b.next_follow_up_date! ? -1 : 1))
    .slice(0, 8);

  const candidateName = new Map(profiles.map((c) => [c.id, c.full_name || c.email]));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Franchise Sales Command Center
            </h1>
            <p className="mt-1 text-zinc-600">
              Qualify candidates, prep better calls, document fit, and move strong
              candidates toward Discovery Day.
            </p>
          </div>
          <Link
            href="/admin/candidates/new"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            + Add candidate
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Active candidates" value={active.length} />
          <StatCard label="Strong-fit" value={strongFit.length} />
          <StatCard label="Needs follow-up" value={needsFollowUp.length} />
          <StatCard label="Discovery Day ready" value={discoveryReady.length} />
          <StatCard label="Paused / disqualified" value={pausedOrDq.length} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Segment title="Needs follow-up" candidates={needsFollowUp} scoreMap={scoreMap} showDate />
          <Segment title="Strong-fit candidates" candidates={strongFit} scoreMap={scoreMap} />
          <Segment
            title="Discovery Day ready"
            candidates={discoveryReady}
            scoreMap={scoreMap}
          />
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Next follow-up list</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {upcomingFollowUps.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-b border-zinc-100 pb-2"
                >
                  <Link
                    href={`/admin/candidates/${c.id}`}
                    className="text-emerald-700 hover:underline"
                  >
                    {c.full_name || c.email}
                  </Link>
                  <span className="text-zinc-500">{c.next_follow_up_date}</span>
                </li>
              ))}
              {!upcomingFollowUps.length && (
                <li className="text-zinc-500">No follow-ups scheduled.</li>
              )}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Recent activity</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {activity?.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between border-b border-zinc-100 pb-2"
              >
                <span>
                  <span className="capitalize text-zinc-800">
                    {event.event_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-zinc-500">
                    {" "}
                    · {candidateName.get(event.candidate_id) ?? "Candidate"}
                  </span>
                </span>
                <span className="text-zinc-500">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </li>
            ))}
            {!activity?.length && (
              <li className="text-zinc-500">No candidate activity yet.</li>
            )}
          </ul>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}

function Segment({
  title,
  candidates,
  scoreMap,
  showDate = false,
}: {
  title: string;
  candidates: CandidateProfile[];
  scoreMap: Map<string, CandidateScores>;
  showDate?: boolean;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {candidates.slice(0, 8).map((c) => {
          const rec = scoreMap.get(c.id)?.overall_recommendation;
          return (
            <li
              key={c.id}
              className="flex items-center justify-between border-b border-zinc-100 pb-2"
            >
              <Link
                href={`/admin/candidates/${c.id}`}
                className="text-emerald-700 hover:underline"
              >
                {c.full_name || c.email}
              </Link>
              <span className="flex items-center gap-2">
                {rec && (
                  <Badge className={RECOMMENDATION_BADGE[rec]}>
                    {rec.replace(/_/g, " ")}
                  </Badge>
                )}
                {showDate && c.next_follow_up_date && (
                  <span className="text-zinc-500">{c.next_follow_up_date}</span>
                )}
              </span>
            </li>
          );
        })}
        {!candidates.length && <li className="text-zinc-500">None right now.</li>}
      </ul>
    </section>
  );
}
