"use client";

import { useState } from "react";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [territory, setTerritory] = useState("");
  const [role, setRole] = useState("candidate");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteLink(null);

    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        full_name: fullName,
        territory_interest: territory,
        role,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setInviteLink(data.inviteLink);
      setEmail("");
      setFullName("");
      setTerritory("");
    } else {
      setError(data.error || "Failed to create invite");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Territory interest</label>
          <input
            type="text"
            value={territory}
            onChange={(e) => setTerritory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="candidate">candidate</option>
            <option value="broker_preview">broker_preview</option>
            <option value="franchise_dev_admin">franchise_dev_admin</option>
            <option value="executive_admin">executive_admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create invite"}
        </button>
      </form>

      {inviteLink && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm">
          <p className="font-medium text-emerald-900">Invite link created</p>
          <p className="mt-2 break-all text-emerald-800">{inviteLink}</p>
          <p className="mt-2 text-emerald-700">Copy and email this link to the candidate.</p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}
    </div>
  );
}
