"use client";

import { useState } from "react";
import { QUESTIONNAIRE_QUESTIONS } from "@/lib/types";

export function QuestionnaireForm({
  initialResponses,
}: {
  initialResponses: Record<string, string>;
}) {
  const [responses, setResponses] = useState<Record<string, string>>(initialResponses);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = QUESTIONNAIRE_QUESTIONS.map((q) => ({
      question_key: q.key,
      question_text: q.text,
      response: responses[q.key] || "",
    }));

    const res = await fetch("/api/questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: payload }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage("Questionnaire saved successfully.");
    } else {
      setMessage(data.error || "Failed to save questionnaire");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {QUESTIONNAIRE_QUESTIONS.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-medium text-zinc-800">{q.text}</label>
          {q.type === "textarea" ? (
            <textarea
              rows={4}
              value={responses[q.key] || ""}
              onChange={(e) => setResponses({ ...responses, [q.key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          ) : q.type === "select" ? (
            <select
              value={responses[q.key] || ""}
              onChange={(e) => setResponses({ ...responses, [q.key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">Select...</option>
              {q.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={responses[q.key] || ""}
              onChange={(e) => setResponses({ ...responses, [q.key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-700 px-6 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save questionnaire"}
      </button>

      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{message}</p>
      )}
    </form>
  );
}
