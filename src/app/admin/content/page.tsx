import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContentPage() {
  const { appUser } = await requireAdmin();
  const supabase = await createClient();

  const { data: content } = await supabase
    .from("preview_content")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Preview Content</h1>
        <p className="mt-2 text-zinc-600">
          Candidate-facing modules. Edit content in Supabase for legal-approved copy updates.
        </p>
        <div className="mt-6 space-y-4">
          {content?.map((item) => (
            <ContentCard key={item.id} title={item.title}>
              <p className="text-sm text-zinc-500">
                /{item.slug} · {item.category} · {item.audience}
              </p>
              <p className="mt-2 text-sm">{item.body}</p>
            </ContentCard>
          ))}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
