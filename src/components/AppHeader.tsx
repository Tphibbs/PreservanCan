import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface AppHeaderProps {
  email?: string;
  role?: string;
  showNav?: boolean;
}

const candidateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/start-here", label: "Start Here" },
  { href: "/owner-role", label: "Owner Role" },
  { href: "/operating-system", label: "Operating System" },
  { href: "/training-preview", label: "Training" },
  { href: "/connect-center", label: "Connect Center" },
  { href: "/sample-dashboard", label: "Sample Dashboard" },
  { href: "/validation-prep", label: "Validation" },
  { href: "/questionnaire", label: "Questionnaire" },
  { href: "/next-steps", label: "Next Steps" },
];

const adminLinks = [
  { href: "/admin", label: "Command Center" },
  { href: "/admin/candidates", label: "Candidates" },
  { href: "/admin/candidates/new", label: "Add Candidate" },
  { href: "/admin/sales-playbook", label: "Playbook" },
  { href: "/admin/scorecards", label: "Scorecards" },
  { href: "/admin/invites", label: "Invites" },
  { href: "/admin/content", label: "Content" },
];

export function AppHeader({ email, role, showNav = true }: AppHeaderProps) {
  const isAdmin = role === "franchise_dev_admin" || role === "executive_admin";
  const links = isAdmin ? adminLinks : candidateLinks;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-xl font-bold text-emerald-800">
            {APP_NAME}
          </Link>
          {email && (
            <p className="text-sm text-zinc-500">
              {email}
              {role ? ` · ${role.replace(/_/g, " ")}` : ""}
            </p>
          )}
        </div>
        {showNav && (
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                {link.label}
              </Link>
            ))}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
              >
                Sign out
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
