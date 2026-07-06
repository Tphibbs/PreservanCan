import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { PLAYBOOK_SECTIONS } from "@/lib/sales";

export default async function SalesPlaybookPage() {
  const { appUser } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Sales Conversation Guide</h1>
        <p className="mt-1 text-zinc-600">
          Internal talking points for franchise development conversations. Keep it honest,
          keep it compliant, and defer all financial-performance questions to the FDD.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2 text-sm">
          {PLAYBOOK_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md bg-white px-3 py-1.5 text-emerald-700 ring-1 ring-zinc-200 hover:bg-emerald-50"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-6">
          {PLAYBOOK_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-zinc-900">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                {section.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
