import { LEGAL_DISCLAIMER } from "@/lib/constants";

export function LegalFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
      <p>{LEGAL_DISCLAIMER}</p>
    </footer>
  );
}
