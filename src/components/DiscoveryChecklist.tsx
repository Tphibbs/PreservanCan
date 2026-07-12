"use client";

import { useMemo, useState } from "react";
import { DISCOVERY_CHECKLIST_ITEMS } from "@/lib/sales";

type State = Record<string, boolean>;

export function DiscoveryChecklist({
  candidateId,
  initial,
}: {
  candidateId: string;
  initial: State;
}) {
  const [state, setState] = useState<State>(() => {
    const base: State = {};
    for (const item of DISCOVERY_CHECKLIST_ITEMS) {
      base[item.key] = Boolean(initial[item.key]);
    }
    return base;
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const percent = useMemo(() => {
    const done = DISCOVERY_CHECKLIST_ITEMS.filter((i) => state[i.key]).length;
    return Math.round((done / DISCOVERY_CHECKLIST_ITEMS.length) * 100);
  }, [state]);

  async function save(next: State) {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/discovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId, ...next }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(res.ok ? "Saved" : data.error || "Failed to save");
  }

  function toggle(key: string) {
    const next = { ...state, [key]: !state[key] };
    setState(next);
    void save(next);
  }

  const barColor =
    percent === 100 ? "bg-emerald-600" : percent >= 60 ? "bg-sky-500" : "bg-amber-500";

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700">Discovery Day readiness</span>
          <span className="font-semibold text-zinc-900">{percent}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <ul className="space-y-2">
        {DISCOVERY_CHECKLIST_ITEMS.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">
              <input
                type="checkbox"
                checked={state[item.key]}
                onChange={() => toggle(item.key)}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
              />
              <span className={state[item.key] ? "text-zinc-900" : "text-zinc-600"}>
                {item.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {message && (
        <p className="mt-3 text-xs text-zinc-500">{saving ? "Saving..." : message}</p>
      )}
    </div>
  );
}
