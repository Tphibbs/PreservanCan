"use client";

import { useMemo, useState } from "react";
import {
  RECOMMENDATION_OPTIONS,
  RECOMMENDED_ACTION_BY_CATEGORY,
  SCORE_FIELDS,
  scoreTotals,
  suggestedFitCategory,
} from "@/lib/sales";
import type { OverallRecommendation } from "@/lib/types";

type FormState = Record<string, string | number | null>;

export function ScorecardForm({
  candidateId,
  initial,
}: {
  candidateId: string;
  initial: FormState;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => scoreTotals(form), [form]);
  const suggested = useMemo(() => suggestedFitCategory(form), [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId, ...form }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(res.ok ? "Scorecard saved" : data.error || "Failed to save");
  }

  function applySuggestion() {
    if (!suggested) return;
    setForm((f) => ({
      ...f,
      overall_recommendation: suggested,
      recommended_next_action:
        f.recommended_next_action || RECOMMENDED_ACTION_BY_CATEGORY[suggested],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {SCORE_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-zinc-600">
              {field.label} (1-5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={form[field.key] ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.key]: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm">
        <span>
          <span className="text-zinc-500">Total: </span>
          <span className="font-semibold text-zinc-900">
            {totals.total}/{totals.max}
          </span>
        </span>
        <span>
          <span className="text-zinc-500">Avg: </span>
          <span className="font-semibold text-zinc-900">
            {totals.average.toFixed(1)}
          </span>
        </span>
        {suggested && (
          <button
            type="button"
            onClick={applySuggestion}
            className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200"
          >
            Suggested: {suggested.replace(/_/g, " ")} — apply
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Fit category</label>
        <select
          value={String(form.overall_recommendation ?? "")}
          onChange={(e) =>
            setForm({
              ...form,
              overall_recommendation: e.target.value as OverallRecommendation,
            })
          }
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">Select...</option>
          {RECOMMENDATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Recommended next action</label>
        <textarea
          rows={2}
          value={String(form.recommended_next_action ?? "")}
          onChange={(e) =>
            setForm({ ...form, recommended_next_action: e.target.value })
          }
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
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

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save scorecard"}
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </form>
  );
}
