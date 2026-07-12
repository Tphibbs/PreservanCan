"use client";

import { useState } from "react";
import { FOLLOW_UP_TEMPLATES, type FollowUpContext } from "@/lib/sales";

export function FollowUpGenerator({ context }: { context: FollowUpContext }) {
  const [activeKey, setActiveKey] = useState<string>(FOLLOW_UP_TEMPLATES[0].key);
  const [draft, setDraft] = useState<string>(() =>
    FOLLOW_UP_TEMPLATES[0].build(context)
  );
  const [copied, setCopied] = useState(false);

  function select(key: string) {
    const template = FOLLOW_UP_TEMPLATES.find((t) => t.key === key);
    if (!template) return;
    setActiveKey(key);
    setDraft(template.build(context));
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-zinc-600">
        Generate an editable draft, then copy/paste into your email tool. Nothing is
        sent from here.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FOLLOW_UP_TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => select(t.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              activeKey === t.key
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        rows={12}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs leading-relaxed"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
        <button
          type="button"
          onClick={() => select(activeKey)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Reset draft
        </button>
      </div>
    </div>
  );
}
