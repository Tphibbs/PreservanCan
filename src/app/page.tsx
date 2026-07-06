import Link from "next/link";
import { APP_NAME, APP_TAGLINE, LEGAL_DISCLAIMER } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Preservan Franchise Development
        </p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-900 sm:text-5xl">{APP_NAME}</h1>
        <p className="mt-4 text-xl text-zinc-600">{APP_TAGLINE}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-700">
          Invite-only access for qualified Preservan franchise candidates. Preview the operating
          system, owner role, training model, Connect Center support, and validation process before
          Discovery Day.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800"
          >
            Sign in
          </Link>
          <Link
            href="/accept-invite"
            className="rounded-lg border border-emerald-700 px-6 py-3 font-medium text-emerald-800 hover:bg-emerald-50"
          >
            Accept invite
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            "Operating system preview",
            "Readiness questionnaire",
            "Discovery Day preparation",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="font-medium text-zinc-900">{item}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="px-4 py-6 text-center text-sm text-zinc-600">
        <p>{LEGAL_DISCLAIMER}</p>
      </footer>
    </div>
  );
}
