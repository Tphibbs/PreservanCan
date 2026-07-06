"use client";

import { useState } from "react";

export function AdminNoteForm({ candidateId }: { candidateId: string }) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId, note }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Note saved");
      setNote("");
      window.location.reload();
    } else {
      setMessage(data.error || "Failed to save note");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        placeholder="Internal admin note..."
      />
      <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white">
        Add note
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </form>
  );
}
