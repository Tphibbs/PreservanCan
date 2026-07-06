"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { APP_NAME, LEGAL_DISCLAIMER } from "@/lib/constants";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"signin" | "accepting" | "done">("signin");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user && token) {
        setStep("accepting");
        const res = await fetch("/api/invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setStep("done");
          router.push("/dashboard");
        } else {
          setMessage(data.error || "Failed to accept invite");
          setStep("signin");
        }
      }
    });
  }, [token, router]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setMessage("Missing invite token. Use the full invite link from your admin.");
      return;
    }

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/accept-invite?token=${token}`)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for a magic link. Use the same email that received the invite.");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-emerald-800">Accept Invite</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Sign in with the email address on your PreservanCan invite.
      </p>

      {step === "accepting" && (
        <p className="mt-4 text-sm text-zinc-600">Setting up your account...</p>
      )}

      {step === "signin" && (
        <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Send magic link
          </button>
        </form>
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {message}
        </p>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-emerald-700 underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <p className="mb-4 text-center text-sm font-medium text-emerald-800">{APP_NAME}</p>
        <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading...</div>}>
          <AcceptInviteForm />
        </Suspense>
      </main>
      <footer className="px-4 py-6 text-center text-sm text-zinc-600">
        <p>{LEGAL_DISCLAIMER}</p>
      </footer>
    </div>
  );
}
