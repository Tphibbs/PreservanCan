import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LegalFooter } from "@/components/LegalFooter";
import { ContentCard } from "@/components/Cards";
import { CandidateForm } from "@/components/CandidateForm";

export default async function NewCandidatePage() {
  const { appUser } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader email={appUser.email} role={appUser.role} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">Add candidate</h1>
        <p className="mt-1 text-zinc-600">
          Create a candidate record for qualification and call prep. No portal account
          is required.
        </p>
        <div className="mt-6">
          <ContentCard title="Candidate details">
            <CandidateForm mode="create" initial={{ candidate_stage: "active" }} />
          </ContentCard>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
