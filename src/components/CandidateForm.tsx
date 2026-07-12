"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  COMFORT_OPTIONS,
  LEAD_SOURCES,
  LIQUID_CAPITAL_RANGES,
  OWNER_ROLE_OPTIONS,
  STAGE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/sales";

type FormState = Record<string, string>;

const LABEL = "block text-xs font-medium text-zinc-600";
const INPUT =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none";

export function CandidateForm({
  candidateId,
  initial,
  mode,
}: {
  candidateId?: string;
  initial?: FormState;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial ?? {});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/admin/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: candidateId, ...form }),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      if (mode === "create") {
        router.push(`/admin/candidates/${data.id}`);
      } else {
        setMessage("Saved");
        router.refresh();
      }
    } else {
      setError(data.error || "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-800">Contact</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Full name</label>
            <input
              className={INPUT}
              value={form.full_name ?? ""}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Email *</label>
            <input
              type="email"
              required
              className={INPUT}
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Phone</label>
            <input
              className={INPUT}
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Territory interest</label>
            <input
              className={INPUT}
              value={form.territory_interest ?? ""}
              onChange={(e) => set("territory_interest", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Source</label>
            <select
              className={INPUT}
              value={form.source ?? ""}
              onChange={(e) => set("source", e.target.value)}
            >
              <option value="">Select...</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Assigned rep</label>
            <input
              className={INPUT}
              value={form.assigned_rep ?? ""}
              onChange={(e) => set("assigned_rep", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-800">Qualification</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Current stage</label>
            <select
              className={INPUT}
              value={form.candidate_stage ?? "active"}
              onChange={(e) => set("candidate_stage", e.target.value)}
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Financial readiness (summary)</label>
            <input
              className={INPUT}
              value={form.financial_readiness ?? ""}
              onChange={(e) => set("financial_readiness", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Liquid capital range</label>
            <select
              className={INPUT}
              value={form.liquid_capital_range ?? ""}
              onChange={(e) => set("liquid_capital_range", e.target.value)}
            >
              <option value="">Select...</option>
              {LIQUID_CAPITAL_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Timeline to launch</label>
            <select
              className={INPUT}
              value={form.timeline_to_launch ?? ""}
              onChange={(e) => set("timeline_to_launch", e.target.value)}
            >
              <option value="">Select...</option>
              {TIMELINE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Owner role preference</label>
            <select
              className={INPUT}
              value={form.owner_role_preference ?? ""}
              onChange={(e) => set("owner_role_preference", e.target.value)}
            >
              <option value="">Select...</option>
              {OWNER_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Sales comfort level</label>
            <select
              className={INPUT}
              value={form.sales_comfort_level ?? ""}
              onChange={(e) => set("sales_comfort_level", e.target.value)}
            >
              <option value="">Select...</option>
              {COMFORT_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Technician management comfort</label>
            <select
              className={INPUT}
              value={form.technician_management_comfort ?? ""}
              onChange={(e) => set("technician_management_comfort", e.target.value)}
            >
              <option value="">Select...</option>
              {COMFORT_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-800">Motivation &amp; fit notes</h3>
        <div className="mt-3 grid gap-4">
          <div>
            <label className={LABEL}>Why Preservan</label>
            <textarea
              rows={2}
              className={INPUT}
              value={form.why_preservan ?? ""}
              onChange={(e) => set("why_preservan", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Biggest concern</label>
            <textarea
              rows={2}
              className={INPUT}
              value={form.biggest_concern ?? ""}
              onChange={(e) => set("biggest_concern", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Red flags (internal)</label>
            <textarea
              rows={2}
              className={INPUT}
              value={form.red_flags ?? ""}
              onChange={(e) => set("red_flags", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-800">Next step</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL}>Next step</label>
            <input
              className={INPUT}
              value={form.next_step ?? ""}
              onChange={(e) => set("next_step", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Next follow-up date</label>
            <input
              type="date"
              className={INPUT}
              value={form.next_follow_up_date ?? ""}
              onChange={(e) => set("next_follow_up_date", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create candidate" : "Save changes"}
        </button>
        {message && <span className="text-sm text-emerald-700">{message}</span>}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </form>
  );
}
