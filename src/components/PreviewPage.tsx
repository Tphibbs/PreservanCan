import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { requireAppUser } from "@/lib/auth";

interface PreviewPageProps {
  slug: string;
  eventType?: string;
}

export async function PreviewPage({ slug, eventType }: PreviewPageProps) {
  const { appUser } = await requireAppUser();
  const supabase = await createClient();

  const { data: content } = await supabase
    .from("preview_content")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (eventType && appUser.role === "candidate") {
    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", appUser.id)
      .maybeSingle();

    if (profile) {
      await supabase.from("candidate_activity_events").insert({
        candidate_id: profile.id,
        event_type: eventType,
        event_metadata: { slug },
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <ContentCard title={content?.title ?? "Preview Content"}>
          <p>{content?.body ?? "Content is being prepared."}</p>
        </ContentCard>
      </main>
      <LegalFooter />
    </div>
  );
}
