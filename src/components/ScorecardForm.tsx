"use client";

import { useState } from "react";

const scoreFields = [
  "financial_readiness_score",
  "owner_operator_fit_score",
  "coachability_score",
  "sales_comfort_score",
  "operations_fit_score",
  "territory_fit_score",
  "portal_engagement_score",
  "validation_maturity_score",
] as const;

export function ScorecardForm({
  candidateId,
  initial,
}: {
  candidateId: string;
  initial: Record<string, string | number | null>;
}) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId, ...form }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Scorecard saved" : data.error || "Failed to save");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {scoreFields.map((field) => (
          <div key={field}>
            <label className="block text-xs font-medium capitalize text-zinc-600">
              {field.replace(/_score/g, "").replace(/_/g, " ")} (1-5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={form[field] ?? ""}
              onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium">Overall recommendation</label>
        <select
          value={String(form.overall_recommendation ?? "")}
          onChange={(e) => setForm({ ...form, overall_recommendation: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">Select...</option>
          <option value="strong_fit">strong_fit</option>
          <option value="nurture">nurture</option>
          <option value="pause">pause</option>
          <option value="disqualify">disqualify</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Admin summary</label>
        <textarea
          rows={4}
          value={String(form.admin_summary ?? "")}
          onChange={(e) => setForm({ ...form, admin_summary: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white">
        Save scorecard
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </form>
  );
}
